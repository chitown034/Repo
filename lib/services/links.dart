import 'package:material_ui/material_ui.dart';
import 'package:url_launcher/url_launcher.dart';

import '../app/org.dart';
import '../app/routes.dart';

/// Website anchors → heading text to scroll to inside the converted page.
const anchorHeadings = {
  'ah-homeless': 'Homeless or at risk',
  'ah-keephome': 'Keep your home',
  'ah-utility': 'Utility bill',
  'ah-grants': 'Emergency grants',
};

/// Opens any link found in site content:
/// - `app://slug#anchor` → native screen for that website page
/// - `tel:`, `mailto:`, `sms:` → system apps
/// - PayPal donations → external browser (App Store rule for nonprofits)
/// - other web links → in-app browser
Future<void> openLink(BuildContext context, String url) async {
  if (url.startsWith('app://')) {
    final rest = url.substring(6);
    final hash = rest.indexOf('#');
    final slug = hash < 0 ? rest : rest.substring(0, hash);
    final anchor = hash < 0 ? null : anchorHeadings[rest.substring(hash + 1)];
    if (slug == 'home') {
      Navigator.of(context).popUntil((r) => r.isFirst);
      return;
    }
    await Navigator.of(context).push(routeForSlug(slug, anchor: anchor));
    return;
  }
  final uri = Uri.tryParse(url);
  if (uri == null) return;
  final isWeb = uri.scheme == 'http' || uri.scheme == 'https';
  final external = !isWeb || url.contains('paypal.com/donate');
  final ok = await launchUrl(
    uri,
    mode: external ? LaunchMode.externalApplication : LaunchMode.inAppBrowserView,
  ).catchError((_) => false);
  if (!ok && context.mounted) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text('Could not open ${uri.scheme == 'tel' ? uri.path : url}')));
  }
}

Future<void> donate(BuildContext context) => openLink(context, Org.donateUrl);

/// Builds an email draft to the club with the given subject/body.
Future<bool> composeEmail({required String subject, required String body, String to = Org.email}) {
  final uri = Uri(
    scheme: 'mailto',
    path: to,
    query: 'subject=${Uri.encodeComponent(subject)}&body=${Uri.encodeComponent(body)}',
  );
  return launchUrl(uri).catchError((_) => false);
}
