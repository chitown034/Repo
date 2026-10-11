# Loan stack — connection status (written 2026-10-11)

Scope: the systems the three loan/real-estate task agents (`tax-assessor-agent`, `loan-pricing-agent`, and the
gated `reverse-engineering` capability) would touch. Nothing below was tested live from the build sandbox.
Auth types are described generically and are **verify with the vendor**; none are guessed. Every "Steven must do"
cell is a HALT item (credential, account change, terms, spend). Companion: `integrations/CONNECT-PLAN-2026-10-09.md`.

| System | What the agent would do | Auth type (generic) | Already in the repo | Steven must do (HALT items) | Risk / guardrail | Status |
|---|---|---|---|---|---|---|
| **ARIVE API** | Read a loan file's scenario/status to prefill the worksheet; never write | Unknown — verify with ARIVE | Nothing | Email ARIVE (draft below); accept any terms; create any key himself | Holds borrower PII: local model only; read-only first; no write-back | not started |
| **Zoho CRM** | Read mortgage pipeline for context (existing `zoho-crm-sync`) | Vendor-issued credentials (see connect plan) | `cli-anything-harnesses/zoho/`, skill `zoho-crm-sync`; last recorded state: 403 NO_PERMISSION (2026-10-08) | Tick the API access permission on his Zoho profile; put credentials in `~/.config/zoho/.env` | Client PII; no CRM writes | needs Steven |
| **Lofty** | Read lead context (existing `lofty-crm-sync`) | Vendor key | `cli-anything-harnesses/lofty/`, skill `lofty-crm-sync`; recorded live since 2026-10-07 | Nothing for the key; run the field-map probe once | Client PII; read-only | read-only ok |
| **SkySlope** | Read transaction/file status | Vendor key/secret (unverified) | `cli-anything-harnesses/skyslope/`, locked pending compliance sign-off | Alexandra/ECC sign-off, then generate key himself | Holds client files: local model only | needs Steven |
| **Dotloop** | Read loop status | OAuth-style (unverified) | `cli-anything-harnesses/dotloop/`, never run | Apply for developer access; consent in browser | Client files; production access terms unverified | needs Steven |
| **Ticor Property Data** | Property profile lookups | Account login; API unknown | Nothing built | Ask Ticor whether an API/export exists (draft in connect plan section 6) | Terms not read; no automated use until read | not started |
| **San Diego & Riverside county records** | Public assessor/recorder/tax-collector lookups (`tax-assessor-agent`) | None for public viewing (verify per page; logins/fees = stop) | This skill; browser tools (`integrations/browser-agents/`) | Approve a one-time terms read; decide if he wants the agent used | Public records only; no orders, no payments | read-only ok |
| **Optimal Blue / pricing engine** | None directly. Steven pulls rate and points himself and types them in | Account login (his/lender's) | Daily national-average rate feed only (not a lender quote) | Pull pricing himself; any API access is his/lender's decision | Rate quoting is a licensed act | not started |

## ARIVE
ARIVE offers integrations through its partner/API programme — confirm current access terms with ARIVE support
(https://www.arive.com). I cannot verify API availability or pricing from here.

**Draft email — NOT SENT:**
> Subject: API / integration access for my ARIVE account
> Hello ARIVE support — I am a licensed MLO (Patriot Pacific Financial) using ARIVE.
> Does ARIVE offer API or partner-programme access for read-only retrieval of my own loan files?
> If yes, what are the access terms, fees, security requirements and permitted uses?
> Please send the application steps. Thank you — Steven Shearrill

## Needs-Steven packet
1. Decide whether to email ARIVE. If yes, send the draft above yourself. Do not give anyone your ARIVE login.
2. Zoho: in Zoho CRM, open Setup, Security Control, Profiles, your profile, and tick the CRM API access permission. Then put the credentials in `~/.config/zoho/.env` on the Mac yourself.
3. SkySlope and Dotloop: ask Alexandra and Elena for a yes or no first. Only if yes, create the key or developer application yourself.
4. Ticor: send one email asking whether an API or bulk export exists and on what terms.
5. County records: say yes or no to read-only public lookups for San Diego and Riverside Counties. A one-time read of each site's terms comes first.
6. Pricing: keep pulling rate and points from your pricing engine or lender sheet and type them into the worksheet. The agents will not.
7. REA: no install until you say yes. If you want it, say which machine; it will run in a sandbox first.
8. Anything that spends money, needs a login by an agent, or sends to a client stays yours.
