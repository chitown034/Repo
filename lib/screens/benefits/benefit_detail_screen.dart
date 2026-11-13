import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';

import '../../data/benefits.dart';
import '../../data/prefs.dart';
import '../../services/links.dart';
import '../../widgets/common.dart';
import 'benefits_finder_screen.dart' show levelColor;

class BenefitDetailScreen extends StatelessWidget {
  const BenefitDetailScreen({super.key, required this.benefit});
  final Benefit benefit;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final b = benefit;
    return ListenableBuilder(
      listenable: Prefs.instance,
      builder: (context, _) {
        final saved = Prefs.instance.isBenefitSaved(b.id);
        return Scaffold(
          appBar: AppBar(
            actions: [
              IconButton(
                tooltip: 'Share',
                icon: const Icon(Icons.ios_share),
                onPressed: () => SharePlus.instance.share(ShareParams(text: '${b.title}\n\n${b.value}\n\n${b.url}')),
              ),
              IconButton(
                tooltip: saved ? 'Remove from saved' : 'Save',
                icon: Icon(saved ? Icons.bookmark : Icons.bookmark_border),
                color: saved ? scheme.secondary : null,
                onPressed: () => Prefs.instance.toggleBenefit(b.id),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
            children: [
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: [
                  Badge2(b.category),
                  Badge2(b.level, color: levelColor(context, b.level)),
                  if (b.confidence == 'high') const Badge2('Verified', color: Color(0xFF1D7A3E)),
                ],
              ),
              const SizedBox(height: 12),
              Text(b.title, style: t.headlineSmall),
              if (b.org != null) ...[
                const SizedBox(height: 6),
                Text(b.org!, style: t.bodyMedium?.copyWith(color: scheme.onSurfaceVariant)),
              ],
              const SizedBox(height: 20),
              _Section(icon: Icons.person_outline, title: 'Who qualifies', text: b.who),
              _Section(icon: Icons.card_giftcard_outlined, title: 'What you get', text: b.value),
              _Section(icon: Icons.assignment_turned_in_outlined, title: 'How to get it', text: b.how),
              if (b.deadline != null && b.deadline!.isNotEmpty)
                _Section(icon: Icons.event_outlined, title: 'Deadline', text: b.deadline!),
              if (b.hack != null && b.hack!.isNotEmpty)
                Container(
                  margin: const EdgeInsets.only(top: 6, bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: scheme.tertiary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: scheme.tertiary.withValues(alpha: 0.4)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.lightbulb_outline, color: scheme.tertiary),
                          const SizedBox(width: 8),
                          Text('Insider tip', style: t.titleSmall),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(b.hack!, style: t.bodyMedium?.copyWith(height: 1.5)),
                    ],
                  ),
                ),
              const SizedBox(height: 8),
              FilledButton.icon(
                onPressed: () => openLink(context, b.url),
                icon: const Icon(Icons.open_in_new),
                label: const Text('Open official source'),
              ),
              const SizedBox(height: 16),
              Text(
                'Confirm eligibility with the agency. We are an independent nonprofit and not affiliated with VA.',
                style: t.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
              ),
              if (b.tags.isNotEmpty) ...[
                const SizedBox(height: 16),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [for (final tag in b.tags) Chip(label: Text(tag), visualDensity: VisualDensity.compact)],
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.icon, required this.title, required this.text});
  final IconData icon;
  final String title;
  final String text;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
              const SizedBox(width: 8),
              Text(title, style: t.titleSmall),
            ],
          ),
          const SizedBox(height: 6),
          SelectableText(text, style: t.bodyMedium?.copyWith(height: 1.5)),
        ],
      ),
    );
  }
}
