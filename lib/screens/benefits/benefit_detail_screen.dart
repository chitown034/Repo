import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:material_ui/material_ui.dart';
import 'package:share_plus/share_plus.dart';

import '../../data/benefits.dart';
import '../../data/prefs.dart';
import '../../services/links.dart';
import '../../ui/apple.dart';
import 'benefits_finder_screen.dart' show levelColor;

class BenefitDetailScreen extends StatelessWidget {
  const BenefitDetailScreen({super.key, required this.benefit});
  final Benefit benefit;

  @override
  Widget build(BuildContext context) {
    final b = benefit;
    return ListenableBuilder(
      listenable: Prefs.instance,
      builder: (context, _) {
        final c = context.c;
        final saved = Prefs.instance.isBenefitSaved(b.id);
        return Scaffold(
          backgroundColor: c.bg,
          appBar: appleBar(
            context,
            b.category,
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                BarButton(
                  icon: CupertinoIcons.share,
                  tooltip: 'Share',
                  onPressed: () => SharePlus.instance.share(ShareParams(text: '${b.title}\n\n${b.value}\n\n${b.url}')),
                ),
                BarButton(
                  icon: saved ? CupertinoIcons.bookmark_fill : CupertinoIcons.bookmark,
                  tooltip: saved ? 'Remove from saved' : 'Save',
                  onPressed: () {
                    Prefs.instance.toggleBenefit(b.id);
                    showToast(context, saved ? 'Removed from Saved' : 'Saved');
                  },
                ),
              ],
            ),
          ),
          body: ListView(
            padding: EdgeInsets.fromLTRB(0, 16, 0, 40 + MediaQuery.paddingOf(context).bottom),
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: kGutter + 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        Tag(b.level, color: levelColor(context, b.level)),
                        if (b.confidence == 'high') Tag('Verified', color: c.green),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(b.title, style: context.t.headlineMedium),
                    if (b.org != null) ...[
                      const SizedBox(height: 6),
                      Text(b.org!, style: context.t.bodyMedium?.copyWith(color: c.secondaryLabel)),
                    ],
                    const SizedBox(height: 18),
                  ],
                ),
              ),
              _Block(header: 'What You Get', text: b.value),
              _Block(header: 'Who Qualifies', text: b.who),
              _Block(header: 'How to Get It', text: b.how),
              if (b.deadline != null && b.deadline!.isNotEmpty) _Block(header: 'Deadline', text: b.deadline!),
              if (b.hack != null && b.hack!.isNotEmpty)
                Padding(
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
                            Text('Insider Tip', style: context.t.titleMedium),
                          ],
                        ),
                        const SizedBox(height: 8),
                        SelectableText(b.hack!, style: context.t.bodyMedium?.copyWith(height: 1.45)),
                      ],
                    ),
                  ),
                ),
              Padding(
                padding: kPage,
                child: AppleButton(
                  icon: CupertinoIcons.arrow_up_right_square,
                  label: 'Open Official Source',
                  onPressed: () => openLink(context, b.url),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(32, 14, 32, 0),
                child: Text(
                  'Confirm eligibility with the agency. We are an independent nonprofit, not affiliated with VA.',
                  textAlign: TextAlign.center,
                  style: context.t.labelSmall?.copyWith(color: c.secondaryLabel),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _Block extends StatelessWidget {
  const _Block({required this.header, required this.text});
  final String header;
  final String text;

  @override
  Widget build(BuildContext context) => InsetSection(
    header: header,
    children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        child: SelectableText(text, style: context.t.bodyLarge?.copyWith(height: 1.45)),
      ),
    ],
  );
}
