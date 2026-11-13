# Active Duty Veteran & Hometown Hero — mobile app (v2)

Flutter app for Android and iOS for Active Duty Veteran and Hometown Hero
Home-Owners Club, Inc. It brings everything on
[veteransresourcenetwork.org](https://www.veteransresourcenetwork.org) into a native app.

## Design

Apple Human Interface Guidelines throughout: large-title navigation bars that collapse and blur, an iOS tab bar,
inset-grouped lists with Settings-style icon badges, continuous-corner cards, wheel pickers, action sheets,
swipe-back navigation, and full dark mode. iPhones use the system font (San Francisco); Android uses Inter.
Shared components live in `lib/ui/apple.dart`.

## What's in the app

| Tab | Contents |
| --- | --- |
| **Home** | Hero, quick start guides, featured tools, housing help, videos, official sources, FAQs, Veterans Crisis Line, donate |
| **Benefits** | Native Benefits Finder: 2,345 federal/state/private benefits, filters, saved list, 52 state guides, VA phone numbers |
| **Resources** | All ~70 website guides (benefits, careers, interview prep, education, relocation, county resources) with search across 829 resources; includes Real Estate Careers (LPT) |
| **Tools** | VA loan payment, funding fee, BAH buying power, and combined VA rating calculators (same math as the website); Career Command Center; webinar registration; request forms |
| **Contact** | Call, email, message form, social links, About us, Board, Testimonials, and *Donate, Pay It Forward & settings* |

**Pay It Forward** (the referral feature from v1, renamed from Invite Friends): pick people from the
phone's contacts with multi-select, choose a pre-drafted intro (Default, Short, Family, Direct, or the original
seminar invite), then tap **Send**. Messages opens with a 3-way text for the first person (the friend, the sender,
and Steven at 619-368-7141); each time the user comes back to the app, the next person's text opens, until everyone
selected is done. Works the same on iPhone and Android. Logic is in `lib/logic/referral.dart`.

## App IDs (unchanged from v1 so the stores treat this as an update)

- Android `applicationId`: `com.active_duty.active_dutyMobile`
- iOS bundle ID: `com.activeduty.activedutyMobile` (team `FSUTAP9MFF`)
- Version: `2.0.0+20` in `pubspec.yaml`. The build number must be higher than the one live in
  Google Play / App Store Connect; raise it if needed.

## Build

Requires Flutter 3.50+.

```bash
flutter pub get
flutter test
flutter build appbundle          # Android → build/app/outputs/bundle/release/app-release.aab
flutter build ipa                # iOS (on a Mac with Xcode)
```

Android release signing reads `android/key.properties` (not committed):

```
storeFile=/path/to/upload-keystore.jks
storePassword=...
keyAlias=upload
keyPassword=...
```

## Updating content

Website content lives in `assets/content/site.json` (pages) and `assets/content/benefits.json`
(Benefits Finder). Both were generated from the live website; the Career Command Center tool is
`assets/tools/career_command_center.html`. Icons and the splash screen are generated from
`assets/branding/` with `dart run flutter_launcher_icons` and `dart run flutter_native_splash:create`.
