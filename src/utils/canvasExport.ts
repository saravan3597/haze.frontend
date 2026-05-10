import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNative, isAndroid } from './platform';

export const WALLPAPER_WIDTH = 1080;
export const WALLPAPER_HEIGHT = 1920;

function filename(): string {
  return `haze-${Date.now()}.png`;
}

/** Save canvas as PNG — web uses anchor download, native saves to gallery. */
export async function saveToPhotos(canvas: HTMLCanvasElement): Promise<void> {
  if (isNative()) {
    await saveNative(canvas);
  } else {
    saveWeb(canvas);
  }
}

/** Share canvas image for "Set as Wallpaper" — Android shares file, iOS throws UnsupportedError. */
export async function shareForWallpaper(canvas: HTMLCanvasElement): Promise<void> {
  if (!isAndroid()) {
    throw new Error('not-supported');
  }
  const base64 = canvas.toDataURL('image/png').split(',')[1];
  const name = filename();
  await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Cache });
  const { uri } = await Filesystem.getUri({ path: name, directory: Directory.Cache });
  await Share.share({
    title: 'Set as Wallpaper',
    url: uri,
    dialogTitle: 'Set as Wallpaper',
  });
}

function saveWeb(canvas: HTMLCanvasElement): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename();
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

async function saveNative(canvas: HTMLCanvasElement): Promise<void> {
  const base64 = canvas.toDataURL('image/png').split(',')[1];
  const name = filename();

  await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Cache });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { Media } = await (Function('return import("@capacitor-community/media")')() as Promise<any>);

  const albums = await Media.getAlbums();
  let album = (albums.albums as any[]).find((a: any) => a.name === 'Haze');
  if (!album) {
    album = await Media.createAlbum({ name: 'Haze' });
  }

  const { uri } = await Filesystem.getUri({ path: name, directory: Directory.Cache });
  await Media.savePhoto({ path: uri, albumIdentifier: album.identifier });
}
