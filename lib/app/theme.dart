import 'package:google_fonts/google_fonts.dart';
import 'package:material_ui/material_ui.dart';

/// Brand palette drawn from the club's shield logo: deep slate navy,
/// brushed-steel blue, and patriotic red, with a touch of honor gold.
class Brand {
  Brand._();

  static const navy950 = Color(0xFF0C141D);
  static const navy900 = Color(0xFF121C27);
  static const navy800 = Color(0xFF1A2633);
  static const navy700 = Color(0xFF22303F);
  static const navy600 = Color(0xFF2F3E50);
  static const blue = Color(0xFF23406A);
  static const steel = Color(0xFF7E93B0);
  static const steelLight = Color(0xFFB9C7DA);
  static const red = Color(0xFFC8414B);
  static const redBright = Color(0xFFE35D66);
  static const gold = Color(0xFFC9A227);
  static const paper = Color(0xFFF4F6F9);

  static const heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [navy700, navy900, navy950],
  );

  static const redGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [redBright, red],
  );
}

class AppTheme {
  AppTheme._();

  /// Tests turn this off so no fonts are downloaded.
  static bool useGoogleFonts = true;

  static TextTheme _text(TextTheme base, Color ink) {
    final body = useGoogleFonts ? GoogleFonts.interTextTheme(base) : base;
    TextStyle? serif(TextStyle? s, {FontWeight w = FontWeight.w700}) => useGoogleFonts
        ? GoogleFonts.volkhov(textStyle: s, fontWeight: w, color: ink, height: 1.15)
        : s?.copyWith(fontWeight: w, color: ink, height: 1.15);
    return body
        .copyWith(
          displayLarge: serif(base.displayLarge),
          displayMedium: serif(base.displayMedium),
          displaySmall: serif(base.displaySmall),
          headlineLarge: serif(base.headlineLarge),
          headlineMedium: serif(base.headlineMedium),
          headlineSmall: serif(base.headlineSmall),
          titleLarge: body.titleLarge?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -0.2),
          titleMedium: body.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          labelLarge: body.labelLarge?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 0.1),
        )
        .apply(bodyColor: ink, displayColor: ink);
  }

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(seedColor: Brand.blue, brightness: Brightness.light).copyWith(
      primary: Brand.blue,
      onPrimary: Colors.white,
      secondary: Brand.red,
      onSecondary: Colors.white,
      tertiary: Brand.gold,
      surface: Colors.white,
      surfaceContainerLowest: Colors.white,
      surfaceContainerLow: Brand.paper,
      surfaceContainer: const Color(0xFFEDF0F5),
      surfaceContainerHigh: const Color(0xFFE5E9F0),
      onSurface: const Color(0xFF111A24),
      onSurfaceVariant: const Color(0xFF4F5B6B),
      outlineVariant: const Color(0xFFDDE2EA),
    );
    return _build(scheme, Brand.paper);
  }

  static ThemeData dark() {
    final scheme = ColorScheme.fromSeed(seedColor: Brand.blue, brightness: Brightness.dark).copyWith(
      primary: const Color(0xFFA9BDD9),
      onPrimary: Brand.navy900,
      secondary: Brand.redBright,
      onSecondary: Colors.white,
      tertiary: const Color(0xFFE0BE52),
      surface: Brand.navy900,
      surfaceContainerLowest: Brand.navy950,
      surfaceContainerLow: const Color(0xFF16212C),
      surfaceContainer: Brand.navy800,
      surfaceContainerHigh: Brand.navy700,
      onSurface: const Color(0xFFE9EEF5),
      onSurfaceVariant: const Color(0xFFA7B3C3),
      outlineVariant: const Color(0xFF2D3B4B),
    );
    return _build(scheme, Brand.navy950);
  }

  static ThemeData _build(ColorScheme scheme, Color scaffold) {
    final base = ThemeData(colorScheme: scheme, useMaterial3: true);
    final text = _text(base.textTheme, scheme.onSurface);
    final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(14));
    return base.copyWith(
      scaffoldBackgroundColor: scaffold,
      textTheme: text,
      appBarTheme: AppBarTheme(
        backgroundColor: scaffold,
        foregroundColor: scheme.onSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: scheme.surfaceContainerLowest,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(color: scheme.outlineVariant),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(48, 50),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          shape: shape,
          textStyle: text.labelLarge,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(48, 50),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          shape: shape,
          textStyle: text.labelLarge,
        ),
      ),
      textButtonTheme: TextButtonThemeData(style: TextButton.styleFrom(textStyle: text.labelLarge)),
      chipTheme: base.chipTheme.copyWith(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        side: BorderSide(color: scheme.outlineVariant),
        labelStyle: text.labelMedium,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: scheme.surfaceContainerLowest,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: scheme.outlineVariant),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: scheme.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: scheme.primary, width: 1.6),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: scheme.surfaceContainerLowest,
        indicatorColor: scheme.primary.withValues(alpha: 0.14),
        surfaceTintColor: Colors.transparent,
        height: 68,
        labelTextStyle: WidgetStatePropertyAll(text.labelSmall?.copyWith(fontWeight: FontWeight.w600)),
      ),
      listTileTheme: ListTileThemeData(
        iconColor: scheme.primary,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
        titleTextStyle: text.titleMedium,
        subtitleTextStyle: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
      ),
      dividerTheme: DividerThemeData(color: scheme.outlineVariant, space: 1),
      snackBarTheme: const SnackBarThemeData(behavior: SnackBarBehavior.floating),
    );
  }
}
