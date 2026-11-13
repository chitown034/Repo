import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:flutter/foundation.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:material_ui/material_ui.dart';

import '../ui/apple.dart';

/// Brand colors from the club's shield logo.
class Brand {
  Brand._();

  static const navy950 = Color(0xFF0B1119);
  static const navy900 = Color(0xFF15202E);
  static const navy700 = Color(0xFF2B3D55);
  static const steelLight = Color(0xFFB9C7DA);
  static const red = Color(0xFFC8414B);
  static const gold = Color(0xFFC9A227);
}

/// Apple Human Interface Guidelines theme. iPhones use the system font
/// (San Francisco); other platforms use Inter, its closest open equivalent.
class AppTheme {
  AppTheme._();

  /// Tests turn this off so no fonts are downloaded.
  static bool useGoogleFonts = true;

  static bool get _systemFont => defaultTargetPlatform == TargetPlatform.iOS || !useGoogleFonts;

  static TextTheme _text(Color ink) {
    TextStyle s(double size, FontWeight w, double tracking, {double height = 1.25}) =>
        TextStyle(fontSize: size, fontWeight: w, letterSpacing: tracking, height: height, color: ink);
    final base = TextTheme(
      displayLarge: s(40, FontWeight.w700, -0.8),
      displayMedium: s(36, FontWeight.w700, -0.7),
      displaySmall: s(34, FontWeight.w700, -0.6, height: 1.15), // Large Title
      headlineLarge: s(30, FontWeight.w700, -0.5),
      headlineMedium: s(28, FontWeight.w700, -0.5, height: 1.18), // Title 1
      headlineSmall: s(22, FontWeight.w700, -0.35), // Title 2
      titleLarge: s(20, FontWeight.w600, -0.3), // Title 3
      titleMedium: s(17, FontWeight.w600, -0.3), // Headline
      titleSmall: s(15, FontWeight.w600, -0.15), // Subheadline (bold)
      bodyLarge: s(17, FontWeight.w400, -0.3, height: 1.3), // Body
      bodyMedium: s(15, FontWeight.w400, -0.15, height: 1.33), // Subheadline
      bodySmall: s(13, FontWeight.w400, -0.05), // Footnote
      labelLarge: s(17, FontWeight.w600, -0.3), // Buttons
      labelMedium: s(15, FontWeight.w500, -0.15),
      labelSmall: s(12, FontWeight.w500, 0), // Caption
    );
    return _systemFont ? base : GoogleFonts.interTextTheme(base);
  }

  static ThemeData light() => _build(AppPalette.light, Brightness.light);
  static ThemeData dark() => _build(AppPalette.darkPalette, Brightness.dark);

  static ThemeData _build(AppPalette c, Brightness brightness) {
    final text = _text(c.label);
    final scheme = ColorScheme.fromSeed(seedColor: c.tint, brightness: brightness).copyWith(
      primary: c.tint,
      onPrimary: Colors.white,
      secondary: c.red,
      onSecondary: Colors.white,
      tertiary: c.gold,
      surface: c.card,
      surfaceContainerLowest: c.card,
      surfaceContainerLow: c.bg,
      surfaceContainer: c.card,
      surfaceContainerHigh: c.cardRaised,
      onSurface: c.label,
      onSurfaceVariant: c.secondaryLabel,
      outlineVariant: c.separator,
      error: c.red,
    );
    final cupertino = CupertinoThemeData(
      brightness: brightness,
      primaryColor: c.tint,
      scaffoldBackgroundColor: c.bg,
      barBackgroundColor: c.bg.withValues(alpha: 0.86),
      textTheme: CupertinoTextThemeData(
        primaryColor: c.tint,
        textStyle: text.bodyLarge,
        actionTextStyle: text.bodyLarge?.copyWith(color: c.tint),
        navTitleTextStyle: text.titleMedium,
        navLargeTitleTextStyle: text.displaySmall,
        navActionTextStyle: text.bodyLarge?.copyWith(color: c.tint),
        tabLabelTextStyle: text.labelSmall?.copyWith(fontSize: 10, letterSpacing: 0.1),
        pickerTextStyle: text.titleLarge?.copyWith(fontWeight: FontWeight.w400),
      ),
    );
    final base = ThemeData(colorScheme: scheme, useMaterial3: true, brightness: brightness);
    return base.copyWith(
      scaffoldBackgroundColor: c.bg,
      canvasColor: c.bg,
      textTheme: text,
      cupertinoOverrideTheme: cupertino,
      // No Material ripples: iOS uses a quiet gray press highlight.
      splashFactory: NoSplash.splashFactory,
      highlightColor: c.fill,
      hoverColor: c.fill.withValues(alpha: 0.5),
      dividerTheme: DividerThemeData(color: c.separator, thickness: 0.5, space: 0.5),
      iconTheme: IconThemeData(color: c.tint),
      textSelectionTheme: TextSelectionThemeData(cursorColor: c.tint, selectionHandleColor: c.tint),
      inputDecorationTheme: InputDecorationTheme(
        border: InputBorder.none,
        enabledBorder: InputBorder.none,
        focusedBorder: InputBorder.none,
        errorBorder: InputBorder.none,
        focusedErrorBorder: InputBorder.none,
        isDense: true,
        contentPadding: EdgeInsets.zero,
        hintStyle: text.bodyLarge?.copyWith(color: c.tertiaryLabel),
        errorStyle: text.bodySmall?.copyWith(color: c.red),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: c.dark ? const Color(0xFF2C2C2E) : const Color(0xF21C1C1E),
        contentTextStyle: text.titleSmall?.copyWith(color: Colors.white),
        behavior: SnackBarBehavior.floating,
        elevation: 0,
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: c.bg,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        dragHandleColor: c.tertiaryLabel,
        shape: const RoundedSuperellipseBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(22))),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(color: c.tint),
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
        },
      ),
    );
  }
}
