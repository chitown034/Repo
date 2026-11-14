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

/// Sends to everyone selected, one group text per person. The app can't see
/// whether Send was tapped in Messages, so a text counts as sent once the
/// user has left for Messages and come back.
class SendRun extends ChangeNotifier {
  SendRun(this.people, {required this.open});

  final List<Invitee> people;

  /// Opens the composer for one person; false when no messaging app is available.
  final Future<bool> Function(Invitee) open;

  Invitee? _awaiting;
  bool _leftApp = false;
  bool auto = true;
  bool failed = false;

  Invitee? get awaiting => _awaiting;
  Invitee? get next => people.where((p) => !p.sent).firstOrNull;
  int get sentCount => people.where((p) => p.sent).length;
  bool get done => next == null;

  /// Opens the composer for [person], or for the next unsent person.
  Future<void> send([Invitee? person]) async {
    final p = person ?? next;
    if (p == null) return;
    _awaiting = p;
    _leftApp = false;
    failed = false;
    notifyListeners();
    final ok = await open(p);
    if (!ok) {
      _awaiting = null;
      failed = true;
      auto = false;
    }
    notifyListeners();
  }

  /// The app went to the background (Messages took over).
  void onLeftApp() {
    if (_awaiting != null) _leftApp = true;
  }

  /// The app is in front again. Returns the next person to open automatically, if any.
  Invitee? onReturned() {
    final p = _awaiting;
    if (p == null || !_leftApp) return null;
    p.sent = true;
    _awaiting = null;
    _leftApp = false;
    notifyListeners();
    return auto ? next : null;
  }

  void pause() {
    auto = false;
    notifyListeners();
  }

  void retry(Invitee p) {
    p.sent = false;
    notifyListeners();
  }
}
