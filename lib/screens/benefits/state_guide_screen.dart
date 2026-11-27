import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:material_ui/material_ui.dart';

import '../../data/benefits.dart';
import '../../services/links.dart';
import '../../ui/apple.dart';
import 'benefits_finder_screen.dart' show GenerosityStars;

/// One state's veteran benefits at a glance.
class StateGuideScreen extends StatelessWidget {
  const StateGuideScreen({super.key, required this.state});
  final UsState state;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return LargeTitleScaffold(
      title: state.name,
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 22),
            child: AppleCard(
              gradient: Gradients.navy,
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GenerosityStars(value: state.generosity, color: const Color(0xFFFFD60A)),
                  const SizedBox(height: 10),
                  Text(state.headline, style: context.t.bodyLarge?.copyWith(color: Colors.white, height: 1.45)),
                ],
              ),
            ),
          ),
        ),
        if (state.topHack.isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 22),
              child: AppleCard(
                color: c.gold.withValues(alpha: c.dark ? 0.18 : 0.12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(CupertinoIcons.lightbulb_fill, color: c.gold, size: 20),
                        const SizedBox(width: 6),
                        Text('Top Tip', style: context.t.titleMedium),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(state.topHack, style: context.t.bodyMedium?.copyWith(height: 1.45)),
                  ],
                ),
              ),
            ),
          ),
        SliverToBoxAdapter(
          child: InsetSection(
            header: 'Benefits',
            dividerIndent: 16,
            children: [for (final (label, text) in state.sections) DisclosureRow(title: label, body: text)],
          ),
        ),
        if (state.other.isNotEmpty)
          SliverToBoxAdapter(
            child: InsetSection(
              header: 'Also Worth Knowing',
              dividerIndent: 50,
              children: [
                for (final o in state.other)
                  AppleRow(
                    leading: Icon(CupertinoIcons.checkmark_circle_fill, color: c.green, size: 22),
                    title: o,
                    accessory: RowAccessory.none,
                  ),
              ],
            ),
          ),
        if (state.agencyName != null)
          SliverToBoxAdapter(
            child: InsetSection(
              header: 'State Veterans Agency',
              children: [
                AppleRow(icon: CupertinoIcons.building_2_fill, title: state.agencyName!, accessory: RowAccessory.none),
                if (state.agencyPhone != null)
                  AppleRow(
                    icon: CupertinoIcons.phone_fill,
                    iconColor: Hue.green,
                    title: state.agencyPhone!,
                    accessory: RowAccessory.none,
                    onTap: () => openLink(context, 'tel:${state.agencyPhone!.replaceAll(RegExp(r'[^0-9]'), '')}'),
                  ),
                if (state.agencyUrl != null)
                  AppleRow(
                    icon: CupertinoIcons.globe,
                    iconColor: Hue.blue,
                    title: 'Website',
                    accessory: RowAccessory.external,
                    onTap: () => openLink(context, state.agencyUrl!),
                  ),
              ],
            ),
          ),
      ],
    );
  }
}
