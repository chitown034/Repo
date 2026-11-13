import 'package:material_ui/material_ui.dart';

import '../data/catalog.dart';
import '../ui/apple.dart';

import '../screens/benefits/benefits_finder_screen.dart';
import '../screens/content_page_screen.dart';
import '../screens/more/board_screen.dart';
import '../screens/more/contact_screen.dart';
import '../screens/more/testimonials_screen.dart';
import '../screens/tools/calculators_screen.dart';
import '../screens/tools/career_center_screen.dart';
import '../screens/tools/webinar_screen.dart';

/// Website page slug → native screen.
Widget screenForSlug(String slug, {String? anchor}) {
  switch (slug) {
    case 'calculators':
      return const CalculatorsScreen();
    case 'career-command-center':
      return const CareerCenterScreen();
    case 'veteran-benefits-finder':
      return const BenefitsFinderScreen(standalone: true);
    case 'va-home-buying-webinar':
      return const WebinarScreen();
    case 'contact-us':
      return const ContactScreen();
    case 'board-members':
      return const BoardScreen();
    case 'testimonials':
      return const TestimonialsScreen();
    default:
      return ContentPageScreen(slug: slug, anchor: anchor);
  }
}

Route<void> routeForSlug(String slug, {String? anchor}) =>
    appleRoute(screenForSlug(slug, anchor: anchor), title: titleForSlug(slug, ''));

Future<void> pushScreen(BuildContext context, Widget screen, {String? title}) =>
    Navigator.of(context).push(appleRoute(screen, title: title));
