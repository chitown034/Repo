import 'package:cupertino_ui/cupertino_ui.dart';

import '../../app/routes.dart';
import '../../services/links.dart';
import '../../ui/apple.dart';
import '../../widgets/common.dart';
import '../more/refer_screen.dart';
import '../shell.dart';
import 'calculators_screen.dart';
import 'career_center_screen.dart';
import 'webinar_screen.dart';

class ToolsScreen extends StatelessWidget {
  const ToolsScreen({super.key});

  @override
  Widget build(BuildContext context) => LargeTitleScaffold(
    title: 'Tools',
    slivers: [
      const SliverToBoxAdapter(
        child: SectionTitle(
          'VA Loan Calculators',
          subtitle: 'Estimates in seconds. No sign-up, nothing saved.',
          top: 4,
        ),
      ),
      SliverToBoxAdapter(
        child: TileGrid(
          children: [
            for (final (i, icon, color, title, sub) in const [
              (0, CupertinoIcons.house_fill, Hue.navy, 'Loan Payment', 'PITI + HOA with the funding fee financed'),
              (1, CupertinoIcons.percent, Hue.red, 'Funding Fee', 'Purchase, cash-out, and IRRRL rates'),
              (2, CupertinoIcons.money_dollar_circle_fill, Hue.green, 'BAH Buying Power', '41% DTI guideline estimate'),
              (
                3,
                CupertinoIcons.checkmark_shield_fill,
                Hue.indigo,
                'Combined VA Rating',
                'VA math for several ratings',
              ),
            ])
              FeatureTile(
                icon: icon,
                color: color,
                title: title,
                subtitle: sub,
                onTap: () => pushScreen(context, CalculatorsScreen(initial: i), title: 'Tools'),
              ),
          ],
        ),
      ),
      const SliverToBoxAdapter(child: SectionTitle('Careers & Benefits')),
      SliverToBoxAdapter(
        child: InsetSection(
          children: [
            AppleRow(
              icon: CupertinoIcons.briefcase_fill,
              iconColor: Hue.brown,
              title: 'Career Command Center',
              subtitle: 'Search job boards, track applications, practice interviews',
              onTap: () => pushScreen(context, const CareerCenterScreen(), title: 'Tools'),
            ),
            AppleRow(
              icon: CupertinoIcons.checkmark_shield_fill,
              iconColor: Hue.navy,
              title: 'Benefits Finder',
              subtitle: '2,345 benefits across 52 jurisdictions',
              onTap: () => AppShell.selectTab(context, 1),
            ),
            AppleRow(
              icon: CupertinoIcons.videocam_fill,
              iconColor: Hue.red,
              title: 'Free VA Home Buying Webinar',
              subtitle: '10 common mistakes VA homebuyers make',
              onTap: () => pushScreen(context, const WebinarScreen(), title: 'Tools'),
            ),
            AppleRow(
              icon: CupertinoIcons.person_badge_plus_fill,
              iconColor: Hue.blue,
              title: 'Invite Friends',
              subtitle: 'Text the free VA seminar to people you know',
              onTap: () => pushScreen(context, const ReferScreen(), title: 'Tools'),
            ),
          ],
        ),
      ),
      SliverToBoxAdapter(
        child: InsetSection(
          header: 'Get Personal Help',
          children: [
            for (final (icon, color, title, slug) in const [
              (CupertinoIcons.car_detailed, Hue.orange, 'Nationwide Relocation', 'nationwide-relocation-assistance'),
              (
                CupertinoIcons.sun_max_fill,
                Hue.yellow,
                'Relocating to San Diego / Temecula',
                'relocating-to-southern-california',
              ),
              (CupertinoIcons.rosette, Hue.indigo, 'Scholarship Assistance', 'scholarship-assistance'),
              (CupertinoIcons.square_list_fill, Hue.teal, 'Job Questionnaire', 'job-questionnaire'),
            ])
              AppleRow(icon: icon, iconColor: color, title: title, onTap: () => openLink(context, 'app://$slug')),
          ],
        ),
      ),
      const SliverToBoxAdapter(child: OrgFooter()),
    ],
  );
}
