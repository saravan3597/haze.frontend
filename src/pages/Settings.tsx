import React, { useCallback, useState } from "react";
import { IonPage, IonAlert } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signOutUser } from "../firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { PalettePref } from "../hooks/useWallpaperGenerator";
import "./Settings.css";

const PALETTE_KEY = "haze_palette";
const PALETTE_OPTIONS: { value: PalettePref; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function loadPalette(): PalettePref {
  return (localStorage.getItem(PALETTE_KEY) as PalettePref) ?? "auto";
}

const Settings: React.FC = () => {
  const history = useHistory();
  const { user, isGuest } = useAuth();
  const [palette, setPalette] = useState<PalettePref>(loadPalette);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutAlert, setShowSignOutAlert] = useState(false);

  const handlePaletteChange = useCallback(
    async (p: PalettePref) => {
      setPalette(p);
      localStorage.setItem(PALETTE_KEY, p);
      window.dispatchEvent(
        new CustomEvent("hazepalette", { detail: { palette: p } }),
      );
      if (user && !isGuest) {
        try {
          await updateDoc(doc(db, "users", user.uid, "profile", "data"), {
            palette: p,
          });
        } catch {
          // non-blocking
        }
      }
    },
    [user, isGuest],
  );

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOutUser();
      history.replace("/auth");
    } finally {
      setSigningOut(false);
    }
  }, [history]);

  return (
    <IonPage className="settings-page">
      <header className="settings-header">
        <div className="settings-header__inner">
          <button
            className="settings-back-btn"
            onClick={() => history.goBack()}
            aria-label="Back"
          >
            <BackIcon />
          </button>
          <span className="settings-title-bar">Settings</span>
          <div style={{ width: 40 }} />
        </div>
      </header>

      <div className="settings-body">
        <section className="settings-section">
          <p className="settings-section-label">Account</p>
          {isGuest ? (
            <div className="settings-account-row">
              <p className="settings-account-name">Browsing as Guest</p>
              <p className="settings-account-email">
                Sign in to save your favorites
              </p>
              <button
                className="settings-signin-btn"
                onClick={() => history.push("/auth")}
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="settings-account-row">
              <p className="settings-account-name">
                {user?.displayName || "Haze User"}
              </p>
              <p className="settings-account-email">{user?.email}</p>
            </div>
          )}
        </section>

        <div className="settings-divider" />

        <section className="settings-section">
          <p className="settings-section-label">Palette</p>
          <div className="settings-palette-row">
            {PALETTE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                className={`settings-palette-btn${palette === value ? " settings-palette-btn--active" : ""}`}
                onClick={() => handlePaletteChange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {!isGuest && (
          <>
            <div className="settings-divider" />
            <section className="settings-section">
              <button
                className="settings-signout-btn"
                onClick={() => setShowSignOutAlert(true)}
                disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Sign Out"}
              </button>
            </section>
          </>
        )}

        <div className="settings-divider" />

        <section className="settings-section">
          <p className="settings-meta">Version 1.1.0</p>
          <p className="settings-meta">Haze — Minimalist wallpapers₹</p>
          <p className="settings-meta settings-meta--dim">
            By Minimalist. For Minimalists.
          </p>
        </section>
      </div>
      <IonAlert
        isOpen={showSignOutAlert}
        onDidDismiss={() => setShowSignOutAlert(false)}
        header="Sign out?"
        message="You will need to sign in again to access your favorites."
        buttons={[
          { text: "Cancel", role: "cancel" },
          {
            text: "Sign Out",
            role: "destructive",
            cssClass: "alert-btn-destructive",
            handler: handleSignOut,
          },
        ]}
      />
    </IonPage>
  );
};

const BackIcon: React.FC = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#111111"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default Settings;
