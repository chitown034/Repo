import 'package:material_ui/material_ui.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../app/org.dart';
import '../../app/routes.dart';
import '../../app/theme.dart';
import '../../data/prefs.dart';
import '../../services/links.dart';
import '../../widgets/common.dart';
import '../search_screen.dart';
import 'refer_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    ListTile nav(IconData icon, String title, String target, {String? sub}) => ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: sub == null ? null : Text(sub),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => openLink(context, target),
    );
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const SliverAppBar.large(title: Text('More')),
          SliverToBoxAdapter(
            child: Padding(
              padding: pagePadding,
              child: Container(
                decoration: BoxDecoration(gradient: Brand.heroGradient, borderRadius: BorderRadius.circular(22)),
                padding: const EdgeInsets.all(18),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.asset('assets/images/logo_full.jpg', width: 76, height: 76, fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(Org.shortName, style: t.titleMedium?.copyWith(color: Colors.white)),
                          const SizedBox(height: 4),
                          Text(
                            'Homeowners Club, Inc. · 501(c)(3)',
                            style: t.bodySmall?.copyWith(color: Colors.white70),
                          ),
                          Text('EIN ${Org.ein} · Temecula, CA', style: t.bodySmall?.copyWith(color: Colors.white70)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SectionHeader(title: 'Get involved')),
          SliverToBoxAdapter(
            child: TileGroup(
              children: [
                ListTile(
                  leading: const Icon(Icons.group_add_outlined),
                  title: const Text('Invite friends to the VA seminar'),
                  subtitle: const Text('Text a personal invite to people you know'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => pushScreen(context, const ReferScreen()),
                ),
                ListTile(
                  leading: const Icon(Icons.volunteer_activism_outlined, color: Brand.red),
                  title: const Text('Donate'),
                  subtitle: const Text('Tax-deductible as allowed by law · PayPal'),
                  trailing: const Icon(Icons.open_in_new, size: 18),
                  onTap: () => donate(context),
                ),
                nav(Icons.favorite_border, 'Support local charities', 'app://support-local-charities'),
                nav(Icons.handshake_outlined, 'Affiliates', 'app://affiliates'),
              ],
            ),
          ),
          const SliverToBoxAdapter(child: SectionHeader(title: 'About us')),
          SliverToBoxAdapter(
            child: TileGroup(
              children: [
                nav(Icons.info_outline, 'About us', 'app://about-us'),
                nav(Icons.groups_2_outlined, 'Board members', 'app://board-members'),
                nav(Icons.format_quote_outlined, 'Testimonials', 'app://testimonials'),
                nav(Icons.verified_outlined, 'Verify our 501(c)(3) on Candid', Org.candidUrl),
              ],
            ),
          ),
          const SliverToBoxAdapter(child: SectionHeader(title: 'Help')),
          SliverToBoxAdapter(
            child: TileGroup(
              children: [
                nav(Icons.mail_outline, 'Contact us', 'app://contact-us', sub: Org.phoneDisplay),
                ListTile(
                  leading: const Icon(Icons.bookmarks_outlined),
                  title: const Text('Saved resources'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => pushScreen(context, const SearchScreen(showSaved: true)),
                ),
                ListTile(
                  leading: const Icon(Icons.support_agent, color: Brand.red),
                  title: const Text('Veterans Crisis Line'),
                  subtitle: const Text('Dial 988 then press 1 · 24/7'),
                  onTap: () => openLink(context, Org.crisisTel),
                ),
                ListTile(
                  leading: const Icon(Icons.house_outlined),
                  title: const Text('Homeless veteran hotline'),
                  subtitle: const Text('${Org.homelessHotlineDisplay} · 24/7'),
                  onTap: () => openLink(context, Org.homelessHotlineTel),
                ),
              ],
            ),
          ),
          const SliverToBoxAdapter(child: SectionHeader(title: 'Settings')),
          SliverToBoxAdapter(
            child: Padding(
              padding: pagePadding,
              child: ListenableBuilder(
                listenable: Prefs.instance,
                builder: (context, _) => SegmentedButton<ThemeMode>(
                  segments: const [
                    ButtonSegment(value: ThemeMode.system, label: Text('Auto'), icon: Icon(Icons.brightness_auto)),
                    ButtonSegment(value: ThemeMode.light, label: Text('Light'), icon: Icon(Icons.light_mode)),
                    ButtonSegment(value: ThemeMode.dark, label: Text('Dark'), icon: Icon(Icons.dark_mode)),
                  ],
                  selected: {Prefs.instance.themeMode},
                  onSelectionChanged: (s) => Prefs.instance.setThemeMode(s.first),
                ),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 12)),
          SliverToBoxAdapter(
            child: TileGroup(
              children: [
                nav(Icons.gavel_outlined, 'Terms & conditions', 'app://terms-and-conditions'),
                const ListTile(
                  leading: Icon(Icons.lock_outline),
                  title: Text('Privacy'),
                  subtitle: Text(
                    'Saved items, your state, and Career Command Center data stay on this device. '
                    'Contacts are only read when you invite friends and are never uploaded.',
                  ),
                ),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: FutureBuilder<PackageInfo>(
              future: PackageInfo.fromPlatform(),
              builder: (context, s) => Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Center(
                  child: Text(
                    s.hasData ? 'Version ${s.data!.version} (${s.data!.buildNumber})' : '',
                    style: t.bodySmall,
                  ),
                ),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: OrgFooter()),
        ],
      ),
    );
  }
}
