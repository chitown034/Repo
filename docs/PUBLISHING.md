# Publishing to the App Store and Google Play

This app replaces the version already in both stores, so you upload it as an **update** to the
existing listings. The app IDs are unchanged on purpose:

| | ID |
| --- | --- |
| iPhone / iPad bundle ID | `com.activeduty.activedutyMobile` (team `FSUTAP9MFF`) |
| Android application ID | `com.active_duty.active_dutyMobile` |

Ready-to-paste listing text is in [`../store/LISTING.md`](../store/LISTING.md). Screenshots, the Play
icon and the Play feature graphic are in [`../store/`](../store).

Plan on about an hour per store the first time, plus Apple's review (usually 1 to 2 days) and
Google's review (from a few hours to a few days).

---

## 0. One-time setup

**Accounts**
- Apple Developer Program for the organization (the team that owns the current app). Nonprofits
  can apply for a fee waiver at developer.apple.com.
- Google Play Console account that owns the current Android app.

**On a Mac** (needed for iPhone; also works for Android)
1. Install **Xcode 26 or later** from the Mac App Store. Since April 28, 2026, Apple only accepts
   uploads built with Xcode 26 or later.
2. Open Xcode once, accept the license, and let it install its components.
3. Install **Flutter 3.50 or later**: https://docs.flutter.dev/get-started/install/macos
4. Install **Android Studio** (for the Android SDK): https://developer.android.com/studio
5. In Terminal, run the check below and fix anything it marks with a red X:

   ```bash
   flutter doctor
   ```

**Get the code**

```bash
git clone https://github.com/chitown034/Repo.git
```

```bash
cd Repo
```

```bash
git checkout claude/gracious-bardeen-n4iawi
```

(Once pull request #5 is merged you can stay on the default branch instead.)

```bash
flutter pub get
```

```bash
flutter test
```

All tests should pass.

---

## 1. Set the version number

Open `pubspec.yaml` and find the line `version: 2.0.0+20`.

- `2.0.0` is the version people see in the store.
- `20` is the build number. **It must be higher than the build number of the version that is live
  now** in both stores. Check it in App Store Connect (your app › TestFlight › builds) and in Play
  Console (your app › Test and release › App bundle explorer). If either is 20 or higher, change
  `+20` to one more than the highest, for example `+25`.

Every new upload needs a higher build number than the last one, even after a rejected upload.

---

## 2. Apple App Store

### 2a. Signing (once)
1. Open the iPhone project in Xcode:

   ```bash
   open ios/Runner.xcworkspace
   ```

2. In the left sidebar click **Runner**, then the **Runner** target, then **Signing & Capabilities**.
3. Tick **Automatically manage signing** and pick the organization's team under **Team**.
   The Bundle Identifier must read `com.activeduty.activedutyMobile`.
4. Close Xcode.

### 2b. Build

```bash
flutter build ipa --release
```

This creates `build/ios/archive/Runner.xcarchive` and an `.ipa` in `build/ios/ipa/`.

### 2c. Upload
Easiest way: open the archive in Xcode and upload it from there.

```bash
open build/ios/archive/Runner.xcarchive
```

In the Organizer window, choose **Distribute App** › **App Store Connect** › **Upload**, keep the
defaults, and click **Upload**. (Alternative: drag the `.ipa` into Apple's free **Transporter** app.)

The build appears in App Store Connect after 10 to 30 minutes of processing. You get an email when
it's ready. Export compliance is already answered in the app, so it won't ask about encryption.

### 2d. Test first (recommended)
In App Store Connect › your app › **TestFlight**, add yourself as an internal tester and install the
build with the TestFlight app on your iPhone. Check Pay It Forward (contacts prompt, picking
several friends, the Messages sheet), the Benefits Finder, and the Contact tab.

### 2e. Submit the update
In **App Store Connect** (appstoreconnect.apple.com) › **Apps** › your app:

1. Click **+** next to *iOS App* and enter version **2.0.0** (must match `pubspec.yaml`).
2. **What's New in This Version**, **Promotional Text**, **Description**, **Keywords**,
   **Support URL**: paste from `store/LISTING.md`.
3. **Screenshots**:
   - iPhone 6.9" display: upload the six files in `store/app-store/iphone-6.9/` (1320 × 2868).
   - iPad 13" display: upload the six files in `store/app-store/ipad-13/` (2064 × 2752). These are
     required because the app also runs on iPad.
4. **Build**: click **Add Build** and pick the one you uploaded.
5. **App Review Information**: no sign-in is needed, so leave the demo account empty. Paste the
   review notes from `store/LISTING.md` into **Notes**, and add your phone and email.
6. **App Privacy** (left sidebar): set the privacy policy URL to
   `https://chitown034.github.io/pay-it-forward/privacy.html`. Under data collection, answer
   **No, we do not collect data from this app**. Contacts are read only on the phone and never
   sent to you, and Apple's definition of "collect" means data sent off the device.
7. Click **Add for Review**, then **Submit for Review**.

Apple emails you when it's approved or if they have questions. If they ask about donations: the
Donate button opens your PayPal page in Safari, outside the app, which is how Apple asks
nonprofits to handle donation links.

**About the address:** App Store Connect may ask for "trader status" for the European Union. If you
declare yourself a trader, Apple shows your address on the EU App Store. A free app from a nonprofit
is often not a trader, but choose what's accurate for you. If you must declare, you can avoid
showing the address by turning off EU countries under **Pricing and Availability**.

---

## 3. Google Play

### 3a. Upload key (once)
Google Play only accepts updates signed with the app's **upload key**, the keystore file (`.jks`)
used for the current Android version.

- **If you have that keystore file**, create a file named `android/key.properties` (it stays on your
  computer and is never committed) with:

  ```
  storeFile=/full/path/to/your-upload-keystore.jks
  storePassword=YOUR_STORE_PASSWORD
  keyAlias=YOUR_KEY_ALIAS
  keyPassword=YOUR_KEY_PASSWORD
  ```

- **If the keystore is lost**: in Play Console › your app › **Test and release** › **Setup** ›
  **App signing**, check that Play App Signing is on, then use **Request upload key reset**. Make a
  new key with the command below, follow Google's steps, and then fill in `key.properties` as above.

  ```bash
  keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
  ```

  Keep the new `.jks` file and its passwords somewhere safe; you need them for every future update.

### 3b. Build

```bash
flutter build appbundle --release
```

This creates `build/app/outputs/bundle/release/app-release.aab`. The app targets Android 16
(API level 36), which Google Play requires for updates.

### 3c. Test first (recommended)
Play Console › your app › **Test and release** › **Testing** › **Internal testing** › **Create new
release**. Upload the `.aab`, add yourself as a tester, roll it out, and install it from the
opt-in link on your Android phone.

### 3d. Release to everyone
1. **Test and release** › **Production** › **Create new release**.
2. Upload `app-release.aab` (or promote the internal-testing release).
3. **Release notes**: paste from `store/LISTING.md`.
4. **Next** › fix anything listed › **Save** › **Go to overview** › **Send changes for review**.

### 3e. Store listing and app content
**Grow users** › **Store presence** › **Main store listing**:
- App name, short description, full description: from `store/LISTING.md`.
- App icon: `store/google-play/icon-512.png`.
- Feature graphic: `store/google-play/feature-graphic.png` (1024 × 500).
- Phone screenshots: the six files in `store/google-play/phone/`.

**Policy and programs** › **App content**, review each item:
- **Privacy policy**: `https://chitown034.github.io/pay-it-forward/privacy.html`
- **Data safety**: the app does **not** collect or share user data. Contacts are processed only on
  the device, and Google doesn't count on-device-only processing as collection. There are no
  accounts, ads, or analytics.
- **Ads**: No.
- **App access**: all functionality is available without special access.
- **Target audience**: 18 and over.
- **Content rating**: complete the questionnaire (reference app, no violence, no user-generated
  content, no purchases).
- **Financial features** (if asked): the app gives free education and calculators; it doesn't offer
  loans or financial services itself.

Google usually reviews updates within a few days.

---

## 4. Future updates

1. Refresh the app's content from the website:

   ```bash
   tool/content/refresh.sh
   ```

   (Needs `pip install beautifulsoup4` once.) It downloads every page, converts it, and reapplies
   the app's edits (no street address, no "Temecula" as the organization's location).

2. `flutter test`
3. Raise the build number in `pubspec.yaml`.
4. Repeat steps 2b to 2e (Apple) and 3b to 3d (Google).
