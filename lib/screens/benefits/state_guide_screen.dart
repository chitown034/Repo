import 'package:material_ui/material_ui.dart';

import '../../data/benefits.dart';
import '../../services/links.dart';
import 'benefits_finder_screen.dart' show GenerosityStars;

/// One state's veteran benefits at a glance.
class StateGuideScreen extends StatelessWidget {
  const StateGuideScreen({super.key, required this.state});
  final UsState state;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar.large(title: Text(state.name)),
          SliverList.list(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    GenerosityStars(value: state.generosity),
                    const SizedBox(height: 10),
                    Text(state.headline, style: t.bodyLarge?.copyWith(height: 1.5)),
                    if (state.topHack.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: scheme.tertiary.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.lightbulb_outline, color: scheme.tertiary),
                                const SizedBox(width: 8),
                                Text('Top tip', style: t.titleSmall),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(state.topHack, style: t.bodyMedium?.copyWith(height: 1.5)),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 8),
                  ],
                ),
              ),
              for (final (label, text) in state.sections)
                Theme(
                  data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    title: Text(label, style: t.titleMedium),
                    tilePadding: const EdgeInsets.symmetric(horizontal: 20),
                    childrenPadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                    expandedAlignment: Alignment.topLeft,
                    children: [SelectableText(text, style: t.bodyMedium?.copyWith(height: 1.5))],
                  ),
                ),
              if (state.other.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Also worth knowing', style: t.titleMedium),
                      const SizedBox(height: 8),
                      for (final o in state.other)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.check_circle, size: 18, color: scheme.secondary),
                              const SizedBox(width: 8),
                              Expanded(child: Text(o, style: t.bodyMedium)),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              if (state.agencyName != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('State veterans agency', style: t.labelMedium),
                          const SizedBox(height: 4),
                          Text(state.agencyName!, style: t.titleMedium),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              if (state.agencyPhone != null)
                                FilledButton.tonalIcon(
                                  onPressed: () =>
                                      openLink(context, 'tel:${state.agencyPhone!.replaceAll(RegExp(r'[^0-9]'), '')}'),
                                  icon: const Icon(Icons.call, size: 18),
                                  label: Text(state.agencyPhone!),
                                ),
                              if (state.agencyUrl != null)
                                OutlinedButton.icon(
                                  onPressed: () => openLink(context, state.agencyUrl!),
                                  icon: const Icon(Icons.open_in_new, size: 18),
                                  label: const Text('Website'),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
