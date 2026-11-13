import 'package:material_ui/material_ui.dart';

import '../../app/theme.dart';
import '../../data/site_content.dart';
import '../../services/links.dart';
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
    final t = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final items = parseTestimonials(SiteContent.instance['testimonials']!);
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const SliverAppBar.large(title: Text('Testimonials')),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: Text(
                'Hear from military families we have helped become homeowners.',
                style: t.bodyLarge?.copyWith(color: scheme.onSurfaceVariant),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverList.separated(
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, i) {
                final x = items[i];
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            for (var s = 0; s < 5; s++) const Icon(Icons.star_rounded, color: Brand.gold, size: 20),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text('“${x.quote.join(' ')}”', style: t.bodyLarge?.copyWith(height: 1.5)),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 16,
                              backgroundColor: scheme.primary.withValues(alpha: 0.12),
                              child: Text(x.name.characters.first, style: TextStyle(color: scheme.primary)),
                            ),
                            const SizedBox(width: 10),
                            Expanded(child: Text(x.name, style: t.titleSmall)),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: FilledButton(
                onPressed: () => openLink(context, 'app://va-home-buying-webinar'),
                child: const Text('Join the free VA home buying webinar'),
              ),
            ),
          ),
          const SliverToBoxAdapter(child: OrgFooter()),
        ],
      ),
    );
  }
}
