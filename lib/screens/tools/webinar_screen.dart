import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:material_ui/material_ui.dart';

import '../../app/routes.dart';
import '../../data/site_content.dart';
import '../../ui/apple.dart';
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
      title: 'Register',
      fields: page.form?.fields ?? const [],
      intro: "Free, live, about 90 minutes online. If you can't attend, register anyway to get the slides.",
      webPath: slug,
      submitLabel: 'Register',
    ),
    title: 'Webinar',
  );

  @override
  Widget build(BuildContext context) {
    final page = SiteContent.instance[slug]!;
    final t = context.t;
    final c = context.c;
    // Website's live date line, e.g. "Thursday, January 21, 2027 | 7:00 PM CT | 90 MINS".
    final when = page.blocks
        .whereType<TextBlock>()
        .map((b) => b.text)
        .firstWhere((s) => s.contains('MINS') || RegExp(r'\b20\d\d\b.*\|').hasMatch(s), orElse: () => '');
    final start = page.blocks.indexWhere((b) => b is HeadingBlock && b.text.startsWith('In This Webinar'));
    final body = [
      for (final b in page.blocks.skip(start < 0 ? 0 : start))
        if (b is! FormBlock &&
            !(b is HeadingBlock && b.text.startsWith('Join Steven')) &&
            !(b is TextBlock && const {'Previous', 'Next', 'Register For Live Webinar'}.contains(b.text)))
          b,
    ];
    return LargeTitleScaffold(
      title: 'VA Webinar',
      bottomBar: DecoratedBox(
        decoration: BoxDecoration(
          color: c.bg.withValues(alpha: 0.94),
          border: Border(top: BorderSide(color: c.separator, width: 0.5)),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 10, kGutter, 10),
            child: AppleButton(
              kind: ButtonStyleKind.red,
              icon: CupertinoIcons.calendar_badge_plus,
              label: 'Register for Live Webinar',
              onPressed: () => _register(context, page),
            ),
          ),
        ),
      ),
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 0, kGutter, 6),
            child: AppleCard(
              gradient: Gradients.navy,
              radius: 26,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Caption('Free Online Webinar', color: Color(0xFFB9C7DA)),
                  const SizedBox(height: 8),
                  Text(
                    '10 Common Mistakes Military VA Homebuyers Make & How to Avoid Them',
                    style: t.headlineMedium?.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: 14),
                  if (when.isNotEmpty)
                    Row(
                      children: [
                        const Icon(CupertinoIcons.calendar, color: Colors.white70, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            when.replaceAll(' | ', ' · '),
                            style: t.bodyMedium?.copyWith(color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(CupertinoIcons.person_crop_circle, color: Colors.white70, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Steven Shearrill, retired U.S. Navy Chief, Broker & VA Loan Officer',
                          style: t.bodyMedium?.copyWith(color: Colors.white),
                        ),
                      ),
                    ],
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
          child: InsetSection(
            children: [
              AppleRow(
                icon: CupertinoIcons.person_badge_plus_fill,
                iconColor: Hue.blue,
                title: 'Pay It Forward',
                onTap: () => pushScreen(context, const ReferScreen(), title: 'Webinar'),
              ),
            ],
          ),
        ),
        const SliverToBoxAdapter(child: OrgFooter()),
      ],
    );
  }
}
