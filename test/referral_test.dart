import 'package:active_duty/app/theme.dart';
import 'package:active_duty/logic/referral.dart';
import 'package:active_duty/main.dart';
import 'package:active_duty/screens/more/refer_screen.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart' show AppLifecycleState, Scrollable;
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

    test('each return from Messages marks one sent and queues the next', () async {
      final opened = <String>[];
      final run = SendRun(
        people(),
        open: (p) async {
          opened.add(p.firstName);
          return true;
        },
      );
      await run.send();
      expect(opened, ['Maria']);
      // Coming back without ever leaving the app (e.g. a system dialog) changes nothing.
      expect(run.onReturned(), isNull);
      expect(run.sentCount, 0);
      run.onLeftApp();
      final next = run.onReturned();
      expect(run.sentCount, 1);
      expect(next?.firstName, 'James');
      await run.send(next);
      run.onLeftApp();
      expect(run.onReturned(), isNull);
      expect(run.done, isTrue);
      expect(opened, ['Maria', 'James']);
    });

    test('pausing stops the automatic next text', () async {
      final run = SendRun(people(), open: (_) async => true);
      await run.send();
      run.pause();
      run.onLeftApp();
      expect(run.onReturned(), isNull);
      expect(run.sentCount, 1);
      expect(run.next?.firstName, 'James');
    });

    test('no messaging app: nothing is marked sent', () async {
      final run = SendRun(people(), open: (_) async => false);
      await run.send();
      expect(run.failed, isTrue);
      expect(run.sentCount, 0);
    });
  });

  testWidgets('Send run opens Messages for each person in turn', (tester) async {
    AppTheme.useGoogleFonts = false;
    SharedPreferences.setMockInitialValues({});
    final opened = <String>[];
    final people = [Invitee('Maria Lopez', '7025550123'), Invitee('James Carter', '7025550188')];
    await tester.pumpWidget(
      HeroApp(
        home: SendRunScreen(
          people: people,
          template: referralTones.first.template,
          open: (p) async {
            opened.add(p.firstName);
            return true;
          },
        ),
      ),
    );
    await tester.pump();
    expect(opened, ['Maria']);
    expect(find.text('Messages is open for Maria'), findsOneWidget);

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

  testWidgets('Pay It Forward opens the phone contact directory as soon as the screen opens', (tester) async {
    AppTheme.useGoogleFonts = false;
    SharedPreferences.setMockInitialValues({});
    var asked = 0;
    await tester.pumpWidget(
      HeroApp(
        home: ReferScreen(
          loadContacts: () async {
            asked++;
            return [Invitee('James Carter', '7025550188'), Invitee('Maria Lopez', '7025550123')];
          },
        ),
      ),
    );
    await tester.pump();
    await tester.pump();
    expect(asked, 1, reason: 'contacts are requested without tapping anything');
    expect(find.text('Choose from Contacts'), findsNothing);
    await tester.scrollUntilVisible(find.text('Maria Lopez'), 300, scrollable: find.byType(Scrollable).first);
    await tester.tap(find.text('Maria Lopez'));
    await tester.pump();
    expect(find.text('Send to 1 Friend'), findsOneWidget);
    expect(find.textContaining('Hey Maria,'), findsOneWidget);
  });

  testWidgets('Pay It Forward offers Settings when contacts access is refused', (tester) async {
    AppTheme.useGoogleFonts = false;
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(HeroApp(home: ReferScreen(loadContacts: () async => null)));
    await tester.pump();
    await tester.pump();
    await tester.scrollUntilVisible(find.text('Open Settings'), 300, scrollable: find.byType(Scrollable).first);
    expect(find.text('Choose from Contacts'), findsOneWidget);
    expect(find.text('Add Phone Number'), findsOneWidget);
  });
}
