import 'package:material_ui/material_ui.dart';

import '../app/routes.dart';
import '../data/catalog.dart';
import '../data/site_content.dart';
import '../services/links.dart';
import '../ui/apple.dart';
import '../widgets/common.dart';
import 'search_screen.dart';

/// Directory of every resource guide from the website.
class ResourcesScreen extends StatelessWidget {
  const ResourcesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final content = SiteContent.instance;
    final total = content.pages.values.fold<int>(0, (n, p) => n + p.cards.length);
    return LargeTitleScaffold(
      title: 'Resources',
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 18),
            child: AppleSearchField(
              placeholder: 'Search $total resources',
              readOnly: true,
              onTap: () => pushScreen(context, const SearchScreen(), title: 'Resources'),
            ),
          ),
        ),
        for (final g in catalog)
          SliverToBoxAdapter(
            child: InsetSection(
              header: g.title,
              children: [
                for (final e in g.entries)
                  AppleRow(
                    icon: e.icon,
                    iconColor: g.color,
                    title: e.title,
                    subtitle: e.blurb.isNotEmpty ? e.blurb : _count(content[e.slug]),
                    accessory: e.url != null ? RowAccessory.external : RowAccessory.chevron,
                    onTap: () => openLink(context, e.target),
                  ),
              ],
            ),
          ),
        const SliverToBoxAdapter(child: OrgFooter()),
      ],
    );
  }

  String? _count(SitePage? p) {
    final n = p?.cards.length ?? 0;
    return n > 0 ? '$n resources' : null;
  }
}
