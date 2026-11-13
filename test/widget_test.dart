import 'dart:io';

import 'package:active_duty/app/theme.dart';
import 'package:active_duty/data/site_content.dart';
import 'package:active_duty/main.dart';
import 'package:active_duty/screens/content_page_screen.dart';
import 'package:active_duty/screens/more/contact_screen.dart';
import 'package:active_duty/screens/tools/calculators_screen.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUpAll(() {
    AppTheme.useGoogleFonts = false;
    SharedPreferences.setMockInitialValues({});
    SiteContent.setInstance(SiteContent.parse(File('assets/content/site.json').readAsStringSync()));
  });

  testWidgets('home renders and every tab opens', (tester) async {
    tester.view.physicalSize = const Size(1179, 2556);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const HeroApp());
    await tester.pump();
    expect(find.text('Serving those who served.'), findsOneWidget);
    expect(find.text('Find benefits'), findsOneWidget);

    await tester.tap(find.text('Resources'));
    await tester.pumpAndSettle();
    expect(find.text('Veteran Resources'), findsWidgets);

    await tester.tap(find.text('Tools'));
    await tester.pumpAndSettle();
    expect(find.text('VA loan calculators'), findsOneWidget);

    // Contact is the last tab and links to everything that used to be under "More".
    final labels = tester.widgetList<NavigationDestination>(find.byType(NavigationDestination)).map((d) => d.label);
    expect(labels, ['Home', 'Benefits', 'Resources', 'Tools', 'Contact']);
    await tester.tap(find.text('Contact'));
    await tester.pumpAndSettle();
    expect(find.text('Send us a message'), findsOneWidget);
    await tester.drag(find.byType(ContactScreen), const Offset(0, -3000));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Donate, invite friends & settings'));
    await tester.pumpAndSettle();
    expect(find.text('Get involved'), findsOneWidget);
    expect(find.text('Invite friends to the VA seminar', skipOffstage: false), findsOneWidget);
  });

  testWidgets('calculators show the same result as the website', (tester) async {
    await tester.pumpWidget(const HeroApp(home: CalculatorsScreen()));
    await tester.pumpAndSettle();
    expect(find.text('Estimated monthly payment'), findsOneWidget);
    expect(find.text('\$4,834'), findsOneWidget);
  });

  testWidgets('a converted website page renders natively', (tester) async {
    await tester.pumpWidget(const HeroApp(home: ContentPageScreen(slug: 'mental-health')));
    await tester.pumpAndSettle();
    expect(find.text('Mental Health'), findsWidgets);
    expect(find.text('Give an Hour'), findsOneWidget);
  });
}
