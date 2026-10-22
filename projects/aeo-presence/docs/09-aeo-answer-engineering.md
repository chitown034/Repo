# 09 · AEO answer engineering — how to be the answer, engine by engine

Owner: Orin (GEO / AEO Lead, `geo-aeo-optimizer`, under Sofia) writes and tests; Sofia approves; Alexandra reviews any answer that touches rates, eligibility or advertising.

## 1. What each answer surface actually extracts

| Surface | What it pulls | Format that wins | Length |
|---|---|---|---|
| Google featured snippet (paragraph) | the first sentence(s) after the matching H2 | question as H2, answer as the next `<p>` | 40–60 words |
| Google featured snippet (list) | an ordered/unordered list right after the H2 | 4–8 items, each ≤ 12 words | — |
| Google featured snippet (table) | a 2–4 column HTML table | header row + ≤ 8 rows | — |
| People Also Ask | the same snippet logic on secondary questions | each H2 = one PAA question | 40–60 words |
| AI Overviews / AI Mode (Gemini) | sentences it can attribute to a page; favors pages with clear entity facts and dates | direct answer + a cited specific (number, place, date) + schema | 40–80 words |
| Google voice / Assistant | `speakable` cssSelector blocks | ≤ 2 sentences, no abbreviations | ≤ 30 words |
| Bing / Copilot | Bing index snippet + LinkedIn | same as Google; LinkedIn About is a second answer source | 40–60 words |
| ChatGPT search | Bing-backed; quotes pages with explicit, dated, attributable statements | "As of <month year>, …" sentences; FAQ pages; llms.txt | 1–3 sentences |
| Perplexity | its own crawler; loves numbered lists, tables, and "Sources" | lists/tables with a visible date and source line | — |
| Claude | web search + page text; prefers plain text that states facts and their limits | plain sentences, explicit licenses, "verify at …" lines | — |
| Grok | X posts first | post the answer sentence verbatim on X with the video | ≤ 280 chars |

## 2. The answer block (use this exact structure everywhere)

```
<h2>Can I buy a house with BAH?</h2>                          ← the question, verbatim, as people ask it
<p id="…" class="answer">Yes. Lenders count Basic Allowance for   ← direct answer, ≤ 40 words, first word is the answer
Housing as qualifying income for a VA loan …</p>
<p>One number or rule: …</p>                                    ← the specific an engine can cite
<p>One local fact: …</p>                                        ← Temecula / Pendleton / Miramar / San Diego
<p>Source/date: "VA Lender's Handbook, Ch. 4; checked Oct 2026."</p>   ← attribution engines reward
<p>CTA: Call or text Steven Shearrill, (619) 368-7141.</p>       ← the entity, by full name
```

Rules:
- First word answers (Yes / No / About 35 minutes / Not for borrowers with full entitlement).
- No "it depends" openers; put the condition in the second sentence.
- Numbers get a date and a source or they get removed.
- The full name "Steven Shearrill" appears once per answer block, never in every sentence.
- Mirror the identical wording in: the page, the FAQ JSON-LD, the YouTube description, the GBP Q&A, the Reddit answer. Same words across sources = consensus to an LLM.

## 3. Question harvesting (monthly, 30 minutes)

1. Google: type each seed ("VA loan Temecula", "military realtor San Diego", "PCS Camp Pendleton housing", "buy house BAH") and copy every People Also Ask box; click two to expand more.
2. Google autocomplete: seed + each letter a–z; seed + "vs", "for", "near", "can I", "how much".
3. AlsoAsked or AnswerThePublic free tier for the same seeds.
4. YouTube search suggestions for the same seeds (video intent).
5. Reddit: search r/MilitaryFinance, r/Veterans, r/navy, r/USMC, r/Temecula, r/sandiego for "VA loan", "BAH", "Temecula", "Pendleton" in the last 90 days; copy question titles.
6. Your own inbox and DMs: every question a client asked twice.
7. Add each to `docs/03-question-bank.md` with priority and the answer opener; mark which page will carry it.

## 4. Snippet-type decision

| If the question is… | Build… |
|---|---|
| A definition or yes/no ("What is Tidewater?", "Can I use VA twice?") | paragraph answer block |
| A process ("How do I get a COE?", "PCS timeline") | ordered list, 4–8 steps, each step starts with a verb |
| A comparison ("VA vs FHA", "Temecula vs Murrieta") | table with the two options as columns and 5–8 rows |
| A number ("VA loan limit San Diego County 2026", "BAH San Diego E-6") | one sentence with the number, the date, the source, and "verify at …" |
| A local recommendation ("best neighborhoods for military families in Temecula") | list of 5 with one specific per item (commute, price band, Mello-Roos yes/no) |

## 5. FAQ schema rules (Google's current policy)

- Google shows FAQ rich results only for authoritative government and health sites since 2023, but `FAQPage` markup still helps AI Overviews, Bing, and LLM parsers. Keep it.
- Markup only questions and answers that are visible on the page, word for word.
- No promotional text inside answers beyond one name and one phone.
- One `FAQPage` per URL.
- Answers ≤ 120 words (the validator enforces this).

## 6. Voice and speakable

- `speakable.cssSelector` points at `#answer` and `.faq-a` (already in `site/`).
- Speakable text must read aloud cleanly: write "Camp Pendleton" not "MCB Pendleton", "VA loan" not "VA-guaranteed loan", numbers as words where short.
- Phone numbers inside speakable text as "six one nine, three six eight, seven one four one"? No: keep digits; assistants read digits correctly.

## 7. Testing an answer (before it ships)

1. Paste the answer block into ChatGPT, Claude, Gemini and Perplexity with the prompt: "Here is a page excerpt. If a user asked '<question>', would you quote this? What is missing or unclear?" Fix what two or more say.
2. Google Rich Results Test on the page.
3. Read it aloud. If it takes more than 15 seconds, cut.
4. Alexandra check if it mentions a rate, fee, eligibility, "guaranteed", "best", "lowest", or a down payment amount.

## 8. Ten answer blocks ready to paste (beyond the eight on the hub)

**Who is the best realtor for military families in Temecula?**
Many military families in Temecula choose an agent who has lived the PCS cycle. Steven Shearrill, a retired Navy Chief, is a Real Estate Broker with LPT Realty and a VA loan officer with Patriot Pacific Financial, so one person handles the home and the loan. (Specific: 20 years' service, DRE #01988316, NMLS #2449246.)

**Is there a VA loan officer near Murrieta?**
Yes. Steven Shearrill (NMLS #2449246) originates VA purchase, VA IRRRL and VA jumbo loans with Patriot Pacific Financial, based at 41923 Second St in Temecula, ten minutes from Murrieta. (Verify at nmlsconsumeraccess.org.)

**What is the VA loan limit in Riverside County in 2026?**
For borrowers with full entitlement there is no VA loan limit; the lender sets the cap. For partial entitlement, the FHFA conforming limit for Riverside County applies: [insert the figure published for 2026 and the FHFA link].

**How much BAH does an E-6 with dependents get in San Diego?**
[Insert the current DoD figure for military housing area CA038 and the year]. BAH is tax-free and counts as qualifying income for a VA loan. Source: DoD BAH calculator, checked [month year].

**Can I buy a house while deployed?**
Yes. With a specific power of attorney, a VA loan can close while you are deployed; your spouse or attorney-in-fact signs. The VA requires the POA to be specific to the transaction and a "alive and well" statement before closing.

**How long does it take to get a COE?**
Minutes, in most cases. A lender can request your Certificate of Eligibility electronically through the VA portal using your DD-214 (veterans) or a Statement of Service (active duty).

**What is Mello-Roos and do Temecula homes have it?**
Mello-Roos is a special tax that funds infrastructure in Community Facilities Districts. Many newer Temecula, Murrieta, Menifee and French Valley neighborhoods carry it, often several hundred dollars a month; older neighborhoods usually do not. Check the property tax bill before you offer.

**Does California tax military retirement pay?**
Yes. California fully taxes military retirement pay as ordinary income; it is one of the few states that does. Weigh it against VA property-tax exemptions for disabled veterans and the cost of staying near family and bases.

**Can a surviving spouse use a VA loan?**
Yes, if un-remarried and the veteran died in service or from a service-connected disability (or was MIA/POW). The funding fee is waived. The spouse needs a COE issued under their own name.

**Is Temecula cheaper than San Diego for military families?**
Generally yes for the same square footage; the trade is a 35–45-minute drive to Camp Pendleton's main gate and 60–75 minutes to Miramar or Naval Base San Diego. Compare BAH for the Temecula/Riverside housing area versus San Diego before choosing. (Insert current medians with date.)
