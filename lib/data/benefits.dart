import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// A federal, state, or private benefit from the Benefits Finder database
/// (2,345 programs, mirrored from veteransresourcenetwork.org/veteran-benefits-finder).
class Benefit {
  Benefit({
    required this.id,
    required this.title,
    required this.category,
    required this.level,
    required this.who,
    required this.value,
    required this.how,
    required this.url,
    required this.tags,
    required this.confidence,
    this.hack,
    this.deadline,
    this.org,
  }) : _haystack = [title, category, level, who, value, org ?? '', ...tags].join(' ').toLowerCase();

  final String id;
  final String title;
  final String category;

  /// Federal, State, or Private.
  final String level;
  final String who;
  final String value;
  final String how;
  final String url;
  final List<String> tags;
  final String confidence;
  final String? hack;
  final String? deadline;
  final String? org;
  final String _haystack;

  bool matchesAll(List<String> terms) => terms.every(_haystack.contains);

  /// Whether a State-level benefit applies to the given state.
  bool appliesToState(UsState state) {
    if (level != 'State') return true;
    final t = '$title ${org ?? ''} ${tags.join(' ')}';
    return t.contains(state.name) || tags.contains(state.code);
  }

  factory Benefit.fromJson(Map<String, dynamic> j) => Benefit(
    id: j['id'] as String,
    title: j['title'] as String,
    category: j['category'] as String,
    level: j['level'] as String,
    who: j['who'] as String,
    value: j['value'] as String,
    how: j['how'] as String,
    url: j['url'] as String,
    tags: [for (final t in j['tags'] as List) t as String],
    confidence: j['confidence'] as String,
    hack: j['hack'] as String?,
    deadline: j['deadline'] as String?,
    org: j['org'] as String?,
  );
}

class UsState {
  UsState({
    required this.code,
    required this.name,
    required this.generosity,
    required this.headline,
    required this.sections,
    required this.other,
    required this.topHack,
    this.agencyName,
    this.agencyUrl,
    this.agencyPhone,
  });

  final String code;
  final String name;

  /// 1-5 rating of how generous the state is to veterans.
  final int generosity;
  final String headline;

  /// Ordered (label, text) sections such as Income tax, Property tax.
  final List<(String, String)> sections;
  final List<String> other;
  final String topHack;
  final String? agencyName;
  final String? agencyUrl;
  final String? agencyPhone;

  factory UsState.fromJson(Map<String, dynamic> j) {
    final sections = <(String, String)>[];
    final tax = j['incomeTax'];
    if (tax is Map) {
      if (tax['militaryRetirement'] != null) {
        sections.add(('Military retirement pay', tax['militaryRetirement'] as String));
      }
      if (tax['activeDuty'] != null) sections.add(('Active duty pay', tax['activeDuty'] as String));
      if (tax['notes'] != null) sections.add(('Income tax notes', tax['notes'] as String));
    }
    for (final (key, label) in const [
      ('propertyTax', 'Property tax'),
      ('education', 'Education'),
      ('employment', 'Employment'),
      ('vehicleRec', 'Vehicles & recreation'),
      ('cash', 'Cash benefits'),
      ('homesHealth', 'Veterans homes & health'),
    ]) {
      final v = j[key];
      if (v is String && v.isNotEmpty) sections.add((label, v));
    }
    final agency = j['agency'];
    return UsState(
      code: j['code'] as String,
      name: j['name'] as String,
      generosity: (j['generosity'] as num?)?.toInt() ?? 0,
      headline: j['headline'] as String? ?? '',
      sections: sections,
      other: [for (final o in (j['other'] as List? ?? const [])) o.toString()],
      topHack: j['topHack'] as String? ?? '',
      agencyName: agency is Map ? agency['name'] as String? : null,
      agencyUrl: agency is Map ? agency['url'] as String? : null,
      agencyPhone: agency is Map ? agency['phone'] as String? : null,
    );
  }
}

class VaPhone {
  const VaPhone(this.what, this.number);
  final String what;
  final String number;
}

class BenefitsDb {
  BenefitsDb({required this.items, required this.states, required this.phones, required this.checked});

  final List<Benefit> items;
  final List<UsState> states;
  final List<VaPhone> phones;
  final String checked;

  late final List<String> categories = () {
    final counts = <String, int>{};
    for (final b in items) {
      counts[b.category] = (counts[b.category] ?? 0) + 1;
    }
    final list = counts.keys.toList()..sort((a, b) => counts[b]!.compareTo(counts[a]!));
    return list;
  }();

  UsState? stateByCode(String? code) => code == null ? null : states.where((s) => s.code == code).firstOrNull;

  List<Benefit> filter({
    String query = '',
    Set<String> categories = const {},
    String? level,
    UsState? state,
    Set<String>? onlyIds,
  }) {
    final terms = query.toLowerCase().split(RegExp(r'\s+')).where((t) => t.isNotEmpty).toList();
    return [
      for (final b in items)
        if ((onlyIds == null || onlyIds.contains(b.id)) &&
            (categories.isEmpty || categories.contains(b.category)) &&
            (level == null || b.level == level) &&
            (state == null || b.appliesToState(state)) &&
            (terms.isEmpty || b.matchesAll(terms)))
          b,
    ];
  }

  static BenefitsDb? _instance;
  static BenefitsDb? get maybeInstance => _instance;

  static Future<BenefitsDb> load() async {
    if (_instance != null) return _instance!;
    final raw = await rootBundle.loadString('assets/content/benefits.json');
    _instance = await compute(parse, raw);
    return _instance!;
  }

  static BenefitsDb parse(String raw) {
    final j = jsonDecode(raw) as Map<String, dynamic>;
    final contacts = j['contacts'] as Map<String, dynamic>? ?? const {};
    return BenefitsDb(
      items: [for (final i in j['items'] as List) Benefit.fromJson(i as Map<String, dynamic>)],
      states: [for (final s in j['states'] as List) UsState.fromJson(s as Map<String, dynamic>)]
        ..sort((a, b) => a.name.compareTo(b.name)),
      phones: [
        for (final p in (contacts['phones'] as List? ?? const []))
          VaPhone((p as Map)['what'] as String, p['number'] as String),
      ],
      checked: ((j['asOf'] as Map?)?['checked'] as String?) ?? '',
    );
  }
}
