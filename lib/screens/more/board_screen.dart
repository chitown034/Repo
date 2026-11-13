import 'package:material_ui/material_ui.dart';

import '../../data/site_content.dart';
import '../../services/links.dart';
import '../../widgets/common.dart';

class BoardMember {
  BoardMember(this.role);
  final String role;
  String name = '';
  final List<String> details = [];
  final List<LinkBlock> links = [];
}

List<BoardMember> parseBoard(SitePage page) {
  final out = <BoardMember>[];
  for (final b in page.blocks) {
    switch (b) {
      case HeadingBlock(:final text, level: <= 3):
        out.add(BoardMember(text));
      case HeadingBlock(:final text) when out.isNotEmpty && out.last.name.isEmpty:
        out.last.name = text;
      case TextBlock(:final text) when out.isNotEmpty:
        if (!text.startsWith('Phone')) out.last.details.add(text);
      case LinkBlock() when out.isNotEmpty:
        out.last.links.add(b);
      default:
        break;
    }
  }
  return out.where((m) => m.name.isNotEmpty).toList();
}

class BoardScreen extends StatelessWidget {
  const BoardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final members = parseBoard(SiteContent.instance['board-members']!);
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const SliverAppBar.large(title: Text('Board Members')),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
            sliver: SliverList.separated(
              itemCount: members.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final m = members[i];
                final initials = m.name
                    .replaceAll(RegExp(r'[“”"]'), '')
                    .split(' ')
                    .where((w) => w.isNotEmpty)
                    .map((w) => w[0])
                    .take(2)
                    .join();
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: scheme.primary,
                          child: Text(
                            initials,
                            style: TextStyle(color: scheme.onPrimary, fontWeight: FontWeight.w700),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Badge2(m.role, color: scheme.secondary),
                              const SizedBox(height: 6),
                              Text(m.name, style: t.titleMedium),
                              for (final d in m.details)
                                Text(d, style: t.bodySmall?.copyWith(color: scheme.onSurfaceVariant)),
                              if (m.links.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 4,
                                  children: [
                                    for (final l in m.links)
                                      ActionChip(
                                        avatar: Icon(l.url.startsWith('tel:') ? Icons.call : Icons.language, size: 16),
                                        label: Text(
                                          l.url.startsWith('tel:')
                                              ? l.text.replaceFirst(RegExp(r'Phone:\s*'), '')
                                              : Uri.parse(l.url).host.replaceFirst('www.', ''),
                                        ),
                                        onPressed: () => openLink(context, l.url),
                                      ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SliverToBoxAdapter(child: OrgFooter()),
        ],
      ),
    );
  }
}
