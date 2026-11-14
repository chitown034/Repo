import 'package:active_duty/app/theme.dart';
import 'package:active_duty/logic/referral.dart';
import 'package:active_duty/main.dart';
import 'package:active_duty/screens/more/refer_screen.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart' show AppLifecycleState;
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('pre-drafted 3-way messages', () {
    test('every tone greets the friend by first name', () {
      for (final t in referralTones) {
        final text = fillReferral(t.template, 'Maria');
        expect(text, contains('Maria'), reason: t.id);
        expect(text, isNot(contains(referralToken)), reason: t.id);
      }
    });

    test('the Pay It Forward tones introduce Steven to the friend', () {
      final text = fillReferral(referralTones.first.template, 'Maria');
      expect(text, startsWith("Hey Maria, hope you're doing well."));
      expect(text, contains("I'm adding Steven here."));
      expect(text, endsWith('Steven, this is Maria. Take good care of them.'));
      for (final t in referralTones.where((t) => t.id != 'classic')) {
        expect(t.template, contains('Steven'), reason: t.id);
      }
    });

    test('no em dashes, and short enough for one text on older phones', () {
      for (final t in referralTones) {
        expect(t.template, isNot(contains('\u2014')), reason: t.id);
      }
      for (final t in referralTones.where((t) => t.id != 'classic')) {
        expect(fillReferral(t.template, 'Michael').length, lessThanOrEqualTo(300), reason: t.id);
      }
    });

    test('the original seminar invite is still offered', () {
      final classic = referralTones.firstWhere((t) => t.id == 'classic');
      expect(fillReferral(classic.template, 'Maria'), referralMessage('Maria'));
    });

    test('first names and phone comparison', () {
      expect(firstNameOf('Maria Elena Lopez'), 'Maria');
      expect(Invitee('James Carter', '555').firstName, 'James');
      expect(Invitee('Carter, J', '555', firstName: 'James').firstName, 'James');
      expect(phoneKey('+1 (619) 368-7141'), phoneKey('619-368-7141'));
    });

    test('each text is a group of the friend and Steven', () {
      final body = fillReferral(referralTones.first.template, 'Maria');
      final uri = referralSmsUri(['(702) 555-0123', '619-368-7141'], body, platform: TargetPlatform.iOS).toString();
      expect(uri, startsWith('sms:/open?addresses=7025550123,6193687141&body=Hey%20Maria'));
    });
  });

  group('send to everyone selected', () {
    List<Invitee> people() => [Invitee('Maria Lopez', '7025550123'), Invitee('James Carter', '7025550188')];
    Future<void> beat() => Future<void>.delayed(Duration.zero);

    test('iPhone message sheet: as soon as one text is sent, the next one opens', () async {
      final opened = <String>[];
      final run = SendRun(
        people(),
        beat: Duration.zero,
        open: (p) async {
          opened.add(p.firstName);
          return ComposeResult.sent;
        },
      );
      await run.send();
      await beat();
      await beat();
      expect(opened, ['Maria', 'James']);
      expect(run.sentCount, 2);
      expect(run.done, isTrue);
    });

    test('iPhone message sheet: Cancel stops and lets the user continue', () async {
      final opened = <String>[];
      final run = SendRun(
        people(),
        beat: Duration.zero,
        open: (p) async {
          opened.add(p.firstName);
          return p.firstName == 'Maria' ? ComposeResult.cancelled : ComposeResult.sent;
        },
      );
      await run.send();
      await beat();
      expect(opened, ['Maria']);
      expect(run.cancelled?.firstName, 'Maria');
      expect(run.sentCount, 0);
      run.people.first.sent = true; // the user chose to skip Maria
      run.resume();
      await beat();
      await beat();
      expect(opened, ['Maria', 'James']);
      expect(run.people.last.sent, isTrue);
    });

    test('Android texting app: each return to the app marks one sent and opens the next', () async {
      final opened = <String>[];
      final run = SendRun(
        people(),
        beat: Duration.zero,
        open: (p) async {
          opened.add(p.firstName);
          return ComposeResult.opened;
        },
      );
      await run.send();
      expect(opened, ['Maria']);
      // Coming back without ever leaving the app (e.g. a system dialog) changes nothing.
      run.onReturned();
      expect(run.sentCount, 0);
      run.onLeftApp();
      run.onReturned();
      expect(run.sentCount, 1);
      await beat();
      expect(opened, ['Maria', 'James']);
      run.onLeftApp();
      run.onReturned();
      await beat();
      expect(run.done, isTrue);
      expect(opened, ['Maria', 'James']);
    });

    test('pausing stops the automatic next text', () async {
      final opened = <String>[];
      final run = SendRun(
        people(),
        beat: Duration.zero,
        open: (p) async {
          opened.add(p.firstName);
          return ComposeResult.opened;
        },
      );
      await run.send();
      run.pause();
      run.onLeftApp();
      run.onReturned();
      await beat();
      expect(run.sentCount, 1);
      expect(opened, ['Maria']);
      expect(run.next?.firstName, 'James');
    });

    test('no messaging available: nothing is marked sent', () async {
      final run = SendRun(people(), beat: Duration.zero, open: (_) async => ComposeResult.unavailable);
      await run.send();
      expect(run.failed, isTrue);
      expect(run.sentCount, 0);
    });
  });

  testWidgets('Pay It Forward: contacts open on arrival, tick a friend, the 3-way text opens with their name', (
    tester,
  ) async {
    AppTheme.useGoogleFonts = false;
    SharedPreferences.setMockInitialValues({});
    var asked = 0;
    final texts = <String, String>{};
    await tester.pumpWidget(
      HeroApp(
        home: ReferScreen(
          loadContacts: () async {
            asked++;
            return [Invitee('James Carter', '7025550188'), Invitee('Maria Lopez', '7025550123')];
          },
          compose: (p, body) async {
            texts[p.phone] = body;
            return ComposeResult.sent;
          },
        ),
      ),
    );
    await tester.pump();
    await tester.pump();
    expect(asked, 1, reason: 'contacts are requested without tapping anything');
    expect(find.text('Choose from Contacts'), findsNothing);
    expect(find.text('James Carter'), findsOneWidget);
    expect(find.text('Maria Lopez'), findsOneWidget);
    await tester.tap(find.text('Maria Lopez'));
    await tester.tap(find.text('James Carter'));
    await tester.pump();
    expect(find.text('2 SELECTED'), findsOneWidget);
    await tester.tap(find.text('Send to 2 Friends'));
    await tester.pumpAndSettle();
    await tester.pump(const Duration(seconds: 1));
    await tester.pumpAndSettle();
    expect(texts.keys, ['7025550188', '7025550123']);
    expect(texts['7025550123'], startsWith('Hey Maria,'));
    expect(texts['7025550188'], startsWith('Hey James,'));
    expect(find.text('All 2 sent. Thank you.'), findsOneWidget);
  });

  testWidgets('Sending screen: texts opened in the texting app count once the user comes back', (tester) async {
    AppTheme.useGoogleFonts = false;
    SharedPreferences.setMockInitialValues({});
    final opened = <String>[];
    final people = [Invitee('Maria Lopez', '7025550123'), Invitee('James Carter', '7025550188')];
    await tester.pumpWidget(
      HeroApp(
        home: SendRunScreen(
          people: people,
          template: referralTones.first.template,
          compose: (p, body) async {
            opened.add(p.firstName);
            return ComposeResult.opened;
          },
        ),
      ),
    );
    await tester.pump();
    expect(opened, ['Maria']);
    expect(find.text('Text ready for Maria'), findsOneWidget);

    Future<void> leaveAndReturn() async {
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.inactive);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.hidden);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.hidden);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.inactive);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pump();
    }

    await leaveAndReturn();
    expect(find.text('1 of 2 sent'), findsOneWidget);
    await tester.pump(const Duration(seconds: 1));
    expect(opened, ['Maria', 'James']);

    await leaveAndReturn();
    await tester.pump(const Duration(seconds: 1));
    expect(find.text('All 2 sent. Thank you.'), findsOneWidget);
    expect(find.text('Done'), findsOneWidget);
    expect(opened, ['Maria', 'James']);
  });

  testWidgets('Pay It Forward offers Settings when contacts access is refused', (tester) async {
    AppTheme.useGoogleFonts = false;
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(HeroApp(home: ReferScreen(loadContacts: () async => null)));
    await tester.pump();
    await tester.pump();
    expect(find.text('Open Settings'), findsOneWidget);
    expect(find.text('Choose from Contacts'), findsOneWidget);
    expect(find.text('Add Phone Number'), findsOneWidget);
  });
}
