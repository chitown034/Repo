import 'package:cupertino_ui/cupertino_ui.dart';

import '../data/catalog.dart';
import '../data/prefs.dart';
import '../data/site_content.dart';
import '../services/links.dart';
import '../ui/apple.dart';
import '../widgets/common.dart';

/// Search across every resource card and guide in the app.
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, this.showSaved = false});
  final bool showSaved;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  String _q = '';

  @override
  Widget build(BuildContext context) {
    final hits = SiteContent.instance.search(_q);
    final guides = _q.length < 2
        ? const <CatalogEntry>[]
        : [
            for (final g in catalog)
              for (final e in g.entries)
                if (e.title.toLowerCase().contains(_q.toLowerCase())) e,
          ];
    return LargeTitleScaffold(
      title: widget.showSaved ? 'Saved' : 'Search',
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 18),
            child: AppleSearchField(
              placeholder: 'Jobs, scholarships, housing…',
              autofocus: !widget.showSaved,
              onChanged: (v) => setState(() => _q = v.trim()),
            ),
          ),
        ),
        if (_q.isEmpty)
          const SliverToBoxAdapter(child: _Saved())
        else ...[
          if (guides.isNotEmpty)
            SliverToBoxAdapter(
              child: InsetSection(
                header: 'Guides',
                children: [
                  for (final e in guides)
                    AppleRow(
                      icon: e.icon,
                      title: e.title,
                      accessory: e.url != null ? RowAccessory.external : RowAccessory.chevron,
                      onTap: () => openLink(context, e.target),
                    ),
                ],
              ),
            ),
          if (hits.isEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Column(
                  children: [
                    Icon(CupertinoIcons.search, size: 44, color: context.c.tertiaryLabel),
                    const SizedBox(height: 10),
                    Text('No Results for “$_q”', textAlign: TextAlign.center, style: context.t.titleLarge),
                    const SizedBox(height: 4),
                    Text(
                      'Check the spelling or try a new search.',
                      style: context.t.bodyMedium?.copyWith(color: context.c.secondaryLabel),
                    ),
                  ],
                ),
              ),
            )
          else
            SliverToBoxAdapter(
              child: InsetSection(
                header: '${hits.length} Resources',
                children: [
                  for (final h in hits) ResourceRow(card: h.card, overline: titleForSlug(h.page.slug, h.page.title)),
                ],
              ),
            ),
        ],
      ],
    );
  }
}

class _Saved extends StatelessWidget {
  const _Saved();

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: Prefs.instance,
    builder: (context, _) {
      final saved = Prefs.instance.savedResources;
      if (saved.isEmpty) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(40, 40, 40, 0),
          child: Column(
            children: [
              Icon(CupertinoIcons.bookmark, size: 44, color: context.c.tertiaryLabel),
              const SizedBox(height: 10),
              Text('No Saved Resources', style: context.t.titleLarge),
              const SizedBox(height: 4),
              Text(
                'Tap the bookmark on any resource to keep it here.',
                textAlign: TextAlign.center,
                style: context.t.bodyMedium?.copyWith(color: context.c.secondaryLabel),
              ),
            ],
          ),
        );
      }
      return InsetSection(
        header: 'Saved',
        children: [
          for (final r in saved)
            ResourceRow(
              card: CardBlock(title: r.title, badge: '', desc: r.subtitle, url: r.url, cta: ''),
            ),
        ],
      );
    },
  );
}
