import 'package:material_ui/material_ui.dart';

import '../app/org.dart';
import '../app/routes.dart';
import '../app/theme.dart';
import '../data/site_content.dart';
import '../services/links.dart';
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
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final stats = home.blocks.whereType<StatBlock>().toList();
    final videos = home.blocks.whereType<VideoBlock>().toList();
    final faqs = home.blocks.whereType<FaqBlock>().toList();
    final sources = cardsInSection(home, 'Go straight to the source');
    final housing = cardsInSection(home, 'roof overhead');

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: _Hero(stats: stats)),
          SliverToBoxAdapter(
            child: SectionHeader(
              eyebrow: 'Start here',
              title: 'Find what you need, fast.',
              subtitle: 'Pick a mission. Each guide is organized, up to date, and written in plain English.',
            ),
          ),
          SliverToBoxAdapter(
            child: ResponsiveGrid(
              children: [
                for (final (icon, title, sub, slug, color) in const [
                  (
                    Icons.military_tech_outlined,
                    'Veteran Resources',
                    'Claims, mental health, travel, discounts',
                    'veteran-resources',
                    Brand.blue,
                  ),
                  (
                    Icons.work_outline,
                    'Employment',
                    'Job boards, SkillBridge, resumes',
                    'employment-assistance',
                    Color(0xFF8A3A42),
                  ),
                  (
                    Icons.school_outlined,
                    'Education & Scholarships',
                    'GI Bill, certifications, scholarships',
                    'education-resources',
                    Color(0xFF2E6B5A),
                  ),
                  (
                    Icons.local_shipping_outlined,
                    'Relocation',
                    'PCS moves, neighborhoods, bases',
                    'nationwide-relocation-assistance',
                    Color(0xFF9A6B12),
                  ),
                  (
                    Icons.location_city_outlined,
                    'County Resources',
                    'San Diego, Riverside, Orange, LA',
                    'san-diego-county',
                    Color(0xFF5B4B8A),
                  ),
                  (
                    Icons.map_outlined,
                    'Benefits by State',
                    'Property tax, tuition, plates',
                    'veteran-and-disabled-veteran-benefits-by-state',
                    Color(0xFF2F5D8A),
                  ),
                ])
                  ActionCard(
                    icon: icon,
                    title: title,
                    subtitle: sub,
                    color: color,
                    onTap: () => openLink(context, 'app://$slug'),
                  ),
              ],
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 20)),
          SliverToBoxAdapter(child: _FeatureStrip()),
          SliverToBoxAdapter(
            child: SectionHeader(
              eyebrow: 'Housing & utilities',
              title: 'Help keeping a roof overhead and the lights on.',
              subtitle: 'HUD-VASH, SSVF, VA foreclosure help, LIHEAP, utility discounts, emergency grants, and more.',
            ),
          ),
          SliverToBoxAdapter(
            child: TileGroup(
              children: [
                for (final c in housing) ResourceTile(card: c),
                ListTile(
                  leading: const Icon(Icons.call),
                  title: Text('Homeless or at risk? ${Org.homelessHotlineDisplay}'),
                  subtitle: const Text('National Call Center for Homeless Veterans · 24/7'),
                  onTap: () => openLink(context, Org.homelessHotlineTel),
                ),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: SectionHeader(
              eyebrow: 'Watch & learn',
              title: 'Short videos. Big benefits.',
              subtitle: 'Official explainers from VA, TAP, and Military OneSource.',
            ),
          ),
          SliverToBoxAdapter(child: VideoCarousel(videos: videos)),
          SliverToBoxAdapter(child: _WebinarPromo()),
          SliverToBoxAdapter(
            child: SectionHeader(
              eyebrow: 'Official sources',
              title: 'Go straight to the source.',
              subtitle: 'The government and nonprofit programs we point veterans to most.',
            ),
          ),
          SliverToBoxAdapter(
            child: TileGroup(children: [for (final c in sources) ResourceTile(card: c)]),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
          const SliverToBoxAdapter(child: CrisisBanner()),
          SliverToBoxAdapter(
            child: SectionHeader(eyebrow: 'Quick answers', title: 'Questions veterans ask us most.'),
          ),
          SliverToBoxAdapter(child: FaqGroup(faqs: faqs)),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(gradient: Brand.heroGradient, borderRadius: BorderRadius.circular(22)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Eyebrow('Support the mission', color: Brand.steelLight),
                    const SizedBox(height: 8),
                    Text('Help a hero come home.', style: t.headlineSmall?.copyWith(color: Colors.white)),
                    const SizedBox(height: 8),
                    Text(
                      'Your gift funds free webinars, resource guides, scholarships, and local charities '
                      'that support our military and first responder families.',
                      style: t.bodyMedium?.copyWith(color: Colors.white.withValues(alpha: 0.85)),
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        FilledButton.icon(
                          style: FilledButton.styleFrom(backgroundColor: Brand.red, foregroundColor: Colors.white),
                          onPressed: () => donate(context),
                          icon: const Icon(Icons.volunteer_activism),
                          label: const Text('Donate via PayPal'),
                        ),
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white54),
                          ),
                          onPressed: () => openLink(context, 'app://contact-us'),
                          child: const Text('Contact us'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SectionHeader(
              eyebrow: 'Local help',
              title: 'Southern California counties',
              subtitle: 'Veteran services offices and programs near you.',
            ),
          ),
          SliverToBoxAdapter(
            child: TileGroup(
              children: [
                for (final (name, slug) in const [
                  ('San Diego County', 'san-diego-county'),
                  ('Riverside County', 'riverside-county'),
                  ('Orange County', 'orange-county'),
                  ('Los Angeles County', 'los-angeles-county'),
                ])
                  ListTile(
                    leading: const Icon(Icons.location_on_outlined),
                    title: Text(name),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => openLink(context, 'app://$slug'),
                  ),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
              child: Text('Our mission', style: t.titleLarge),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
              child: Text(
                'We are dedicated to empowering active-duty military, veterans, and local heroes by educating '
                'them on the full scope of benefits available for home buying, retirement planning, and beyond. '
                'Through expert guidance, employment assistance, and meaningful contributions to local charities, '
                'we serve those who serve us.',
                style: t.bodyLarge?.copyWith(color: scheme.onSurfaceVariant, height: 1.5),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: OrgFooter()),
        ],
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({required this.stats});
  final List<StatBlock> stats;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final top = MediaQuery.paddingOf(context).top;
    return Container(
      decoration: const BoxDecoration(
        gradient: Brand.heroGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(20, top + 12, 20, 22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.asset('assets/images/logo_full.jpg', width: 44, height: 44, fit: BoxFit.cover),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Active Duty Veteran\n& Hometown Hero',
                  style: t.titleSmall?.copyWith(color: Colors.white, height: 1.2, fontWeight: FontWeight.w700),
                ),
              ),
              IconButton(
                tooltip: 'Search everything',
                onPressed: () => pushScreen(context, const SearchScreen()),
                icon: const Icon(Icons.search, color: Colors.white),
              ),
              IconButton(
                tooltip: 'Call us',
                onPressed: () => openLink(context, Org.phoneTel),
                icon: const Icon(Icons.call_outlined, color: Colors.white),
              ),
              IconButton(
                tooltip: 'Menu',
                onPressed: () => pushScreen(context, const MoreScreen()),
                icon: const Icon(Icons.menu, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 26),
          const Eyebrow('501(c)(3) nonprofit · Temecula, CA', color: Brand.steelLight),
          const SizedBox(height: 10),
          Text(Org.tagline, style: t.displaySmall?.copyWith(color: Colors.white, fontSize: 34)),
          const SizedBox(height: 10),
          Text(
            'Free education, benefits guidance, and career support for active duty, veterans, military '
            'families, and the hometown heroes who keep our communities safe.',
            style: t.bodyLarge?.copyWith(color: Colors.white.withValues(alpha: 0.85), height: 1.45),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Brand.navy900),
                  onPressed: () => AppShell.selectTab(context, 1),
                  icon: const Icon(Icons.manage_search),
                  label: const Text('Find benefits'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(backgroundColor: Brand.red, foregroundColor: Colors.white),
                  onPressed: () => donate(context),
                  icon: const Icon(Icons.favorite),
                  label: const Text('Donate'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          if (stats.isNotEmpty)
            Row(
              children: [
                for (final s in stats)
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          s.value,
                          style: t.titleLarge?.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                        ),
                        Text(
                          s.label,
                          maxLines: 4,
                          style: t.labelSmall?.copyWith(color: Colors.white.withValues(alpha: 0.7)),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

/// Horizontal strip of the headline tools.
class _FeatureStrip extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final items = <(IconData, String, String, VoidCallback)>[
      (Icons.manage_search, 'Benefits Finder', '2,345 programs', () => AppShell.selectTab(context, 1)),
      (
        Icons.work_history_outlined,
        'Career Command Center',
        'Job search toolkit',
        () => pushScreen(context, const CareerCenterScreen()),
      ),
      (
        Icons.calculate_outlined,
        'VA Loan Calculators',
        'Payment, fee, BAH',
        () => openLink(context, 'app://calculators'),
      ),
      (
        Icons.co_present_outlined,
        'Free VA Webinar',
        'Reserve your seat',
        () => openLink(context, 'app://va-home-buying-webinar'),
      ),
      (Icons.group_add_outlined, 'Invite Friends', 'Share the seminar', () => pushScreen(context, const ReferScreen())),
    ];
    final scheme = Theme.of(context).colorScheme;
    return SizedBox(
      height: 104,
      child: ListView.separated(
        padding: pagePadding,
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, _) => const SizedBox(width: 10),
        itemBuilder: (context, i) {
          final (icon, title, sub, onTap) = items[i];
          return SizedBox(
            width: 170,
            child: Material(
              color: scheme.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(18),
              child: InkWell(
                borderRadius: BorderRadius.circular(18),
                onTap: onTap,
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Icon(icon, color: scheme.primary),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.titleSmall,
                          ),
                          Text(sub, style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _WebinarPromo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(height: 6, decoration: const BoxDecoration(gradient: Brand.redGradient)),
            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Eyebrow('Free VA home buying webinar'),
                  const SizedBox(height: 8),
                  Text('10 common mistakes VA homebuyers make.', style: t.headlineSmall),
                  const SizedBox(height: 8),
                  Text(
                    'Learn how to choose your rate, avoid lender overlays, and get sellers to help with your '
                    'costs, taught by a retired Navy Chief who is both a broker and a VA loan officer.',
                    style: t.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
                  ),
                  const SizedBox(height: 10),
                  for (final s in const [
                    'Three ways to get your VA loan approved',
                    'How to compare lenders and loan costs',
                    'What sellers can contribute for VA buyers',
                  ])
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        children: [
                          Icon(Icons.check_circle, size: 18, color: scheme.secondary),
                          const SizedBox(width: 8),
                          Expanded(child: Text(s, style: t.bodyMedium)),
                        ],
                      ),
                    ),
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      FilledButton(
                        onPressed: () => openLink(context, 'app://va-home-buying-webinar'),
                        child: const Text('Reserve my seat'),
                      ),
                      OutlinedButton(
                        onPressed: () => openLink(context, 'app://calculators'),
                        child: const Text('VA loan calculators'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
