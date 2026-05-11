import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  saveWallpaper,
  getFavorites,
  deleteWallpaper,
  WallpaperData,
} from '../firebase/firestore';
import type { StyleId } from './useWallpaperGenerator';
import type { ResolvedPalette } from './useWallpaperGenerator';

export interface Favorite extends WallpaperData {
  id: string;
  style: StyleId;
  palette: ResolvedPalette;
  seed: number;
  createdAt: unknown;
}

export function useFavorites() {
  const { user, isGuest } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(async () => {
    if (!user || isGuest) return;
    setLoading(true);
    try {
      const data = await getFavorites(user.uid);
      setFavorites(data as Favorite[]);
      setFavoriteIds(new Set(data.map((f) => f.id)));
    } finally {
      setLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addFavorite = useCallback(
    async (wallpaperId: string, data: WallpaperData): Promise<boolean> => {
      if (!user || isGuest) return false;
      await saveWallpaper(user.uid, wallpaperId, data);
      setFavorites((prev) => [
        { id: wallpaperId, ...data, createdAt: new Date() } as Favorite,
        ...prev,
      ]);
      setFavoriteIds((prev) => new Set([...prev, wallpaperId]));
      return true;
    },
    [user, isGuest],
  );

  const removeFavorite = useCallback(
    async (wallpaperId: string): Promise<void> => {
      if (!user) return;
      await deleteWallpaper(user.uid, wallpaperId);
      setFavorites((prev) => prev.filter((f) => f.id !== wallpaperId));
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(wallpaperId);
        return next;
      });
    },
    [user],
  );

  const isFavorited = useCallback(
    (wallpaperId: string) => favoriteIds.has(wallpaperId),
    [favoriteIds],
  );

  return { favorites, loading, addFavorite, removeFavorite, isFavorited, loadFavorites };
}
