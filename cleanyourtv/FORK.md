# This fork

A copy of [Gathin23/cleanyourtv](https://github.com/Gathin23/cleanyourtv) (MIT, imported at upstream commit
`34e1c42`) with a redesigned launcher. Everything upstream documents still applies: `PROMPT.md` cleans the TV and
`launcher/build-and-install.sh` installs the launcher.

## What's new in the launcher

| Feature | What it does | Key |
|---|---|---|
| **Search** | A magnifier pill at the start of the top bar, the remote's Search key, or a letter typed on a paired keyboard opens a full-screen search. Type on the tvOS-style letter row, and installed apps line up as tiles, best match first. The ranking works like Spotlight: an exact name first, then names that start with what you typed, words that start with it, initials (`yt` finds YouTube, `pv` Prime Video), any substring, and finally the letters in order. Accents and case are ignored. With nothing typed it shows the apps you opened most recently. | `spotlight_search` |
| **Control Center** | A pill before Settings slides in a smoked-glass sheet over Home or a playing app. It shows the time, the date and whether you're on Wi-Fi or Ethernet, plus a 3×3 grid of tiles: Picture, Sound, Network, Bluetooth, Inputs, Screensaver, Search, Home settings and system Settings. | `control_center` |
| **Parallax** | The tile that takes focus leans a few degrees in the direction focus moved, then springs back flat, the way tvOS tiles react to the remote. | `tile_parallax` |
| **Sheen** | A soft band of light sweeps once across a tile as it takes focus. | `tile_sheen` |

Upstream's `advanced_effects` (a deeper focus zoom and a lifted tile) is **on by default** here, because parallax and
sheen depend on it. On a TV whose GPU struggles, turn it off in the launcher's own Settings screen, or set
`reduced_motion` to true. That stops all of the motion above, while Search and Control Center keep working.

All four keys default to `true` in `launcher/app/src/main/res/values/config.xml`. You can turn any of them off
there, or in a theme's `config.json` (see `themes/README.md`). None of them adds a permission, network access or a
background service. Search reads only the package manager, and the Control Center tiles only open standard
settings screens.

The new text is in English. Other languages fall back to English until those strings are translated in
`launcher/app/src/main/res/values-*/strings.xml`.

## Getting the APK

Each push that touches `cleanyourtv/launcher/` runs `.github/workflows/cleanyourtv-launcher.yml`. It runs the JVM
unit tests, lint and a release build, then uploads `app-release.apk` as the `cleanyourtv-launcher-apk` artifact
of that run. The size gate is 512 KB. Upstream's is 480 KB, but upstream builds at 470 KB and the redesign adds
about 22 KB. To build it yourself, follow `launcher/build-and-install.sh` as
upstream does.

## Install it on your TV

This has to run from a computer on the same Wi-Fi as the TV. First, on the TV: Settings → Device Preferences → About
→ press OK on **Build** seven times. Then go back to Developer options and turn on **USB debugging** (and Network/ADB
debugging if the TV has it).

- **The full clean-up (recommended):** clone this repo on that computer, open Claude Code in `cleanyourtv/`, and
  paste `PROMPT.md` with your TV model filled in. It backs up the TV, asks you which apps to keep, disables the
  ads and bloat (never uninstalls), then builds and installs this launcher as Home.
- **Only the launcher:** with JDK 17 and the Android SDK (platform 34, build-tools 34.0.0) installed, run:

  ```sh
  cd cleanyourtv
  python3 -m venv tools/venv && tools/venv/bin/pip install -r tools/requirements.txt
  TV_HOST=<tv ip> launcher/build-and-install.sh
  ```

  Accept "Allow USB debugging?" on the TV when it asks. The script makes the launcher Home and only then turns off
  the stock home screen. `tools/restore.sh` undoes everything.

When it's done, turn USB and network debugging back off on the TV. Port 5555 is unencrypted.

Each launcher change is also installed on an Android TV emulator (API 30) by
`.github/workflows/cleanyourtv-tv-emulator.yml`. It walks Home, Search (from the button, from typing, and its
results) and Control Center with remote keys, fails on a crash or a screen that didn't open, and uploads the
screenshots as `tv-screenshots`.
