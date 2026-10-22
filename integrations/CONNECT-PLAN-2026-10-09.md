# Connect plan — every system Steven named on 2026-10-09 (what is real, what he does, what agents do)

Steven, 2026-10-09: connect Zoho and Lofty (he has API keys for both), Showami, ShowingTime, homes.com, CRMLS
(crmls.org), zipForms, SkySlope, Dotloop, Ticor Property Data (ticorpropertydata.com) and "more"; wire the second
brain to OmniRoute, FreeAPI, OpenRouter, APInation, Composio, CLI-Anything and API Anything.

**Rules that never bend (CLAUDE.md HALT list):** keys go into files on the Mac only (`~/.config/<tool>/.env`,
`chmod 600`) — never into chat, the repo, a dashboard or a routine prompt. Signing in, tick-boxes in an account,
licence/terms agreements and anything that spends money are Steven's hands. Everything below is **read-only** until
Steven says otherwise in writing. Client data (SkySlope, zipForms, Dotloop, Lofty, Zoho) never goes to a cloud
model: PII-fired requests route to the local model only (`integrations/omniroute/README.md`). The Claude
subscription never goes through OmniRoute.

Status words: **live** = a run proved it · **key** = Steven supplies a key/secret · **signin** = Steven signs in by
hand · **apply** = a licence/partner application only Steven (or his broker) can file · **none** = no public path found.

## 1. The two with keys

| System | Status | Steven does | Then agents do |
|---|---|---|---|
| **Lofty** | **live** since 2026-10-07 (54 leads sync). Gap: lead list returns no lead id, so speed-to-lead is not measurable. | Nothing for the key. Run the ISA-KPI paste once (it probes `lofty-cli leads timeline --v2`). | Verify the id field, write the field map, switch the Sunday KPI task to real numbers. |
| **Zoho CRM** | Composio connection active but every CRM call returned **403 `NO_PERMISSION` / `Crm_Implied_Api_Access`** (re-tested 2026-10-08). That is a **profile permission**, not a missing key. | (a) Zoho CRM → Setup → Security Control → Profiles → *your profile* → tick **Zoho CRM API Access**. (b) If the key you have is an OAuth **client id + client secret** (Zoho has no single "API key" for CRM v8): create a *Self Client* in the Zoho API Console with scopes `ZohoCRM.modules.ALL,ZohoCRM.settings.READ`, generate the refresh token, and put the five names below in `~/.config/zoho/.env` on the Mac. | Mint a one-hour token with `zoho/tools/mint-access-token.sh`, run `zoho selftest`, then `zoho-crm-sync` writes `zohoSync`, `zohoLeads`, `zohoDeals`. |

`~/.config/zoho/.env` names (values typed by Steven, never shown): `ZOHO_ACCOUNTS_URL`, `ZOHO_API_URL`,
`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`. The two URLs depend on Steven's Zoho data centre
(.com / .eu / .in …) — he reads it off the address bar of his Zoho login. `LOFTY_API_KEY` lives in
`~/.config/lofty/.env`.

## 2. Systems that hold client data or are licence-gated

| System | What exists today | Real path (sources) | Steven does | Agents do |
|---|---|---|---|---|
| **CRMLS** (crmls.org) | `cli-anything-harnesses/CRMLS-HALT.md`: **no scraper, by decision.** | Only sanctioned automated path is the **RESO Web API** under a data-licence agreement, normally filed by the **Broker Participant** (LPT Realty), via `licensing@crmls.org` then `api@crmls.org`. CRMLS also offers Matrix IDX links and licensed IDX vendors ([CRMLS IDX resources](https://go.crmls.org/idx-resources/)). | Ask LPT's broker to apply, or send the draft in §4 yourself. Needs LPT's brokerage DRE number and entity name (still blank). | Nothing until a feed exists; then a read-only RESO client (proposal only). |
| **SkySlope** | `skyslope/` harness, locked pending compliance sign-off. | Third-party setup guides say an **Access Key + Secret** are generated in SkySlope: *My Account → Integrations → Generate New Key*, with the same access as the user ([Drivetrain guide](https://integrations.drivetrain.ai/integration-guide/readme/others/integrating-with-skyslope)); partner credentials come from SkySlope's customer success team. Not verified against SkySlope's own docs. | Generate the key yourself only after Alexandra/ECC sign-off; type it into `~/.config/skyslope/.env`. | Read-only, **local model only** (it holds client files). |
| **zipForms** (Lone Wolf) | `zipforms/` harness, locked. | No public API found. Lone Wolf and SkySlope ended their partnership in 2019 ([Inman](https://inman.com/2019/08/19/lone-wolf-skyslope-dissolve-partnership)). Forms need a licence to be edited outside zipForms. | Ask Lone Wolf whether a partner/API programme exists; otherwise browser read-only after sign-in. | Browser recipe, locked until sign-off. |
| **Dotloop** | `dotloop/` harness (OAuth2, no write verbs); never run. | Dotloop Public API v2 is OAuth2; third-party sources say production access needs a **partner application and signed API licence**, not self-serve ([summary](https://supergood.ai/docs/dotloop-api)); register via info.dotloop.com/developers. Not verified against Dotloop's own docs. | Apply as a developer; then 3-legged consent once in the browser (`tools/exchange-auth-code.sh`). | Mint tokens, read-only loop/status list. |
| **Ticor Property Data** | Nothing built. | Account via your **Ticor Title Sales Executive or Customer Service**; products named on the site: Ticor Online Pro, Ticor Elite, Ticor Commercial Elite ([site](https://ticorpropertydata.com/)). **No API page found.** | Ask Ticor in one email whether an API or bulk export exists and under what terms (draft in §4). | Until then: manual lookups, or browser-use read-only on your own login if Ticor's terms allow (they have not been read). |

## 3. Showing and portal sites (no public API found)

| System | Path | Steven does |
|---|---|---|
| **ShowingTime** | No public API found; access normally runs through MLS agreements (CRMLS has a ShowingTime solutions page, [go.crmls.org/solutions/showingtime](https://go.crmls.org/solutions/showingtime)). Browser recipe in `showingtime/`, read-only. | Sign in by hand once in the agent Chrome; ask CRMLS/ShowingTime whether an integration is offered to agents. |
| **Showami** | No public API found. Browser recipe in `showami/`, read-only. | Sign in by hand once. |
| **homes.com** | Browser recipe in `homes/`, read-only, public pages. | Nothing beyond the terms review. |

All three: `integrations/cli-anything-harnesses/connect.sh` prints exactly which need a hand sign-in. Signing in
is never done by an agent.

## 4. Routers and tools (the second brain's wiring)

| Item | Decision / status | Steven does |
|---|---|---|
| **OmniRoute** | The one router. Local tier (Bonsai 27B) for PII; free fallback when Claude is rate-limited. Built, **not installed on the Mac**. | Run the bootstrap (it calls `omniroute/configure-omniroute.sh`); say yes to the local model download. |
| **FreeAPI** (`freellmapi`) | Recorded as **declined 2026-09-22** (`MAC-SETUP.sh` DECLINED_LIST): a second free-tier aggregator means a second egress path to audit. **Recommendation:** use its provider catalogue as reference and add free providers *behind OmniRoute*, not as a second router. Steven may override. | One word: "behind OmniRoute" or "override". |
| **OpenRouter** | Local MCP exists, **no key**. A key spends money per call. | Only if he wants outside models: create the key himself, set a hard monthly spend cap in OpenRouter, put `OPENROUTER_API_KEY` in `~/.config/openrouter/.env`. Default stays off. |
| **APInation** | **Could not identify it** (no search result for that name). | Send the URL (or the exact name) and I will assess it. |
| **Composio** | Connected apps listed in `CONNECTIONS.md`; Google Drive, GoHighLevel, Discord bot still *initiated, no account*. | Say "Composio links" when seated; sign in to each within 10 minutes. |
| **CLI-Anything** | Harnesses for homes, showami, showingtime, skyslope, zipforms, lofty, zoho, dotloop built; installed by `MAC-SETUP.sh --only cli-anything-harnesses`. | Part of the bootstrap. |
| **API Anything** | Cloud-proven, Mac install pending. FRED + Freddie Mac first; others per Steven's yes. | Part of the bootstrap. |

## 5. "And more" — proposed, public, read-only (Steven says yes per group)

FRED + Freddie Mac PMMS (rates; in progress) · FHFA conforming loan limits and HUD FHA limits (limits tables) ·
VA.gov loan-limit/funding-fee pages · county assessor/recorder lookups (Riverside, San Diego) · FEMA flood map
lookup · Census/ACS and BLS series for market context. Each needs its terms read once before an agent touches it.

## 6. Drafts only — nothing below has been sent

**To Ticor (send yourself):** "Hello — I am a California broker associate with a Ticor Property Data account.
Does Ticor offer an API or bulk export of property profiles for use in my own CRM? If yes, what are the terms,
fees and permitted uses? Thank you."

**To CRMLS (Broker Participant sends, or LPT's broker):** "We would like to apply for RESO Web API data access for
internal use by <brokerage entity name>, DRE <brokerage DRE>. Contact: <name>. Please send the licensing agreement
and fee schedule." — to `licensing@crmls.org` (per `CRMLS-HALT.md`). Needs the two blanks Steven still owes.
