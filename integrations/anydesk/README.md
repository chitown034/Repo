# AnyDesk links

`anydesk-links.py` turns a **local** list of your devices (label + AnyDesk ID) into `anydesk:` deep links, a markdown table,
and one JSON blob for the dashboard. It stores and prints **no passwords**. Python 3 standard library only.

## Setup (one time)

1. Copy `devices.example.json` to `~/.config/anydesk-links/devices.json` (on Windows: `%USERPROFILE%\.config\anydesk-links\devices.json`).
   The real file stays **out of the repo**; the script refuses a devices file inside the repo.
2. Replace the fake IDs (`000 000 000`) with your real ones. The ID is the number on AnyDesk's main screen ("This Desk").
   Labels used here: Mac 1, Mac 2, Alienware, iPad, Phone. Only `label` and `id` are allowed; any other key is rejected.
3. On Mac/Linux: `chmod 600 ~/.config/anydesk-links/devices.json`.

## Use

```
python3 anydesk-links.py                # label + link per device
python3 anydesk-links.py table          # markdown table
python3 anydesk-links.py json           # one JSON line for the dashboard: labels, ids, links only
python3 anydesk-links.py open Alienware # open the link (AnyDesk must be installed; add --dry-run to preview)
python3 anydesk-links.py check          # validate the file
```

Tests: `python3 -m unittest -q test_anydesk_links` (IDs with non-digits are rejected; a file with a key named like
password, pwd, secret or token is refused).

## What AnyDesk can and cannot do (stated plainly)

- AnyDesk's desktop client supports the **`anydesk:` URI scheme** (`anydesk:123456789`) and a **command line**:
  `AnyDesk.exe <id> --with-password` reads a password from standard input. That is per AnyDesk's published documentation as
  known when this was written; **not re-verified in the build sandbox, and not tested on Steven's devices.**
- **This repo never stores, pipes or prints a password**, including an unattended-access password. The `anydesk:` link only
  opens a connection; AnyDesk itself then asks for approval or the password. Do not put passwords in `devices.json`.
- AnyDesk also has a **paid REST API** for address-book and session management. It needs Steven's AnyDesk licence and API
  credentials, so it is a **Needs-Steven item** (credential plus account change). Nothing here calls it.
- **iPad and iPhone:** they are controlled FROM using the AnyDesk app. Whether a controlled iOS device can be operated or is
  view-only depends on AnyDesk's current rules (the repo's understanding is view-only unless AnyDesk says otherwise).
  **Verify in AnyDesk's current docs; not verified here.**

## Install AnyDesk on every computer (2026-10-22)

Official sources only. AnyDesk is free for personal use; nothing below buys a licence. **No step sets a password or
turns on unattended access** — that is Steven's, typed into AnyDesk itself on the machine being reached.

| Computer | Install | Then (Steven's clicks) |
|---|---|---|
| **Mac 1, Mac 2** | `bash connect-all.sh` step 6d: Homebrew cask `anydesk` (it downloads `https://download.anydesk.com/anydesk.dmg`, checked 2026-10-22). No Homebrew → `https://anydesk.com/en/downloads/mac-os`. The step opens AnyDesk and prints this Mac's ID in the report. | System Settings → Privacy & Security → **Screen Recording** → AnyDesk on, and **Accessibility** → AnyDesk on; quit and reopen AnyDesk. Optional: AnyDesk → Settings → Security → unlock → unattended access → type your own password. |
| **Alienware PC (Windows)** | PowerShell: `winget install --id AnyDeskSoftwareGmbH.AnyDesk -e --source winget` — **winget id unverified** (the winget catalogue could not be reached from the build sandbox; `integrations/alienware/alienware-setup.ps1` uses `AnyDesk.AnyDesk`, which disagrees). Run `winget search AnyDesk` first and use the Id whose Publisher is *AnyDesk Software GmbH*. No winget → `https://anydesk.com/en/downloads/windows`. | Allow it through the Windows Defender prompt if asked. Optional unattended password, as above. |
| **iPad / tablet** | App Store: search **AnyDesk Remote Desktop** (publisher AnyDesk Software GmbH). Android tablet: Google Play, same name and publisher. | Use it to reach the Macs and the PC. Being *controlled* from an iPad/iPhone is view-only/screen-share per AnyDesk's iOS rules (verify in AnyDesk's docs). |
| **Phone** | iPhone: App Store; Android: Google Play — **AnyDesk Remote Desktop** by AnyDesk Software GmbH. | Android may ask to install the AnyDesk control plugin to be controlled; your tap. |

Then put each device's ID (the 9–10 digit number on AnyDesk's main screen — an address, not a secret) into the
Computer Hub card (Command Deck → Toolkit & Remote Access, panel 40) or `~/.config/anydesk-links/devices.json`.

## Setting an unattended-access password (Steven does this himself)

In AnyDesk on that device: menu (three lines) > Settings > Security > Unlock Security Settings > turn on unattended access and
type a long unique password. Keep it in a password manager. Menu wording varies by version (not verified here). The Windows
setup script (`integrations/alienware/`) prints these clicks but never sets the password.

## Dashboard use

`python3 anydesk-links.py json` prints a blob like
`{"kind":"anydeskLinks","generatedAt":"...","devices":[{"label":"Mac 1","id":"000 000 000","link":"anydesk:000000000"}]}`.
An AnyDesk ID is not a secret on its own, but anyone who knows it can *ask* to connect, so keep the real list private.
