#!/usr/bin/env node
/**
 * Haze — Icon & Splash Generator
 *
 * Design:
 *   • Black (#000000) background
 *   • Bold white geometric H lettermark — two thick vertical bars + crossbar,
 *     clean and minimal (Unsplash-style bold mark on black)
 *
 * Usage:
 *   node scripts/generate-icons.cjs
 *
 * Requires: sharp  (npm install --save-dev sharp)
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// ---------------------------------------------------------------------------
// SVG source — uses a 0 0 100 100 viewBox, scaled via width/height
// ---------------------------------------------------------------------------

function iconSvg(size) {
  // Pixelated H mark — 6-row × 9-col block grid in a 100×100 viewBox.
  // Each block is 6 wide × 5 tall. Mark spans x=23–77, y=35–65
  // giving ~23% breathing room on every side.
  //
  // Grid (. = empty, # = filled, cols 0-8 at x=23,29,35…71, rows 0-5 at y=35,40,45…60):
  //   . # . . . . . # .   row 0 y=35 — corner notch
  //   # # . . . . . # #   row 1 y=40
  //   # # # # # # # # #   row 2 y=45  ┐ crossbar (10 units tall)
  //   # # # # # # # # #   row 3 y=50  ┘
  //   # # . . . . . # #   row 4 y=55
  //   . # . . . . . # .   row 5 y=60 — corner notch
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#000000"/>
  <!-- Left bar: notch (col 1), body top (cols 0-1), body bottom, notch -->
  <rect x="29" y="35" width="6"  height="5"  fill="white"/>
  <rect x="23" y="40" width="12" height="5"  fill="white"/>
  <rect x="23" y="55" width="12" height="5"  fill="white"/>
  <rect x="29" y="60" width="6"  height="5"  fill="white"/>
  <!-- Right bar: mirror (cols 7-8, col 7 starts at x=65) -->
  <rect x="65" y="35" width="6"  height="5"  fill="white"/>
  <rect x="65" y="40" width="12" height="5"  fill="white"/>
  <rect x="65" y="55" width="12" height="5"  fill="white"/>
  <rect x="65" y="60" width="6"  height="5"  fill="white"/>
  <!-- Full-width crossbar (rows 2-3, x=23 to x=77) -->
  <rect x="23" y="45" width="54" height="10" fill="white"/>
</svg>`;
}

function splashSvg(size) {
  // Same pixelated H mark at 38% scale, centred at (50, 38) — small and clean.
  // Uses the same rect coordinates as iconSvg (x=23–77, y=35–65).
  // "haze" wordmark sits close below.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#000000"/>
  <!-- H mark at 38% scale, centred at (50, 38) -->
  <g transform="translate(50 38) scale(0.38) translate(-50 -50)">
    <rect x="29" y="35" width="6"  height="5"  fill="white"/>
    <rect x="23" y="40" width="12" height="5"  fill="white"/>
    <rect x="23" y="55" width="12" height="5"  fill="white"/>
    <rect x="29" y="60" width="6"  height="5"  fill="white"/>
    <rect x="65" y="35" width="6"  height="5"  fill="white"/>
    <rect x="65" y="40" width="12" height="5"  fill="white"/>
    <rect x="65" y="55" width="12" height="5"  fill="white"/>
    <rect x="65" y="60" width="6"  height="5"  fill="white"/>
    <rect x="23" y="45" width="54" height="10" fill="white"/>
  </g>
  <!-- haze wordmark, close below the mark -->
  <text
    x="50" y="53"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-weight="700"
    font-size="5.5"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
    letter-spacing="1.2">haze</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// Size tables
// ---------------------------------------------------------------------------

const IOS_ICON_DIR = path.join(
  __dirname,
  "../ios/App/App/Assets.xcassets/AppIcon.appiconset",
);
const IOS_SPLASH_DIR = path.join(
  __dirname,
  "../ios/App/App/Assets.xcassets/Splash.imageset",
);

const ANDROID_RES = path.join(__dirname, "../android/app/src/main/res");

const IOS_ICON_SIZES = [
  // iOS 16+ universal: just one 1024×1024
  { size: 1024, filename: "AppIcon-512@2x.png" },
];

const ANDROID_ICON_SIZES = [
  { density: "mdpi", size: 48 },
  { density: "hdpi", size: 72 },
  { density: "xhdpi", size: 96 },
  { density: "xxhdpi", size: 144 },
  { density: "xxxhdpi", size: 192 },
];

// Adaptive icon foreground (same sizes, larger canvas so mark has padding)
const ANDROID_FG_SIZES = [
  { density: "mdpi", size: 108 },
  { density: "hdpi", size: 162 },
  { density: "xhdpi", size: 216 },
  { density: "xxhdpi", size: 324 },
  { density: "xxxhdpi", size: 432 },
];

const IOS_SPLASH_SIZES = [
  { scale: "1x", filename: "splash-2732x2732-2.png", size: 2732 },
  { scale: "2x", filename: "splash-2732x2732-1.png", size: 2732 },
  { scale: "3x", filename: "splash-2732x2732.png", size: 2732 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function writePng(svgString, outputPath) {
  await sharp(Buffer.from(svgString)).png().toFile(outputPath);
  console.log("  ✓", path.relative(path.join(__dirname, ".."), outputPath));
}

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------

async function run() {
  console.log("\n── iOS App Icon ──────────────────────────────────────────");
  fs.mkdirSync(IOS_ICON_DIR, { recursive: true });

  for (const { size, filename } of IOS_ICON_SIZES) {
    await writePng(iconSvg(size), path.join(IOS_ICON_DIR, filename));
  }

  // Write Contents.json
  const contentsJson = {
    images: IOS_ICON_SIZES.map(({ filename }) => ({
      filename,
      idiom: "universal",
      platform: "ios",
      size: "1024x1024",
    })),
    info: { author: "xcode", version: 1 },
  };
  fs.writeFileSync(
    path.join(IOS_ICON_DIR, "Contents.json"),
    JSON.stringify(contentsJson, null, 2),
  );
  console.log("  ✓ Contents.json updated");

  // ── Android icons ────────────────────────────────────────────────────────
  console.log("\n── Android App Icon ──────────────────────────────────────");

  for (const { density, size } of ANDROID_ICON_SIZES) {
    const dir = path.join(ANDROID_RES, `mipmap-${density}`);
    fs.mkdirSync(dir, { recursive: true });
    // Round launcher icon (same design, sharp will render the SVG as-is)
    await writePng(iconSvg(size), path.join(dir, "ic_launcher.png"));
    await writePng(iconSvg(size), path.join(dir, "ic_launcher_round.png"));
  }

  // Adaptive foreground — transparent background, mark only
  for (const { density, size } of ANDROID_FG_SIZES) {
    const dir = path.join(ANDROID_RES, `mipmap-${density}`);
    fs.mkdirSync(dir, { recursive: true });
    const fgSvg = iconSvg(size).replace('fill="#000000"', 'fill="none"');
    await writePng(fgSvg, path.join(dir, "ic_launcher_foreground.png"));
  }

  // ic_launcher_background color (already in colors.xml if it exists, but
  // write a backup drawable XML so the adaptive icon always has a bg)
  const bgXmlPath = path.join(
    ANDROID_RES,
    "drawable",
    "ic_launcher_background.xml",
  );
  fs.mkdirSync(path.dirname(bgXmlPath), { recursive: true });
  if (!fs.existsSync(bgXmlPath)) {
    fs.writeFileSync(
      bgXmlPath,
      `<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android">\n    <solid android:color="#000000" />\n</shape>\n`,
    );
    console.log("  ✓ ic_launcher_background.xml created");
  }

  // ── iOS Splash ───────────────────────────────────────────────────────────
  console.log("\n── iOS Splash Screen ────────────────────────────────────");
  fs.mkdirSync(IOS_SPLASH_DIR, { recursive: true });

  for (const { filename, size } of IOS_SPLASH_SIZES) {
    await writePng(splashSvg(size), path.join(IOS_SPLASH_DIR, filename));
  }

  // ── Android Splash ───────────────────────────────────────────────────────
  console.log("\n── Android Splash Drawable ──────────────────────────────");
  const androidSplashDir = path.join(ANDROID_RES, "drawable");
  fs.mkdirSync(androidSplashDir, { recursive: true });

  // Generate a 1080×1920 splash PNG for Android
  await writePng(
    splashSvg(1080),
    path.join(androidSplashDir, "splash_img.png"),
  );

  console.log("\n✅  All assets generated.\n");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
