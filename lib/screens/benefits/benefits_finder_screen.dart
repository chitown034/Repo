import 'package:material_ui/material_ui.dart';

import '../../app/routes.dart';
import '../../data/benefits.dart';
import '../../data/prefs.dart';
import '../../services/links.dart';
import '../../widgets/common.dart';
import 'benefit_detail_screen.dart';
import 'state_guide_screen.dart';

/// Native Benefits Finder: search 2,345 federal, state, and private benefits.
class BenefitsFinderScreen extends StatefulWidget {
  const BenefitsFinderScreen({super.key, this.standalone = false});
  final bool standalone;

  @override
  State<BenefitsFinderScreen> createState() => _BenefitsFinderScreenState();
}

class _BenefitsFinderScreenState extends State<BenefitsFinderScreen> {
  late final Future<BenefitsDb> _db = BenefitsDb.load();
  final _search = TextEditingController();
  String _query = '';
  String? _level;
  final Set<String> _cats = {};
  bool _savedOnly = false;
  bool _useState = true;

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _pickState(BenefitsDb db) async {
    final code = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (ctx) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        builder: (ctx, controller) => ListView(
          controller: controller,
          children: [
            const ListTile(title: Text('Your state'), subtitle: Text('Shows that state’s programs and guide')),
            ListTile(
              leading: const Icon(Icons.public),
              title: const Text('All states'),
              onTap: () => Navigator.pop(ctx, ''),
            ),
            for (final s in db.states)
              ListTile(
                leading: CircleAvatar(radius: 16, child: Text(s.code, style: const TextStyle(fontSize: 11))),
                title: Text(s.name),
                trailing: s.code == Prefs.instance.homeState ? const Icon(Icons.check) : null,
                onTap: () => Navigator.pop(ctx, s.code),
              ),
          ],
        ),
      ),
    );
    if (code == null) return;
    Prefs.instance.setHomeState(code.isEmpty ? null : code);
    setState(() => _useState = code.isNotEmpty);
  }

  void _showPhones(BenefitsDb db) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (ctx) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        builder: (ctx, controller) => ListView(
          controller: controller,
          children: [
            const ListTile(title: Text('Important VA phone numbers')),
            for (final p in db.phones)
              ListTile(
                leading: const Icon(Icons.call_outlined),
                title: Text(p.what),
                subtitle: Text(p.number),
                onTap: () {
                  final m = RegExp(r'1?-?\d{3}-\d{3}-\d{4}|\b\d{3}\b').firstMatch(p.number);
                  if (m != null) openLink(context, 'tel:${m.group(0)!.replaceAll('-', '')}');
                },
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<BenefitsDb>(
      future: _db,
      builder: (context, snap) {
        final db = snap.data;
        return ListenableBuilder(
          listenable: Prefs.instance,
          builder: (context, _) => Scaffold(body: db == null ? _loading(snap.error) : _body(db)),
        );
      },
    );
  }

  Widget _loading(Object? error) => CustomScrollView(
    slivers: [
      const SliverAppBar.large(title: Text('Benefits Finder')),
      SliverFillRemaining(
        child: Center(
          child: error != null ? Text('Could not load benefits: $error') : const CircularProgressIndicator(),
        ),
      ),
    ],
  );

  Widget _body(BenefitsDb db) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final state = _useState ? db.stateByCode(Prefs.instance.homeState) : null;
    final results = db.filter(
      query: _query,
      categories: _cats,
      level: _level,
      state: state,
      onlyIds: _savedOnly ? Prefs.instance.savedBenefitIds : null,
    );
    return CustomScrollView(
      slivers: [
        SliverAppBar.large(
          title: const Text('Benefits Finder'),
          actions: [
            IconButton(
              tooltip: 'VA phone numbers',
              onPressed: () => _showPhones(db),
              icon: const Icon(Icons.contact_phone_outlined),
            ),
            IconButton(
              tooltip: _savedOnly ? 'Show all' : 'Show saved',
              onPressed: () => setState(() => _savedOnly = !_savedOnly),
              icon: Icon(_savedOnly ? Icons.bookmark : Icons.bookmark_border),
              color: _savedOnly ? scheme.secondary : null,
            ),
          ],
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
            child: Text(
              '${_fmt(db.items.length)} federal, state, and private benefits for service members, veterans, '
              'families, survivors, and caregivers.',
              style: t.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 6),
            child: TextField(
              controller: _search,
              onChanged: (v) => setState(() => _query = v.trim()),
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search),
                hintText: 'Try “property tax”, “GI Bill”, “dental”',
                suffixIcon: _query.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => setState(() {
                          _search.clear();
                          _query = '';
                        }),
                      ),
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              children: [
                ActionChip(
                  avatar: const Icon(Icons.place_outlined, size: 18),
                  label: Text(state?.name ?? 'All states'),
                  onPressed: () => _pickState(db),
                ),
                const SizedBox(width: 8),
                for (final l in const ['Federal', 'State', 'Private']) ...[
                  FilterChip(
                    label: Text(l),
                    selected: _level == l,
                    onSelected: (v) => setState(() => _level = v ? l : null),
                  ),
                  const SizedBox(width: 8),
                ],
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              children: [
                for (final c in db.categories) ...[
                  FilterChip(
                    label: Text(_catLabel(c)),
                    selected: _cats.contains(c),
                    onSelected: (v) => setState(() => v ? _cats.add(c) : _cats.remove(c)),
                  ),
                  const SizedBox(width: 8),
                ],
              ],
            ),
          ),
        ),
        if (state != null)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 4),
              child: _StateCard(state: state),
            ),
          ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 8),
            child: Text(
              _savedOnly ? '${results.length} saved' : '${_fmt(results.length)} matching benefits',
              style: t.labelLarge?.copyWith(color: scheme.onSurfaceVariant),
            ),
          ),
        ),
        if (results.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Text(
                _savedOnly
                    ? 'Tap the bookmark on any benefit to save it here.'
                    : 'No benefits match. Try fewer filters.',
                textAlign: TextAlign.center,
              ),
            ),
          ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
          sliver: SliverList.separated(
            itemCount: results.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, i) => _BenefitCard(benefit: results[i]),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
            child: Text(
              'Independent nonprofit directory, last verified ${db.checked}. Every program links to its official '
              'source. Confirm eligibility with the agency. Your choices stay on your phone.',
              style: t.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
            ),
          ),
        ),
      ],
    );
  }
}

String _catLabel(String c) => switch (c) {
  'GuardReserve' => 'Guard & Reserve',
  'MST' => 'MST',
  _ => c,
};

class _StateCard extends StatelessWidget {
  const _StateCard({required this.state});
  final UsState state;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Card(
      color: scheme.primary.withValues(alpha: 0.07),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => pushScreen(context, StateGuideScreen(state: state)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${state.name} veteran guide', style: t.titleMedium),
                    const SizedBox(height: 4),
                    GenerosityStars(value: state.generosity),
                    const SizedBox(height: 6),
                    Text(state.headline, maxLines: 3, overflow: TextOverflow.ellipsis, style: t.bodySmall),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}

class GenerosityStars extends StatelessWidget {
  const GenerosityStars({super.key, required this.value});
  final int value;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      for (var i = 1; i <= 5; i++)
        Icon(
          i <= value ? Icons.star_rounded : Icons.star_outline_rounded,
          size: 18,
          color: Theme.of(context).colorScheme.tertiary,
        ),
      const SizedBox(width: 6),
      Text('Generosity $value/5', style: Theme.of(context).textTheme.labelSmall),
    ],
  );
}

class _BenefitCard extends StatelessWidget {
  const _BenefitCard({required this.benefit});
  final Benefit benefit;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final saved = Prefs.instance.isBenefitSaved(benefit.id);
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => pushScreen(context, BenefitDetailScreen(benefit: benefit)),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 6, 14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        Badge2(_catLabel(benefit.category)),
                        Badge2(benefit.level, color: levelColor(context, benefit.level)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(benefit.title, style: t.titleSmall, maxLines: 3, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    Text(
                      benefit.value,
                      style: t.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: saved ? 'Remove from saved' : 'Save',
                onPressed: () => Prefs.instance.toggleBenefit(benefit.id),
                icon: Icon(saved ? Icons.bookmark : Icons.bookmark_border),
                color: saved ? scheme.secondary : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Color levelColor(BuildContext context, String level) => switch (level) {
  'Federal' => const Color(0xFF2F5D8A),
  'State' => const Color(0xFF2E6B5A),
  _ => const Color(0xFF8A5A12),
};

String _fmt(int n) => n.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',');
