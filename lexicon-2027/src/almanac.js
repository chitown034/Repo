window.LEX = window.LEX || {};
/* 2027 almanac. Fixed-date entries only; rule-based holidays (US federal, DST) are computed in app.js.
   Religious dates for Jewish and Islamic calendars were checked against the ICU calendars
   (Islamic dates follow Umm al-Qura and can shift by a day with local moon sighting).
   Sports, expo and election dates were checked against organisers' announcements as of November 2026. */
LEX.almanac = [
  // Astronomy
  { d:"2027-01-03", end:"2027-01-04", t:"Quadrantid meteor shower peak", cat:"Sky", note:"Best seen from the Northern Hemisphere before dawn." },
  { d:"2027-02-06", t:"Annular solar eclipse", cat:"Sky", note:"A ‘ring of fire’ eclipse whose path crosses southern South America and the South Atlantic to West Africa." },
  { d:"2027-02-20", t:"Penumbral lunar eclipse", cat:"Sky", note:"A subtle shading of the full Moon; easy to miss without a camera." },
  { d:"2027-03-20", t:"March equinox", cat:"Sky", note:"Spring begins in the Northern Hemisphere, autumn in the Southern (date in UTC)." },
  { d:"2027-04-22", t:"Lyrid meteor shower peak", cat:"Sky", note:"Around 15–20 meteors an hour under dark skies." },
  { d:"2027-05-06", t:"Eta Aquariid meteor shower peak", cat:"Sky", note:"Debris of Halley’s Comet; best from the Southern Hemisphere." },
  { d:"2027-06-21", t:"June solstice", cat:"Sky", note:"Longest day north of the equator, shortest day south of it (date in UTC)." },
  { d:"2027-07-18", t:"Penumbral lunar eclipse", cat:"Sky", note:"Very shallow; the Moon barely enters Earth’s outer shadow." },
  { d:"2027-08-02", t:"Total solar eclipse", cat:"Sky", note:"The eclipse of the decade. The path of totality runs from the Atlantic across southern Spain, the Strait of Gibraltar, North Africa, Egypt and Arabia to the Horn of Africa. Totality lasts up to about 6 minutes 23 seconds near Luxor, Egypt, the longest on land until 2114." },
  { d:"2027-08-12", end:"2027-08-13", t:"Perseid meteor shower peak", cat:"Sky", note:"The most popular shower of the northern summer, from Comet Swift–Tuttle." },
  { d:"2027-08-17", t:"Penumbral lunar eclipse", cat:"Sky", note:"The third and last lunar eclipse of 2027, all of them penumbral." },
  { d:"2027-09-23", t:"September equinox", cat:"Sky", note:"Day and night are close to equal length everywhere (date in UTC)." },
  { d:"2027-10-21", t:"Orionid meteor shower peak", cat:"Sky", note:"A second shower from Halley’s Comet debris." },
  { d:"2027-11-17", t:"Leonid meteor shower peak", cat:"Sky", note:"Famous for occasional meteor storms, though none is expected in 2027." },
  { d:"2027-12-14", t:"Geminid meteor shower peak", cat:"Sky", note:"Often the year’s richest shower, up to 120 meteors an hour." },
  { d:"2027-12-22", t:"December solstice", cat:"Sky", note:"Shortest day in the Northern Hemisphere (date in UTC)." },

  // Observances & festivals
  { d:"2027-01-01", t:"New Year’s Day", cat:"Holiday", note:"2027 begins on a Friday." },
  { d:"2027-02-06", t:"Lunar New Year: Year of the Goat", cat:"Holiday", note:"The Fire Goat (dīng wèi) year runs until 25 January 2028. The new moon falls close to midnight Beijing time, so a few calendars list 7 February." },
  { d:"2027-02-08", t:"Ramadan begins (approx.)", cat:"Holiday", note:"1 Ramadan 1448 AH by the Umm al-Qura calendar; local moon sighting can shift it by a day." },
  { d:"2027-02-10", t:"Ash Wednesday", cat:"Holiday", note:"Start of Lent in Western Christianity." },
  { d:"2027-02-14", t:"Valentine’s Day", cat:"Holiday", note:"" },
  { d:"2027-02-20", t:"Lantern Festival", cat:"Holiday", note:"15th day of the first lunar month, closing the New Year season." },
  { d:"2027-03-09", t:"Eid al-Fitr (approx.)", cat:"Holiday", note:"End of Ramadan, 1 Shawwal 1448 AH." },
  { d:"2027-03-17", t:"St Patrick’s Day", cat:"Holiday", note:"" },
  { d:"2027-03-28", t:"Easter Sunday (Western)", cat:"Holiday", note:"Good Friday falls on 26 March." },
  { d:"2027-04-22", t:"Passover begins", cat:"Holiday", note:"15 Nisan 5787; observance starts at sundown on 21 April." },
  { d:"2027-05-02", t:"Easter Sunday (Orthodox)", cat:"Holiday", note:"" },
  { d:"2027-05-16", t:"Eid al-Adha (approx.)", cat:"Holiday", note:"10 Dhu al-Hijjah 1448 AH." },
  { d:"2027-06-06", t:"Islamic New Year 1449 (approx.)", cat:"Holiday", note:"1 Muharram 1449 AH." },
  { d:"2027-10-02", t:"Rosh Hashanah (5788)", cat:"Holiday", note:"Begins at sundown on 1 October." },
  { d:"2027-10-11", t:"Yom Kippur", cat:"Holiday", note:"Begins at sundown on 10 October." },
  { d:"2027-10-29", t:"Diwali (approx.)", cat:"Holiday", note:"Date depends on the regional Hindu calendar." },
  { d:"2027-10-31", t:"Halloween", cat:"Holiday", note:"" },
  { d:"2027-12-25", t:"Christmas Day", cat:"Holiday", note:"Hanukkah also begins at sundown on 24 December (25 Kislev 5788)." },
  { d:"2027-12-31", t:"New Year’s Eve", cat:"Holiday", note:"" },

  // Sport
  { d:"2027-06-19", end:"2027-07-17", t:"Africa Cup of Nations", cat:"Sport", note:"Co-hosted by Kenya, Uganda and Tanzania, the first AFCON held in East Africa since 1976." },
  { d:"2027-06-24", end:"2027-07-25", t:"FIFA Women’s World Cup", cat:"Sport", note:"Brazil hosts the first women’s World Cup in South America; the opener and final are at the Maracanã in Rio de Janeiro. 32 teams, the last edition before expansion to 48." },
  { d:"2027-07-23", end:"2027-08-08", t:"Pan American Games", cat:"Sport", note:"Lima, Peru, which also hosted in 2019. Dates moved a week later in January 2026." },
  { d:"2027-09-01", t:"World Athletics Championships (September)", cat:"Sport", note:"Beijing hosts in September 2027, returning to the Bird’s Nest stadium used in 2008 and 2015.", month:true },
  { d:"2027-09-17", end:"2027-09-19", t:"Ryder Cup", cat:"Sport", note:"Adare Manor, County Limerick, Ireland. Practice and ceremonies from 13 September." },
  { d:"2027-10-01", end:"2027-11-13", t:"Rugby World Cup", cat:"Sport", note:"Australia hosts the first 24-team men’s tournament: 52 matches in seven cities. Opens in Perth; final at Stadium Australia, Sydney." },
  { d:"2027-10-02", end:"2027-11-21", t:"ICC Men’s Cricket World Cup", cat:"Sport", note:"One-day internationals in South Africa, Zimbabwe and Namibia." },
  { d:"2027-12-23", end:"2028-01-21", t:"AFC Asian Cup (reported)", cat:"Sport", note:"Saudi Arabia. Originally set for January–February 2027; reported in November 2026 as moved to these dates." },

  // Civic & culture
  { d:"2027-04-18", t:"French presidential election, first round", cat:"Civic", note:"Run-off on 2 May 2027. The sitting president’s term ends on 14 May." },
  { d:"2027-05-02", t:"French presidential election, run-off", cat:"Civic", note:"" },
  { d:"2027-08-10", t:"Kenya general election", cat:"Civic", note:"Presidential, parliamentary and county elections on one day, as set by the IEBC." },
  { d:"2027-01-15", t:"Nigeria general elections (early 2027)", cat:"Civic", note:"INEC’s timetable was revised during 2026; reports differ between mid-January and late February for the presidential vote.", month:true },
  { d:"2027-05-15", end:"2027-08-15", t:"Expo 2027 Belgrade", cat:"Culture", note:"A specialised world expo on the theme ‘Play for Humanity: Sport and Music for All’, beside Belgrade’s airport in Serbia." },
  { d:"2027-08-01", t:"World Youth Day, Seoul (August)", cat:"Culture", note:"The Catholic youth gathering comes to South Korea for the first time.", month:true }
];

/* Anniversaries falling in 2027 (year of the original event) */
LEX.anniv = [
  { y:1527, t:"Sack of Rome by the troops of Emperor Charles V (6 May)", n:500 },
  { y:1527, t:"Death of Niccolò Machiavelli, author of The Prince (21 June)", n:500 },
  { y:1777, t:"The Stars and Stripes adopted as the US flag (14 June)", n:250 },
  { y:1777, t:"Battles of Saratoga, a turning point of the American Revolution", n:250 },
  { y:1777, t:"Birth of the mathematician Carl Friedrich Gauss (30 April)", n:250 },
  { y:1777, t:"Articles of Confederation adopted by the Continental Congress (15 November)", n:250 },
  { y:1827, t:"Death of Ludwig van Beethoven in Vienna (26 March)", n:200 },
  { y:1827, t:"Death of the poet and painter William Blake (12 August)", n:200 },
  { y:1827, t:"Death of Alessandro Volta, inventor of the electric battery (5 March)", n:200 },
  { y:1877, t:"Thomas Edison demonstrates the phonograph, the first machine to record and play back sound", n:150 },
  { y:1877, t:"The first Wimbledon Championships", n:150 },
  { y:1877, t:"Asaph Hall discovers Mars’s moons Phobos and Deimos (August)", n:150 },
  { y:1927, t:"Charles Lindbergh flies solo nonstop from New York to Paris (20–21 May)", n:100 },
  { y:1927, t:"The Jazz Singer premieres, the first feature film with synchronised dialogue (6 October)", n:100 },
  { y:1927, t:"Philo Farnsworth transmits the first all-electronic television image (7 September)", n:100 },
  { y:1927, t:"Heisenberg publishes the uncertainty principle", n:100 },
  { y:1927, t:"Georges Lemaître proposes that the universe is expanding", n:100 },
  { y:1927, t:"Carving begins on Mount Rushmore (4 October)", n:100 },
  { y:1927, t:"Fritz Lang’s Metropolis premieres in Berlin (January)", n:100 },
  { y:1927, t:"The BBC becomes the British Broadcasting Corporation under royal charter (1 January)", n:100 },
  { y:1952, t:"Accession of Queen Elizabeth II (6 February)", n:75 },
  { y:1977, t:"Star Wars opens in cinemas (25 May)", n:50 },
  { y:1977, t:"Launch of Voyager 2 (20 August) and Voyager 1 (5 September)", n:50 },
  { y:1977, t:"The Apple II personal computer goes on sale", n:50 },
  { y:1977, t:"Death of Elvis Presley (16 August)", n:50 },
  { y:2002, t:"Euro banknotes and coins enter circulation (1 January)", n:25 }
];
