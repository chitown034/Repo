import 'package:material_ui/material_ui.dart';

import '../app/routes.dart';
import '../data/site_content.dart';
import '../screens/forms/site_form_screen.dart';
import '../services/links.dart';
import 'common.dart';

/// Consecutive blocks of the same kind, rendered together.
sealed class _Group {}

class _Single extends _Group {
  _Single(this.block);
  final Block block;
}

class _Cards extends _Group {
  _Cards(this.cards);
  final List<CardBlock> cards;
}

class _Videos extends _Group {
  _Videos(this.videos);
  final List<VideoBlock> videos;
}

class _Faqs extends _Group {
  _Faqs(this.faqs);
  final List<FaqBlock> faqs;
}

class _Stats extends _Group {
  _Stats(this.stats);
  final List<StatBlock> stats;
}

class _Links extends _Group {
  _Links(this.links);
  final List<LinkBlock> links;
}

class _Bullets extends _Group {
  _Bullets(this.bullets);
  final List<BulletBlock> bullets;
}

List<_Group> _group(List<Block> blocks) {
  final out = <_Group>[];
  for (final b in blocks) {
    final last = out.isEmpty ? null : out.last;
    switch (b) {
      case CardBlock():
        last is _Cards ? last.cards.add(b) : out.add(_Cards([b]));
      case VideoBlock():
        last is _Videos ? last.videos.add(b) : out.add(_Videos([b]));
      case FaqBlock():
        last is _Faqs ? last.faqs.add(b) : out.add(_Faqs([b]));
      case StatBlock():
        last is _Stats ? last.stats.add(b) : out.add(_Stats([b]));
      case LinkBlock():
        last is _Links ? last.links.add(b) : out.add(_Links([b]));
      case BulletBlock():
        last is _Bullets ? last.bullets.add(b) : out.add(_Bullets([b]));
      default:
        out.add(_Single(b));
    }
  }
  return out;
}

/// Renders website content blocks as native slivers-friendly widgets.
class BlockList extends StatelessWidget {
  const BlockList({super.key, required this.page, required this.blocks, this.anchorKey, this.anchor});

  final SitePage page;
  final List<Block> blocks;

  /// Key attached to the first heading containing [anchor].
  final GlobalKey? anchorKey;
  final String? anchor;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    var anchorUsed = false;
    final children = <Widget>[];
    for (final g in _group(blocks)) {
      switch (g) {
        case _Single(block: HeadingBlock(:final text, :final level)):
          Key? key;
          if (!anchorUsed && anchor != null && text.toLowerCase().contains(anchor!.toLowerCase())) {
            key = anchorKey;
            anchorUsed = true;
          }
          children.add(
            Padding(
              key: key,
              padding: EdgeInsets.fromLTRB(20, level <= 2 ? 28 : 20, 20, 8),
              child: Text(text, style: level <= 2 ? t.headlineSmall : t.titleLarge),
            ),
          );
        case _Single(block: EyebrowBlock(:final text)):
          children.add(Padding(padding: const EdgeInsets.fromLTRB(20, 24, 20, 0), child: Eyebrow(text)));
        case _Single(block: TextBlock(:final text)):
          children.add(
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
              child: Text(text, style: t.bodyLarge?.copyWith(height: 1.5)),
            ),
          );
        case _Single(block: FormBlock form):
          children.add(_FormCta(page: page, form: form));
        case _Single():
          break;
        case _Cards(:final cards):
          children.add(
            Padding(
              padding: const EdgeInsets.only(top: 4, bottom: 8),
              child: TileGroup(children: [for (final c in cards) ResourceTile(card: c)]),
            ),
          );
        case _Videos(:final videos):
          children.add(
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: VideoCarousel(videos: videos),
            ),
          );
        case _Faqs(:final faqs):
          children.add(
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: FaqGroup(faqs: faqs),
            ),
          );
        case _Stats(:final stats):
          children.add(
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: ResponsiveGrid(
                minTileWidth: 150,
                children: [
                  for (final s in stats)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s.value, style: t.headlineMedium?.copyWith(color: scheme.secondary)),
                            Text(s.label, style: t.bodySmall),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          );
        case _Bullets(:final bullets):
          children.add(
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
              child: Column(
                children: [
                  for (final b in bullets)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Icon(Icons.check_circle, size: 18, color: scheme.secondary),
                          ),
                          const SizedBox(width: 10),
                          Expanded(child: Text(b.text, style: t.bodyLarge)),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          );
        case _Links(:final links):
          children.add(_LinkGroup(links: links));
      }
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: children);
  }
}

class _LinkGroup extends StatelessWidget {
  const _LinkGroup({required this.links});
  final List<LinkBlock> links;

  @override
  Widget build(BuildContext context) {
    final calls = [
      for (final l in links)
        if (l.url.startsWith('tel:') || l.url.startsWith('mailto:')) l,
    ];
    final others = [
      for (final l in links)
        if (!calls.contains(l)) l,
    ];
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (calls.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 6),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final l in calls)
                    FilledButton.tonalIcon(
                      onPressed: () => openLink(context, l.url),
                      icon: Icon(l.url.startsWith('tel:') ? Icons.call : Icons.mail_outline, size: 18),
                      label: Text(l.text.isEmpty ? l.url.split(':').last : l.text),
                    ),
                ],
              ),
            ),
          if (others.isNotEmpty)
            TileGroup(
              children: [
                for (final l in others)
                  ListTile(
                    dense: true,
                    title: Text(l.text.isEmpty ? l.url : l.text),
                    trailing: Icon(l.url.startsWith('app://') ? Icons.chevron_right : Icons.open_in_new, size: 18),
                    onTap: () => openLink(context, l.url),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

class _FormCta extends StatelessWidget {
  const _FormCta({required this.page, required this.form});
  final SitePage page;
  final FormBlock form;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
      child: Card(
        color: scheme.primary.withValues(alpha: 0.07),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.edit_document, color: scheme.primary),
              const SizedBox(height: 8),
              Text('Request help from our team', style: t.titleMedium),
              const SizedBox(height: 4),
              Text('Fill out a short form and we will be in touch.', style: t.bodyMedium),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => pushScreen(context, SiteFormScreen(title: page.title, fields: form.fields)),
                child: const Text('Open form'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
