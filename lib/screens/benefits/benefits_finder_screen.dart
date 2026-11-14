import 'package:cupertino_ui/cupertino_ui.dart';

import '../../app/routes.dart';
import '../../data/benefits.dart';
import '../../data/prefs.dart';
import '../../services/links.dart';
import '../../ui/apple.dart';
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
  String _query = '';
  String? _level;
  final Set<String> _cats = {};
  bool _savedOnly = false;
  bool _useState = true;

  Future<void> _pickState(BenefitsDb db) async {
    final options = ['All States', for (final s in db.states) s.name];
    final current = db.states.indexWhere((s) => s.code == Prefs.instance.homeState);
    final i = await showApplePicker(context, title: 'Your State', options: options, initial: current + 1);
    if (i == null) return;
    final code = i == 0 ? null : db.states[i - 1].code;
    Prefs.instance.setHomeState(code);
    setState(() => _useState = code != null);
  }

  Future<void> _showPhones(BenefitsDb db) => Navigator.of(context).push(
    appleRoute(
      LargeTitleScaffold(
        title: 'VA Phone Numbers',
        slivers: [
          SliverToBoxAdapter(
            child: Builder(
              builder: (context) => InsetSection(
                children: [
                  for (final p in db.phones)
                    AppleRow(
                      icon: CupertinoIcons.phone_fill,
                      iconColor: Hue.green,
                      title: p.what,
                      subtitle: p.number,
                      accessory: RowAccessory.none,
                      onTap: () {
                        final m = RegExp(r'1?-?\d{3}-\d{3}-\d{4}|\b\d{3}\b').firstMatch(p.number);
                        if (m != null) openLink(context, 'tel:${m.group(0)!.replaceAll('-', '')}');
                      },
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
      title: 'Benefits',
    ),
  );

  @override
  Widget build(BuildContext context) => FutureBuilder<BenefitsDb>(
    future: _db,
    builder: (context, snap) => ListenableBuilder(
      listenable: Prefs.instance,
      builder: (context, _) {
        final db = snap.data;
        if (db == null) {
          return LargeTitleScaffold(
            title: 'Benefits',
            slivers: [
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: snap.hasError
                      ? Text('Could not load benefits.', style: context.t.bodyLarge)
                      : const CupertinoActivityIndicator(radius: 14),
                ),
              ),
            ],
          );
        }
        return _body(db);
      },
    ),
  );

  Widget _body(BenefitsDb db) {
    final c = context.c;
    final state = _useState ? db.stateByCode(Prefs.instance.homeState) : null;
    final results = db.filter(
      query: _query,
      categories: _cats,
      level: _level,
      state: state,
      onlyIds: _savedOnly ? Prefs.instance.savedBenefitIds : null,
    );
    return LargeTitleScaffold(
      title: 'Benefits',
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          BarButton(icon: CupertinoIcons.phone, tooltip: 'VA phone numbers', onPressed: () => _showPhones(db)),
          BarButton(
            icon: _savedOnly ? CupertinoIcons.bookmark_fill : CupertinoIcons.bookmark,
            tooltip: _savedOnly ? 'Show all' : 'Show saved',
            onPressed: () => setState(() => _savedOnly = !_savedOnly),
          ),
        ],
      ),
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 12),
            child: AppleSearchField(
              placeholder: 'Search ${_fmt(db.items.length)} benefits',
              onChanged: (v) => setState(() => _query = v.trim()),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 12),
            child: AppleSegmented<String>(
              value: _level ?? 'All',
              segments: const {'All': 'All', 'Federal': 'Federal', 'State': 'State', 'Private': 'Private'},
              onChanged: (v) => setState(() => _level = v == 'All' ? null : v),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: kPage,
              children: [
                Pill(
                  icon: CupertinoIcons.location_solid,
                  label: state?.name ?? 'All States',
                  selected: state != null,
                  onTap: () => _pickState(db),
                ),
                for (final cat in db.categories) ...[
                  const SizedBox(width: 8),
                  Pill(
                    label: _catLabel(cat),
                    selected: _cats.contains(cat),
                    onTap: () => setState(() => _cats.contains(cat) ? _cats.remove(cat) : _cats.add(cat)),
                  ),
                ],
              ],
            ),
          ),
        ),
        if (state != null)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(kGutter, 16, kGutter, 0),
              child: _StateCard(state: state),
            ),
          ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter + 4, 22, kGutter, 8),
            child: Caption(_savedOnly ? '${results.length} Saved' : '${_fmt(results.length)} Benefits'),
          ),
        ),
        if (results.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  Icon(_savedOnly ? CupertinoIcons.bookmark : CupertinoIcons.search, size: 44, color: c.tertiaryLabel),
                  const SizedBox(height: 10),
                  Text(_savedOnly ? 'No Saved Benefits' : 'No Results', style: context.t.titleLarge),
                  const SizedBox(height: 4),
                  Text(
                    _savedOnly ? 'Tap the bookmark on any benefit to save it.' : 'Try fewer filters.',
                    textAlign: TextAlign.center,
                    style: context.t.bodyMedium?.copyWith(color: c.secondaryLabel),
                  ),
                ],
              ),
            ),
          ),
        SliverPadding(
          padding: kPage,
          sliver: SliverList.separated(
            itemCount: results.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, i) => _BenefitCard(benefit: results[i]),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(32, 24, 32, 0),
            child: Text(
              'Independent nonprofit directory, last verified ${db.checked}. Every program links to its '
              'official source; confirm eligibility with the agency. Your choices stay on this device.',
              textAlign: TextAlign.center,
              style: context.t.labelSmall?.copyWith(color: c.secondaryLabel, height: 1.4),
            ),
          ),
        ),
      ],
    );
  }
}

String _fmt(int n) => n.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',');

String _catLabel(String c) => switch (c) {
  'GuardReserve' => 'Guard & Reserve',
  _ => c,
};

Color levelColor(BuildContext context, String level) => switch (level) {
  'Federal' => context.c.tint,
  'State' => context.c.green,
  _ => const Color(0xFFC77800),
};

class _StateCard extends StatelessWidget {
  const _StateCard({required this.state});
  final UsState state;

  @override
  Widget build(BuildContext context) => AppleCard(
    onTap: () => pushScreen(context, StateGuideScreen(state: state), title: 'Benefits'),
    child: Row(
      children: [
        IconBadge(CupertinoIcons.map_fill, color: Hue.teal, size: 40),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${state.name} Guide', style: context.t.titleMedium),
              const SizedBox(height: 3),
              GenerosityStars(value: state.generosity),
              const SizedBox(height: 4),
              Text(
                state.headline,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: context.t.bodySmall?.copyWith(color: context.c.secondaryLabel),
              ),
            ],
          ),
        ),
        Icon(CupertinoIcons.chevron_forward, size: 16, color: context.c.tertiaryLabel),
      ],
    ),
  );
}

class GenerosityStars extends StatelessWidget {
  const GenerosityStars({super.key, required this.value, this.color});
  final int value;
  final Color? color;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      for (var i = 1; i <= 5; i++)
        Icon(
          i <= value ? CupertinoIcons.star_fill : CupertinoIcons.star,
          size: 13,
          color: color ?? const Color(0xFFFF9F0A),
        ),
      const SizedBox(width: 6),
      Text('Generosity $value of 5', style: context.t.labelSmall?.copyWith(color: color ?? context.c.secondaryLabel)),
    ],
  );
}

class _BenefitCard extends StatelessWidget {
  const _BenefitCard({required this.benefit});
  final Benefit benefit;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final saved = Prefs.instance.isBenefitSaved(benefit.id);
    return AppleCard(
      radius: 16,
      padding: const EdgeInsets.fromLTRB(16, 14, 6, 14),
      onTap: () => pushScreen(context, BenefitDetailScreen(benefit: benefit), title: 'Benefits'),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Tag(_catLabel(benefit.category)),
                    const SizedBox(width: 6),
                    Tag(benefit.level, color: levelColor(context, benefit.level)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(benefit.title, style: context.t.titleMedium, maxLines: 3, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text(
                  benefit.value,
                  style: context.t.bodyMedium?.copyWith(color: c.secondaryLabel),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          CupertinoButton(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            minimumSize: const Size(36, 36),
            onPressed: () => Prefs.instance.toggleBenefit(benefit.id),
            child: Icon(
              saved ? CupertinoIcons.bookmark_fill : CupertinoIcons.bookmark,
              size: 20,
              color: saved ? c.tint : c.tertiaryLabel,
            ),
          ),
        ],
      ),
    );
  }
}
