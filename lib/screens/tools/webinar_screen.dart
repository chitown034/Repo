import 'package:material_ui/material_ui.dart';

import '../../app/routes.dart';
import '../../app/theme.dart';
import '../../data/site_content.dart';
import '../../widgets/block_list.dart';
import '../../widgets/common.dart';
import '../forms/site_form_screen.dart';
import '../more/refer_screen.dart';

/// Free VA Home Buying Webinar: details, host, FAQs, and registration.
class WebinarScreen extends StatelessWidget {
  const WebinarScreen({super.key});

  static const slug = 'va-home-buying-webinar';

  void _register(BuildContext context, SitePage page) => pushScreen(
    context,
    SiteFormScreen(
      title: 'Register for the VA Home Buying Webinar',
      fields: page.form?.fields ?? const [],
      intro: "Free, live, about 90 minutes online. If you can't attend, register anyway to get the slides.",
      webPath: slug,
      submitLabel: 'Register',
    ),
  );

  @override
  Widget build(BuildContext context) {
    final page = SiteContent.instance[slug]!;
    final t = Theme.of(context).textTheme;
    // The website's first headings repeat the hero; start at "In This Webinar".
    final start = page.blocks.indexWhere((b) => b is HeadingBlock && b.text.startsWith('In This Webinar'));
    final body = [
      for (final b in page.blocks.skip(start < 0 ? 0 : start))
        if (b is! FormBlock &&
            !(b is HeadingBlock && b.text.startsWith('Join Steven')) &&
            !(b is TextBlock && (b.text == 'Previous' || b.text == 'Next' || b.text == 'Register For Live Webinar')))
          b,
    ];
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 300,
            backgroundColor: Brand.navy900,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: Brand.heroGradient),
                padding: EdgeInsets.fromLTRB(20, MediaQuery.paddingOf(context).top + 60, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const Eyebrow('Free online webinar', color: Brand.steelLight),
                    const SizedBox(height: 8),
                    Text(
                      '10 Common Mistakes Military VA Homebuyers Make & How to Avoid Them',
                      style: t.headlineSmall?.copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Hosted by Steven Shearrill, retired U.S. Navy Chief, Broker & VA Loan Officer',
                      style: t.bodyMedium?.copyWith(color: Colors.white70),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: BlockList(page: page, blocks: body),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: OutlinedButton.icon(
                onPressed: () => pushScreen(context, const ReferScreen()),
                icon: const Icon(Icons.group_add_outlined),
                label: const Text('Invite friends to the seminar'),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: OrgFooter()),
          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
          child: FilledButton.icon(
            style: FilledButton.styleFrom(backgroundColor: Brand.red, foregroundColor: Colors.white),
            onPressed: () => _register(context, page),
            icon: const Icon(Icons.event_available),
            label: const Text('Register for live webinar'),
          ),
        ),
      ),
    );
  }
}
