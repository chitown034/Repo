import 'package:cupertino_ui/cupertino_ui.dart';

import '../ui/apple.dart';

import '../app/org.dart';

class CatalogEntry {
  const CatalogEntry(this.slug, this.title, this.icon, [this.blurb = '', this.url]);
  final String slug;
  final String title;
  final IconData icon;
  final String blurb;

  /// External link instead of a website page.
  final String? url;

  String get target => url ?? 'app://$slug';
}

class CatalogGroup {
  const CatalogGroup(this.title, this.subtitle, this.icon, this.color, this.entries);
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final List<CatalogEntry> entries;
}

/// Every resource page from the website, organized for the app.
const catalog = <CatalogGroup>[
  CatalogGroup(
    'Benefits & Support',
    'Claims, health, housing, discounts',
    CupertinoIcons.checkmark_shield_fill,
    Hue.navy,
    [
      CatalogEntry(
        'veteran-resources',
        'Veteran Resources',
        CupertinoIcons.checkmark_shield_fill,
        'Disability claims, mental health, service animals, travel, discounts, and dozens of vetted programs.',
      ),
      CatalogEntry(
        'housing-and-utility-help',
        'Housing & Utility Help',
        CupertinoIcons.house_fill,
        'HUD-VASH, SSVF, foreclosure help, LIHEAP, utility discounts, and emergency grants.',
      ),
      CatalogEntry('va-disability-claims-assistance', 'VA Disability Claims', CupertinoIcons.doc_text_fill),
      CatalogEntry(
        'veteran-and-disabled-veteran-benefits-by-state',
        'Benefits by State',
        CupertinoIcons.map_fill,
        'Property tax exemptions, tuition waivers, license plates, and more.',
      ),
      CatalogEntry('veteran-services-by-state', 'Federal Benefits Guide', CupertinoIcons.building_2_fill),
      CatalogEntry('retirement-planning', 'Retirement Planning', CupertinoIcons.chart_bar_alt_fill),
      CatalogEntry('mental-health', 'Mental Health', CupertinoIcons.heart_fill),
      CatalogEntry('therapy', 'Therapy', CupertinoIcons.leaf_arrow_circlepath),
      CatalogEntry('therapeutic-adventures', 'Therapeutic Adventures', CupertinoIcons.tree),
      CatalogEntry(
        'veterans-with-disabilities',
        'Veterans with Disabilities',
        CupertinoIcons.person_crop_circle_badge_checkmark,
      ),
      CatalogEntry('service-animals', 'Service Animals', CupertinoIcons.paw_solid),
      CatalogEntry('childcare-resource', 'Childcare', CupertinoIcons.person_2_fill),
      CatalogEntry('discounts', 'Discounts', CupertinoIcons.tag_fill),
      CatalogEntry('travel', 'Travel', CupertinoIcons.airplane),
      CatalogEntry('holiday', 'Holiday', CupertinoIcons.gift_fill),
      CatalogEntry('clothesmakeovers', 'Clothes / Makeovers', CupertinoIcons.bag_fill),
      CatalogEntry('community', 'Community', CupertinoIcons.person_3_fill),
      CatalogEntry('social-media-groups', 'Social Media Groups', CupertinoIcons.chat_bubble_2_fill),
      CatalogEntry('special-forces', 'Special Forces', CupertinoIcons.lock_shield_fill),
    ],
  ),
  CatalogGroup('Careers', 'Jobs, SkillBridge, resumes, negotiation', CupertinoIcons.briefcase_fill, Hue.brown, [
    CatalogEntry(
      'employment-assistance',
      'Employment Assistance',
      CupertinoIcons.briefcase_fill,
      'Job boards, SkillBridge, fellowships, resume help, interview prep, and salary negotiation.',
    ),
    CatalogEntry(
      'real-estate-careers',
      'Real Estate Careers',
      CupertinoIcons.house_alt_fill,
      'Start a real estate career with Steven Shearrill at LPT Realty.',
      Org.realEstateCareersUrl,
    ),
    CatalogEntry('job-boards', 'Job Boards', CupertinoIcons.list_bullet),
    CatalogEntry('job-boards-remote', 'Remote Job Boards', CupertinoIcons.device_laptop),
    CatalogEntry('job-fairs-hiring-events', 'Job Fairs & Hiring Events', CupertinoIcons.calendar),
    CatalogEntry('jobs-overseas', 'Jobs Overseas', CupertinoIcons.globe),
    CatalogEntry('apprenticeship', 'Apprenticeship', CupertinoIcons.hammer_fill),
    CatalogEntry('transitioning-assistance-programs', 'Transition Assistance', CupertinoIcons.arrow_2_circlepath),
    CatalogEntry('military-spouse-opportunities', 'Military Spouse Opportunities', CupertinoIcons.person_2_fill),
    CatalogEntry('mentorship-programs', 'Mentorship Programs', CupertinoIcons.hand_raised_fill),
    CatalogEntry('entrepreneurship-business', 'Entrepreneurship / Business', CupertinoIcons.cart_fill),
    CatalogEntry('resume', 'Resume', CupertinoIcons.doc_person_fill),
    CatalogEntry('resume-assistance', 'Resume Assistance', CupertinoIcons.pencil_ellipsis_rectangle),
    CatalogEntry('resume-optimization', 'Resume Optimization', CupertinoIcons.wand_stars),
    CatalogEntry('salary-negotiation', 'Salary Negotiation', CupertinoIcons.money_dollar_circle_fill),
    CatalogEntry('act-now', 'ACT Now', CupertinoIcons.bolt_fill),
  ]),
  CatalogGroup(
    'Interview Prep',
    'Practice questions and checklists',
    CupertinoIcons.person_2_square_stack_fill,
    Hue.indigo,
    [
      CatalogEntry('interview-prep', 'Interview Prep', CupertinoIcons.person_2_square_stack_fill),
      CatalogEntry('interview-checklist', 'Interview Checklist', CupertinoIcons.checkmark_rectangle_fill),
      CatalogEntry('job-preparation', 'Job Preparation', CupertinoIcons.checkmark_seal_fill),
      CatalogEntry('job-questionnaire', 'Job Questionnaire', CupertinoIcons.square_list_fill),
      CatalogEntry('practice-your-answers', 'Practice Your Answers', CupertinoIcons.mic_fill),
      CatalogEntry('traditional-interview-questions', 'Traditional Questions', CupertinoIcons.question_circle_fill),
      CatalogEntry('behavioral-interview-questions', 'Behavioral Questions', CupertinoIcons.person_crop_circle_fill),
      CatalogEntry('behavior-questions', 'Behavior Questions', CupertinoIcons.person_crop_circle_fill_badge_checkmark),
      CatalogEntry(
        'where-do-you-see-yourself',
        'Where Do You See Yourself in 5 Years?',
        CupertinoIcons.graph_square_fill,
      ),
      CatalogEntry('why-do-you-want-this-job', 'Why Do You Want This Job?', CupertinoIcons.lightbulb_fill),
    ],
  ),
  CatalogGroup('Education & Training', 'GI Bill, scholarships, certifications', CupertinoIcons.book_fill, Hue.green, [
    CatalogEntry(
      'education-resources',
      'Education Resources',
      CupertinoIcons.book_fill,
      'GI Bill guidance, certifications, coding and cyber training, plus scholarships.',
    ),
    CatalogEntry('scholarship-resources', 'Scholarship Resources', CupertinoIcons.rosette),
    CatalogEntry('scholarship', 'Scholarships', CupertinoIcons.star_circle_fill),
    CatalogEntry('scholarship-assistance', 'Scholarship Assistance', CupertinoIcons.gift_fill),
    CatalogEntry('collegeeducation', 'College / Education', CupertinoIcons.building_2_fill),
    CatalogEntry('certifications', 'Certifications', CupertinoIcons.checkmark_seal_fill),
    CatalogEntry('certification-discounts', 'Certification Discounts', CupertinoIcons.tag_fill),
    CatalogEntry('cyberit-certifications', 'Cyber / IT Certifications', CupertinoIcons.lock_shield_fill),
    CatalogEntry('itcybersecurity-training', 'IT / Cybersecurity Training', CupertinoIcons.desktopcomputer),
    CatalogEntry('computer-coding', 'Computer Coding', CupertinoIcons.chevron_left_slash_chevron_right),
    CatalogEntry('financial-certifications', 'Financial Certifications', CupertinoIcons.creditcard_fill),
    CatalogEntry('nursing-programs', 'Nursing Programs', CupertinoIcons.bandage_fill),
    CatalogEntry('real-estate-training-certification', 'Real Estate Training', CupertinoIcons.house_alt_fill),
    CatalogEntry('training', 'Training', CupertinoIcons.sportscourt_fill),
  ]),
  CatalogGroup('Relocation & Local', 'PCS moves and Southern California', CupertinoIcons.location_solid, Hue.orange, [
    CatalogEntry(
      'nationwide-relocation-assistance',
      'Nationwide Relocation',
      CupertinoIcons.car_detailed,
      'Moving across the country? Neighborhood, school, and base guides.',
    ),
    CatalogEntry('relocating-to-southern-california', 'Relocating to SoCal', CupertinoIcons.sun_max_fill),
    CatalogEntry('san-diego-county', 'San Diego County', CupertinoIcons.building_2_fill),
    CatalogEntry('riverside-county', 'Riverside County', CupertinoIcons.building_2_fill),
    CatalogEntry('orange-county', 'Orange County', CupertinoIcons.building_2_fill),
    CatalogEntry('los-angeles-county', 'Los Angeles County', CupertinoIcons.building_2_fill),
  ]),
];

/// Friendly titles for pages whose website H1 is a sentence.
String titleForSlug(String slug, String fallback) {
  for (final g in catalog) {
    for (final e in g.entries) {
      if (e.slug == slug) return e.title;
    }
  }
  const extra = {
    'home': 'Home',
    'about-us': 'About Us',
    'board-members': 'Board Members',
    'testimonials': 'Testimonials',
    'support-local-charities': 'Support Local Charities',
    'affiliates': 'Affiliates',
    'contact-us': 'Contact Us',
    'terms-and-conditions': 'Terms & Conditions',
    'va-home-buying-webinar': 'VA Home Buying Webinar',
    'calculators': 'Calculators',
  };
  return extra[slug] ?? fallback;
}
