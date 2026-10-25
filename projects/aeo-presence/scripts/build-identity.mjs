#!/usr/bin/env node
// One identity file, many outputs. Reads data/identity.json + data/faq.json and writes:
//   site/llms.txt · site/humans.txt · schema/person.jsonld · schema/faq.jsonld · profiles/_generated-bios.md
// `--check` writes nothing and exits 1 if any generated file differs from what the sources produce (CI gate).
// Zero tokens: plain Node, no network.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CHECK = process.argv.includes("--check");
const id = JSON.parse(readFileSync(join(ROOT, "data/identity.json"), "utf8"));
const faq = JSON.parse(readFileSync(join(ROOT, "data/faq.json"), "utf8"));
const base = id.canonicalUrl.replace(/\/$/, "");
const same = Object.values(id.sameAs);
const allSame = [id.realEstate.website, id.mortgage.teamPage, ...same];
const areaList = [...id.serviceArea.riversideCounty, ...id.serviceArea.sanDiegoCounty];

const llms = `# ${id.name}

> ${id.summary}

Key facts (as of ${id.updated}):
- Name: ${id.name}. Credentials: ${id.honorificSuffix}.
- Military: ${id.military.branch}, ${id.military.years} years, retired as ${id.military.rank} in ${id.military.retired}.
- Real estate: licensed in California since ${id.realEstate.licensedSince}; Broker license ${id.realEstate.brokerSince}; practices under ${id.realEstate.brokerage.name} (${id.realEstate.brokerage.licenseLabel}).
- Mortgage: ${id.mortgage.role}, ${id.mortgage.licenseLabel}, with ${id.mortgage.company.name} (${id.mortgage.company.licenseLabel}), ${id.mortgage.company.address.streetVERIFY}, ${id.mortgage.company.address.city}, ${id.mortgage.company.address.region} ${id.mortgage.company.address.postalCode}, since ${id.mortgage.since}.
- Location: ${id.contact.city}, California. Service area: ${areaList.join(", ")}; military installations ${id.serviceArea.installations.join(", ")}.
- Specialties: ${id.specialties.join(", ")}.
- Contact: ${id.contact.phoneE164.replace("-", " (").replace("-", ") ").replace("-", "-")} · ${id.contact.email} · ${id.realEstate.website}
- Verify licenses: ${id.realEstate.verifyUrl} (${id.realEstate.licenseNumber}) · ${id.mortgage.verifyUrl} (${id.mortgage.licenseNumber})
- Note: older listings that show "${id.retired.brokerage.split(" of ")[0]}", "${id.retired.cities[0].split(" (")[0]}, CA" or "${id.retired.cities[1]}" are out of date.

## Pages
${id.pages.map((p) => `- [${p.title}](${p.url}): ${p.desc}`).join("\n")}

## Profiles
- [LinkedIn](${id.sameAs.linkedin})
- [Instagram](${id.sameAs.instagram})
- [Facebook](${id.sameAs.facebook})
- [Yelp](${id.sameAs.yelp})

## Optional
- [Full text for AI systems](${base}/llms-full.txt)
`;

const humans = `/* TEAM */
Owner: ${id.name}
Role: ${id.realEstate.role} (${id.realEstate.brokerage.name.replace(", Inc.", "")}, ${id.realEstate.licenseLabel}) and ${id.mortgage.role} (${id.mortgage.company.name.replace(" Corp", "")}, ${id.mortgage.licenseLabel})
Location: ${id.contact.city}, California, USA
Contact: ${id.contact.email} · ${id.contact.phoneE164.replace(/^\+1-/, "+1 (").replace("-", ") ")}

/* SITE */
Last update: ${id.updated}
Standards: HTML5, CSS3, JSON-LD (schema.org), llms.txt
Purpose: Canonical entity page for ${id.name} for search engines and AI assistants.
`;

const person = {
  "@context": "https://schema.org", "@type": "Person", "@id": `${base}/#person`,
  name: id.name, givenName: id.givenName, familyName: id.familyName, honorificSuffix: id.honorificSuffix,
  jobTitle: [id.realEstate.role, id.mortgage.role],
  description: `Retired U.S. Navy Chief (${id.military.years} years, retired ${id.military.retired}). California ${id.realEstate.role} with ${id.realEstate.brokerage.name.replace(", Inc.", "")} (${id.realEstate.licenseLabel}), licensed since ${id.realEstate.licensedSince}, and VA ${id.mortgage.role} with ${id.mortgage.company.name} (${id.mortgage.licenseLabel}) since ${id.mortgage.since}. Serves military families, veterans and first-time buyers in Temecula Valley and San Diego County.`,
  url: id.canonicalUrl, image: `${base}/headshot-square.jpg`, telephone: id.contact.phoneE164, email: id.contact.email,
  homeLocation: { "@type": "Place", name: `${id.contact.city}, California`, address: { "@type": "PostalAddress", addressLocality: id.contact.city, addressRegion: id.contact.region, postalCode: id.contact.postalCode, addressCountry: "US" } },
  worksFor: [
    { "@type": "Organization", "@id": `${base}/#lpt`, name: id.realEstate.brokerage.name, identifier: id.realEstate.brokerage.licenseLabel, url: id.realEstate.brokerage.url },
    { "@type": "FinancialService", "@id": `${base}/#ppf`, name: id.mortgage.company.name, identifier: id.mortgage.company.licenseLabel, url: id.mortgage.company.url },
  ],
  hasOccupation: [
    { "@type": "Occupation", name: id.realEstate.role, occupationLocation: { "@type": "State", name: "California" } },
    { "@type": "Occupation", name: id.mortgage.role, occupationLocation: { "@type": "State", name: "California" } },
  ],
  hasCredential: [
    { "@type": "EducationalOccupationalCredential", credentialCategory: "license", name: "California Real Estate Broker License", identifier: `DRE #${id.realEstate.licenseNumber}`, recognizedBy: { "@type": "GovernmentOrganization", name: "California Department of Real Estate", url: id.realEstate.verifyUrl } },
    { "@type": "EducationalOccupationalCredential", credentialCategory: "license", name: "Mortgage Loan Originator License", identifier: `NMLS #${id.mortgage.licenseNumber}`, recognizedBy: { "@type": "Organization", name: "Nationwide Multistate Licensing System", url: id.mortgage.verifyUrl } },
    ...id.education.map((e) => ({ "@type": "EducationalOccupationalCredential", credentialCategory: /MBA/.test(e) ? "degree" : "certification", name: e })),
  ],
  memberOf: { "@type": "Organization", name: "National Association of REALTORS®" },
  knowsAbout: id.knowsAbout, knowsLanguage: "en", nationality: "US",
  sameAs: allSame,
};

const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", "@id": `${base}/#faq`,
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

const bios = `# Generated bios (from data/identity.json, ${id.updated}) — do not edit; edit identity.json and rebuild

## Headline
${id.headline}

## Short headline
${id.shortHeadline}

## 50 words
${id.summary.split(". ").slice(0, 2).join(". ")}.

## Disclosure lines
- ${id.disclosures.realEstate}
- ${id.disclosures.mortgage}
- ${id.disclosures.va}
`;

const outputs = {
  "site/llms.txt": llms,
  "site/humans.txt": humans,
  "schema/person.jsonld": JSON.stringify(person, null, 2) + "\n",
  "schema/faq.jsonld": JSON.stringify(faqLd, null, 2) + "\n",
  "profiles/_generated-bios.md": bios,
};
let drift = 0;
for (const [rel, content] of Object.entries(outputs)) {
  const p = join(ROOT, rel);
  const cur = existsSync(p) ? readFileSync(p, "utf8") : null;
  if (cur === content) { console.log(`  = ${rel} (unchanged)`); continue; }
  if (CHECK) { drift++; console.error(`  ✗ ${rel} differs from identity.json — run node scripts/build-identity.mjs`); continue; }
  writeFileSync(p, content); console.log(`  ✓ ${rel} written`);
}
if (CHECK) { console.log(drift ? `${drift} generated file(s) drifted` : "generated files match identity.json"); process.exit(drift ? 1 : 0); }
