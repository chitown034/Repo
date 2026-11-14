import 'package:cupertino_ui/cupertino_ui.dart';

import '../../data/site_content.dart';
import '../../services/links.dart';
import '../../ui/apple.dart';
import '../../widgets/common.dart';

class Testimonial {
  Testimonial(this.name);
  final String name;
  final List<String> quote = [];
}

/// Groups the website's testimonial headings/paragraphs into name + quote.
List<Testimonial> parseTestimonials(SitePage page) {
  bool isName(String s) =>
      s.split(' ').length <= 5 && !s.contains(RegExp(r'[.!?,]')) && !s.toLowerCase().contains('star');
  final out = <Testimonial>[];
  for (final b in page.blocks) {
    final text = switch (b) {
      HeadingBlock(:final text) => text,
      TextBlock(:final text) => text,
      _ => null,
    };
    if (text == null) continue;
    if (b is HeadingBlock && isName(text)) {
      out.add(Testimonial(text));
    } else if (out.isNotEmpty) {
      out.last.quote.add(text);
    }
  }
  return out;
}

class TestimonialsScreen extends StatelessWidget {
  const TestimonialsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = parseTestimonials(SiteContent.instance['testimonials']!);
    final c = context.c;
    return LargeTitleScaffold(
      title: 'Testimonials',
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter + 4, 0, kGutter, 16),
            child: Text(
              'Military families we helped become homeowners.',
              style: context.t.bodyLarge?.copyWith(color: c.secondaryLabel),
            ),
          ),
        ),
        SliverPadding(
          padding: kPage,
          sliver: SliverList.separated(
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, i) {
              final x = items[i];
              return AppleCard(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        for (var s = 0; s < 5; s++)
                          const Icon(CupertinoIcons.star_fill, color: Color(0xFFFF9F0A), size: 15),
                        const Spacer(),
                        Icon(CupertinoIcons.quote_bubble_fill, color: c.tertiaryLabel, size: 20),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(x.quote.join(' '), style: context.t.bodyLarge?.copyWith(height: 1.45)),
                    const SizedBox(height: 12),
                    Text('— ${x.name}', style: context.t.titleSmall?.copyWith(color: c.secondaryLabel)),
                  ],
                ),
              );
            },
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(kGutter, 22, kGutter, 0),
            child: AppleButton(
              label: 'Join the Free VA Webinar',
              onPressed: () => openLink(context, 'app://va-home-buying-webinar'),
            ),
          ),
        ),
        const SliverToBoxAdapter(child: OrgFooter()),
      ],
    );
  }
}
