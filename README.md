# Haze

Minimalist wallpapers, generated daily.

A cross-platform mobile wallpaper generator built with Ionic + React + Capacitor.
Seeded by the current date — same day, same wallpaper. No backend, no auth, fully offline.

---

## Getting Started

```bash
npm install
ionic serve      # or: npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Native Builds

### Add platforms (first time only)
```bash
npx cap add ios
npx cap add android
```

### Build and sync
```bash
npm run build
npx cap sync
```

### Open in Xcode (iOS)
```bash
npx cap open ios
```

### Open in Android Studio
```bash
npx cap open android
```

---

## Required Native Permissions

### iOS — `ios/App/App/Info.plist`
```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Haze saves generated wallpapers to your photo library.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Haze needs access to save wallpapers to your library.</string>
```

### Android — `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
  android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
  android:maxSdkVersion="28" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

---

## Plugin Install Reference

These are already in `package.json`. If reinstalling from scratch:

```bash
# Core
npm install @capacitor/filesystem
npm install @capacitor/haptics
npm install @capacitor/share

# Gallery save
npm install capacitor-community/media

# After installing any Capacitor plugin:
npx cap sync
```

---

## Gestures

- **Hard swipe down** on the wallpaper preview → regenerate (new seed variation)
  - Triggers `Haptics.impact({ style: ImpactStyle.Medium })` on native
  - Silently skipped on web

---

## File Structure

```
src/
  pages/
    Home.tsx              # Main screen
    Settings.tsx          # Re-exports SettingsSheet
  components/
    TopBar.tsx            # Wordmark + gear icon
    ActionBar.tsx         # Save to Photos | Set as Wallpaper
    ConfirmationBar.tsx   # Custom inline toast (black bar)
    StyleToggle.tsx       # Gradient / Color Blocks text tabs
    SettingsSheet.tsx     # IonModal bottom sheet
  generators/
    gradient.ts           # Smooth multi-stop gradients
    colorblocks.ts        # Mondrian flat colour grid
  hooks/
    useWallpaperGenerator.ts  # Style, seed, render logic
    useSwipeRefresh.ts        # Hard swipe detection + haptics
    useSaveWallpaper.ts       # Permissions + save + set wallpaper
  utils/
    seededRandom.ts       # mulberry32 PRNG + dateSeed()
    canvasExport.ts       # Web download + native gallery save + share
    platform.ts           # Capacitor.getPlatform() helpers
  data/
    quotes.ts             # Reserved
```

## Tech Stack
- Ionic 8 + React 19 + TypeScript
- Capacitor 8
- Canvas API — no graphics libraries
- Google Fonts: Source Sans Pro
