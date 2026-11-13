import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:material_ui/material_ui.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../app/org.dart';
import '../../app/routes.dart';
import '../../data/prefs.dart';
import '../../services/links.dart';
import '../../ui/apple.dart';
import '../../widgets/common.dart';
import '../search_screen.dart';
import 'refer_screen.dart';

/// Settings-style menu: get involved, about, help, appearance, legal.
class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    AppleRow nav(IconData icon, Color color, String title, String target, {String? sub}) => AppleRow(
      icon: icon,
      iconColor: color,
      title: title,
      subtitle: sub,
      accessory: target.startsWith('app://') ? RowAccessory.chevron : RowAccessory.external,
      onTap: () => openLink(context, target),
    );
    return LargeTitleScaffold(
      title: 'More',
      slivers: [
        SliverToBoxAdapter(
          child: InsetSection(
            children: [
              AppleRow(
                leading: ClipOval(
                  child: Image.asset('assets/images/logo_full.jpg', width: 58, height: 58, fit: BoxFit.cover),
                ),
                title: 'Active Duty Veteran & Hometown Hero',
                subtitle: '501(c)(3) Nonprofit · Temecula, CA',
                onTap: () => openLink(context, 'app://about-us'),
              ),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            header: 'Get Involved',
            children: [
              AppleRow(
                icon: CupertinoIcons.person_badge_plus_fill,
                iconColor: Hue.blue,
                title: 'Invite Friends to the VA Seminar',
                onTap: () => pushScreen(context, const ReferScreen(), title: 'More'),
              ),
              AppleRow(
                icon: CupertinoIcons.heart_fill,
                iconColor: Hue.red,
                title: 'Donate',
                subtitle: 'Tax-deductible as allowed by law',
                accessory: RowAccessory.external,
                onTap: () => donate(context),
              ),
              nav(CupertinoIcons.gift_fill, Hue.pink, 'Support Local Charities', 'app://support-local-charities'),
              nav(CupertinoIcons.hand_raised_fill, Hue.orange, 'Affiliates', 'app://affiliates'),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            header: 'About',
            children: [
              nav(CupertinoIcons.info_circle_fill, Hue.navy, 'About Us', 'app://about-us'),
              nav(CupertinoIcons.person_3_fill, Hue.teal, 'Board Members', 'app://board-members'),
              nav(CupertinoIcons.quote_bubble_fill, Hue.orange, 'Testimonials', 'app://testimonials'),
              nav(CupertinoIcons.checkmark_seal_fill, Hue.green, 'Verify Our 501(c)(3)', Org.candidUrl),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            header: 'Help',
            children: [
              nav(CupertinoIcons.chat_bubble_2_fill, Hue.blue, 'Contact Us', 'app://contact-us', sub: Org.phoneDisplay),
              AppleRow(
                icon: CupertinoIcons.bookmark_fill,
                iconColor: Hue.indigo,
                title: 'Saved Resources',
                onTap: () => pushScreen(context, const SearchScreen(showSaved: true), title: 'More'),
              ),
              AppleRow(
                icon: CupertinoIcons.heart_circle_fill,
                iconColor: Hue.red,
                title: 'Veterans Crisis Line',
                subtitle: 'Dial 988 then press 1 · 24/7',
                accessory: RowAccessory.none,
                onTap: () => openLink(context, Org.crisisTel),
              ),
              AppleRow(
                icon: CupertinoIcons.house_fill,
                iconColor: Hue.orange,
                title: 'Homeless Veteran Hotline',
                subtitle: '${Org.homelessHotlineDisplay} · 24/7',
                accessory: RowAccessory.none,
                onTap: () => openLink(context, Org.homelessHotlineTel),
              ),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            header: 'Appearance',
            dividerIndent: 16,
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: ListenableBuilder(
                  listenable: Prefs.instance,
                  builder: (context, _) => AppleSegmented<ThemeMode>(
                    value: Prefs.instance.themeMode,
                    segments: const {ThemeMode.system: 'Automatic', ThemeMode.light: 'Light', ThemeMode.dark: 'Dark'},
                    onChanged: Prefs.instance.setThemeMode,
                  ),
                ),
              ),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            header: 'Legal',
            footer:
                'Saved items, your state, and Career Command Center data stay on this device. Contacts are only read '
                'when you invite friends and are never uploaded.',
            children: [
              nav(CupertinoIcons.doc_text_fill, Hue.gray, 'Terms & Conditions', 'app://terms-and-conditions'),
              const AppleRow(
                icon: CupertinoIcons.lock_shield_fill,
                iconColor: Hue.blue,
                title: 'Privacy',
                value: 'On Device',
                accessory: RowAccessory.none,
              ),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: FutureBuilder<PackageInfo>(
            future: PackageInfo.fromPlatform(),
            builder: (context, s) => Text(
              s.hasData ? 'Version ${s.data!.version} (${s.data!.buildNumber})' : '',
              textAlign: TextAlign.center,
              style: context.t.bodySmall?.copyWith(color: context.c.secondaryLabel),
            ),
          ),
        ),
        const SliverToBoxAdapter(child: OrgFooter()),
      ],
    );
  }
}
