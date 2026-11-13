import 'package:material_ui/material_ui.dart';

import '../../app/routes.dart';
import '../../app/theme.dart';
import '../../services/links.dart';
import '../../widgets/common.dart';
import '../more/refer_screen.dart';
import '../shell.dart';
import 'calculators_screen.dart';
import 'career_center_screen.dart';
import 'webinar_screen.dart';

class ToolsScreen extends StatelessWidget {
  const ToolsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    Widget tile(IconData icon, String title, String sub, Color color, VoidCallback onTap) =>
        ActionCard(icon: icon, title: title, subtitle: sub, color: color, onTap: onTap);
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const SliverAppBar.large(title: Text('Tools')),
          const SliverToBoxAdapter(
            child: SectionHeader(
              eyebrow: 'Home buying',
              title: 'VA loan calculators',
              subtitle: 'Estimates in seconds. No sign-up, nothing saved.',
            ),
          ),
          SliverToBoxAdapter(
            child: ResponsiveGrid(
              children: [
                tile(
                  Icons.home_outlined,
                  'VA loan payment',
                  'PITI + HOA with the funding fee financed',
                  Brand.blue,
                  () => pushScreen(context, const CalculatorsScreen(initial: 0)),
                ),
                tile(
                  Icons.percent,
                  'VA funding fee',
                  'Purchase, cash-out, and IRRRL rates',
                  Brand.red,
                  () => pushScreen(context, const CalculatorsScreen(initial: 1)),
                ),
                tile(
                  Icons.account_balance_wallet_outlined,
                  'Buying power with BAH',
                  '41% DTI guideline estimate',
                  const Color(0xFF2E6B5A),
                  () => pushScreen(context, const CalculatorsScreen(initial: 2)),
                ),
                tile(
                  Icons.calculate_outlined,
                  'Combined VA rating',
                  'VA math for multiple ratings',
                  const Color(0xFF5B4B8A),
                  () => pushScreen(context, const CalculatorsScreen(initial: 3)),
                ),
              ],
            ),
          ),
          const SliverToBoxAdapter(
            child: SectionHeader(eyebrow: 'Careers & benefits', title: 'Power tools'),
          ),
          SliverToBoxAdapter(
            child: ResponsiveGrid(
              children: [
                tile(
                  Icons.work_history_outlined,
                  'Career Command Center',
                  'Search boards, track applications, practice interviews',
                  const Color(0xFF8A3A42),
                  () => pushScreen(context, const CareerCenterScreen()),
                ),
                tile(
                  Icons.manage_search,
                  'Benefits Finder',
                  '2,345 benefits across 52 jurisdictions',
                  Brand.blue,
                  () => AppShell.selectTab(context, 1),
                ),
                tile(
                  Icons.co_present_outlined,
                  'Free VA webinar',
                  '10 common mistakes VA homebuyers make',
                  const Color(0xFF9A6B12),
                  () => pushScreen(context, const WebinarScreen()),
                ),
                tile(
                  Icons.group_add_outlined,
                  'Invite friends',
                  'Text the free VA seminar to people you know',
                  const Color(0xFF2F5D8A),
                  () => pushScreen(context, const ReferScreen()),
                ),
              ],
            ),
          ),
          const SliverToBoxAdapter(
            child: SectionHeader(eyebrow: 'Requests', title: 'Get personal help'),
          ),
          SliverToBoxAdapter(
            child: TileGroup(
              children: [
                for (final (icon, title, slug) in const [
                  (
                    Icons.local_shipping_outlined,
                    'Nationwide relocation assistance',
                    'nationwide-relocation-assistance',
                  ),
                  (Icons.wb_sunny_outlined, 'Relocating to San Diego / Temecula', 'relocating-to-southern-california'),
                  (Icons.volunteer_activism_outlined, 'Scholarship assistance', 'scholarship-assistance'),
                  (Icons.quiz_outlined, 'Job questionnaire', 'job-questionnaire'),
                  (Icons.mail_outline, 'Contact us', 'contact-us'),
                ])
                  ListTile(
                    leading: Icon(icon),
                    title: Text(title),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => openLink(context, 'app://$slug'),
                  ),
              ],
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),
    );
  }
}
