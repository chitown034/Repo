import 'package:material_ui/material_ui.dart';

import '../data/catalog.dart';
import '../data/prefs.dart';
import '../data/site_content.dart';
import '../services/links.dart';
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
    final content = SiteContent.instance;
    final hits = content.search(_q);
    final guides = _q.length < 2
        ? const <CatalogEntry>[]
        : [
            for (final g in catalog)
              for (final e in g.entries)
                if (e.title.toLowerCase().contains(_q.toLowerCase())) e,
          ];
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: TextField(
          autofocus: !widget.showSaved,
          onChanged: (v) => setState(() => _q = v.trim()),
          decoration: const InputDecoration(
            hintText: 'Search jobs, scholarships, housing…',
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            filled: false,
          ),
        ),
      ),
      body: _q.isEmpty
          ? _Saved()
          : ListView(
              padding: const EdgeInsets.only(bottom: 24),
              children: [
                if (guides.isNotEmpty) ...[
                  const SectionHeader(title: 'Guides'),
                  TileGroup(
                    children: [
                      for (final e in guides)
                        ListTile(
                          leading: Icon(e.icon),
                          title: Text(e.title),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => openLink(context, e.target),
                        ),
                    ],
                  ),
                ],
                SectionHeader(title: hits.isEmpty ? 'No resources match "$_q"' : '${hits.length} resources'),
                if (hits.isNotEmpty)
                  TileGroup(
                    children: [
                      for (final h in hits)
                        ResourceTile(card: h.card, pageTitle: titleForSlug(h.page.slug, h.page.title)),
                    ],
                  ),
              ],
            ),
    );
  }
}

class _Saved extends StatelessWidget {
  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: Prefs.instance,
    builder: (context, _) {
      final saved = Prefs.instance.savedResources;
      if (saved.isEmpty) {
        return const Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Text(
              'Search every vetted resource from the website.\n\nTap the bookmark on any resource to save it here.',
              textAlign: TextAlign.center,
            ),
          ),
        );
      }
      return ListView(
        children: [
          const SectionHeader(title: 'Saved resources'),
          TileGroup(
            children: [
              for (final r in saved)
                ResourceTile(
                  card: CardBlock(title: r.title, badge: '', desc: r.subtitle, url: r.url, cta: ''),
                ),
            ],
          ),
        ],
      );
    },
  );
}
