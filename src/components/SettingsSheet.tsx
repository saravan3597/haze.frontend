import React from 'react';
import { IonModal, IonContent } from '@ionic/react';
import { PalettePref } from '../hooks/useWallpaperGenerator';
import './SettingsSheet.css';

const APP_VERSION = '1.0.0';

interface Props {
  isOpen: boolean;
  onDismiss: () => void;
  palette: PalettePref;
  onPaletteChange: (p: PalettePref) => void;
}

const PALETTE_OPTIONS: { value: PalettePref; label: string }[] = [
  { value: 'auto',  label: 'Auto'  },
  { value: 'light', label: 'Light' },
  { value: 'dark',  label: 'Dark'  },
];

const SettingsSheet: React.FC<Props> = ({ isOpen, onDismiss, palette, onPaletteChange }) => (
  <IonModal
    isOpen={isOpen}
    onDidDismiss={onDismiss}
    initialBreakpoint={0.55}
    breakpoints={[0, 0.55]}
    handle
  >
    <IonContent className="settings-content">
      <div className="settings-body">
        <h2 className="settings-title">Settings</h2>

        <section className="settings-section">
          <p className="settings-label">Palette</p>
          <div className="settings-palette-row">
            {PALETTE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                className={`settings-palette-btn${palette === value ? ' settings-palette-btn--active' : ''}`}
                onClick={() => onPaletteChange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <div className="settings-divider" />

        <section className="settings-section">
          <p className="settings-meta">Version {APP_VERSION}</p>
          <p className="settings-meta">Haze — Minimalist wallpapers, generated daily.</p>
          <p className="settings-meta settings-meta--dim">Made with Claude</p>
        </section>
      </div>
    </IonContent>
  </IonModal>
);

export default SettingsSheet;
