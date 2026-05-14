import { Media } from '@capacitor-community/media';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNative, isAndroid } from './platform';

export const WALLPAPER_WIDTH = 1080;
export const WALLPAPER_HEIGHT = 1920;

function filename(): string {
  return `haze-${Date.now()}`;
}

/**
 * Save canvas to Photos / Camera Roll.
 * - Web: anchor download
 * - iOS: saves to Camera Roll via Media plugin (requests add-only permission on first save)
 * - Android: saves to "Haze" album via Media plugin
 */
export async function saveToPhotos(canvas: HTMLCanvasElement): Promise<void> {
  if (!isNative()) {
    saveWeb(canvas);
    return;
  }

  // Full data URI — Media plugin accepts this on both platforms
  const dataUri = canvas.toDataURL('image/png');

  if (isAndroid()) {
    // Android requires an albumIdentifier
    const { albums } = await Media.getAlbums();
    let album = albums.find(a => a.name === 'Haze');
    if (!album) {
      await Media.createAlbum({ name: 'Haze' });
      const { albums: refreshed } = await Media.getAlbums();
      album = refreshed.find(a => a.name === 'Haze');
    }
    await Media.savePhoto({
      path: dataUri,
      albumIdentifier: album!.identifier,
      fileName: filename(),
    });
  } else {
    // iOS: saves to Camera Roll; plugin requests add-only permission on first call
    await Media.savePhoto({ path: dataUri });
  }
}

/**
 * Share canvas for wallpaper intent — Android only.
 */
export async function shareForWallpaper(canvas: HTMLCanvasElement): Promise<void> {
  if (!isAndroid()) throw new Error('not-supported');
  const base64 = canvas.toDataURL('image/png').split(',')[1];
  const name = `${filename()}.png`;
  await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Cache });
  const { uri } = await Filesystem.getUri({ path: name, directory: Directory.Cache });
  await Share.share({ title: 'Set as Wallpaper', url: uri, dialogTitle: 'Set as Wallpaper' });
}

function saveWeb(canvas: HTMLCanvasElement): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
