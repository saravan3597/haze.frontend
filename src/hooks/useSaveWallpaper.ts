import { useState, useCallback } from 'react';
import { isNative, isIOS, isAndroid } from '../utils/platform';
import { saveToPhotos } from '../utils/canvasExport';
import { Wallpaper } from '../plugins/wallpaper';

export type SaveState =
  | { type: 'idle' }
  | { type: 'saving' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

function isPermissionError(e: unknown): boolean {
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return msg.includes('permission') || msg.includes('denied') || msg.includes('not authorized');
}

export function useSaveWallpaper(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [state, setState] = useState<SaveState>({ type: 'idle' });
  const [showIOSSheet, setShowIOSSheet] = useState(false);

  const showMessage = (type: 'success' | 'error', message: string) => {
    setState({ type, message });
    setTimeout(() => setState({ type: 'idle' }), 2800);
  };

  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setState({ type: 'saving' });
    try {
      await saveToPhotos(canvas);
      showMessage('success', 'Saved to Photos');
    } catch (e) {
      if (isPermissionError(e)) {
        showMessage(
          'error',
          isIOS()
            ? 'Photos access denied — enable in Settings → Privacy → Photos → Haze.'
            : 'Storage access denied — enable in Settings → Apps → Haze → Permissions.',
        );
      } else {
        showMessage('error', 'Save failed — please try again.');
      }
    }
  }, [canvasRef]);

  const handleSetWallpaper = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isIOS()) {
      // iOS can't set wallpapers programmatically.
      // Save to Photos first, then guide the user.
      setState({ type: 'saving' });
      try {
        await saveToPhotos(canvas);
      } catch (e) {
        if (isPermissionError(e)) {
          showMessage('error', 'Photos access denied — enable in Settings → Privacy → Photos → Haze.');
          return;
        }
        // Non-fatal: still show the sheet even if save failed
      } finally {
        setState({ type: 'idle' });
      }
      setShowIOSSheet(true);
      return;
    }

    if (isAndroid()) {
      setState({ type: 'saving' });
      try {
        const base64 = canvas.toDataURL('image/png').split(',')[1];
        await Wallpaper.setWallpaper({ base64 });
        showMessage('success', 'Wallpaper set!');
      } catch (e) {
        if (isPermissionError(e)) {
          showMessage('error', 'Permission denied — enable in Settings → Apps → Haze → Permissions.');
        } else {
          showMessage('error', 'Could not set wallpaper — please try again.');
        }
      }
      return;
    }

    // Web
    showMessage('error', 'Open on your phone to set as wallpaper.');
  }, [canvasRef]);

  return { state, handleSave, handleSetWallpaper, showIOSSheet, setShowIOSSheet };
}
