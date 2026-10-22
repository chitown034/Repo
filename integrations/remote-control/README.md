# Remote Control agent (both Macs)

1. **What it does:** keeps one `claude remote-control` server running on the Mac (under `caffeinate -i`, restarted if it exits), so the Mac shows up as a session you can drive from claude.ai/code or the Claude phone app. No poller: one long-lived process, no scheduled runs, no usage burned while idle.
2. **One command per Mac** (run it on each Mac, from the Repo folder): `claude remote-control` once by hand (answer `y` to "Enable Remote Control?" and "Trust this directory?", then Ctrl+C), then `bash rc-agent.sh install` and answer `y`. Preview first with `--dry-run`. This is a script you run and confirm; nothing installs itself.
3. **Check it:** `bash rc-agent.sh doctor` (login, agent loaded, process alive, sleep settings, duplicate instances) and `bash rc-agent.sh status`.
4. **Open it:** Claude Code app or claude.ai/code -> session list -> the session named after the Mac (label from the computer name; override by putting a name on line 1 of `~/.config/claude-runner/id`). Phone: Claude app -> Code. `bash rc-agent.sh url` prints the direct link. `bash rc-agent.sh report` prints one JSON line to paste into the Command Deck Remote Control card.
5. **Claude Desktop:** the Desktop app is a separate process. In its Code tab type `/remote-control` (or Settings > Claude Code > "Connect new sessions to Remote Control") and that session appears in the same list. The agent here controls a Claude Code CLI session on the Mac; it does not drive the Desktop window itself.
6. **Turn off:** `bash rc-agent.sh stop` (off, stays off after login; `restart` brings it back) or `bash rc-agent.sh uninstall` (removes the LaunchAgent and state; logs in `~/Library/Logs/vanessa-remote-control/` are kept).

Subcommands: `install status url report restart stop uninstall doctor`; `--dry-run` works on all of them.

## Security note

A Remote Control session runs with the same power as a local Claude Code session on that Mac: files, shell, MCP connectors, the Keychain-backed tools. Whoever can open it can use all of it. What keeps it contained:

- It is tied to **Steven's own claude.ai login**; the session list is visible only when signed in to that account. Anthropic's docs describe all traffic as outbound TLS to the Anthropic API, with no inbound port opened on the Mac. Optionally turn on "Require trusted devices" in claude.ai settings so each new browser/phone must enroll after a full sign-in.
- The script grants **no extra permissions**: it passes only `--name`, no `--permission-mode`, no `--dangerously-skip-permissions`, no extra flags. Sessions start in the CLI's default permission mode, so tool prompts still appear (and are answerable from the phone).
- It reads no tokens or keys (login is checked with `claude auth status`), stores none, and `report`/the dashboard card carry only host name, label, link, and timestamps. A session link is useless without the signed-in account, but treat it as private anyway.
- The CLAUDE.md HALT list still binds a remote session: no client sends, no spending, no credentials.
- Stop or uninstall at any time; a lost phone: sign out other sessions in claude.ai and run `rc-agent.sh stop` on each Mac.

## To verify on the Mac (not checkable from the cloud container)

- That `claude remote-control` runs with no terminal attached under launchd and prints a `claude.ai` link. If it exits with a terminal error, add `RC_PTY=1` to the plist environment (wraps it in `/usr/bin/script`). Docs say a first-run prompt cannot be answered without a terminal, hence the manual first run.
- The exact output wording/URL shape (parsed generously: any `https://...claude.ai/...` link; if none, `report` leaves `url` empty and you find the session by name).
- Whether the server-mode session pre-created in the Repo folder keeps working across sleep/wake (docs: reconnects on wake; gives up and exits after ~10 minutes of no network, which the restart loop then repairs).
- `launchctl print` output field `pid =` on your macOS version (used for "alive"), and `pmset -g custom` layout.
- That `claude auth status` works the same on the Mac (it does in the Linux CLI 2.1.295).
- Whether two Macs on one account list cleanly side by side (names differ by label).

# Orca remote control (Mac A <-> Mac B, and the phone)

Script: `orca-remote.sh` (subcommands `serve pair status unpair report doctor`, `--dry-run` on all). Orca's own `orca serve` / `orca environment add` do the work; the script only adds guard rails.

1. **On the Mac to be controlled (A):** `bash orca-remote.sh serve`. Pick a home-LAN or Tailscale address from the list (public addresses are refused), answer `y`. It stays in the foreground and prints a pairing link to that terminal only. Add `--phone` for the phone QR/link.
2. **On the controlling Mac (B):** `bash orca-remote.sh pair`, type a name for A, answer `y`, paste the link at the hidden prompt. Then `orca --environment <name> status` (or any orca command with `--environment <name>`) runs against A.
3. **Both directions:** do steps 1-2 again with the roles swapped. `status` shows what is paired, `report` gives one JSON line for the dashboard card, `doctor` checks setup.
4. **Phone:** `serve --phone` on the Mac, scan the QR in the Orca iOS/Android app (the phone must reach that address: same Wi-Fi or Tailscale).
5. **Turn off / rotate:** Ctrl+C the `serve` terminal (stops the server and ends the offer). `unpair` removes a paired Mac on the controlling side. Re-run `serve` for a fresh link.
6. **Never** paste a pairing link into chat, the dashboard, a note or the repo. `doctor` flags any `orca serve` that is public or granted desktop control.

## Orca security note

- A pairing link is a **secret equal to remote control of that Mac's Orca agents**, and those agents run with his Claude and Codex subscriptions and the Mac's files. Treat it like a password.
- Pair only over the **home LAN or your own private network (Tailscale)**. Nothing relays through a cloud by default, and the script refuses public addresses, URL schemes and odd hosts.
- `--grant-desktop-control` (lets a paired client drive the Mac's screen and keyboard) is **never passed** and `serve` refuses it if you try. `doctor` flags a server somebody started with it by hand.
- The script prints the link only to an interactive terminal (it refuses if output is a file or pipe), never logs it, hides the paste prompt, does not echo it, and clears it after use. `report`, `status` and the card never contain links, codes or addresses.
- Known residual: Orca's CLI takes the code as an argument (`--pairing-code`), so for a moment it is visible in the process list of the same Mac to local users/processes. Do this on a Mac only you use.

## To verify on the Macs (Orca CLI help read in the cloud container, v1.4.214; not run against real Macs)

- Whether the Orca desktop app has its own "share this computer / paired servers" UI that replaces `orca serve` (and whether `orca serve` and the open app can run together or conflict over the port).
- Tailscale (installed, signed in, same tailnet on both Macs) and macOS's "allow incoming connections" firewall prompt on first `serve`.
- Shape of `orca environment list --json` (the script reads `"name"` fields; if the shape differs `report` shows an empty list, never a wrong one) and whether `orca status` exits non-zero when no runtime is up (drives `runtimeReachable`).
- Whether `serve` offers a link on every start or only with `--mobile-pairing`, whether stopping the server really invalidates an offer, and that the phone app pairs from the `--mobile-pairing` link.
- Whether `orca` (not only `orca-dev`) is on PATH on the Macs; set `ORCA_BIN=/path/to/orca` if not.
