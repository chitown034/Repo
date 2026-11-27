import 'package:material_ui/material_ui.dart';

import '../data/catalog.dart';
import '../data/site_content.dart';
import '../ui/apple.dart';
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
      return LargeTitleScaffold(
        title: title,
        slivers: const [SliverFillRemaining(child: Center(child: Text('This page is not available.')))],
      );
    }
    final count =
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
    final subtitle = page.title.isNotEmpty && page.title != title ? page.title : null;
    return LargeTitleScaffold(
      title: title,
      slivers: [
        if (subtitle != null)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(kGutter + 4, 0, kGutter, 8),
              child: Text(subtitle, style: context.t.titleLarge?.copyWith(color: context.c.secondaryLabel)),
            ),
          ),
        if (count >= 12)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(kGutter, 4, kGutter, 14),
              child: AppleSearchField(
                placeholder: 'Search $count resources',
                onChanged: (v) => setState(() => _filter = v.trim()),
              ),
            ),
          ),
        SliverToBoxAdapter(
          child: BlockList(page: page, blocks: blocks, anchor: widget.anchor, anchorKey: _anchorKey),
        ),
        if (_filter.isNotEmpty && blocks.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Text(
                'No Results',
                textAlign: TextAlign.center,
                style: context.t.titleLarge?.copyWith(color: context.c.secondaryLabel),
              ),
            ),
          ),
        const SliverToBoxAdapter(child: OrgFooter()),
      ],
    );
  }
}
