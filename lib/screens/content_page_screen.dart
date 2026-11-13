import 'package:material_ui/material_ui.dart';

import '../data/catalog.dart';
import '../data/site_content.dart';
import '../widgets/block_list.dart';
import '../widgets/common.dart';

/// Native rendering of any resource page from the website.
class ContentPageScreen extends StatefulWidget {
  const ContentPageScreen({super.key, required this.slug, this.anchor});
  final String slug;
  final String? anchor;

  @override
  State<ContentPageScreen> createState() => _ContentPageScreenState();
}

class _ContentPageScreenState extends State<ContentPageScreen> {
  final _anchorKey = GlobalKey();
  String _filter = '';

  @override
  void initState() {
    super.initState();
    if (widget.anchor != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final ctx = _anchorKey.currentContext;
        if (ctx != null) {
          Scrollable.ensureVisible(ctx, duration: const Duration(milliseconds: 450), curve: Curves.easeOutCubic);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final page = SiteContent.instance[widget.slug];
    final title = titleForSlug(widget.slug, page?.title ?? 'Resources');
    if (page == null) {
      return Scaffold(
        appBar: AppBar(title: Text(title)),
        body: const Center(child: Text('This page is not available.')),
      );
    }
    final cardCount =
        page.cards.length + page.blocks.whereType<LinkBlock>().where((l) => l.url.startsWith('app://')).length;
    var blocks = page.blocks;
    if (_filter.isNotEmpty) {
      final terms = _filter.toLowerCase().split(RegExp(r'\s+'));
      blocks = [
        for (final b in blocks)
          if ((b is CardBlock && terms.every('${b.title} ${b.badge} ${b.desc}'.toLowerCase().contains)) ||
              (b is LinkBlock && terms.every(b.text.toLowerCase().contains)))
            b,
      ];
    }
    final showTitle = page.title.isNotEmpty && page.title != title;
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar.medium(title: Text(title)),
          if (showTitle)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
                child: Text(page.title, style: Theme.of(context).textTheme.headlineSmall),
              ),
            ),
          if (cardCount >= 12)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
                child: TextField(
                  onChanged: (v) => setState(() => _filter = v.trim()),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search),
                    hintText: 'Filter $cardCount resources',
                  ),
                ),
              ),
            ),
          SliverToBoxAdapter(
            child: BlockList(page: page, blocks: blocks, anchor: widget.anchor, anchorKey: _anchorKey),
          ),
          if (_filter.isNotEmpty && blocks.isEmpty)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Center(child: Text('No matching resources')),
              ),
            ),
          const SliverToBoxAdapter(child: OrgFooter()),
        ],
      ),
    );
  }
}
