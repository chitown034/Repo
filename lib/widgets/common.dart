import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:material_ui/material_ui.dart';

import '../app/org.dart';
import '../data/prefs.dart';
import '../data/site_content.dart';
import '../services/links.dart';
import '../ui/apple.dart';

/// Icon + color for a link, chosen from its badge/title so lists read like Settings.
(IconData, Color) iconFor(String text, String url) {
  final s = text.toLowerCase();
  if (url.startsWith('tel:')) return (CupertinoIcons.phone_fill, Hue.green);
  if (url.startsWith('mailto:')) return (CupertinoIcons.envelope_fill, Hue.blue);
  if (url.endsWith('.pdf')) return (CupertinoIcons.doc_text_fill, Hue.red);
  for (final (keys, icon, color) in const [
    (['crisis', 'mental', 'therapy', 'counsel', 'ptsd'], CupertinoIcons.heart_fill, Hue.pink),
    (['health', 'medical', 'nurs', 'dental', 'care'], CupertinoIcons.bandage_fill, Hue.red),
    (['home', 'housing', 'homeless', 'rent', 'mortgage', 'loan', 'real estate'], CupertinoIcons.house_fill, Hue.orange),
    (['utility', 'energy', 'liheap', 'bill'], CupertinoIcons.bolt_fill, Hue.yellow),
    (
      ['job', 'career', 'employ', 'hiring', 'resume', 'work', 'apprentice', 'salary'],
      CupertinoIcons.briefcase_fill,
      Hue.brown,
    ),
    (
      ['school', 'college', 'scholar', 'educat', 'gi bill', 'tuition', 'course', 'train', 'certif', 'coding', 'cyber'],
      CupertinoIcons.book_fill,
      Hue.indigo,
    ),
    (['family', 'child', 'spouse', 'kids'], CupertinoIcons.person_2_fill, Hue.teal),
    (['legal', 'law', 'court', 'justice'], CupertinoIcons.hammer_fill, Hue.gray),
    (['travel', 'flight', 'park', 'adventure', 'outdoor'], CupertinoIcons.airplane, Hue.blue),
    (
      ['discount', 'deal', 'save', 'grant', 'money', 'financ', 'pay', 'tax', 'cash'],
      CupertinoIcons.money_dollar_circle_fill,
      Hue.green,
    ),
    (['va.gov', 'va ', 'veteran', 'benefit', 'disab', 'claim'], CupertinoIcons.checkmark_shield_fill, Hue.navy),
    (['dod', 'military', 'onesource', 'tap', 'transition'], CupertinoIcons.star_fill, Hue.navy),
    (['county', 'local', '211', 'city', 'region'], CupertinoIcons.location_solid, Hue.purple),
    (['dog', 'animal', 'pet'], CupertinoIcons.paw_solid, Hue.brown),
    (['community', 'group', 'social', 'mentor', 'nonprofit'], CupertinoIcons.person_3_fill, Hue.teal),
  ]) {
    if (keys.any(s.contains)) return (icon, color);
  }
  return (CupertinoIcons.link, Hue.gray);
}

/// A website resource as an inset-list row.
class ResourceRow extends StatelessWidget {
  const ResourceRow({super.key, required this.card, this.overline});
  final CardBlock card;
  final String? overline;

  @override
  Widget build(BuildContext context) {
    final internal = card.url.startsWith('app://');
    final (icon, color) = iconFor('${card.badge} ${card.title}', card.url);
    return AppleRow(
      icon: icon,
      iconColor: color,
      overline: overline ?? card.badge,
      title: card.title,
      subtitle: card.desc,
      onTap: () => openLink(context, card.url),
      trailing: internal
          ? null
          : Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SaveButton(
                  resource: SavedResource(title: card.title, url: card.url, subtitle: card.desc),
                ),
                Icon(CupertinoIcons.arrow_up_right, size: 15, color: context.c.tertiaryLabel),
              ],
            ),
    );
  }
}

class SaveButton extends StatelessWidget {
  const SaveButton({super.key, required this.resource});
  final SavedResource resource;

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: Prefs.instance,
    builder: (context, _) {
      final saved = Prefs.instance.isResourceSaved(resource.url);
      return Semantics(
        button: true,
        label: saved ? 'Remove from saved' : 'Save',
        child: CupertinoButton(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          minimumSize: const Size(34, 34),
          onPressed: () {
            Prefs.instance.toggleResource(resource);
            showToast(context, saved ? 'Removed from Saved' : 'Saved');
          },
          child: Icon(
            saved ? CupertinoIcons.bookmark_fill : CupertinoIcons.bookmark,
            size: 19,
            color: saved ? context.c.tint : context.c.tertiaryLabel,
          ),
        ),
      );
    },
  );
}

/// Horizontally scrolling video shelf (Apple TV style).
class VideoShelf extends StatelessWidget {
  const VideoShelf({super.key, required this.videos});
  final List<VideoBlock> videos;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return SizedBox(
      height: 224,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: kPage,
        itemCount: videos.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final v = videos[i];
          return SizedBox(
            width: 260,
            child: GestureDetector(
              onTap: () => openLink(context, v.watchUrl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRSuperellipse(
                    borderRadius: BorderRadius.circular(16),
                    child: AspectRatio(
                      aspectRatio: 16 / 9,
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.network(
                            v.thumbnailUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) =>
                                const DecoratedBox(decoration: BoxDecoration(gradient: Gradients.navy)),
                          ),
                          Align(
                            alignment: Alignment.bottomLeft,
                            child: Padding(
                              padding: const EdgeInsets.all(10),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: ShapeDecoration(
                                  color: Colors.black.withValues(alpha: 0.55),
                                  shape: const StadiumBorder(),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(CupertinoIcons.play_fill, color: Colors.white, size: 13),
                                    SizedBox(width: 4),
                                    Text(
                                      'Play',
                                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(v.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: context.t.titleSmall),
                  if (v.source.isNotEmpty)
                    Text(
                      v.source,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: context.t.bodySmall?.copyWith(color: c.secondaryLabel),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class FaqSection extends StatelessWidget {
  const FaqSection({super.key, required this.faqs, this.header});
  final List<FaqBlock> faqs;
  final String? header;

  @override
  Widget build(BuildContext context) => InsetSection(
    header: header,
    dividerIndent: 16,
    children: [for (final f in faqs) DisclosureRow(title: f.question, body: f.answer)],
  );
}

/// Veterans Crisis Line card, always one tap away.
class CrisisCard extends StatelessWidget {
  const CrisisCard({super.key, this.compact = false});
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    Widget action(IconData icon, String label, String url) => Expanded(
      child: Material(
        color: Colors.white.withValues(alpha: 0.2),
        shape: squircle(12),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => openLink(context, url),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Column(
              children: [
                Icon(icon, color: Colors.white, size: 20),
                const SizedBox(height: 3),
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: t.labelSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),
      ),
    );
    return Padding(
      padding: kPage,
      child: AppleCard(
        gradient: Gradients.red,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(CupertinoIcons.heart_circle_fill, color: Colors.white, size: 26),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('Veterans Crisis Line', style: t.titleMedium?.copyWith(color: Colors.white)),
                ),
              ],
            ),
            if (!compact) ...[
              const SizedBox(height: 6),
              Text(
                "Free, confidential, 24/7. You don't have to be enrolled in VA benefits.",
                style: t.bodyMedium?.copyWith(color: Colors.white.withValues(alpha: 0.9)),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                action(CupertinoIcons.phone_fill, 'Call 988, press 1', Org.crisisTel),
                const SizedBox(width: 8),
                action(CupertinoIcons.chat_bubble_fill, 'Text 838255', Org.crisisSms),
                const SizedBox(width: 8),
                action(CupertinoIcons.globe, 'Chat online', Org.crisisChatUrl),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Quiet footer with the nonprofit disclosure.
class OrgFooter extends StatelessWidget {
  const OrgFooter({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Padding(
      padding: const EdgeInsets.fromLTRB(32, 28, 32, 8),
      child: Column(
        children: [
          CupertinoButton(
            padding: EdgeInsets.zero,
            minimumSize: const Size(0, 0),
            onPressed: () => openLink(context, Org.candidUrl),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(CupertinoIcons.checkmark_seal_fill, size: 15, color: c.tint),
                const SizedBox(width: 5),
                Flexible(
                  child: Text(
                    'Verified 501(c)(3) · EIN ${Org.ein}',
                    style: context.t.bodySmall?.copyWith(color: c.tint, fontWeight: FontWeight.w500),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            Org.disclaimer,
            textAlign: TextAlign.center,
            style: context.t.labelSmall?.copyWith(color: c.secondaryLabel, height: 1.4),
          ),
        ],
      ),
    );
  }
}

/// Grid tile with icon badge, title, and subtitle.
class FeatureTile extends StatelessWidget {
  const FeatureTile({
    super.key,
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => AppleCard(
    onTap: onTap,
    padding: const EdgeInsets.all(14),
    child: ConstrainedBox(
      constraints: const BoxConstraints(minHeight: 118),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IconBadge(icon, color: color, size: 34),
          const SizedBox(height: 12),
          Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: context.t.titleMedium),
          const SizedBox(height: 3),
          Text(
            subtitle,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: context.t.bodySmall?.copyWith(color: context.c.secondaryLabel),
          ),
        ],
      ),
    ),
  );
}

/// Two-up (or wider on tablets) grid of tiles.
class TileGrid extends StatelessWidget {
  const TileGrid({super.key, required this.children, this.minTileWidth = 160});
  final List<Widget> children;
  final double minTileWidth;

  @override
  Widget build(BuildContext context) => Padding(
    padding: kPage,
    child: LayoutBuilder(
      builder: (context, box) {
        final cols = (box.maxWidth / minTileWidth).floor().clamp(2, 4);
        const gap = 12.0;
        final rows = <Widget>[];
        for (var i = 0; i < children.length; i += cols) {
          if (rows.isNotEmpty) rows.add(const SizedBox(height: gap));
          rows.add(
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (var j = 0; j < cols; j++) ...[
                  if (j > 0) const SizedBox(width: gap),
                  Expanded(child: i + j < children.length ? children[i + j] : const SizedBox()),
                ],
              ],
            ),
          );
        }
        return Column(children: rows);
      },
    ),
  );
}
