import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { app } from './config';

export const db = getFirestore(app);

export interface WallpaperData {
  style: string;
  seed: number;
  palette: string;
  resolution: string;
  thumbnailBase64: string;
}

export async function saveWallpaper(
  uid: string,
  wallpaperId: string,
  data: WallpaperData,
): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'favorites', wallpaperId), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await setDoc(
    doc(db, 'wallpapers', wallpaperId),
    { style: data.style, seed: data.seed, palette: data.palette, generatedAt: serverTimestamp(), saves: 1 },
    { merge: true },
  );
}

export async function getFavorites(
  uid: string,
): Promise<(WallpaperData & { id: string; createdAt: unknown })[]> {
  const snapshot = await getDocs(collection(db, 'users', uid, 'favorites'));
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() } as WallpaperData & { id: string; createdAt: unknown }),
  );
}

export async function deleteWallpaper(uid: string, wallpaperId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'favorites', wallpaperId));
}
