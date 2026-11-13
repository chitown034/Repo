import 'dart:io';

import 'package:active_duty/data/benefits.dart';
import 'package:active_duty/data/catalog.dart';
import 'package:active_duty/data/site_content.dart';
import 'package:active_duty/screens/more/board_screen.dart';
import 'package:active_duty/screens/more/refer_screen.dart';
import 'package:active_duty/screens/more/testimonials_screen.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';

/// Pages rendered by dedicated native screens instead of the generic renderer.
const customSlugs = {'veteran-benefits-finder', 'career-command-center', 'home'};

void main() {
  late SiteContent site;
  late BenefitsDb db;

  setUpAll(() {
    site = SiteContent.parse(File('assets/content/site.json').readAsStringSync());
    db = BenefitsDb.parse(File('assets/content/benefits.json').readAsStringSync());
  });

  test('every website page converted with content', () {
    expect(site.pages.length, greaterThanOrEqualTo(70));
    for (final p in site.pages.values) {
      expect(p.blocks, isNotEmpty, reason: p.slug);
    }
    final cards = site.pages.values.fold<int>(0, (n, p) => n + p.cards.length);
    expect(cards, greaterThan(800));
  });

  test('every resource hub entry points at a real page', () {
    for (final g in catalog) {
      for (final e in g.entries) {
        if (e.url != null) continue;
        expect(site[e.slug], isNotNull, reason: e.slug);
      }
    }
  });

  test('every internal link resolves to a page or native screen', () {
    final broken = <String>{};
    for (final p in site.pages.values) {
      for (final b in p.blocks) {
        final url = switch (b) {
          CardBlock(:final url) => url,
          LinkBlock(:final url) => url,
          _ => null,
        };
        if (url == null || !url.startsWith('app://')) continue;
        final slug = url.substring(6).split('#').first;
        if (site[slug] == null && !customSlugs.contains(slug)) broken.add('${p.slug} -> $slug');
      }
    }
    expect(broken, isEmpty);
  });

  test('real estate careers points to the LPT link, not the old eXp link', () {
    final careers = catalog.firstWhere((g) => g.title == 'Careers');
    expect(careers.entries.any((e) => e.url == 'https://stevenshearrill.lpt.com/'), isTrue);
    expect(File('assets/content/site.json').readAsStringSync(), isNot(contains('exprealty')));
  });

  test('website forms carry their fields', () {
    final contact = site['contact-us']!.form!;
    expect(contact.fields.map((f) => f.label), containsAll(['First Name', 'Last Name', 'Email', 'Phone', 'Comments']));
    expect(contact.fields.firstWhere((f) => f.label == 'Email').kind, FormFieldKind.email);
    final reloc = site['relocating-to-southern-california']!.form!;
    final type = reloc.fields.firstWhere((f) => f.label.startsWith('Property Type'));
    expect(type.kind, FormFieldKind.select);
    expect(type.options, contains('Single Family Residence'));
    expect(type.options, isNot(contains('Select One')));
  });

  test('search finds resources across pages', () {
    expect(site.search('scholarship'), isNotEmpty);
    expect(site.search('zzzz-no-match'), isEmpty);
  });

  test('board and testimonials parse into people', () {
    final board = parseBoard(site['board-members']!);
    expect(board.length, greaterThanOrEqualTo(8));
    expect(board.first.name, 'Steven Shearrill');
    expect(board.first.links.any((l) => l.url.startsWith('tel:')), isTrue);
    final t = parseTestimonials(site['testimonials']!);
    expect(t.length, 5);
    expect(t.every((x) => x.quote.isNotEmpty), isTrue);
  });

  group('benefits database', () {
    test('loads all programs and states', () {
      expect(db.items.length, 2345);
      expect(db.states.length, 52);
      expect(db.categories, contains('Housing'));
    });

    test('filters by query, level, category, and state', () {
      final ca = db.stateByCode('CA')!;
      final caState = db.filter(level: 'State', state: ca);
      expect(caState, isNotEmpty);
      expect(caState.every((b) => b.appliesToState(ca)), isTrue);
      final tx = db.stateByCode('TX')!;
      expect(
        caState.any(
          (b) => b.title.contains('Texas') && !b.title.contains('California') && !b.tags.contains('California'),
        ),
        isFalse,
      );
      expect(db.filter(level: 'State', state: tx).any((b) => b.title.contains('Texas')), isTrue);
      expect(db.filter(query: 'gi bill').length, greaterThan(5));
      expect(db.filter(categories: {'Burial'}).every((b) => b.category == 'Burial'), isTrue);
    });
  });

  group('referral invite (kept from the original app)', () {
    test('message is personalized', () {
      expect(referralMessage('Maria'), startsWith('Hi Maria, I just attended this awesome VA Home Buying Seminar'));
      expect(referralMessage(''), startsWith('Hi there,'));
    });

    test('group text includes the friend and the club number on both platforms', () {
      final ios = referralSmsUri(['(555) 123-4567', '619-368-7141'], 'hi', platform: TargetPlatform.iOS).toString();
      expect(ios, 'sms:/open?addresses=5551234567,6193687141&body=hi');
      final android = referralSmsUri(
        ['(555) 123-4567', '619-368-7141'],
        'hi there',
        platform: TargetPlatform.android,
      ).toString();
      expect(android, 'smsto:5551234567;6193687141?body=hi%20there');
    });
  });
}
