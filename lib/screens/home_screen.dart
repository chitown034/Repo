import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:material_ui/material_ui.dart';

import '../app/org.dart';
import '../app/routes.dart';
import '../data/site_content.dart';
import '../services/links.dart';
import '../ui/apple.dart';
import '../widgets/common.dart';
import 'more/more_screen.dart';
import 'more/refer_screen.dart';
import 'search_screen.dart';
import 'shell.dart';
import 'tools/career_center_screen.dart';

/// Cards that follow the heading containing [heading], up to the next H2.
List<CardBlock> cardsInSection(SitePage page, String heading) {
  final out = <CardBlock>[];
  var inside = false;
  for (final b in page.blocks) {
    if (b is HeadingBlock && b.level <= 2) {
      if (inside) break;
      inside = b.text.contains(heading);
      continue;
    }
    if (inside && b is CardBlock) out.add(b);
  }
  return out;
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final home = SiteContent.instance['home']!;
    final stats = home.blocks.whereType<StatBlock>().toList();
    final videos = home.blocks.whereType<VideoBlock>().toList();
    final faqs = home.blocks.whereType<FaqBlock>().toList();
    final sources = cardsInSection(home, 'Go straight to the source');
    final housing = cardsInSection(home, 'roof overhead');

    return LargeTitleScaffold(
      title: 'Hometown Hero',
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          BarButton(
            icon: CupertinoIcons.search,
            tooltip: 'Search',
            onPressed: () => pushScreen(context, const SearchScreen(), title: 'Home'),
          ),
          BarButton(
            icon: CupertinoIcons.ellipsis_circle,
            tooltip: 'More',
            onPressed: () => pushScreen(context, const MoreScreen(), title: 'Home'),
          ),
        ],
      ),
      slivers: [
        SliverToBoxAdapter(child: _HeroCard(stats: stats)),
        const SliverToBoxAdapter(
          child: SectionTitle(
            'Start Here',
            subtitle: 'Pick a mission. Every guide is organized, current, and in plain English.',
          ),
        ),
        SliverToBoxAdapter(
          child: TileGrid(
            children: [
              for (final (icon, color, title, sub, slug) in const [
                (
                  CupertinoIcons.checkmark_shield_fill,
                  Hue.navy,
                  'Veteran Resources',
                  'Claims, mental health, travel, discounts',
                  'veteran-resources',
                ),
                (
                  CupertinoIcons.briefcase_fill,
                  Hue.brown,
                  'Employment',
                  'Job boards, SkillBridge, resumes',
                  'employment-assistance',
                ),
                (
                  CupertinoIcons.book_fill,
                  Hue.indigo,
                  'Education',
                  'GI Bill, certifications, scholarships',
                  'education-resources',
                ),
                (
                  CupertinoIcons.car_detailed,
                  Hue.orange,
                  'Relocation',
                  'PCS moves, neighborhoods, bases',
                  'nationwide-relocation-assistance',
                ),
                (
                  CupertinoIcons.location_solid,
                  Hue.purple,
                  'County Resources',
                  'San Diego, Riverside, Orange, LA',
                  'san-diego-county',
                ),
                (
                  CupertinoIcons.map_fill,
                  Hue.teal,
                  'Benefits by State',
                  'Property tax, tuition, plates',
                  'veteran-and-disabled-veteran-benefits-by-state',
                ),
              ])
                FeatureTile(
                  icon: icon,
                  color: color,
                  title: title,
                  subtitle: sub,
                  onTap: () => openLink(context, 'app://$slug'),
                ),
            ],
          ),
        ),
        const SliverToBoxAdapter(child: SectionTitle('Featured Tools')),
        const SliverToBoxAdapter(child: _ToolShelf()),
        const SliverToBoxAdapter(child: SizedBox(height: 22)),
        const SliverToBoxAdapter(child: _WebinarCard()),
        const SliverToBoxAdapter(
          child: SectionTitle(
            'Housing & Utilities',
            subtitle: 'HUD-VASH, SSVF, foreclosure help, LIHEAP, utility discounts, and emergency grants.',
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            children: [
              for (final c in housing) ResourceRow(card: c),
              AppleRow(
                icon: CupertinoIcons.phone_fill,
                iconColor: Hue.green,
                title: 'Homeless or at risk?',
                subtitle: 'Call ${Org.homelessHotlineDisplay} · 24/7',
                accessory: RowAccessory.none,
                onTap: () => openLink(context, Org.homelessHotlineTel),
              ),
            ],
          ),
        ),
        const SliverToBoxAdapter(
          child: SectionTitle(
            'Watch & Learn',
            subtitle: 'Official explainers from VA, TAP, and Military OneSource.',
            top: 6,
          ),
        ),
        SliverToBoxAdapter(child: VideoShelf(videos: videos)),
        const SliverToBoxAdapter(
          child: SectionTitle('Official Sources', subtitle: 'The programs we point veterans to most.'),
        ),
        SliverToBoxAdapter(
          child: InsetSection(children: [for (final c in sources) ResourceRow(card: c)]),
        ),
        const SliverToBoxAdapter(child: CrisisCard()),
        const SliverToBoxAdapter(child: SectionTitle('Questions Veterans Ask')),
        SliverToBoxAdapter(child: FaqSection(faqs: faqs)),
        const SliverToBoxAdapter(child: _DonateCard()),
        const SliverToBoxAdapter(
          child: SectionTitle('Southern California', subtitle: 'Veteran services offices and programs near you.'),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            children: [
              for (final (name, slug) in const [
                ('San Diego County', 'san-diego-county'),
                ('Riverside County', 'riverside-county'),
                ('Orange County', 'orange-county'),
                ('Los Angeles County', 'los-angeles-county'),
              ])
                AppleRow(
                  icon: CupertinoIcons.location_solid,
                  iconColor: Hue.purple,
                  title: name,
                  onTap: () => openLink(context, 'app://$slug'),
                ),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: kPage,
            child: AppleCard(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Caption('Our Mission', color: context.c.tint),
                  const SizedBox(height: 8),
                  Text(
                    'We empower active-duty military, veterans, and local heroes with the full scope of '
                    'benefits for home buying, retirement planning, and beyond, through expert guidance, '
                    'employment assistance, and contributions to local charities.',
                    style: context.t.bodyLarge?.copyWith(height: 1.45),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SliverToBoxAdapter(child: OrgFooter()),
      ],
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.stats});
  final List<StatBlock> stats;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    return Padding(
      padding: const EdgeInsets.fromLTRB(kGutter, 6, kGutter, 0),
      child: ClipRSuperellipse(
        borderRadius: BorderRadius.circular(26),
        child: AppleCard(
          gradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF081120), Color(0xFF0E1F3D), Color(0xFF081120)],
          ),
          radius: 26,
          padding: EdgeInsets.zero,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Semantics(
                label: 'Active Duty Veteran and Hometown Hero Homeowners Club',
                image: true,
                child: AspectRatio(
                  aspectRatio: 3,
                  child: Image.asset('assets/images/hero_banner.jpg', fit: BoxFit.cover),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(Org.tagline, style: t.displaySmall?.copyWith(color: Colors.white)),
                    const SizedBox(height: 8),
                    Text(
                      'Free education, benefits guidance, and career support for active duty, veterans, military '
                      'families, and the hometown heroes who keep our communities safe.',
                      style: t.bodyMedium?.copyWith(color: Colors.white.withValues(alpha: 0.78), height: 1.45),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: AppleButton(
                            kind: ButtonStyleKind.white,
                            label: 'Find Benefits',
                            onPressed: () => AppShell.selectTab(context, 1),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: AppleButton(
                            kind: ButtonStyleKind.red,
                            icon: CupertinoIcons.heart_fill,
                            label: 'Donate',
                            onPressed: () => donate(context),
                          ),
                        ),
                      ],
                    ),
                    if (stats.isNotEmpty) ...[
                      const SizedBox(height: 18),
                      Container(height: 0.5, color: Colors.white.withValues(alpha: 0.18)),
                      const SizedBox(height: 14),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          for (final s in stats)
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(s.value, style: t.titleLarge?.copyWith(color: Colors.white)),
                                  const SizedBox(height: 2),
                                  Text(
                                    s.label,
                                    maxLines: 3,
                                    style: t.labelSmall?.copyWith(
                                      color: Colors.white.withValues(alpha: 0.6),
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
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
      ),
    );
  }
}

class _ToolShelf extends StatelessWidget {
  const _ToolShelf();

  @override
  Widget build(BuildContext context) {
    final items = <(IconData, Color, String, String, VoidCallback)>[
      (
        CupertinoIcons.checkmark_shield_fill,
        Hue.navy,
        'Benefits Finder',
        '2,345 programs',
        () => AppShell.selectTab(context, 1),
      ),
      (
        CupertinoIcons.briefcase_fill,
        Hue.brown,
        'Career Command Center',
        'Job search toolkit',
        () => pushScreen(context, const CareerCenterScreen(), title: 'Home'),
      ),
      (
        CupertinoIcons.percent,
        Hue.green,
        'VA Loan Calculators',
        'Payment, fee, BAH',
        () => openLink(context, 'app://calculators'),
      ),
      (
        CupertinoIcons.videocam_fill,
        Hue.red,
        'Free VA Webinar',
        'Reserve your seat',
        () => openLink(context, 'app://va-home-buying-webinar'),
      ),
      (
        CupertinoIcons.person_badge_plus_fill,
        Hue.blue,
        'Invite Friends',
        'Share the seminar',
        () => pushScreen(context, const ReferScreen(), title: 'Home'),
      ),
    ];
    return SizedBox(
      height: 132,
      child: ListView.separated(
        padding: kPage,
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final (icon, color, title, sub, onTap) = items[i];
          return SizedBox(
            width: 168,
            child: AppleCard(
              onTap: onTap,
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconBadge(icon, color: color, size: 34),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: context.t.titleSmall),
                      Text(sub, style: context.t.bodySmall?.copyWith(color: context.c.secondaryLabel)),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _WebinarCard extends StatelessWidget {
  const _WebinarCard();

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Padding(
      padding: kPage,
      child: AppleCard(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Caption('Free VA Home Buying Webinar', color: c.red),
            const SizedBox(height: 6),
            Text('10 common mistakes VA homebuyers make.', style: context.t.headlineSmall),
            const SizedBox(height: 6),
            Text(
              'Choose your rate, avoid lender overlays, and get sellers to help with costs, taught by a '
              'retired Navy Chief who is both a broker and a VA loan officer.',
              style: context.t.bodyMedium?.copyWith(color: c.secondaryLabel),
            ),
            const SizedBox(height: 12),
            for (final s in const [
              'Three ways to get your VA loan approved',
              'How to compare lenders and loan costs',
              'What sellers can contribute for VA buyers',
            ])
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 3),
                child: Row(
                  children: [
                    Icon(CupertinoIcons.checkmark_circle_fill, size: 18, color: c.green),
                    const SizedBox(width: 8),
                    Expanded(child: Text(s, style: context.t.bodyMedium)),
                  ],
                ),
              ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: AppleButton(
                    label: 'Reserve My Seat',
                    onPressed: () => openLink(context, 'app://va-home-buying-webinar'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: AppleButton(
                    kind: ButtonStyleKind.tinted,
                    label: 'Calculators',
                    onPressed: () => openLink(context, 'app://calculators'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DonateCard extends StatelessWidget {
  const _DonateCard();

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 0),
    child: AppleCard(
      gradient: Gradients.navy,
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Caption('Support the Mission', color: Color(0xFFB9C7DA)),
          const SizedBox(height: 6),
          Text('Help a hero come home.', style: context.t.headlineSmall?.copyWith(color: Colors.white)),
          const SizedBox(height: 6),
          Text(
            'Your gift funds free webinars, resource guides, scholarships, and local charities that support '
            'military and first responder families.',
            style: context.t.bodyMedium?.copyWith(color: Colors.white.withValues(alpha: 0.78)),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: AppleButton(
                  kind: ButtonStyleKind.red,
                  icon: CupertinoIcons.heart_fill,
                  label: 'Donate',
                  onPressed: () => donate(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AppleButton(
                  kind: ButtonStyleKind.white,
                  label: 'Contact Us',
                  onPressed: () => AppShell.selectTab(context, 4),
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}
