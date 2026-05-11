# Haze

Minimalist wallpapers, generated daily.

A cross-platform mobile app that generates beautiful wallpapers seeded by the current date — same day, same wallpaper. Two generation styles: smooth gradients and Mondrian-style color blocks. Supports saving to Photos, setting as wallpaper (Android), and saving favorites to the cloud.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Ionic 8 + React 19 + TypeScript |
| Build | Vite |
| Native | Capacitor 8 |
| Auth | Firebase Authentication (Google, Email/Password, Anonymous) |
| Database | Cloud Firestore |
| Graphics | Canvas API — no graphics libraries |
| Fonts | Source Sans Pro (Google Fonts) |
| Wallpaper generation | Custom seeded PRNG (`mulberry32`) + curated palettes |

---

## Features

- **Two wallpaper styles** — Gradient (26 curated palettes, linear + radial) and Color Blocks (22 curated Mondrian-style palettes)
- **Date-seeded** — same day always produces the same wallpaper; swipe down to generate a variation
- **Light / Dark / Auto palette** — follows OS preference or locked manually in Settings
- **Favorites** — heart any wallpaper to save it to your Firestore account; tap a favorite to reload it
- **Save to Photos** — Camera Roll on iOS, gallery album on Android
- **Set as Wallpaper** — native `WallpaperManager` on Android; instructions sheet on iOS (no public API exists on iOS)
- **Auth modes** — Google Sign-In, email/password, or guest (guests can generate and download; sign in to save favorites)

---

## Getting Started (Web)

```bash
nvm use 24          # or: export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
npm install
cp .env.example .env
# Fill in .env with your Firebase project values (see Environment Variables below)
npm run dev         # Vite dev server → http://localhost:5173
```

---

## Environment Variables

Create `.env` at the project root (it is gitignored):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Get these values from **Firebase Console → Project Settings → General → Your apps → haze-web**.

---

## iOS Setup

### Prerequisites
- macOS with Xcode installed
- CocoaPods: `sudo gem install cocoapods`

### First time
```bash
npm run build
npx cap add ios
npx cap sync
```

### Required native files
Place these files in `ios/App/App/` (download from Firebase Console → Project Settings):

- **`GoogleService-Info.plist`** — must have `BUNDLE_ID: com.haze.app`

### Google Sign-In — Info.plist URL scheme
`ios/App/App/Info.plist` must contain a `CFBundleURLSchemes` entry with the `REVERSED_CLIENT_ID` from `GoogleService-Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

### Build and run
```bash
npm run build && npx cap sync
npx cap open ios    # Opens Xcode → select simulator or device → Run
```

---

## Android Setup

### Prerequisites
- Android Studio with SDK Platform 34+
- Java 17+

### First time
```bash
npm run build
npx cap add android
npx cap sync
```

### Required native files
Place this file at `android/app/google-services.json` (download from Firebase Console → Project Settings → Android app with package `com.haze.app`).

### Google Sign-In — SHA-1 fingerprint
Google Sign-In on Android requires your signing fingerprint registered in Firebase Console:

```bash
# Debug fingerprint (for development)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the SHA-1 value → Firebase Console → Project Settings → Android app → **Add fingerprint** → download a fresh `google-services.json`.

For a release build, register your release keystore's SHA-1 the same way.

### Build and run
```bash
npm run build && npx cap sync
npx cap open android  # Opens Android Studio → Run
```

---

## App Icon & Splash Screen

Icons and splash assets are generated from source:

```bash
node scripts/generate-icons.cjs
npx cap sync
```

**Design:** Black `#000000` background, white pixelated H lettermark with corner notches (~23% padding on all sides). Splash adds the "haze" wordmark below the mark.

---

## Firestore Rules

Deploy rules from `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

Rules enforce that users can only read/write their own profile and favorites (`/users/{uid}/**`).

---

## Save to Photos

Uses `@capacitor-community/media` (v9.1.0, Capacitor 8).

- **iOS** — saves to Camera Roll; requests add-only permission on first save via `NSPhotoLibraryAddUsageDescription`
- **Android** — saves to a "Haze" album; uses `WRITE_EXTERNAL_STORAGE` (Android ≤ 9) and `READ_MEDIA_IMAGES` (Android 13+)

---

## Set as Wallpaper

### Android
Uses a custom Capacitor plugin (`WallpaperPlugin.java`) that calls `WallpaperManager.setBitmap()`. The `SET_WALLPAPER` permission is in `AndroidManifest.xml`.

### iOS
iOS has no public API to set wallpapers programmatically (as of iOS 18). Haze saves the image to Photos automatically, then shows a bottom sheet with manual instructions: Photos app → find image → Share → **Use as Wallpaper**.

---

## Gestures

- **Hard swipe down** on the wallpaper preview → regenerate (new seed variation)
  - Triggers `Haptics.impact({ style: ImpactStyle.Medium })` on native
  - Silently skipped on web

---

## Native Permissions

### iOS — `ios/App/App/Info.plist`

| Key | Purpose |
|-----|---------|
| `NSPhotoLibraryAddUsageDescription` | Saving wallpapers to Camera Roll |

### Android — `android/app/src/main/AndroidManifest.xml`

| Permission | Purpose |
|------------|---------|
| `INTERNET` | Firebase + web content |
| `WRITE_EXTERNAL_STORAGE` (maxSdk 29) | Gallery save on Android ≤ 9 |
| `READ_MEDIA_IMAGES` | Gallery save on Android 13+ |
| `SET_WALLPAPER` | WallpaperPlugin |

---

## Project Structure

```
src/
  pages/
    Auth.tsx              # Sign in / create account / guest
    Home.tsx              # Main wallpaper screen
    Favorites.tsx         # Saved favorites grid
    Settings.tsx          # Palette, account, sign out
  components/
    TopBar.tsx            # H mark + favorites + settings icons
    ActionBar.tsx         # Generate | Save | Set Wallpaper | Favorite
    ConfirmationBar.tsx   # Inline toast (black bar)
    StyleToggle.tsx       # Gradient / Color Blocks tabs
    WallpaperSheet.tsx    # iOS "set wallpaper" instruction sheet
  generators/
    gradient.ts           # 26 curated gradient palettes
    colorblocks.ts        # 22 curated Mondrian color block palettes
  hooks/
    useWallpaperGenerator.ts  # Style, seed, render logic
    useSwipeRefresh.ts        # Hard swipe detection + haptics
    useSaveWallpaper.ts       # Permissions + save + set wallpaper
    useFavorites.ts           # Firestore favorites CRUD
    useAuth.ts                # Auth context consumer
  context/
    AuthContext.tsx       # Firebase auth state + Firestore profile sync
  firebase/
    config.ts             # Firebase app init (reads from .env)
    auth.ts               # Auth methods (Google, email, guest, sign out)
    firestore.ts          # Favorites read/write helpers
  utils/
    seededRandom.ts       # mulberry32 PRNG + dateSeed()
    canvasExport.ts       # Download + native gallery save + share
    platform.ts           # Capacitor platform helpers
scripts/
  generate-icons.cjs      # Generates iOS + Android icons and splash PNGs
firestore.rules           # Firestore security rules
```

---

## Commands Reference

```bash
npm run dev           # Vite dev server (browser)
npm run build         # TypeScript + Vite build → dist/
npx cap sync          # Copy dist/ to native projects + update plugins
npx cap open ios      # Open Xcode
npx cap open android  # Open Android Studio
npm run lint          # ESLint
npm run test.unit     # Vitest unit tests
npm run test.e2e      # Cypress end-to-end tests
node scripts/generate-icons.cjs  # Regenerate all app icons and splash screens
firebase deploy --only firestore:rules  # Deploy Firestore security rules
```
