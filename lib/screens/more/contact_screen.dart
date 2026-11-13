import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:material_ui/material_ui.dart';

import '../../app/org.dart';
import '../../app/routes.dart';
import '../../data/site_content.dart';
import '../../services/links.dart';
import '../../ui/apple.dart';
import '../../widgets/common.dart';
import '../forms/site_form_screen.dart';
import 'more_screen.dart';
import 'refer_screen.dart';

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key, this.isTab = false});

  /// As the last bottom tab it also links to About, Get involved, and Settings.
  final bool isTab;

  @override
  Widget build(BuildContext context) {
    final fields = SiteContent.instance['contact-us']?.form?.fields ?? const [];
    void message() => pushScreen(
      context,
      SiteFormScreen(title: 'New Message', fields: fields, webPath: 'contact-us'),
      title: 'Contact',
    );
    return LargeTitleScaffold(
      title: 'Contact',
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 22),
            child: Column(
              children: [
                const SizedBox(height: 4),
                Image.asset('assets/images/logo_shield.png', height: 132, fit: BoxFit.contain),
                const SizedBox(height: 12),
                Text('Active Duty Veteran & Hometown Hero', textAlign: TextAlign.center, style: context.t.titleLarge),
                const SizedBox(height: 4),
                Text(
                  'Questions about VA home buying, benefits, or careers? We’re glad to help, free and with no obligation.',
                  textAlign: TextAlign.center,
                  style: context.t.bodyMedium?.copyWith(color: context.c.secondaryLabel),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    CircleAction(
                      icon: CupertinoIcons.phone_fill,
                      label: 'call',
                      onTap: () => openLink(context, Org.phoneTel),
                    ),
                    const SizedBox(width: 8),
                    CircleAction(icon: CupertinoIcons.chat_bubble_fill, label: 'message', onTap: message),
                    const SizedBox(width: 8),
                    CircleAction(
                      icon: CupertinoIcons.envelope_fill,
                      label: 'mail',
                      onTap: () => openLink(context, 'mailto:${Org.email}'),
                    ),
                    const SizedBox(width: 8),
                    CircleAction(
                      icon: CupertinoIcons.globe,
                      label: 'website',
                      onTap: () => openLink(context, Org.website),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            dividerIndent: 16,
            children: [
              _InfoRow(label: 'phone', value: Org.phoneDisplay, onTap: () => openLink(context, Org.phoneTel)),
              _InfoRow(label: 'email', value: Org.email, onTap: () => openLink(context, 'mailto:${Org.email}')),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 22),
            child: AppleButton(icon: CupertinoIcons.square_pencil, label: 'Send Us a Message', onPressed: message),
          ),
        ),
        SliverToBoxAdapter(
          child: InsetSection(
            header: 'Follow Us',
            children: [
              for (final (icon, color, name, url) in const [
                (CupertinoIcons.person_2_fill, Color(0xFF1877F2), 'Facebook', Org.facebookUrl),
                (CupertinoIcons.camera_fill, Color(0xFFE1306C), 'Instagram', Org.instagramUrl),
                (CupertinoIcons.play_rectangle_fill, Color(0xFFFF0000), 'YouTube', Org.youtubeUrl),
                (CupertinoIcons.globe, Hue.blue, 'Website', Org.website),
              ])
                AppleRow(
                  icon: icon,
                  iconColor: color,
                  title: name,
                  accessory: RowAccessory.external,
                  onTap: () => openLink(context, url),
                ),
            ],
          ),
        ),
        if (isTab) ...[
          SliverToBoxAdapter(
            child: InsetSection(
              header: 'About Us',
              children: [
                for (final (icon, color, title, target) in const [
                  (CupertinoIcons.info_circle_fill, Hue.navy, 'About Us', 'app://about-us'),
                  (CupertinoIcons.person_3_fill, Hue.teal, 'Board Members', 'app://board-members'),
                  (CupertinoIcons.quote_bubble_fill, Hue.orange, 'Testimonials', 'app://testimonials'),
                ])
                  AppleRow(icon: icon, iconColor: color, title: title, onTap: () => openLink(context, target)),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: InsetSection(
              children: [
                AppleRow(
                  icon: CupertinoIcons.heart_fill,
                  iconColor: Hue.red,
                  title: 'Donate',
                  accessory: RowAccessory.external,
                  onTap: () => donate(context),
                ),
                AppleRow(
                  icon: CupertinoIcons.person_badge_plus_fill,
                  iconColor: Hue.blue,
                  title: 'Invite Friends',
                  onTap: () => pushScreen(context, const ReferScreen(), title: 'Contact'),
                ),
                AppleRow(
                  icon: CupertinoIcons.ellipsis,
                  iconColor: Hue.gray,
                  title: 'More & Settings',
                  onTap: () => pushScreen(context, const MoreScreen(), title: 'Contact'),
                ),
              ],
            ),
          ),
        ],
        const SliverToBoxAdapter(child: CrisisCard(compact: true)),
        const SliverToBoxAdapter(child: OrgFooter()),
      ],
    );
  }
}

/// Contacts-app style "label / value" row.
class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value, required this.onTap});
  final String label;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
    color: Colors.transparent,
    child: InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: context.t.bodySmall?.copyWith(color: context.c.label)),
            const SizedBox(height: 2),
            Text(value, style: context.t.bodyLarge?.copyWith(color: context.c.tint)),
          ],
        ),
      ),
    ),
  );
}
