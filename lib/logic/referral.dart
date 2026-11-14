import 'package:flutter/foundation.dart';

/// Pay It Forward referral logic: pre-drafted 3-way intro texts (the friend,
/// the sender, and Steven). The wording matches chitown034.github.io/pay-it-forward.

const referralToken = '[First Name]';

class ReferralTone {
  const ReferralTone(this.id, this.name, this.blurb, this.template);
  final String id;
  final String name;
  final String blurb;

  /// Message with [referralToken] wherever the friend's first name goes.
  final String template;
}

/// The seminar invite text from the original app, personalized per friend.
String referralMessage(String name) => _classic.replaceAll(referralToken, name.trim().isEmpty ? 'there' : name.trim());

const _classic =
    'Hi $referralToken, I just attended this awesome VA Home Buying Seminar '
    'hosted by Active Duty Veteran and Hometown Hero Homeowners Club, and I was amazed by all the information '
    'shared at this event. Many MYTHS of credit score requirements were dispelled, NO private mortgage '
    'insurance, ZERO down payment, LOW interest rates were all explained in detail and much MORE. I thought '
    'you would appreciate learning about the VA Home Buying seminar for FREE. Just take an hour out of your '
    'day to learn about this great benefit!';

const referralTones = <ReferralTone>[
  ReferralTone(
    'default',
    'Default',
    'Warm, a little story',
    "Hey $referralToken, hope you're doing well. I went to a VA home buying seminar today and thought of you right away. I'm adding Steven here. He's a Navy vet who helps veterans use their VA home loan benefit, and he'll walk you through yours for free.\n\nSteven, this is $referralToken. Take good care of them.",
  ),
  ReferralTone(
    'short',
    'Short',
    'Quick and to the point',
    "Hey $referralToken, I just left a VA home buying seminar and thought of you. I'm adding Steven here. He's a Navy vet who does VA home loans, and he'll go over your benefits with you for free.\n\nSteven, meet $referralToken.",
  ),
  ReferralTone(
    'family',
    'Family',
    'For relatives and close friends',
    "Hey $referralToken, I went to a VA home buying seminar today and you were the first person I thought of. I'm adding Steven here. He's a Navy vet who does VA loans, and he'll go over your benefits for free. No pressure, just hear him out.\n\nSteven, this is $referralToken. They're family, so take good care of them.",
  ),
  ReferralTone(
    'direct',
    'Direct',
    'Straight to it',
    "$referralToken, you should be using your VA home loan benefit. I'm adding Steven here. He's a Navy vet and VA loan specialist who ran the seminar I went to today, and he'll walk you through it for free.\n\nSteven, this is $referralToken. Take care of them.",
  ),
  ReferralTone('classic', 'Seminar Invite', 'The original invite to the free seminar', _classic),
];

/// Fills a template with the friend's first name.
String fillReferral(String template, String firstName) {
  final n = firstName.trim();
  return template.replaceAll(referralToken, n.isEmpty ? 'there' : n);
}

/// First word of a contact's name, for the greeting.
String firstNameOf(String fullName) {
  final parts = fullName.trim().split(RegExp(r'\s+'));
  return parts.isEmpty ? '' : parts.first;
}

/// Digits only, without a leading US country code, for comparing numbers.
String phoneKey(String phone) {
  final d = phone.replaceAll(RegExp(r'\D'), '');
  return d.length == 11 && d.startsWith('1') ? d.substring(1) : d;
}

/// Builds the SMS composer link for one group text. Like the original app,
/// each text goes to the friend and to Steven so he can follow up.
Uri referralSmsUri(List<String> recipients, String body, {TargetPlatform? platform}) {
  final p = platform ?? defaultTargetPlatform;
  final clean = [for (final r in recipients) r.replaceAll(RegExp(r'[^0-9+]'), '')];
  final encoded = Uri.encodeComponent(body);
  if (p == TargetPlatform.iOS) {
    return Uri.parse('sms:/open?addresses=${clean.join(',')}&body=$encoded');
  }
  return Uri.parse('smsto:${clean.join(';')}?body=$encoded');
}

/// One person to introduce.
class Invitee {
  Invitee(this.name, this.phone, {String? firstName}) : firstName = firstName ?? firstNameOf(name);
  final String name;
  final String firstName;
  final String phone;
  bool selected = false;
  bool sent = false;
}

/// How opening one text ended.
enum ComposeResult {
  /// iPhone's in-app message sheet: the user tapped Send.
  sent,

  /// iPhone's in-app message sheet: the user closed it without sending.
  cancelled,

  /// iPhone's in-app message sheet: the text could not be sent.
  failed,

  /// The phone's texting app was opened (Android, or the fallback link). The app
  /// can't see what happens there, so the text counts as sent once the user comes back.
  opened,

  /// This device can't send texts.
  unavailable,
}

/// Sends to everyone selected, one group text per person, like the original app:
/// the text for the first person opens, and as soon as it is sent the next one opens,
/// until everyone selected is done.
class SendRun extends ChangeNotifier {
  SendRun(this.people, {required this.open, this.beat = const Duration(milliseconds: 700)});

  final List<Invitee> people;

  /// Opens the text for one person.
  final Future<ComposeResult> Function(Invitee) open;

  /// Pause between one text and the next, so the user sees the progress.
  final Duration beat;

  Invitee? _awaiting;
  bool _external = false;
  bool _leftApp = false;
  bool _cameBack = false;
  bool _disposed = false;
  bool auto = true;

  /// This device can't send texts.
  bool failed = false;

  /// The last text that was closed without sending.
  Invitee? cancelled;

  /// The last text that could not be sent.
  Invitee? sendError;

  Invitee? get awaiting => _awaiting;
  Invitee? get next => people.where((p) => !p.sent).firstOrNull;
  int get sentCount => people.where((p) => p.sent).length;
  bool get done => next == null;

  void _notify() {
    if (!_disposed) notifyListeners();
  }

  /// Opens the text for [person], or for the next unsent person.
  Future<void> send([Invitee? person]) async {
    final p = person ?? next;
    if (p == null || _disposed) return;
    if (_awaiting != null && _awaiting != p) return;
    _awaiting = p;
    _external = false;
    _leftApp = false;
    _cameBack = false;
    failed = false;
    cancelled = null;
    sendError = null;
    _notify();
    ComposeResult r;
    try {
      r = await open(p);
    } catch (_) {
      r = ComposeResult.unavailable;
    }
    if (_disposed || _awaiting != p) return;
    switch (r) {
      case ComposeResult.sent:
        _complete(p);
      case ComposeResult.opened:
        _external = true;
        // The user may already have gone to Messages and come back before the reply arrived.
        if (_leftApp && _cameBack) {
          _complete(p);
        } else {
          _notify();
        }
      case ComposeResult.cancelled:
        _awaiting = null;
        auto = false;
        cancelled = p;
        _notify();
      case ComposeResult.failed:
        _awaiting = null;
        auto = false;
        sendError = p;
        _notify();
      case ComposeResult.unavailable:
        _awaiting = null;
        auto = false;
        failed = true;
        _notify();
    }
  }

  void _complete(Invitee p) {
    p.sent = true;
    _awaiting = null;
    _external = false;
    _leftApp = false;
    _cameBack = false;
    _notify();
    final n = next;
    if (auto && n != null) {
      Future<void>.delayed(beat, () {
        if (!_disposed && auto && _awaiting == null && !n.sent) send(n);
      });
    }
  }

  /// The app went to the background (the texting app took over).
  void onLeftApp() {
    if (_awaiting != null) _leftApp = true;
  }

  /// The app is in front again: a text opened in the texting app counts as sent.
  void onReturned() {
    final p = _awaiting;
    if (p == null || !_leftApp) return;
    if (!_external) {
      _cameBack = true;
      return;
    }
    _complete(p);
  }

  /// Picks up again with the next unsent person.
  void resume() {
    auto = true;
    send();
  }

  void pause() {
    auto = false;
    _notify();
  }

  void retry(Invitee p) {
    p.sent = false;
    _notify();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
