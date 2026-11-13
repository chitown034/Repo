import 'package:material_ui/material_ui.dart';

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
  CatalogGroup('Benefits & support', 'Claims, health, housing, discounts', Icons.shield_outlined, Color(0xFF23406A), [
    CatalogEntry(
      'veteran-resources',
      'Veteran Resources',
      Icons.military_tech_outlined,
      'Disability claims, mental health, service animals, travel, discounts, and dozens of vetted programs.',
    ),
    CatalogEntry(
      'housing-and-utility-help',
      'Housing & Utility Help',
      Icons.home_work_outlined,
      'HUD-VASH, SSVF, foreclosure help, LIHEAP, utility discounts, and emergency grants.',
    ),
    CatalogEntry('va-disability-claims-assistance', 'VA Disability Claims', Icons.assignment_outlined),
    CatalogEntry(
      'veteran-and-disabled-veteran-benefits-by-state',
      'Benefits by State',
      Icons.map_outlined,
      'Property tax exemptions, tuition waivers, license plates, and more.',
    ),
    CatalogEntry('veteran-services-by-state', 'Federal Benefits Guide', Icons.account_balance_outlined),
    CatalogEntry('retirement-planning', 'Retirement Planning', Icons.savings_outlined),
    CatalogEntry('mental-health', 'Mental Health', Icons.favorite_border),
    CatalogEntry('therapy', 'Therapy', Icons.spa_outlined),
    CatalogEntry('therapeutic-adventures', 'Therapeutic Adventures', Icons.hiking_outlined),
    CatalogEntry('veterans-with-disabilities', 'Veterans with Disabilities', Icons.accessible_outlined),
    CatalogEntry('service-animals', 'Service Animals', Icons.pets_outlined),
    CatalogEntry('childcare-resource', 'Childcare', Icons.child_care_outlined),
    CatalogEntry('discounts', 'Discounts', Icons.local_offer_outlined),
    CatalogEntry('travel', 'Travel', Icons.flight_outlined),
    CatalogEntry('holiday', 'Holiday', Icons.celebration_outlined),
    CatalogEntry('clothesmakeovers', 'Clothes / Makeovers', Icons.checkroom_outlined),
    CatalogEntry('community', 'Community', Icons.groups_outlined),
    CatalogEntry('social-media-groups', 'Social Media Groups', Icons.forum_outlined),
    CatalogEntry('special-forces', 'Special Forces', Icons.security_outlined),
  ]),
  CatalogGroup('Careers', 'Jobs, SkillBridge, resumes, negotiation', Icons.work_outline, Color(0xFF8A3A42), [
    CatalogEntry(
      'employment-assistance',
      'Employment Assistance',
      Icons.work_outline,
      'Job boards, SkillBridge, fellowships, resume help, interview prep, and salary negotiation.',
    ),
    CatalogEntry(
      'real-estate-careers',
      'Real Estate Careers',
      Icons.real_estate_agent_outlined,
      'Start a real estate career with Steven Shearrill at LPT Realty.',
      Org.realEstateCareersUrl,
    ),
    CatalogEntry('job-boards', 'Job Boards', Icons.list_alt_outlined),
    CatalogEntry('job-boards-remote', 'Remote Job Boards', Icons.laptop_outlined),
    CatalogEntry('job-fairs-hiring-events', 'Job Fairs & Hiring Events', Icons.event_outlined),
    CatalogEntry('jobs-overseas', 'Jobs Overseas', Icons.public_outlined),
    CatalogEntry('apprenticeship', 'Apprenticeship', Icons.construction_outlined),
    CatalogEntry('transitioning-assistance-programs', 'Transition Assistance', Icons.sync_alt_outlined),
    CatalogEntry('military-spouse-opportunities', 'Military Spouse Opportunities', Icons.diversity_1_outlined),
    CatalogEntry('mentorship-programs', 'Mentorship Programs', Icons.handshake_outlined),
    CatalogEntry('entrepreneurship-business', 'Entrepreneurship / Business', Icons.storefront_outlined),
    CatalogEntry('resume', 'Resume', Icons.description_outlined),
    CatalogEntry('resume-assistance', 'Resume Assistance', Icons.edit_note_outlined),
    CatalogEntry('resume-optimization', 'Resume Optimization', Icons.auto_fix_high_outlined),
    CatalogEntry('salary-negotiation', 'Salary Negotiation', Icons.payments_outlined),
    CatalogEntry('act-now', 'ACT Now', Icons.bolt_outlined),
  ]),
  CatalogGroup(
    'Interview prep',
    'Practice questions and checklists',
    Icons.record_voice_over_outlined,
    Color(0xFF5B4B8A),
    [
      CatalogEntry('interview-prep', 'Interview Prep', Icons.record_voice_over_outlined),
      CatalogEntry('interview-checklist', 'Interview Checklist', Icons.checklist_outlined),
      CatalogEntry('job-preparation', 'Job Preparation', Icons.fact_check_outlined),
      CatalogEntry('job-questionnaire', 'Job Questionnaire', Icons.quiz_outlined),
      CatalogEntry('practice-your-answers', 'Practice Your Answers', Icons.mic_none_outlined),
      CatalogEntry('traditional-interview-questions', 'Traditional Questions', Icons.help_outline),
      CatalogEntry('behavioral-interview-questions', 'Behavioral Questions', Icons.psychology_outlined),
      CatalogEntry('behavior-questions', 'Behavior Questions', Icons.psychology_alt_outlined),
      CatalogEntry('where-do-you-see-yourself', 'Where Do You See Yourself in 5 Years?', Icons.trending_up),
      CatalogEntry('why-do-you-want-this-job', 'Why Do You Want This Job?', Icons.lightbulb_outline),
    ],
  ),
  CatalogGroup(
    'Education & training',
    'GI Bill, scholarships, certifications',
    Icons.school_outlined,
    Color(0xFF2E6B5A),
    [
      CatalogEntry(
        'education-resources',
        'Education Resources',
        Icons.school_outlined,
        'GI Bill guidance, certifications, coding and cyber training, plus scholarships.',
      ),
      CatalogEntry('scholarship-resources', 'Scholarship Resources', Icons.emoji_events_outlined),
      CatalogEntry('scholarship', 'Scholarships', Icons.workspace_premium_outlined),
      CatalogEntry('scholarship-assistance', 'Scholarship Assistance', Icons.volunteer_activism_outlined),
      CatalogEntry('collegeeducation', 'College / Education', Icons.account_balance_outlined),
      CatalogEntry('certifications', 'Certifications', Icons.verified_outlined),
      CatalogEntry('certification-discounts', 'Certification Discounts', Icons.discount_outlined),
      CatalogEntry('cyberit-certifications', 'Cyber / IT Certifications', Icons.security_outlined),
      CatalogEntry('itcybersecurity-training', 'IT / Cybersecurity Training', Icons.computer_outlined),
      CatalogEntry('computer-coding', 'Computer Coding', Icons.code),
      CatalogEntry('financial-certifications', 'Financial Certifications', Icons.account_balance_wallet_outlined),
      CatalogEntry('nursing-programs', 'Nursing Programs', Icons.medical_services_outlined),
      CatalogEntry('real-estate-training-certification', 'Real Estate Training', Icons.real_estate_agent_outlined),
      CatalogEntry('training', 'Training', Icons.fitness_center_outlined),
    ],
  ),
  CatalogGroup(
    'Relocation & local',
    'PCS moves and Southern California',
    Icons.location_on_outlined,
    Color(0xFF9A6B12),
    [
      CatalogEntry(
        'nationwide-relocation-assistance',
        'Nationwide Relocation',
        Icons.local_shipping_outlined,
        'Moving across the country? Neighborhood, school, and base guides.',
      ),
      CatalogEntry('relocating-to-southern-california', 'Relocating to SoCal', Icons.wb_sunny_outlined),
      CatalogEntry('san-diego-county', 'San Diego County', Icons.location_city_outlined),
      CatalogEntry('riverside-county', 'Riverside County', Icons.location_city_outlined),
      CatalogEntry('orange-county', 'Orange County', Icons.location_city_outlined),
      CatalogEntry('los-angeles-county', 'Los Angeles County', Icons.location_city_outlined),
    ],
  ),
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
