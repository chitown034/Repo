import 'package:google_fonts/google_fonts.dart';
import 'package:material_ui/material_ui.dart';

import 'app/theme.dart';
import 'data/benefits.dart';
import 'data/prefs.dart';
import 'data/site_content.dart';
import 'screens/shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Fonts are fetched once and cached; the app falls back to system fonts offline.
  GoogleFonts.config.allowRuntimeFetching = true;
  await Future.wait([Prefs.instance.load(), SiteContent.load()]);
  // Warm the 2,345-benefit database in the background.
  BenefitsDb.load();
  runApp(const HeroApp());
}

class HeroApp extends StatelessWidget {
  const HeroApp({super.key, this.home});

  /// Overridable for tests.
  final Widget? home;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Prefs.instance,
      builder: (context, _) => MaterialApp(
        title: 'Hometown Hero',
        debugShowCheckedModeBanner: false,
        scrollBehavior: const _BouncyScroll(),
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        themeMode: Prefs.instance.themeMode,
        home: home ?? const AppShell(),
      ),
    );
  }
}

/// iOS-style rubber-band scrolling on every platform.
class _BouncyScroll extends MaterialScrollBehavior {
  const _BouncyScroll();

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) =>
      const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics());

  @override
  Widget buildOverscrollIndicator(BuildContext context, Widget child, ScrollableDetails details) => child;
}
