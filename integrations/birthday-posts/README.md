# Birthday posts — a branded card for every birthday, every day (built 2026-11-01)

Steven, 2026-11-01: *"enable claude to go through facebook daily to everyone's birthday on my friends list … create a
template from canva similar to the image attached with Happy Birthday, their name, my branding, their photo … and post
daily automatically to each person's facebook wall."*

What is built does the whole job that Meta's rules allow, and says plainly where it stops. Owner: Sofia (marketing),
Derek (automation), Alexandra (advertising compliance). Nothing here reads Facebook.

## What Facebook allows (checked 2026-11-01)

| Wish | Reality | What the system does instead |
|---|---|---|
| Read the friends list with birthdays and profile photos | **Not available.** Graph API v2.0 (2014) removed friends' data; `user_friends` returns only friends who also use the same app, and no permission returns a friend's birthday or photo. Collecting it by automation (a bot logging in as Steven, a scraper) is barred by Meta's Terms ("You may not access or collect data from our Products using automated means") and gets accounts disabled. | Steven exports his own birthday calendar once (Facebook › Events › Birthdays with the *Birthday Calendar Exporter* extension → `birthday-calendar.ics`), or pastes names + dates from Lofty / Zoho / his phone. The list lives in the Command Deck's private database (`state/birthdayList`), never in this public repo. Photos are only ones the person gave him (a Lofty contact photo, a client photo) — never pulled from a profile. |
| Post on a **friend's** timeline | **Not available since 2014.** | The card and caption are texted to Steven's own phone each morning; he taps, pastes, posts (10 seconds each). |
| Post on **Steven's personal** timeline automatically | **Not available since 2018** (`publish_actions` removed). | Same tap-to-post delivery. |
| Post on his **Facebook Page** automatically | **Allowed** (`pages_manage_posts`). His Page *Steven Shearrill - LPT Realty and MLO Patriot Pacific* is connected through Composio (account `facebook_hoon-belone`). | Cards whose row says `channel: page` or `both` are published to the Page by the daily routine **once `autoPostPage` is true** in `state/birthdayPosts` (default false — a public post is a client-facing send, so it is Steven's yes). |

Sources: Meta Terms of Service §3.2 (automated collection), Meta's 2018-04-24 platform changes post (`publish_actions`),
the Graph API v2.0 changelog (friends). Vendor pages and dates are in the session notes of 2026-11-01.

## The pieces

| File | Does |
|---|---|
| `template.html` | The card: gold-and-black balloon cluster, gold star/ribbon confetti, cream gradient, script "Happy Birthday", warm-gray band with the person's name in white serif capitals, the photo bottom-left, Steven's licence lines underneath (CA DRE #01988316 · NMLS #1921615 — the advertising rule needs both). Fonts are bundled (`fonts/`, all SIL Open Font License: Great Vibes, Cinzel, Montserrat). |
| `brand.json` | Name, the two brand lines, optional logo files (`logo_left`, `logo_right` — drop in LPT / Patriot Pacific PNGs to replace the text), colours, caption template, default photo. |
| `render.js` | `node render.js job.json` → 1080×1080 PNG through the installed Playwright Chromium. Fonts, photo and logos are inlined, so a render is identical on the Mac and in the cloud and needs no network. Deterministic confetti per name. |
| `birthdays.py` | Reads the list (CSV and/or the Facebook `.ics` export), finds today's birthdays (Feb 29 → Feb 28 in a non-leap year, de-duplicated), writes one job per person and `out/<date>/queue.json`; `--render` makes the PNGs. Stdlib only; 9 tests in `tests/`. |
| `samples/` | `sample-card.png` (the rendered proof, Steven's own name and photo), `reference-design.jpg` (the post he sent), `steven-headshot-sample.jpg`. |
| `birthdays.example.csv` | The list format: `name,birthday,photo,channel,note`. `birthday` = `YYYY-MM-DD`, `MM-DD` or `MM/DD[/YYYY]`; `channel` = `personal` (default) · `page` · `both`. |

```bash
python3 -m unittest -q integrations.birthday-posts.tests.test_birthdays      # from the repo root
python3 integrations/birthday-posts/birthdays.py --csv my-list.csv --ics birthday-calendar.ics --date 2026-11-01 --render
```

## The daily routine — "Birthday cards (daily, this session)"

Cloud routine, 9:17 AM PT, bound to the Claude Code session that built this (a fresh-session routine carries no repo and
no connectors). Each run:

1. Reads `state/birthdayList` and `state/birthdayPosts` from the Command Deck (ArtifactData). Empty list → writes
   `lastRun` and stops.
2. Writes the list to a temporary CSV **outside the repo**, runs `birthdays.py --render` for today (Pacific date).
3. For every card: **personal** → stages the PNG with Inkbox and texts it with the caption to Steven's own number
   (the same channel the morning brief uses; never to anyone else). **page / both** → if `autoPostPage` is true,
   commits the PNG under `integrations/birthday-posts/published/<date>/` (public repo → a public raw URL Facebook can
   fetch) and calls Composio `FACEBOOK_CREATE_PHOTO_POST` on the Page with the caption; otherwise it is texted to Steven
   like a personal card and listed as "awaiting your yes".
4. Writes `state/birthdayPosts.lastRun` + `lastQueue` (name, channel, status, post id) so the Command Deck and the
   Broker Command Center can show the day's cards, and appends one line per posted card to `state/birthdayLog`.
5. Never scrapes, never logs in to Facebook, never posts to a personal or a friend's timeline, never posts to the Page
   without `autoPostPage: true`, never writes a phone number or e-mail anywhere.

## Canva

The request named Canva. Two things exist there now:

- A generated on-brand Facebook-post design (brand kit `kAGdzymuEqA`) was added to Steven's Canva account on
  2026-11-01 as an editable starting point (design `DAHZtNow20k`, edit link https://www.canva.com/d/VRMt7pNGnyE6YIr). Canva's **autofill** (name + photo fields filled
  by API every day) needs the design turned into a **Brand Template** with tagged data fields — a Canva Teams feature
  done once in the Canva editor (Share → Publish as Brand Template) or with the `create-brand-template-draft` /
  `publish-brand-template` tools; `search-brand-templates` found none on 2026-11-01.
- Until that exists, `render.js` is the daily engine (free, deterministic, identical output on every machine) and the
  Canva design is the hand-editable version. If Steven prefers Canva as the engine: publish the brand template, note
  its id in `brand.json` as `canva_brand_template_id`, and the routine switches to `autofill-design` + `export-design`.

## Steven's three steps

1. **The list.** Export once (Chrome extension *Birthday Calendar Exporter for Facebook* → `birthday-calendar.ics`), then
   say "load my birthday calendar" with the file, or paste names and dates. Add `photo` only where the person gave you
   the photo. Everything else stays empty; the card without a photo is the one in `samples/` with the band only.
2. **Page posting.** Say "post birthdays to my Page" to flip `autoPostPage` — until then every card comes to your
   phone only.
3. **Logos.** Drop the LPT Realty and Patriot Pacific PNGs into this folder and name them in `brand.json`
   (`logo_left`, `logo_right`); the text lines stay as the fallback.
