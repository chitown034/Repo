import 'package:material_ui/material_ui.dart';

import '../../data/site_content.dart';
import '../../services/links.dart';
import '../../ui/apple.dart';
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

  Future<void> _contact(BuildContext context, BoardMember m) async {
    final labels = [
      for (final l in m.links)
        l.url.startsWith('tel:')
            ? 'Call ${l.text.replaceFirst(RegExp(r'Phone:\s*'), '')}'
            : 'Visit ${Uri.parse(l.url).host.replaceFirst('www.', '')}',
    ];
    if (labels.isEmpty) return;
    final i = await showAppleActions(context, title: m.name, message: m.role, actions: labels);
    if (i != null && context.mounted) await openLink(context, m.links[i].url);
  }

  @override
  Widget build(BuildContext context) {
    final members = parseBoard(SiteContent.instance['board-members']!);
    return LargeTitleScaffold(
      title: 'Board Members',
      slivers: [
        SliverToBoxAdapter(
          child: InsetSection(
            dividerIndent: 76,
            children: [
              for (final m in members)
                AppleRow(
                  leading: _Avatar(name: m.name),
                  overline: m.role,
                  title: m.name,
                  subtitle: m.details.join(' · '),
                  accessory: m.links.isEmpty ? RowAccessory.none : RowAccessory.chevron,
                  onTap: m.links.isEmpty ? null : () => _contact(context, m),
                ),
            ],
          ),
        ),
        const SliverToBoxAdapter(child: OrgFooter()),
      ],
    );
  }
}

/// Monogram avatar, as in Contacts.
class _Avatar extends StatelessWidget {
  const _Avatar({required this.name});
  final String name;

  @override
  Widget build(BuildContext context) {
    final initials = name
        .replaceAll(RegExp(r'[“”"]'), '')
        .split(' ')
        .where((w) => w.isNotEmpty)
        .map((w) => w[0])
        .take(2)
        .join();
    return Container(
      width: 48,
      height: 48,
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFA5ADBA), Color(0xFF858D9A)],
        ),
      ),
      child: Text(
        initials,
        style: const TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.w600),
      ),
    );
  }
}
