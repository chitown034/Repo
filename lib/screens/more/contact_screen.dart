import 'package:material_ui/material_ui.dart';

import '../../app/org.dart';
import '../../app/routes.dart';
import '../../data/site_content.dart';
import '../../services/links.dart';
import '../../widgets/common.dart';
import '../forms/site_form_screen.dart';
import 'more_screen.dart';

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key, this.isTab = false});

  /// As the last bottom tab it also links to About, Get involved, and Settings.
  final bool isTab;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final fields = SiteContent.instance['contact-us']?.form?.fields ?? const [];
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const SliverAppBar.large(title: Text('Contact Us')),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: Text(
                'Questions about VA home buying, benefits, or careers? We are glad to help, free and with no obligation.',
                style: t.bodyLarge,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: TileGroup(
              children: [
                ListTile(
                  leading: const Icon(Icons.call_outlined),
                  title: const Text('Call'),
                  subtitle: const Text(Org.phoneDisplay),
                  onTap: () => openLink(context, Org.phoneTel),
                ),
                ListTile(
                  leading: const Icon(Icons.mail_outline),
                  title: const Text('Email'),
                  subtitle: const Text(Org.email),
                  onTap: () => openLink(context, 'mailto:${Org.email}'),
                ),
                ListTile(
                  leading: const Icon(Icons.place_outlined),
                  title: const Text('Mailing address'),
                  subtitle: const Text(Org.address),
                  onTap: () => openLink(context, 'https://maps.google.com/?q=${Uri.encodeComponent(Org.address)}'),
                ),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: FilledButton.icon(
                onPressed: () =>
                    pushScreen(context, SiteFormScreen(title: 'Contact Us', fields: fields, webPath: 'contact-us')),
                icon: const Icon(Icons.edit_outlined),
                label: const Text('Send us a message'),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SectionHeader(title: 'Follow us')),
          SliverToBoxAdapter(
            child: TileGroup(
              children: [
                for (final (icon, name, url) in const [
                  (Icons.facebook, 'Facebook', Org.facebookUrl),
                  (Icons.camera_alt_outlined, 'Instagram', Org.instagramUrl),
                  (Icons.smart_display_outlined, 'YouTube', Org.youtubeUrl),
                  (Icons.language, 'Website', Org.website),
                ])
                  ListTile(
                    leading: Icon(icon),
                    title: Text(name),
                    trailing: const Icon(Icons.open_in_new, size: 18),
                    onTap: () => openLink(context, url),
                  ),
              ],
            ),
          ),
          if (isTab) ...[
            const SliverToBoxAdapter(child: SectionHeader(title: 'About us & more')),
            SliverToBoxAdapter(
              child: TileGroup(
                children: [
                  for (final (icon, title, target) in const [
                    (Icons.info_outline, 'About us', 'app://about-us'),
                    (Icons.groups_2_outlined, 'Board members', 'app://board-members'),
                    (Icons.format_quote_outlined, 'Testimonials', 'app://testimonials'),
                  ])
                    ListTile(
                      leading: Icon(icon),
                      title: Text(title),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => openLink(context, target),
                    ),
                  ListTile(
                    leading: const Icon(Icons.more_horiz),
                    title: const Text('Donate, invite friends & settings'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => pushScreen(context, const MoreScreen()),
                  ),
                ],
              ),
            ),
          ],
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
          const SliverToBoxAdapter(child: CrisisBanner(compact: true)),
          const SliverToBoxAdapter(child: OrgFooter()),
        ],
      ),
    );
  }
}
