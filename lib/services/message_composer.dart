import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../logic/referral.dart';

/// Opens one group text, the way the original app did.
///
/// - iPhone: Apple's message sheet slides up inside the app with the recipients and the
///   message filled in, and the app learns whether the user tapped Send or Cancel.
/// - Android: the phone's texting app opens with the group text ready.
///
/// Neither platform lets an app send a text without the user tapping Send.
class MessageComposer {
  static const channel = MethodChannel('org.hometownhero.app/message_composer');

  static Future<ComposeResult> compose(List<String> recipients, String body) async {
    final clean = [for (final r in recipients) r.replaceAll(RegExp(r'[^0-9+]'), '')];
    final native =
        !kIsWeb && (defaultTargetPlatform == TargetPlatform.iOS || defaultTargetPlatform == TargetPlatform.android);
    if (native) {
      try {
        final r = await channel.invokeMethod<String>('compose', {'recipients': clean, 'body': body});
        final result = switch (r) {
          'sent' => ComposeResult.sent,
          'cancelled' => ComposeResult.cancelled,
          'failed' => ComposeResult.failed,
          'opened' => ComposeResult.opened,
          _ => ComposeResult.unavailable,
        };
        if (result != ComposeResult.unavailable) return result;
      } on MissingPluginException {
        // Fall through to the link below.
      } on PlatformException {
        // Fall through to the link below.
      }
    }
    try {
      final ok = await launchUrl(referralSmsUri(clean, body));
      return ok ? ComposeResult.opened : ComposeResult.unavailable;
    } catch (_) {
      return ComposeResult.unavailable;
    }
  }
}
