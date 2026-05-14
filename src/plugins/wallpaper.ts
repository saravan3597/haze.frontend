import { registerPlugin } from '@capacitor/core';

export interface WallpaperPlugin {
  setWallpaper(options: { base64: string }): Promise<{ success: boolean }>;
}

/**
 * Custom Capacitor plugin — Android only.
 * Uses WallpaperManager to set the device wallpaper from a base64 PNG.
 * On iOS this plugin is not registered; the JS layer detects iOS and shows
 * a bottom sheet with manual instructions instead.
 */
const Wallpaper = registerPlugin<WallpaperPlugin>('Wallpaper');

export { Wallpaper };
