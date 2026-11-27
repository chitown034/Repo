import 'dart:convert';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:material_ui/material_ui.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import '../../services/links.dart';
import '../../ui/apple.dart';

/// Bridges the bundled web tool to native features: external links open in
/// the browser, downloads (backup, calendar) go to the share sheet, and
/// clipboard writes use the system clipboard.
const _bridgeJs = r'''
(function(){
  if (window.__appBridge) return; window.__appBridge = true;
  function post(o){ try { AppBridge.postMessage(JSON.stringify(o)); } catch(e) {} }
  window.open = function(u){ if(u) post({t:'open', u:String(new URL(u, location.href))}); return null; };
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/^(https?:|mailto:|tel:|sms:)/i.test(h)) { e.preventDefault(); e.stopPropagation(); post({t:'open', u:a.href}); }
  }, true);
  window.dl = function(name, text, type){ post({t:'file', name:name, text:String(text), type:type}); };
  try {
    var cb = { writeText: function(t){ post({t:'copy', text:String(t)}); return Promise.resolve(); } };
    Object.defineProperty(navigator, 'clipboard', { value: cb, configurable: true });
  } catch(e) {}
})();
''';

class CareerCenterScreen extends StatefulWidget {
  const CareerCenterScreen({super.key});

  @override
  State<CareerCenterScreen> createState() => _CareerCenterScreenState();
}

class _CareerCenterScreenState extends State<CareerCenterScreen> {
  WebViewController? _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    if (!kIsWeb) _setup();
  }

  Future<void> _setup() async {
    final c = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel('AppBridge', onMessageReceived: _onMessage)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) async {
            await _controller?.runJavaScript(_bridgeJs);
            if (mounted) setState(() => _loading = false);
          },
          onNavigationRequest: (req) {
            final u = req.url;
            if (u.startsWith('http') || u.startsWith('mailto:') || u.startsWith('tel:')) {
              openLink(context, u);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..setOnJavaScriptConfirmDialog((req) async {
        if (!mounted) return false;
        final ok = await showAppleAlert(context, message: req.message, cancel: 'Cancel');
        return ok;
      })
      ..setOnJavaScriptAlertDialog((req) async {
        if (!mounted) return;
        await showAppleAlert(context, message: req.message);
      });

    final platform = c.platform;
    if (platform is AndroidWebViewController) {
      // Lets "Restore backup" pick a file on Android (iOS handles this natively).
      await platform.setOnShowFileSelector((params) async {
        final res = await FilePicker.pickFiles(type: FileType.custom, allowedExtensions: const ['json']);
        final path = res.isEmpty ? null : res.first.path;
        return path == null ? <String>[] : [Uri.file(path).toString()];
      });
    }
    await c.loadFlutterAsset('assets/tools/career_command_center.html');
    if (mounted) setState(() => _controller = c);
  }

  Future<void> _onMessage(JavaScriptMessage msg) async {
    final m = jsonDecode(msg.message) as Map<String, dynamic>;
    switch (m['t']) {
      case 'open':
        if (mounted) await openLink(context, m['u'] as String);
      case 'copy':
        await Clipboard.setData(ClipboardData(text: m['text'] as String));
        if (mounted) {
          showToast(context, 'Copied');
        }
      case 'file':
        final dir = await getTemporaryDirectory();
        final f = File('${dir.path}/${m['name']}');
        await f.writeAsString(m['text'] as String);
        await SharePlus.instance.share(ShareParams(files: [XFile(f.path, mimeType: m['type'] as String?)]));
    }
  }

  @override
  Widget build(BuildContext context) {
    const web = 'https://www.veteransresourcenetwork.org/career-command-center';
    return Scaffold(
      backgroundColor: context.c.bg,
      appBar: appleBar(
        context,
        'Career Command Center',
        trailing: BarButton(
          icon: CupertinoIcons.compass,
          tooltip: 'Open on website',
          onPressed: () => openLink(context, web),
        ),
      ),
      body: kIsWeb
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: AppleButton(label: 'Open Career Command Center', onPressed: () => openLink(context, web)),
              ),
            )
          : Stack(
              children: [
                if (_controller != null) WebViewWidget(controller: _controller!),
                if (_loading) const Center(child: CupertinoActivityIndicator(radius: 14)),
              ],
            ),
    );
  }
}
