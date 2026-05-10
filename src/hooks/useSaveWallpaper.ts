import { useState, useCallback } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { isNative, isIOS, isAndroid } from '../utils/platform';
import { saveToPhotos, shareForWallpaper } from '../utils/canvasExport';

export type SaveState =
  | { type: 'idle' }
  | { type: 'saving' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export function useSaveWallpaper(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [state, setState] = useState<SaveState>({ type: 'idle' });

  const showMessage = (type: 'success' | 'error', message: string) => {
    setState({ type, message });
    setTimeout(() => setState({ type: 'idle' }), 2200);
  };

  const checkPermissions = useCallback(async (): Promise<boolean> => {
    if (!isNative()) return true;
    try {
      let result = await Filesystem.checkPermissions();
      if (result.publicStorage !== 'granted') {
        result = await Filesystem.requestPermissions();
      }
      if (result.publicStorage !== 'granted') {
        showMessage(
          'error',
          'Photo library access denied. Enable it in Settings → Haze → Photos.',
        );
        return false;
      }
      return true;
    } catch {
      return true; // non-blocking on web
    }
  }, []);

  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setState({ type: 'saving' });
    const ok = await checkPermissions();
    if (!ok) return;
    try {
      await saveToPhotos(canvas);
      showMessage('success', 'Saved to Photos');
    } catch {
      showMessage('error', 'Save failed — please try again.');
    }
  }, [canvasRef, checkPermissions]);

  const handleSetWallpaper = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isIOS()) {
      // iOS doesn't allow apps to set wallpapers directly
      showMessage(
        'error',
        'Save to Photos first, then set from the Photos app.',
      );
      return;
    }

    if (isAndroid()) {
      setState({ type: 'saving' });
      const ok = await checkPermissions();
      if (!ok) return;
      try {
        await shareForWallpaper(canvas);
        setState({ type: 'idle' });
      } catch {
        showMessage('error', 'Could not open share sheet.');
      }
      return;
    }

    // Web
    showMessage('error', 'Open on your phone to set as wallpaper.');
  }, [canvasRef, checkPermissions]);

  return { state, handleSave, handleSetWallpaper };
}
