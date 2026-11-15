# Sellbird for Steven Shearrill — partner prospecting

[Sellbird](https://github.com/ethanplusai/sellbird) (AGPL-3.0, formerly Harvey) is an open-source outreach app that runs on your own Mac through Claude Code on your Claude plan. It finds businesses that match your ideal customer, finds who decides, verifies the email address, writes a short personal sequence, sends from your mailbox and handles replies. By default every email waits in its Outbox for your approval.

Here it's configured for **business partners only**: real estate brokerages and agents, home builders, property managers, CPAs, financial advisors and estate-planning attorneys in Temecula, Murrieta, Menifee, Riverside, San Diego and Oceanside. **Don't use it to cold email consumers or borrowers.**

VANESSA has a page for it: **Growth & Ops → 🐦 Sellbird Outreach**. That page has the setup checklist, a config builder that downloads these same three files with your settings filled in, a launcher for Sellbird's private dashboard link, and an import for `sellbird export` CSVs.

## Files

| File | What it is |
|---|---|
| `sellbird.local.yaml` | Your complete Sellbird config: persona, offer, ICP and cities, sending limits, warmup, send window, compliance. It replaces Sellbird's default `sellbird.yaml`, and git never touches it. |
| `skills/email_rules.md` | The rules every email follows: business partners only, no rates/APR/payments/fees (Reg Z), no "guaranteed approval", no referral fees or gifts (RESPA §8), NMLS/DRE sign-off, short 3-email shape. |
| `install.sh` | Installs or updates Sellbird into `~/sellbird` with this config. Safe to re-run: if you've edited a config file, it keeps yours and saves VANESSA's version next to it as `*.vanessa`. |
| `embed.py` | Copies these files into VANESSA's page (`vanessa/app84.js`). Run it after editing any of them, then rebuild VANESSA. |

## Install (on the Mac)

```bash
brew install python@3.13          # if python3 --version is below 3.11
claude login                      # Sellbird thinks through Claude Code
git clone https://github.com/chitown034/Repo.git
bash Repo/sellbird-setup/install.sh
cd ~/sellbird && source .venv/bin/activate
```

Then:

1. **Get a sending mailbox on a separate domain** (a look-alike of patriotpacific.com, never the main one), with SPF, DKIM and DMARC. Warm it up for at least 3 weeks; [TrulyInbox](https://trulyinbox.com) is what Sellbird recommends.
2. **Fill `~/sellbird/.env`:**
   - `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET`, then run `sellbird gmail auth`.
   - `SERPER_API_KEY` (serper.dev, 2,500 free searches).
   - `REOON_API_KEY` (600 free verifications a month). Without a verifier, addresses stay "guess" and are never sent.
   - Optional: `sellbird precleared-key`.
3. **Fill `sellbird.local.yaml`:** `persona.email`, `offer.booking_url` (your TidyCal link; then set `booking_method: calendar_link`) and `warmup.start_date`. Or fill them in VANESSA and re-download the file.
4. `sellbird warmup` tells you whether the mailbox is ready.
5. `sellbird signals` shows what Sellbird proposes to look for on each business's website. Confirm the signals you want.
6. `sellbird discover --provider serper --estimate`, then run it without `--estimate`. Six cities × eight industries is about 72 searches, roughly $0.07, inside the free tier.
7. `sellbird dashboard --url` prints the private link. Paste it into VANESSA's Sellbird page to get a one-click launcher.
8. `sellbird run` starts the loop. Review and approve emails in the dashboard's Outbox.
9. Optional: `sellbird mcp install` lets your Claude Code sessions read Sellbird's pipeline and outbox, and pause sending.

`sellbird sending pause` stops all sending at once.

## Moving prospects into VANESSA

`sellbird export` writes `prospects.csv`: verified and catch-all addresses, with opt-outs excluded. Import it on VANESSA's Sellbird page to re-check emails, run Personalization Research on a partner, or put the top 10 on the board.

## Compliance built into this config

- `require_approval: true`: nothing sends without you.
- Business partners only. No rate, APR, payment or fee language. No government-affiliation wording. NMLS 2449246, CA DRE #01988316 and Patriot Pacific NMLS 1921615 on every email.
- RESPA §8: nothing of value is ever offered for referrals.
- CAN-SPAM: the office postal address and an opt-out line go on every cold email. Opt-outs are honored immediately, and Precleared checks each address before the first email.
- Deliverability: a 21-day warmup ramp, 20 cold emails a day once warm, sends only on weekdays 8:30–4:30 in the recipient's time zone, an automatic pause above 3% bounces, and LinkedIn automation off.
- Do-not-contact already includes patriotpacific.com and patriotpacificmlo.com. Add your current referral partners and any competitors.

## License

Sellbird is AGPL-3.0. It runs as its own app on your Mac, and this folder holds only your configuration, so nothing here copies Sellbird's code. If you ever modify Sellbird and offer it to others over a network, the AGPL requires sharing that modified source.
