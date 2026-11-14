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

**Pay It Forward** (the referral feature from v1, renamed from Invite Friends), with the same workflow as v1:
tap **Pay It Forward** (on Home, Tools, or Contact), allow contacts access, and the phone's contact list
appears with a checkbox on each person. Tick friends, choose a pre-drafted message (Default, Short, Family,
Direct, or the original seminar invite), and tap **Send**. Each friend gets their own 3-way text with the
sender and Steven (619-368-7141), with their first name filled in.

- iPhone: Apple's "New iMessage" sheet slides up inside the app (as in v1). As soon as one text is sent,
  the next friend's sheet opens. Cancel stops the run; the user can continue or skip that person.
- Android: the texting app opens with the group text ready; each time the user comes back to the app,
  the next friend's text opens.

The native pieces are in `ios/Runner/AppDelegate.swift` (`MessageComposerPlugin`, using MessageUI) and
`android/.../MainActivity.kt`; the Dart side is `lib/services/message_composer.dart` and
`lib/logic/referral.dart`. Neither platform lets an app send a text without the user tapping Send.

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
