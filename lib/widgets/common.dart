import 'package:material_ui/material_ui.dart';

import '../app/org.dart';
import '../app/theme.dart';
import '../data/prefs.dart';
import '../data/site_content.dart';
import '../services/links.dart';

const pagePadding = EdgeInsets.symmetric(horizontal: 20);

class Eyebrow extends StatelessWidget {
  const Eyebrow(this.text, {super.key, this.color});
  final String text;
  final Color? color;

  @override
  Widget build(BuildContext context) => Text(
    text.toUpperCase(),
    style: Theme.of(context).textTheme.labelSmall?.copyWith(
      color: color ?? Theme.of(context).colorScheme.secondary,
      fontWeight: FontWeight.w800,
      letterSpacing: 1.4,
    ),
  );
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, this.eyebrow, this.subtitle, this.action});
  final String title;
  final String? eyebrow;
  final String? subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 28, 12, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (eyebrow != null) ...[Eyebrow(eyebrow!), const SizedBox(height: 6)],
                Text(title, style: t.headlineSmall),
                if (subtitle != null) ...[
                  const SizedBox(height: 6),
                  Text(subtitle!, style: t.bodyMedium?.copyWith(color: Theme.of(context).colorScheme.onSurfaceVariant)),
                ],
              ],
            ),
          ),
          ?action,
        ],
      ),
    );
  }
}

class Badge2 extends StatelessWidget {
  const Badge2(this.text, {super.key, this.color});
  final String text;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final c = color ?? Theme.of(context).colorScheme.primary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: c.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
      child: Text(
        text,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(color: c, fontWeight: FontWeight.w700),
      ),
    );
  }
}

/// A resource link from the website (title, badge, description, url).
class ResourceTile extends StatelessWidget {
  const ResourceTile({super.key, required this.card, this.pageTitle});
  final CardBlock card;
  final String? pageTitle;

  IconData get _icon {
    final u = card.url;
    if (u.startsWith('tel:')) return Icons.call_outlined;
    if (u.startsWith('mailto:')) return Icons.mail_outline;
    if (u.startsWith('app://')) return Icons.chevron_right;
    if (u.endsWith('.pdf')) return Icons.picture_as_pdf_outlined;
    return Icons.open_in_new;
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final t = Theme.of(context).textTheme;
    final external = !card.url.startsWith('app://');
    return InkWell(
      onTap: () => openLink(context, card.url),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 8, 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (card.badge.isNotEmpty || pageTitle != null) ...[
                    Badge2(card.badge.isNotEmpty ? card.badge : pageTitle!),
                    const SizedBox(height: 6),
                  ],
                  Text(card.title, style: t.titleMedium),
                  if (card.desc.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(card.desc, style: t.bodyMedium?.copyWith(color: scheme.onSurfaceVariant)),
                  ],
                ],
              ),
            ),
            Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Icon(_icon, size: 20, color: scheme.primary),
                ),
                if (external)
                  SaveButton(
                    resource: SavedResource(title: card.title, url: card.url, subtitle: card.desc),
                  ),
              ],
            ),
          ],
        ),
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
      return IconButton(
        visualDensity: VisualDensity.compact,
        tooltip: saved ? 'Remove from saved' : 'Save',
        onPressed: () => Prefs.instance.toggleResource(resource),
        icon: Icon(saved ? Icons.bookmark : Icons.bookmark_border, size: 20),
        color: saved ? Theme.of(context).colorScheme.secondary : null,
      );
    },
  );
}

/// Groups tiles in a rounded card with dividers.
class TileGroup extends StatelessWidget {
  const TileGroup({super.key, required this.children, this.margin = pagePadding});
  final List<Widget> children;
  final EdgeInsetsGeometry margin;

  @override
  Widget build(BuildContext context) => Padding(
    padding: margin,
    child: Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) const Divider(indent: 16, endIndent: 16),
            children[i],
          ],
        ],
      ),
    ),
  );
}

class VideoCarousel extends StatelessWidget {
  const VideoCarousel({super.key, required this.videos});
  final List<VideoBlock> videos;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return SizedBox(
      height: 214,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: pagePadding,
        itemCount: videos.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final v = videos[i];
          return SizedBox(
            width: 250,
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => openLink(context, v.watchUrl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
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
                                Container(decoration: const BoxDecoration(gradient: Brand.heroGradient)),
                          ),
                          Center(
                            child: Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.55),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 34),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(v.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: t.titleSmall),
                  if (v.source.isNotEmpty)
                    Text(
                      v.source,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: t.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
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

class FaqGroup extends StatelessWidget {
  const FaqGroup({super.key, required this.faqs});
  final List<FaqBlock> faqs;

  @override
  Widget build(BuildContext context) => TileGroup(
    children: [
      for (final f in faqs)
        Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            title: Text(f.question, style: Theme.of(context).textTheme.titleSmall),
            childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            expandedAlignment: Alignment.topLeft,
            children: [Text(f.answer, style: Theme.of(context).textTheme.bodyMedium)],
          ),
        ),
    ],
  );
}

/// Always-reachable Veterans Crisis Line strip.
class CrisisBanner extends StatelessWidget {
  const CrisisBanner({super.key, this.compact = false});
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return Padding(
      padding: pagePadding,
      child: Container(
        decoration: BoxDecoration(gradient: Brand.redGradient, borderRadius: BorderRadius.circular(18)),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.support_agent, color: Colors.white),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Veterans Crisis Line',
                    style: t.titleMedium?.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            ),
            if (!compact) ...[
              const SizedBox(height: 6),
              Text(
                'Free, confidential, 24/7. Dial 988 then press 1, text 838255, or chat online. '
                "You don't have to be enrolled in VA benefits.",
                style: t.bodyMedium?.copyWith(color: Colors.white.withValues(alpha: 0.92)),
              ),
            ],
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _pill(context, Icons.call, 'Call 988, press 1', Org.crisisTel),
                _pill(context, Icons.sms_outlined, 'Text 838255', Org.crisisSms),
                _pill(context, Icons.chat_bubble_outline, 'Chat', Org.crisisChatUrl),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _pill(BuildContext context, IconData icon, String label, String url) => Material(
    color: Colors.white,
    borderRadius: BorderRadius.circular(30),
    child: InkWell(
      borderRadius: BorderRadius.circular(30),
      onTap: () => openLink(context, url),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: Brand.red),
            const SizedBox(width: 6),
            Text(
              label,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(color: Brand.red, fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    ),
  );
}

/// Footer with the nonprofit disclosure shown on every website page.
class OrgFooter extends StatelessWidget {
  const OrgFooter({super.key});

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 28, 20, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: () => openLink(context, Org.candidUrl),
            child: Row(
              children: [
                Icon(Icons.verified, size: 18, color: scheme.primary),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    'Verified 501(c)(3) on Candid GuideStar · EIN ${Org.ein}',
                    style: t.labelMedium?.copyWith(color: scheme.primary),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Text(Org.disclaimer, style: t.bodySmall?.copyWith(color: scheme.onSurfaceVariant)),
        ],
      ),
    );
  }
}

/// Large tappable tile used on Home and Tools.
class ActionCard extends StatelessWidget {
  const ActionCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.color,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final t = Theme.of(context).textTheme;
    final c = color ?? scheme.primary;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 168),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(color: c.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                  child: Icon(icon, color: c),
                ),
                const SizedBox(height: 12),
                Text(title, style: t.titleMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: t.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Responsive 2-4 column grid of tiles.
class ResponsiveGrid extends StatelessWidget {
  const ResponsiveGrid({super.key, required this.children, this.minTileWidth = 160});
  final List<Widget> children;
  final double minTileWidth;

  @override
  Widget build(BuildContext context) => Padding(
    padding: pagePadding,
    child: LayoutBuilder(
      builder: (context, c) {
        final cols = (c.maxWidth / minTileWidth).floor().clamp(2, 4);
        const gap = 12.0;
        final rows = <Widget>[];
        for (var i = 0; i < children.length; i += cols) {
          final cells = <Widget>[];
          for (var j = 0; j < cols; j++) {
            if (j > 0) cells.add(const SizedBox(width: gap));
            cells.add(Expanded(child: i + j < children.length ? children[i + j] : const SizedBox()));
          }
          if (rows.isNotEmpty) rows.add(const SizedBox(height: gap));
          rows.add(Row(crossAxisAlignment: CrossAxisAlignment.start, children: cells));
        }
        return Column(children: rows);
      },
    ),
  );
}
