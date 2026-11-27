import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// One renderable piece of a website page (converted from the live site).
sealed class Block {
  const Block();

  static Block? fromJson(Map<String, dynamic> j) {
    switch (j['t']) {
      case 'h':
        return HeadingBlock(j['text'] as String, j['level'] as int);
      case 'text':
        return TextBlock(j['text'] as String);
      case 'eyebrow':
        return EyebrowBlock(j['text'] as String);
      case 'bullet':
        return BulletBlock(j['text'] as String);
      case 'link':
        return LinkBlock(j['text'] as String, j['url'] as String);
      case 'card':
        return CardBlock(
          title: j['title'] as String,
          badge: (j['badge'] as String?) ?? '',
          desc: (j['desc'] as String?) ?? '',
          url: j['url'] as String,
          cta: (j['cta'] as String?) ?? '',
        );
      case 'video':
        return VideoBlock(
          id: j['id'] as String,
          title: (j['title'] as String?) ?? '',
          source: (j['source'] as String?) ?? '',
        );
      case 'faq':
        return FaqBlock(j['q'] as String, j['a'] as String);
      case 'stat':
        return StatBlock(j['value'] as String, (j['label'] as String?) ?? '');
      case 'form':
        return FormBlock([for (final f in (j['fields'] as List)) FormFieldSpec.fromJson(f as Map<String, dynamic>)]);
    }
    return null;
  }
}

class HeadingBlock extends Block {
  const HeadingBlock(this.text, this.level);
  final String text;
  final int level;
}

class TextBlock extends Block {
  const TextBlock(this.text);
  final String text;
}

class EyebrowBlock extends Block {
  const EyebrowBlock(this.text);
  final String text;
}

class BulletBlock extends Block {
  const BulletBlock(this.text);
  final String text;
}

class LinkBlock extends Block {
  const LinkBlock(this.text, this.url);
  final String text;
  final String url;
}

class CardBlock extends Block {
  const CardBlock({required this.title, required this.badge, required this.desc, required this.url, required this.cta});
  final String title;
  final String badge;
  final String desc;
  final String url;
  final String cta;
}

class VideoBlock extends Block {
  const VideoBlock({required this.id, required this.title, required this.source});
  final String id;
  final String title;
  final String source;

  String get watchUrl => 'https://www.youtube.com/watch?v=$id';
  String get thumbnailUrl => 'https://img.youtube.com/vi/$id/hqdefault.jpg';
}

class FaqBlock extends Block {
  const FaqBlock(this.question, this.answer);
  final String question;
  final String answer;
}

class StatBlock extends Block {
  const StatBlock(this.value, this.label);
  final String value;
  final String label;
}

class FormBlock extends Block {
  const FormBlock(this.fields);
  final List<FormFieldSpec> fields;
}

enum FormFieldKind { text, email, phone, longText, select, choice }

class FormFieldSpec {
  const FormFieldSpec({
    required this.name,
    required this.label,
    required this.kind,
    required this.required,
    this.options = const [],
    this.placeholder,
  });

  final String name;
  final String label;
  final FormFieldKind kind;
  final bool required;
  final List<String> options;
  final String? placeholder;

  factory FormFieldSpec.fromJson(Map<String, dynamic> j) {
    final type = j['type'] as String;
    final label = (j['label'] as String).replaceAll(RegExp(r'[:\s]+$'), '');
    final lower = label.toLowerCase();
    FormFieldKind kind;
    if (type == 'select') {
      kind = FormFieldKind.select;
    } else if (type == 'radio' || type == 'checkbox') {
      kind = FormFieldKind.choice;
    } else if (type == 'email') {
      kind = FormFieldKind.email;
    } else if (lower == 'phone') {
      kind = FormFieldKind.phone;
    } else if (lower.contains('comment') ||
        lower.contains('question') ||
        lower.contains('employers') ||
        lower.contains('skills') ||
        lower.contains('reason')) {
      kind = FormFieldKind.longText;
    } else {
      kind = FormFieldKind.text;
    }
    final options = [
      for (final o in (j['options'] as List? ?? const []))
        if (o != 'Select One') o as String,
    ];
    return FormFieldSpec(
      name: j['name'] as String,
      label: label,
      kind: kind,
      required: j['required'] as bool? ?? false,
      options: options,
      placeholder: j['placeholder'] as String?,
    );
  }
}

class SitePage {
  const SitePage({required this.slug, required this.title, required this.blocks});
  final String slug;
  final String title;
  final List<Block> blocks;

  Iterable<CardBlock> get cards => blocks.whereType<CardBlock>();
  FormBlock? get form => blocks.whereType<FormBlock>().firstOrNull;
}

/// A link-card result for global search.
class SearchHit {
  const SearchHit(this.page, this.card);
  final SitePage page;
  final CardBlock card;
}

class SiteContent {
  SiteContent(this.pages);

  final Map<String, SitePage> pages;

  static SiteContent? _instance;
  static SiteContent get instance => _instance!;
  static bool get isLoaded => _instance != null;

  static Future<SiteContent> load() async {
    if (_instance != null) return _instance!;
    final raw = await rootBundle.loadString('assets/content/site.json');
    _instance = await compute(parse, raw);
    return _instance!;
  }

  @visibleForTesting
  static void setInstance(SiteContent c) => _instance = c;

  static SiteContent parse(String raw) {
    final map = jsonDecode(raw) as Map<String, dynamic>;
    final pages = <String, SitePage>{};
    map.forEach((slug, v) {
      final m = v as Map<String, dynamic>;
      pages[slug] = SitePage(
        slug: slug,
        title: _tidyTitle(m['title'] as String? ?? slug),
        blocks: [
          for (final b in (m['blocks'] as List))
            if (Block.fromJson(b as Map<String, dynamic>) case final Block block) block,
        ],
      );
    });
    return SiteContent(pages);
  }

  static String _tidyTitle(String t) => t.replaceAll(RegExp(r'\s+'), ' ').trim();

  SitePage? operator [](String slug) => pages[slug];

  /// Searches every resource card across the whole site.
  List<SearchHit> search(String query, {int limit = 80}) {
    final terms = query.toLowerCase().split(RegExp(r'\s+')).where((t) => t.isNotEmpty).toList();
    if (terms.isEmpty) return const [];
    final hits = <SearchHit>[];
    final seen = <String>{};
    for (final page in pages.values) {
      for (final card in page.cards) {
        final hay = '${card.title} ${card.badge} ${card.desc} ${page.title}'.toLowerCase();
        if (terms.every(hay.contains) && seen.add(card.url + card.title)) {
          hits.add(SearchHit(page, card));
          if (hits.length >= limit) return hits;
        }
      }
    }
    return hits;
  }
}
