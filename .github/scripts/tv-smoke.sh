#!/usr/bin/env bash
# Installs the CleanYourTV launcher on the Android TV emulator, makes it Home, and walks it with remote keys:
# Home, a few focus moves (parallax and sheen), Search (pill and type-to-search), Control Center.
# Screenshots go to tv-shots/. Fails if the launcher crashes or a screen it should open is not in front.
set -u
APK=cleanyourtv/launcher/app/build/outputs/apk/release/app-release.apk
PKG=com.gathin.tvhome
OUT=tv-shots
mkdir -p "$OUT"
fail=0

key() { for k in "$@"; do adb shell input keyevent "$k"; sleep 0.6; done; }
shot() { adb exec-out screencap -p > "$OUT/$1.png"; echo "shot $1: $(front)"; }
front() { adb shell dumpsys activity activities | grep -m1 -E 'mResumedActivity|topResumedActivity' | sed 's/^ *//'; }
expect() {
  local want="$1" step="$2" now
  now=$(front)
  if echo "$now" | grep -q "$want"; then echo "OK   $step -> $want"; else echo "FAIL $step: expected $want, got: $now"; fail=1; fi
}

adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; do sleep 2; done
adb shell getprop ro.build.version.release
adb install -r "$APK" || { echo "FAIL install"; exit 1; }
# The same order as launcher/build-and-install.sh: prove the activity starts, retire the stock launcher (disabled,
# never uninstalled; this is a throwaway emulator), then make ours the Home preference and confirm it resolves.
adb shell am start -W -a android.intent.action.MAIN -c android.intent.category.HOME -n "$PKG/.MainActivity"
STOCK=$(adb shell cmd package query-activities --brief -a android.intent.action.MAIN -c android.intent.category.HOME \
  | tr -d '\r' | grep '/' | grep -v "$PKG" | cut -d/ -f1 | sort -u)
for p in $STOCK; do [ "$p" = com.android.tv.settings ] || adb shell pm disable-user --user 0 "$p"; done
adb shell cmd package set-home-activity --user 0 "$PKG/.MainActivity"
echo "Home resolves to: $(adb shell cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.HOME | tail -n 1)"
adb logcat -c
adb shell input keyevent KEYCODE_HOME
sleep 8
expect "$PKG/.MainActivity" "Home"
shot 01-home

# Focus moves along the dock: the tile leans and the sheen sweeps (caught mid-flight, then settled).
adb shell input keyevent KEYCODE_DPAD_RIGHT; sleep 0.15; shot 02-move-midflight
sleep 1.5; shot 03-move-settled
key KEYCODE_DPAD_DOWN; sleep 1; shot 04-grid

# Search through the pill: up to the top bar, all the way left to the magnifier, OK.
key KEYCODE_DPAD_UP KEYCODE_DPAD_UP
key KEYCODE_DPAD_LEFT KEYCODE_DPAD_LEFT KEYCODE_DPAD_LEFT KEYCODE_DPAD_LEFT KEYCODE_DPAD_LEFT KEYCODE_DPAD_LEFT KEYCODE_DPAD_LEFT
shot 05-search-pill-focused
key KEYCODE_DPAD_CENTER; sleep 2
expect "$PKG/.SearchActivity" "Search pill"
shot 06-search-empty
adb shell input text "se"; sleep 1.5
shot 07-search-typed
key KEYCODE_DPAD_DOWN; sleep 1
shot 08-search-result-focused
key KEYCODE_BACK; sleep 2
expect "$PKG/.MainActivity" "Back from Search"

# Control Center: right to the end of the top bar (Settings), one back left, OK.
key KEYCODE_DPAD_UP KEYCODE_DPAD_UP
key KEYCODE_DPAD_RIGHT KEYCODE_DPAD_RIGHT KEYCODE_DPAD_RIGHT KEYCODE_DPAD_RIGHT KEYCODE_DPAD_RIGHT KEYCODE_DPAD_RIGHT KEYCODE_DPAD_RIGHT KEYCODE_DPAD_RIGHT
key KEYCODE_DPAD_LEFT
shot 09-control-pill-focused
key KEYCODE_DPAD_CENTER; sleep 2
expect "$PKG/.ControlCenterActivity" "Control Center pill"
shot 10-control-center
key KEYCODE_DPAD_RIGHT; sleep 0.8
shot 11-control-center-moved
key KEYCODE_BACK; sleep 2
expect "$PKG/.MainActivity" "Back from Control Center"

# Type-to-search from Home: a letter on a keyboard opens Search with it typed in.
key KEYCODE_DPAD_DOWN KEYCODE_DPAD_DOWN
adb shell input keyevent KEYCODE_S; sleep 2
expect "$PKG/.SearchActivity" "Typing on Home"
shot 12-type-to-search
key KEYCODE_BACK; sleep 1

echo "---- crashes ----"
if adb logcat -d -b crash | grep -B2 -A30 "$PKG"; then echo "FAIL the launcher crashed"; fail=1; else echo "none"; fi
adb logcat -d | grep -E "AndroidRuntime|$PKG" | grep -iE "exception|error" | head -40
exit $fail
