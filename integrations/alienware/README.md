# ALIENWARE setup (Windows)

One PowerShell script, `alienware-setup.ps1`, that **checks** and **installs** the AI tools on the ALIENWARE gaming PC:
Orca, Laya, and Bonsai 2 27B (the main parts), plus Ollama, AnyDesk and Tailscale (optional).

**Read this first:** the script was written in a Linux cloud sandbox. **It has never been run on Windows.** No PowerShell
was available there, so it was checked by reading it and by a static checker (`lint-ps1.py`), not by running it. The first
run on the ALIENWARE is the real test. That is why the safe mode (Doctor, then DryRun) comes first.

## What it will and will not do

- It asks **Y or N before every change**. Pressing Enter means No. Nothing changes unless you type `y`.
- It prints every command before it runs it.
- It never runs as administrator. A few installers (Git, AnyDesk, Tailscale) show Windows' own "allow this app to make
  changes" box. That box is Windows asking you, and it is normal.
- It never types, stores or logs a password, a sign-in code or an Orca pairing link.
- It does **not** set an AnyDesk password for you. It tells you the clicks and you do it yourself.
- It never downloads a script from the internet and runs it. (Bonsai's own setup has a fallback that does; the script installs
  `uv` first so that fallback is never used. See Risks.)

## Step by step

1. **Open PowerShell as a normal user.** Click Start, type `PowerShell`, click **Windows PowerShell**. Do **not** pick
   "Run as administrator".
2. **Get the folder onto the ALIENWARE.** Copy `integrations\alienware` from the Repo to the PC (git, OneDrive or a USB stick).
   If the file came from a browser download, Windows may block it. Paste this once to unblock it:
   `Unblock-File .\alienware-setup.ps1`
3. **Go to the folder.** Paste (change the path to wherever you put it):
   `cd $env:USERPROFILE\Repo\integrations\alienware`
4. **Allow scripts in this window only.** Windows blocks scripts by default. Paste this one line; it lasts only until you close
   this window and changes nothing permanent:
   `Set-ExecutionPolicy RemoteSigned -Scope Process`
5. **Look, change nothing (Doctor).** Paste:
   `.\alienware-setup.ps1`
   It reports your graphics card, memory, free disk space, and which of the five tools are installed. Read the GPU sentence: it
   tells you in plain words whether the 27B model fits on your graphics card or will run slower on the CPU.
6. **Preview the install (nothing happens).** Paste:
   `.\alienware-setup.ps1 -Action Install -DryRun`
7. **Install for real, one yes at a time.** Paste:
   `.\alienware-setup.ps1 -Action Install`
   To do just one part: `.\alienware-setup.ps1 -Action Install -Only Laya` (parts: Prereqs, Orca, Laya, Bonsai, Ollama, AnyDesk, Tailscale).
8. **Check again, then report.** Run step 5 again. To send the status to the Command Deck's Computer Hub card, paste:
   `.\alienware-setup.ps1 -Action Report`
   It prints **one line** of JSON. Copy that line into the card. It contains computer name, Windows version, graphics card name,
   memory, and the words `ok`, `missing` or `unverified` for each tool. No IP addresses, passwords or pairing codes.

A log of what the Install and Orca actions did goes to `%USERPROFILE%\ai\logs\alienware-setup-<date>.log`. It never contains
secrets (links and codes are scrubbed). Doctor, Report and `-DryRun` write no log.

## The five parts

| Part | What happens | Network / size |
|---|---|---|
| Prerequisites | winget installs Git, Node.js LTS, Python 3.11, uv; Visual C++ runtime only if missing | winget downloads (sizes not checked) |
| **Orca** | If `orca` is missing, the script **prints the official page** and offers to open it. It does not install Orca | none |
| **Laya** | Private Python environment `%USERPROFILE%\ai\laya-venv`, then `pip install "laya[serve,mcp]==0.3.21"`, then import test. The routing test runs only if the model files are already cached, or if you say yes to the Hugging Face download | pip: roughly 1-3 GB (not verified); model download size not verified |
| **Bonsai 2 27B** (main route) | Clones PrismML's Bonsai-demo into `%USERPROFILE%\ai\Bonsai-demo` pinned to one exact version, runs its `setup.ps1` with `BONSAI_MODEL=27B`, then starts its server. Listens on this PC only at **http://localhost:8080** | about 8 GB model plus programs (README says 7.8 GB for the weights) |
| Ollama (optional) | winget installs Ollama, pulls the community model `MichelRosselli/bonsai-27b`, runs a one-prompt test | size unknown; **community upload, unverified** |
| AnyDesk (optional) | winget installs it. Nothing else. You set the password yourself | small |
| Tailscale (optional) | winget installs it. You sign in yourself | small |

**Why Bonsai uses its own demo and not Ollama:** Bonsai's README says stock llama.cpp and Ollama cannot run Bonsai 2 files; it
ships a modified llama.cpp. So the demo is the main route and Ollama is a "maybe". If the Ollama test says the format is
unsupported, that is expected: use the demo route.

**Will it fit on my graphics card?** The 27B ternary model is about 6 GB of weights (README: 5.9 GB; the downloaded file is 7.8 GB
with its packing and vision part). The script wants roughly **8 GB of free video memory** for the GPU path. Less than that, or
no NVIDIA card, means the slower CPU path. The script reads this from Windows and from `nvidia-smi`; it never assumes.
Games and browsers use video memory, so close them first.

## Orca on Windows (serve and pair)

These mirror `integrations/remote-control/orca-remote.sh` (the Mac script) and use the same Orca commands
(`orca serve --pairing-address ...`, `orca environment add --name ... --pairing-code ...`). They are **not verified against a
Windows build of Orca**.

- Serve this PC (the other device pairs to it): `.\alienware-setup.ps1 -Action OrcaServe`
  Pick a home-network or Tailscale address from the list. **Public addresses are refused.** Add `-Phone` for the phone QR.
  The pairing link prints **only in that window**. It is a secret: whoever has it controls this PC's Orca agents. Press Ctrl+C
  to stop. Desktop control is never granted (`-GrantDesktopControl` is refused). If Windows asks about the firewall, allow
  **Private** networks only.
- Pair this PC to another server: `.\alienware-setup.ps1 -Action OrcaPair`. Type a name, answer `y`, paste the link at the
  hidden prompt (nothing shows while you paste). Known weakness, same as the Mac: the link is briefly visible to other
  programs on this PC as a command argument. Do this on a PC only you use.
- Add `-DryRun` to either to preview.

## Opening Bonsai afterwards

Start it again later: open PowerShell, paste
`cd $env:USERPROFILE\ai\Bonsai-demo` then `.\scripts\start_llama_server.ps1`, and browse to http://localhost:8080.
For a one-off question without the server: `.\scripts\run_llama.ps1 -p "What is the capital of France?"`.
(If scripts are blocked, paste the line from step 4 first in that window.)

## Undo (roll back)

Each item is independent. Copy only the line you want.

| Thing | Undo |
|---|---|
| Laya | `Remove-Item -Recurse -Force $env:USERPROFILE\ai\laya-venv` ; downloaded model files, if any: `$env:USERPROFILE\.cache\huggingface\hub\models--convaiinnovations--laya` |
| Bonsai | Close the server window. Then delete the folder `%USERPROFILE%\ai\Bonsai-demo` (this removes the 8 GB model too) |
| Ollama | `ollama rm MichelRosselli/bonsai-27b` then `winget uninstall --id Ollama.Ollama` |
| AnyDesk | First remove your unattended-access password in AnyDesk Settings, then `winget uninstall --id AnyDesk.AnyDesk` |
| Tailscale | Log out from its tray icon, then `winget uninstall --id Tailscale.Tailscale` |
| Orca pairing | `orca environment rm <name>` ; stop a running server with Ctrl+C |
| Git / Node / Python / uv | `winget uninstall --id Git.Git` (or `OpenJS.NodeJS.LTS`, `Python.Python.3.11`, `astral-sh.uv`). Other programs may use them |
| Logs | Delete `%USERPROFILE%\ai\logs` |

## What is verified, and what is not

| Verified (in the cloud sandbox) | Not verified |
|---|---|
| `laya==0.3.21` exists on PyPI and has the `serve` and `mcp` extras (pip metadata read) | Any of the PowerShell actually running on Windows 10/11 or Windows PowerShell 5.1 |
| Bonsai-demo `setup.ps1`, `run_llama.ps1`, `start_llama_server.ps1` read; port 8080, `BONSAI_MODEL=27B`, loopback default, pinned release tag inside the setup | Bonsai on your GPU: download sizes, speed, whether it fits |
| The pinned Bonsai-demo commit is the one read in the sandbox | That the CUDA build works with your driver (the setup needs CUDA 12.4 or newer driver; older falls back to CPU) |
| Orca commands and guard rails copied from `orca-remote.sh` | Orca's Windows install route and Windows CLI; the exact `winget` id for the Visual C++ runtime (`Microsoft.VCRedist.2015+.x64`) |
| Static checks: balanced braces/quotes, ASCII only, no PowerShell 7-only syntax, no dynamic code | `MichelRosselli/bonsai-27b` existing on Ollama; AnyDesk menu wording on your version |
| | huggingface.co and ollama.com were unreachable from the sandbox |

## Top risks

1. **Never run on Windows.** Expect a small error or two on first run. Doctor and DryRun are harmless; paste any error back.
2. **Big downloads and disk.** Bonsai alone is 8+ GB; Laya's libraries are GBs. The script wants 25 GB free.
3. **Third-party code.** Bonsai-demo and its llama.cpp programs come from PrismML on GitHub and run on your PC. The script pins
   the repo to one commit, but the setup downloads binaries by its own pinned tag. Bonsai's setup has a fallback that downloads
   and runs an internet script if `uv` is missing; this script installs `uv` first to avoid it.
4. **Remote access is control.** An Orca pairing link and an AnyDesk unattended password each mean full control of the PC. Keep
   them out of chat, the dashboard and the repo. Use Tailscale or the home network, never the public internet.
5. **GPU fit is a guess until measured.** The 8 GB rule is a rule of thumb. If Windows shows the card low on free memory, Bonsai
   will be slow or fail; use the CPU path or close games.

## Files in this folder

`alienware-setup.ps1` (the script) | `lint-ps1.py` (static checker: `python3 lint-ps1.py`) |
`test-alienware-docs.sh` (checks for secrets, forbidden patterns, public IPs; also runs the linter and the AnyDesk tests).
AnyDesk link helper: `integrations/anydesk/`.
