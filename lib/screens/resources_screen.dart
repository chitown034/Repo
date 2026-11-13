import 'package:material_ui/material_ui.dart';

import '../app/routes.dart';
import '../data/catalog.dart';
import '../data/site_content.dart';
import '../services/links.dart';
import '../widgets/common.dart';
import 'search_screen.dart';

/// Directory of every resource guide from the website.
class ResourcesScreen extends StatelessWidget {
  const ResourcesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final content = SiteContent.instance;
    final total = content.pages.values.fold<int>(0, (n, p) => n + p.cards.length);
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const SliverAppBar.large(title: Text('Resources')),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
              child: Material(
                color: scheme.surfaceContainerLowest,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                  side: BorderSide(color: scheme.outlineVariant),
                ),
                child: InkWell(
                  borderRadius: BorderRadius.circular(14),
                  onTap: () => pushScreen(context, const SearchScreen()),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
                    child: Row(
                      children: [
                        Icon(Icons.search, color: scheme.onSurfaceVariant),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Search $total vetted resources',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: t.bodyLarge?.copyWith(color: scheme.onSurfaceVariant),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          for (final g in catalog) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 10),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: g.color.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(g.icon, color: g.color, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(g.title, style: t.titleLarge),
                          Text(g.subtitle, style: t.bodySmall?.copyWith(color: scheme.onSurfaceVariant)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: TileGroup(
                children: [
                  for (final e in g.entries)
                    ListTile(
                      leading: Icon(e.icon, color: g.color),
                      title: Text(e.title),
                      subtitle: e.blurb.isNotEmpty
                          ? Text(e.blurb, maxLines: 2, overflow: TextOverflow.ellipsis)
                          : _countLabel(content[e.slug]),
                      trailing: e.url != null
                          ? const Icon(Icons.open_in_new, size: 18)
                          : const Icon(Icons.chevron_right),
                      onTap: () => openLink(context, e.target),
                    ),
                ],
              ),
            ),
          ],
          const SliverToBoxAdapter(child: OrgFooter()),
        ],
      ),
    );
  }

  Widget? _countLabel(SitePage? p) {
    final n = p?.cards.length ?? 0;
    return n > 0 ? Text('$n resources') : null;
  }
}
