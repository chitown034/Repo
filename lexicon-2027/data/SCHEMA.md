# Lexicon 2027 — data file contract

Every data file is a plain JavaScript file (NOT JSON, NOT a module) that appends to a global:

    window.LEX = window.LEX || {};
    LEX.<key> = (LEX.<key> || []).concat([
      { ... }, { ... }
    ]);

Rules for every file
- Must pass `node --check <file>` and must load with:
  node -e "global.window=global; require('<abs path>'); console.log(LEX.<key>.length)"
- Use double-quoted JS strings; escape inner double quotes; use typographic ’ for apostrophes inside text
  where convenient. No template literals. No HTML inside strings except <i>…</i> for italics (allowed sparingly).
- ACCURACY OVER QUANTITY. Only well-established facts. Round numbers where exactness is uncertain.
  Never invent dates, people, quotations or etymologies. If an origin is disputed, say so.
- Content should be current as of late 2026 and must not claim events that have not happened.
- Plain, clear, encyclopedic English. No emoji.
- No duplicate headwords inside a file.

## Keys and record shapes

### LEX.dict  (dictionary)
{ w:"serendipity",                       // headword, lowercase unless proper
  ipa:"/ˌsɛr.ənˈdɪp.ɪ.ti/",             // General American IPA
  syl:"ser·en·dip·i·ty",                 // syllabified with middle dot ·
  pos:"noun",                            // noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection|phrase
  defs:["The occurrence of events by chance in a happy or beneficial way."], // 1–4 senses, most common first
  ex:"Finding the café was pure serendipity.",   // one example sentence
  ety:"Coined in 1754 by Horace Walpole after the Persian fairy tale The Three Princes of Serendip, whose heroes kept making lucky discoveries.",
  lang:"English coinage",               // ultimate source family, one of: Latin, Greek, Old English, Old Norse, French, Germanic (other), Dutch, Italian, Spanish, Portuguese, Arabic, Persian, Sanskrit/Hindi, Chinese, Japanese, Native American, African, Malay/Polynesian, Celtic, Hebrew/Yiddish, Turkic, Slavic, English coinage, Unknown
  first:1754,                            // approx year first attested in English (integer; use century midpoints like 1350 if only century known)
  syn:["fluke","luck","chance"], ant:["misfortune"],   // 0–6 each
  level:3,                               // 1=everyday, 2=common, 3=educated, 4=advanced/rare
  tags:["literary"] }                    // optional; e.g. "science","law","informal","archaic","new"

### LEX.thes  (thesaurus)
{ w:"happy", pos:"adjective",
  senses:[ { gloss:"feeling pleasure", syn:["glad","cheerful","joyful","content","delighted","elated"], ant:["sad","unhappy","miserable"] },
           { gloss:"fortunate, lucky", syn:["lucky","fortunate","favorable","timely"], ant:["unlucky"] } ],
  strong:["ecstatic","overjoyed","euphoric"],   // stronger/intensified forms
  mild:["pleased","satisfied"],                  // weaker/milder forms
  formal:["felicitous"], informal:["chuffed","stoked"],
  note:"Glad is usually tied to a specific event; happy can describe a lasting state." } // usage note, optional

### LEX.rhymes  (rhyme families)
{ key:"ight", sound:"/aɪt/", sample:"night",
  one:["bite","bright","fight","flight","fright","height","kite","knight","light","might","night","plight","quite","right","sight","site","slight","spite","tight","white","write"],
  two:["alight","contrite","delight","despite","excite","invite","polite","tonight","upright","airtight","outright"],   // two-syllable words whose LAST stressed syllable rhymes perfectly
  three:["appetite","dynamite","satellite","parasite","overnight","oversight"],             // 3+ syllables, perfect rhyme on final stressed syllable
  near:["ride","time","life","type"],                                                       // slant/near rhymes
  phrases:["at first sight","out of sight","day and night"] }                                // multi-word rhyming phrases
Spelling may differ (bite/height/site). Group strictly by SOUND, not spelling. Only perfect rhymes in one/two/three.

### LEX.idioms  (book of origins: phrases)
{ p:"bite the bullet", m:"To face a painful or unpleasant situation with courage.",
  o:"Often linked to battlefield surgery before anaesthesia, when patients bit on a bullet. The figurative use is recorded from the late 1800s (Kipling, The Light That Failed, 1891).",
  era:"19th century", region:"Britain",
  v:"plausible",            // documented | plausible | disputed | myth  (myth = the popular story is false; then o explains the real story)
  cat:"War & Military" }    // War & Military | Sea & Sailing | Animals | Food & Drink | Body | Sport & Games | Law & Money | Religion & Myth | Literature & Theatre | Work & Trade | Everyday Life | Science & Technology

### LEX.wordorigins  (book of origins: notable word stories)
{ w:"salary", group:"Everyday words",   // groups: Days of the week | Months | Planets & Space | Eponyms (named after people) | Toponyms (named after places) | Food & Drink | Everyday words | Technology & Internet | Science | Numbers & Measures | Animals | Brand names that became words | Words from mistakes & folk etymology
  story:"From Latin salarium, an allowance paid to Roman soldiers, connected with sal ‘salt’. The popular claim that soldiers were paid in salt is not supported by ancient sources.",
  from:"Latin", year:1300 }

### LEX.roots  (roots, prefixes, suffixes)
{ r:"bio", kind:"root",     // root | prefix | suffix
  meaning:"life", src:"Greek bíos",
  ex:["biology","biography","antibiotic","symbiosis"] }

### LEX.loans  (borrowings by language)
{ lang:"Arabic", words:[ ["algebra","al-jabr, ‘reunion of broken parts’"], ["coffee","qahwa, via Turkish kahve and Italian caffè"] ] }

### LEX.ency  (encyclopedia articles)
{ t:"Black hole",                       // title
  cat:"Space",                          // Science | Space | Earth | Life | Human Body | Mathematics | Technology | History | Geography | Arts & Literature | Music & Film | Philosophy & Religion | Society & Economics | Sports
  sum:"A region of spacetime where gravity is so strong that nothing, not even light, can escape once past the event horizon.",  // one-sentence lede
  body:["Paragraph 1 …","Paragraph 2 …","Paragraph 3 …"],   // 3–5 substantial paragraphs, 60–120 words each
  facts:[["Predicted by","General relativity (1915–16)"],["First image","M87*, released 2019"]],  // 4–8 key/value pairs
  rel:["Neutron star","General relativity","Milky Way"],   // related article titles (prefer titles that exist in your own batch)
  yr:1916 }                             // optional key year for timeline, integer (negative for BCE)
