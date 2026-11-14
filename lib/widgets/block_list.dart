import 'package:cupertino_ui/cupertino_ui.dart';

import '../app/routes.dart';
import '../data/site_content.dart';
import '../screens/forms/site_form_screen.dart';
import '../services/links.dart';
import '../ui/apple.dart';
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

/// Renders converted website content in the app's Apple-style layout.
class BlockList extends StatelessWidget {
  const BlockList({super.key, required this.page, required this.blocks, this.anchorKey, this.anchor});

  final SitePage page;
  final List<Block> blocks;

  /// Key attached to the first heading containing [anchor].
  final GlobalKey? anchorKey;
  final String? anchor;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final c = context.c;
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
            KeyedSubtree(
              key: key,
              child: level <= 2
                  ? SectionTitle(text, top: 22)
                  : Padding(
                      padding: const EdgeInsets.fromLTRB(kGutter + 4, 14, kGutter, 8),
                      child: Text(text, style: t.titleLarge),
                    ),
            ),
          );
        case _Single(block: EyebrowBlock(:final text)):
          children.add(
            Padding(
              padding: const EdgeInsets.fromLTRB(kGutter + 4, 22, kGutter, 0),
              child: Caption(text, color: c.tint),
            ),
          );
        case _Single(block: TextBlock(:final text)):
          children.add(
            Padding(
              padding: const EdgeInsets.fromLTRB(kGutter + 4, 2, kGutter + 4, 12),
              child: Text(text, style: t.bodyLarge?.copyWith(height: 1.45)),
            ),
          );
        case _Single(block: FormBlock form):
          children.add(_FormCta(page: page, form: form));
        case _Single():
          break;
        case _Cards(:final cards):
          children.add(InsetSection(children: [for (final card in cards) ResourceRow(card: card)]));
        case _Videos(:final videos):
          children.add(
            Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: VideoShelf(videos: videos),
            ),
          );
        case _Faqs(:final faqs):
          children.add(FaqSection(faqs: faqs));
        case _Stats(:final stats):
          children.add(
            Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: TileGrid(
                minTileWidth: 150,
                children: [
                  for (final s in stats)
                    AppleCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s.value, style: t.headlineMedium?.copyWith(color: c.tint)),
                          const SizedBox(height: 2),
                          Text(s.label, style: t.bodySmall?.copyWith(color: c.secondaryLabel)),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          );
        case _Bullets(:final bullets):
          children.add(
            InsetSection(
              dividerIndent: 50,
              children: [
                for (final b in bullets)
                  AppleRow(
                    leading: Icon(CupertinoIcons.checkmark_circle_fill, color: c.green, size: 22),
                    title: b.text,
                    accessory: RowAccessory.none,
                  ),
              ],
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (calls.isNotEmpty)
          Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 16),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final l in calls)
                  AppleButton(
                    expand: false,
                    height: 40,
                    kind: ButtonStyleKind.tinted,
                    icon: l.url.startsWith('tel:') ? CupertinoIcons.phone_fill : CupertinoIcons.envelope_fill,
                    label: (l.text.isEmpty ? l.url.split(':').last : l.text).replaceFirst(RegExp(r'^Phone:\s*'), ''),
                    onPressed: () => openLink(context, l.url),
                  ),
              ],
            ),
          ),
        if (others.isNotEmpty)
          InsetSection(
            children: [
              for (final l in others)
                () {
                  final (icon, color) = iconFor(l.text, l.url);
                  final internal = l.url.startsWith('app://');
                  return AppleRow(
                    icon: icon,
                    iconColor: color,
                    title: l.text.isEmpty ? l.url : l.text,
                    accessory: internal ? RowAccessory.chevron : RowAccessory.external,
                    onTap: () => openLink(context, l.url),
                  );
                }(),
            ],
          ),
      ],
    );
  }
}

class _FormCta extends StatelessWidget {
  const _FormCta({required this.page, required this.form});
  final SitePage page;
  final FormBlock form;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(kGutter, 4, kGutter, 22),
    child: AppleCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const IconBadge(CupertinoIcons.square_pencil, color: Hue.blue, size: 36),
          const SizedBox(height: 12),
          Text('Request help from our team', style: context.t.titleMedium),
          const SizedBox(height: 4),
          Text(
            'Fill out a short form and we will be in touch.',
            style: context.t.bodyMedium?.copyWith(color: context.c.secondaryLabel),
          ),
          const SizedBox(height: 14),
          AppleButton(
            label: 'Open Form',
            onPressed: () => pushScreen(
              context,
              SiteFormScreen(title: page.title, fields: form.fields, webPath: page.slug),
              title: 'Back',
            ),
          ),
        ],
      ),
    ),
  );
}
