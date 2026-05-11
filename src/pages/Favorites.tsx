import React, { useCallback } from 'react';
import { IonPage, IonSpinner, IonAlert } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { draw as drawGradient } from '../generators/gradient';
import { draw as drawColorblocks } from '../generators/colorblocks';
import type { StyleId } from '../hooks/useWallpaperGenerator';
import type { ResolvedPalette } from '../hooks/useWallpaperGenerator';
import './Favorites.css';

const GENERATORS: Record<string, (canvas: HTMLCanvasElement, seed: number, palette: ResolvedPalette) => void> = {
  gradient: drawGradient,
  colorblocks: drawColorblocks,
};

const Favorites: React.FC = () => {
  const history = useHistory();
  const { isGuest } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites();
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const handleLoad = useCallback(
    (style: StyleId, seed: number, palette: ResolvedPalette) => {
      history.push('/home', { favoriteLoad: { style, seed, palette } });
    },
    [history],
  );

  return (
    <IonPage className="favorites-page">
      <header className="fav-header">
        <div className="fav-header__inner">
          <button className="fav-back-btn" onClick={() => history.goBack()} aria-label="Back">
            <BackIcon />
          </button>
          <span className="fav-title">Favorites</span>
          <div style={{ width: 40 }} />
        </div>
      </header>

      <div className="fav-content">
        {isGuest ? (
          <div className="fav-empty">
            <p className="fav-empty-text">Sign in to save and view your favorite wallpapers.</p>
            <button className="fav-signin-btn" onClick={() => history.push('/auth')}>
              Sign In
            </button>
          </div>
        ) : loading ? (
          <div className="fav-loading">
            <IonSpinner name="crescent" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="fav-empty">
            <p className="fav-empty-text">No favorites yet.</p>
            <p className="fav-empty-sub">Tap ♥ on the home screen to save a wallpaper.</p>
          </div>
        ) : (
          <div className="fav-grid">
            {favorites.map((fav) => (
              <div key={fav.id} className="fav-item">
                <button
                  className="fav-thumb-btn"
                  onClick={() => handleLoad(fav.style as StyleId, fav.seed, fav.palette as ResolvedPalette)}
                  aria-label={`Load ${fav.style} wallpaper`}
                >
                  <img
                    className="fav-thumb"
                    src={`data:image/jpeg;base64,${fav.thumbnailBase64}`}
                    alt=""
                    loading="lazy"
                  />
                </button>
                <button
                  className="fav-delete-btn"
                  onClick={() => setDeleteTarget(fav.id)}
                  aria-label="Remove favorite"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <IonAlert
        isOpen={!!deleteTarget}
        onDidDismiss={() => setDeleteTarget(null)}
        header="Remove Favorite"
        message="Remove this wallpaper from your favorites?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Remove',
            role: 'destructive',
            handler: () => {
              if (deleteTarget) removeFavorite(deleteTarget);
            },
          },
        ]}
      />
    </IonPage>
  );
};

const BackIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const TrashIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

export default Favorites;
