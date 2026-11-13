import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';

/// Design system modeled on Apple's Human Interface Guidelines:
/// grouped backgrounds, inset-grouped lists, SF-style type scale,
/// continuous-corner (superellipse) shapes, and quiet press highlights.

// ───────────────────────────── Color ─────────────────────────────

class AppPalette {
  const AppPalette._({
    required this.dark,
    required this.bg,
    required this.card,
    required this.cardRaised,
    required this.fill,
    required this.label,
    required this.secondaryLabel,
    required this.tertiaryLabel,
    required this.separator,
    required this.tint,
    required this.red,
    required this.gold,
    required this.green,
  });

  final bool dark;

  /// systemGroupedBackground
  final Color bg;

  /// secondarySystemGroupedBackground
  final Color card;

  /// tertiarySystemGroupedBackground
  final Color cardRaised;

  /// tertiarySystemFill — search fields, chips, press highlight.
  final Color fill;
  final Color label;
  final Color secondaryLabel;
  final Color tertiaryLabel;
  final Color separator;

  /// Brand navy, tuned for legibility as an iOS tint color.
  final Color tint;
  final Color red;
  final Color gold;
  final Color green;

  static const light = AppPalette._(
    dark: false,
    bg: Color(0xFFF2F2F7),
    card: Color(0xFFFFFFFF),
    cardRaised: Color(0xFFF2F2F7),
    fill: Color(0x1F767680),
    label: Color(0xFF000000),
    secondaryLabel: Color(0x993C3C43),
    tertiaryLabel: Color(0x4D3C3C43),
    separator: Color(0x4A3C3C43),
    tint: Color(0xFF1D4F91),
    red: Color(0xFFD33A44),
    gold: Color(0xFFB8901A),
    green: Color(0xFF248A3D),
  );

  static const darkPalette = AppPalette._(
    dark: true,
    bg: Color(0xFF000000),
    card: Color(0xFF1C1C1E),
    cardRaised: Color(0xFF2C2C2E),
    fill: Color(0x3D767680),
    label: Color(0xFFFFFFFF),
    secondaryLabel: Color(0x99EBEBF5),
    tertiaryLabel: Color(0x4DEBEBF5),
    separator: Color(0xA6545458),
    tint: Color(0xFF6FA8FF),
    red: Color(0xFFFF6B73),
    gold: Color(0xFFE5C04F),
    green: Color(0xFF30D158),
  );

  static AppPalette of(BuildContext context) => Theme.of(context).brightness == Brightness.dark ? darkPalette : light;
}

extension AppleContext on BuildContext {
  AppPalette get c => AppPalette.of(this);
  TextTheme get t => Theme.of(this).textTheme;
}

/// Settings-app style icon badge colors.
class Hue {
  Hue._();
  static const blue = Color(0xFF0A84FF);
  static const navy = Color(0xFF1D4F91);
  static const red = Color(0xFFFF3B30);
  static const orange = Color(0xFFFF9500);
  static const yellow = Color(0xFFFFCC00);
  static const green = Color(0xFF34C759);
  static const teal = Color(0xFF30B0C7);
  static const indigo = Color(0xFF5856D6);
  static const purple = Color(0xFFAF52DE);
  static const pink = Color(0xFFFF2D55);
  static const brown = Color(0xFFA2845E);
  static const gray = Color(0xFF8E8E93);
}

/// Hero gradients (Apple Card / Wallet feel) built from the logo's navy and steel.
class Gradients {
  Gradients._();
  static const navy = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF2B3D55), Color(0xFF15202E), Color(0xFF0B1119)],
  );
  static const red = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF0626B), Color(0xFFC8333E)],
  );
}

// ───────────────────────────── Shape ─────────────────────────────

ShapeBorder squircle(double r) => RoundedSuperellipseBorder(borderRadius: BorderRadius.circular(r));

Decoration cardDecoration(BuildContext context, {double radius = 20, Color? color, Gradient? gradient}) =>
    ShapeDecoration(
      shape: squircle(radius),
      color: gradient == null ? (color ?? context.c.card) : null,
      gradient: gradient,
      shadows: context.c.dark
          ? null
          : const [BoxShadow(color: Color(0x0F000000), blurRadius: 16, offset: Offset(0, 4))],
    );

const kGutter = 16.0;
const kPage = EdgeInsets.symmetric(horizontal: kGutter);

// ───────────────────────────── Navigation ─────────────────────────────

Route<T> appleRoute<T>(Widget page, {String? title}) => CupertinoPageRoute<T>(builder: (_) => page, title: title);

/// A screen with an iOS large title that collapses into a blurred bar.
class LargeTitleScaffold extends StatelessWidget {
  const LargeTitleScaffold({
    super.key,
    required this.title,
    required this.slivers,
    this.trailing,
    this.bottomBar,
    this.floating,
    this.controller,
  });

  final String title;
  final List<Widget> slivers;
  final Widget? trailing;
  final Widget? bottomBar;
  final Widget? floating;
  final ScrollController? controller;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Scaffold(
      backgroundColor: c.bg,
      bottomNavigationBar: bottomBar,
      floatingActionButton: floating,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      body: CustomScrollView(
        controller: controller,
        slivers: [
          CupertinoSliverNavigationBar(
            largeTitle: Text(title),
            middle: Text(title),
            alwaysShowMiddle: false,
            automaticallyImplyTitle: false,
            trailing: trailing,
            backgroundColor: c.bg.withValues(alpha: 0.86),
            border: Border(bottom: BorderSide(color: c.separator, width: 0)),
          ),
          ...slivers,
          SliverToBoxAdapter(child: SizedBox(height: 32 + MediaQuery.paddingOf(context).bottom)),
        ],
      ),
    );
  }
}

/// Standard (small title) iOS navigation bar for detail screens.
PreferredSizeWidget appleBar(BuildContext context, String title, {Widget? trailing}) => CupertinoNavigationBar(
  middle: Text(title, overflow: TextOverflow.ellipsis),
  trailing: trailing,
  automaticallyImplyMiddle: false,
  backgroundColor: context.c.bg.withValues(alpha: 0.86),
  border: Border(bottom: BorderSide(color: context.c.separator, width: 0)),
);

/// Icon button sized and tinted like a navigation bar item.
class BarButton extends StatelessWidget {
  const BarButton({super.key, required this.icon, required this.onPressed, this.tooltip, this.color});
  final IconData icon;
  final VoidCallback onPressed;
  final String? tooltip;
  final Color? color;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    label: tooltip,
    child: CupertinoButton(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      minimumSize: const Size(36, 36),
      onPressed: onPressed,
      child: Icon(icon, size: 24, color: color ?? context.c.tint),
    ),
  );
}

// ───────────────────────────── Type helpers ─────────────────────────────

class SectionTitle extends StatelessWidget {
  const SectionTitle(this.title, {super.key, this.subtitle, this.action, this.onAction, this.top = 28});
  final String title;
  final String? subtitle;
  final String? action;
  final VoidCallback? onAction;
  final double top;

  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.fromLTRB(kGutter + 4, top, kGutter, 10),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Expanded(child: Text(title, style: context.t.headlineSmall)),
            if (action != null)
              CupertinoButton(
                padding: EdgeInsets.zero,
                minimumSize: const Size(0, 0),
                onPressed: onAction,
                child: Text(action!, style: context.t.bodyLarge?.copyWith(color: context.c.tint)),
              ),
          ],
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 4),
          Text(subtitle!, style: context.t.bodyMedium?.copyWith(color: context.c.secondaryLabel)),
        ],
      ],
    ),
  );
}

class Caption extends StatelessWidget {
  const Caption(this.text, {super.key, this.color});
  final String text;
  final Color? color;

  @override
  Widget build(BuildContext context) => Text(
    text.toUpperCase(),
    style: context.t.labelSmall?.copyWith(
      color: color ?? context.c.secondaryLabel,
      letterSpacing: 0.6,
      fontWeight: FontWeight.w600,
    ),
  );
}

// ───────────────────────────── Lists ─────────────────────────────

/// iOS inset-grouped list section.
class InsetSection extends StatelessWidget {
  const InsetSection({
    super.key,
    required this.children,
    this.header,
    this.footer,
    this.dividerIndent = 58,
    this.margin = const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 22),
  });

  final List<Widget> children;
  final String? header;
  final String? footer;
  final double dividerIndent;
  final EdgeInsets margin;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Padding(
      padding: margin,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (header != null) Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 7), child: Caption(header!)),
          ClipRSuperellipse(
            borderRadius: BorderRadius.circular(14),
            child: ColoredBox(
              color: c.card,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (var i = 0; i < children.length; i++) ...[
                    if (i > 0)
                      Padding(
                        padding: EdgeInsets.only(left: dividerIndent),
                        child: Container(height: 0.5, color: c.separator),
                      ),
                    children[i],
                  ],
                ],
              ),
            ),
          ),
          if (footer != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 7, 16, 0),
              child: Text(footer!, style: context.t.bodySmall?.copyWith(color: c.secondaryLabel)),
            ),
        ],
      ),
    );
  }
}

/// Rounded-square colored icon, as in the iOS Settings app.
class IconBadge extends StatelessWidget {
  const IconBadge(this.icon, {super.key, this.color = Hue.navy, this.size = 30});
  final IconData icon;
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: ShapeDecoration(color: color, shape: squircle(size * 0.25)),
    child: Icon(icon, color: Colors.white, size: size * 0.62),
  );
}

/// Trailing accessory for rows.
enum RowAccessory { chevron, external, none }

/// A list row: optional badge, title, subtitle, value, and accessory.
class AppleRow extends StatelessWidget {
  const AppleRow({
    super.key,
    required this.title,
    this.subtitle,
    this.icon,
    this.iconColor = Hue.navy,
    this.leading,
    this.value,
    this.trailing,
    this.onTap,
    this.accessory = RowAccessory.chevron,
    this.subtitleLines = 2,
    this.titleColor,
    this.overline,
  });

  final String title;
  final String? subtitle;
  final String? overline;
  final IconData? icon;
  final Color iconColor;
  final Widget? leading;
  final String? value;
  final Widget? trailing;
  final VoidCallback? onTap;
  final RowAccessory accessory;
  final int subtitleLines;
  final Color? titleColor;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final lead = leading ?? (icon != null ? IconBadge(icon!, color: iconColor) : null);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 46),
          child: Padding(
            padding: EdgeInsets.fromLTRB(16, subtitle == null ? 11 : 10, 14, subtitle == null ? 11 : 10),
            child: Row(
              children: [
                if (lead != null) ...[lead, const SizedBox(width: 12)],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (overline != null && overline!.isNotEmpty) ...[
                        Text(
                          overline!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: context.t.labelSmall?.copyWith(color: c.tint, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 2),
                      ],
                      Text(title, style: context.t.bodyLarge?.copyWith(color: titleColor ?? c.label)),
                      if (subtitle != null && subtitle!.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          subtitle!,
                          maxLines: subtitleLines,
                          overflow: TextOverflow.ellipsis,
                          style: context.t.bodyMedium?.copyWith(color: c.secondaryLabel),
                        ),
                      ],
                    ],
                  ),
                ),
                if (value != null) ...[
                  const SizedBox(width: 8),
                  Text(value!, style: context.t.bodyLarge?.copyWith(color: c.secondaryLabel)),
                ],
                ?trailing,
                if (accessory != RowAccessory.none && trailing == null) ...[
                  const SizedBox(width: 8),
                  Icon(
                    accessory == RowAccessory.chevron ? CupertinoIcons.chevron_forward : CupertinoIcons.arrow_up_right,
                    size: accessory == RowAccessory.chevron ? 16 : 15,
                    color: c.tertiaryLabel,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Expandable row for FAQs and long sections (iOS disclosure style).
class DisclosureRow extends StatefulWidget {
  const DisclosureRow({super.key, required this.title, required this.body, this.initiallyOpen = false});
  final String title;
  final String body;
  final bool initiallyOpen;

  @override
  State<DisclosureRow> createState() => _DisclosureRowState();
}

class _DisclosureRowState extends State<DisclosureRow> {
  late bool _open = widget.initiallyOpen;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => setState(() => _open = !_open),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 14, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(widget.title, style: context.t.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                  ),
                  const SizedBox(width: 8),
                  AnimatedRotation(
                    turns: _open ? 0.25 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(CupertinoIcons.chevron_forward, size: 16, color: c.tertiaryLabel),
                  ),
                ],
              ),
              AnimatedCrossFade(
                firstChild: const SizedBox(width: double.infinity),
                secondChild: Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: SelectableText(
                    widget.body,
                    style: context.t.bodyMedium?.copyWith(color: c.secondaryLabel, height: 1.45),
                  ),
                ),
                crossFadeState: _open ? CrossFadeState.showSecond : CrossFadeState.showFirst,
                duration: const Duration(milliseconds: 200),
                sizeCurve: Curves.easeOutCubic,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ───────────────────────────── Cards & buttons ─────────────────────────────

class AppleCard extends StatelessWidget {
  const AppleCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(16),
    this.radius = 20,
    this.color,
    this.gradient,
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets padding;
  final double radius;
  final Color? color;
  final Gradient? gradient;

  @override
  Widget build(BuildContext context) {
    final body = Padding(padding: padding, child: child);
    return DecoratedBox(
      decoration: cardDecoration(context, radius: radius, color: color, gradient: gradient),
      child: onTap == null
          ? body
          : Material(
              color: Colors.transparent,
              shape: squircle(radius),
              clipBehavior: Clip.antiAlias,
              child: InkWell(onTap: onTap, child: body),
            ),
    );
  }
}

enum ButtonStyleKind { filled, tinted, gray, white, red }

/// Large iOS button (50pt, 17pt semibold, continuous corners).
class AppleButton extends StatelessWidget {
  const AppleButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.kind = ButtonStyleKind.filled,
    this.expand = true,
    this.height = 50,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final ButtonStyleKind kind;
  final bool expand;
  final double height;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final (Color bg, Color fg) = switch (kind) {
      ButtonStyleKind.filled => (c.tint, Colors.white),
      ButtonStyleKind.tinted => (c.tint.withValues(alpha: c.dark ? 0.22 : 0.12), c.tint),
      ButtonStyleKind.gray => (c.fill, c.label),
      ButtonStyleKind.white => (Colors.white, const Color(0xFF0B1119)),
      ButtonStyleKind.red => (c.red, Colors.white),
    };
    final content = Row(
      mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (icon != null) ...[Icon(icon, size: 19, color: fg), const SizedBox(width: 7)],
        Flexible(
          child: Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: context.t.labelLarge?.copyWith(color: fg),
          ),
        ),
      ],
    );
    return Opacity(
      opacity: onPressed == null ? 0.4 : 1,
      child: Material(
        color: bg,
        shape: squircle(14),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onPressed == null
              ? null
              : () {
                  HapticFeedback.selectionClick();
                  onPressed!();
                },
          highlightColor: fg.withValues(alpha: 0.12),
          child: SizedBox(
            height: height,
            child: Padding(padding: const EdgeInsets.symmetric(horizontal: 18), child: content),
          ),
        ),
      ),
    );
  }
}

/// Capsule filter chip.
class Pill extends StatelessWidget {
  const Pill({super.key, required this.label, required this.selected, required this.onTap, this.icon});
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final fg = selected ? Colors.white : c.label;
    return Material(
      color: selected ? c.tint : c.card,
      shape: const StadiumBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          onTap();
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[Icon(icon, size: 15, color: selected ? fg : c.tint), const SizedBox(width: 5)],
              Text(label, style: context.t.labelMedium?.copyWith(color: fg)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Small rounded tag.
class Tag extends StatelessWidget {
  const Tag(this.text, {super.key, this.color});
  final String text;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final col = color ?? context.c.tint;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: ShapeDecoration(
        color: col.withValues(alpha: context.c.dark ? 0.24 : 0.12),
        shape: squircle(6),
      ),
      child: Text(
        text,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: context.t.labelSmall?.copyWith(color: col, fontWeight: FontWeight.w600),
      ),
    );
  }
}

/// Round action button with label beneath (Contacts / Phone app style).
class CircleAction extends StatelessWidget {
  const CircleAction({super.key, required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Expanded(
      child: Material(
        color: c.card,
        shape: squircle(14),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Column(
              children: [
                Icon(icon, color: c.tint, size: 23),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: context.t.labelSmall?.copyWith(color: c.tint, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ───────────────────────────── Inputs ─────────────────────────────

class AppleSearchField extends StatelessWidget {
  const AppleSearchField({
    super.key,
    required this.placeholder,
    this.onChanged,
    this.onTap,
    this.controller,
    this.autofocus = false,
    this.readOnly = false,
  });

  final String placeholder;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onTap;
  final TextEditingController? controller;
  final bool autofocus;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final field = CupertinoSearchTextField(
      controller: controller,
      placeholder: placeholder,
      onChanged: onChanged,
      autofocus: autofocus,
      enabled: !readOnly,
      backgroundColor: c.fill,
      borderRadius: BorderRadius.circular(11),
      style: context.t.bodyLarge,
      placeholderStyle: context.t.bodyLarge?.copyWith(color: c.secondaryLabel),
      itemColor: c.secondaryLabel,
    );
    if (onTap == null) return field;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: AbsorbPointer(child: field),
    );
  }
}

class AppleSegmented<T extends Object> extends StatelessWidget {
  const AppleSegmented({super.key, required this.value, required this.segments, required this.onChanged});
  final T value;
  final Map<T, String> segments;
  final ValueChanged<T> onChanged;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: double.infinity,
    child: CupertinoSlidingSegmentedControl<T>(
      groupValue: value,
      backgroundColor: context.c.fill,
      thumbColor: context.c.dark ? const Color(0xFF636366) : Colors.white,
      children: {
        for (final e in segments.entries)
          e.key: Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Text(e.value, maxLines: 1, style: context.t.labelMedium?.copyWith(color: context.c.label)),
          ),
      },
      onValueChanged: (v) {
        if (v != null) onChanged(v);
      },
    ),
  );
}

/// iOS wheel picker presented from the bottom. Returns the chosen index.
Future<int?> showApplePicker(
  BuildContext context, {
  required String title,
  required List<String> options,
  int initial = 0,
}) {
  var selected = initial.clamp(0, options.isEmpty ? 0 : options.length - 1);
  return showCupertinoModalPopup<int>(
    context: context,
    builder: (ctx) {
      final c = AppPalette.of(context);
      return Container(
        height: 300,
        color: c.card,
        child: SafeArea(
          top: false,
          child: Column(
            children: [
              Container(
                height: 46,
                decoration: BoxDecoration(
                  border: Border(bottom: BorderSide(color: c.separator, width: 0.5)),
                ),
                child: Row(
                  children: [
                    CupertinoButton(child: const Text('Cancel'), onPressed: () => Navigator.pop(ctx)),
                    Expanded(
                      child: Text(
                        title,
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                    ),
                    CupertinoButton(
                      child: const Text('Done', style: TextStyle(fontWeight: FontWeight.w600)),
                      onPressed: () => Navigator.pop(ctx, selected),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: CupertinoPicker(
                  itemExtent: 36,
                  scrollController: FixedExtentScrollController(initialItem: selected),
                  onSelectedItemChanged: (i) => selected = i,
                  children: [
                    for (final o in options)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(o, maxLines: 1, overflow: TextOverflow.ellipsis),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

/// iOS action sheet. Returns the index of the chosen action.
Future<int?> showAppleActions(BuildContext context, {String? title, String? message, required List<String> actions}) =>
    showCupertinoModalPopup<int>(
      context: context,
      builder: (ctx) => CupertinoActionSheet(
        title: title == null ? null : Text(title),
        message: message == null ? null : Text(message),
        actions: [
          for (var i = 0; i < actions.length; i++)
            CupertinoActionSheetAction(onPressed: () => Navigator.pop(ctx, i), child: Text(actions[i])),
        ],
        cancelButton: CupertinoActionSheetAction(
          isDefaultAction: true,
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Cancel'),
        ),
      ),
    );

/// iOS alert with OK/Cancel. Returns true when confirmed.
Future<bool> showAppleAlert(
  BuildContext context, {
  String? title,
  required String message,
  String ok = 'OK',
  String? cancel,
}) async =>
    await showCupertinoDialog<bool>(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: title == null ? null : Text(title),
        content: Text(message),
        actions: [
          if (cancel != null) CupertinoDialogAction(onPressed: () => Navigator.pop(ctx, false), child: Text(cancel)),
          CupertinoDialogAction(isDefaultAction: true, onPressed: () => Navigator.pop(ctx, true), child: Text(ok)),
        ],
      ),
    ) ??
    false;

/// Brief confirmation toast (like iOS HUD), shown with a snack bar.
void showToast(BuildContext context, String message) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        content: Text(message, textAlign: TextAlign.center),
        behavior: SnackBarBehavior.floating,
        shape: squircle(14),
        margin: const EdgeInsets.fromLTRB(40, 0, 40, 24),
        duration: const Duration(seconds: 2),
      ),
    );
}
