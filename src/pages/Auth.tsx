import React, { useState } from 'react';
import { IonPage, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest } from '../firebase/auth';
import { HazeMark } from '../components/TopBar';
import './Auth.css';

type Mode = 'landing' | 'signin' | 'signup';

const Auth: React.FC = () => {
  const history = useHistory();
  const [mode, setMode] = useState<Mode>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (action: () => Promise<unknown>) => {
    setError('');
    setLoading(true);
    try {
      await action();
      // Navigation is handled by the route condition in App.tsx (user && !isAnonymous → /home)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[Auth] sign-in error:', e);
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  // Guest sign-in creates an anonymous user which doesn't trigger the route guard,
  // so we navigate explicitly after success.
  const handleGuest = async () => {
    setError('');
    setLoading(true);
    try {
      await signInAsGuest();
      history.replace('/home');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[Auth] guest sign-in error:', e);
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => handle(signInWithGoogle);
  const handleEmailAuth = () =>
    handle(() =>
      mode === 'signup'
        ? signUpWithEmail(email, password)
        : signInWithEmail(email, password),
    );

  return (
    <IonPage className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <HazeMark size={64} />
          <span className="auth-logomark-text">haze</span>
        </div>
        <p className="auth-tagline">Minimalist wallpapers, generated daily.</p>

        {mode === 'landing' && (
          <div className="auth-actions">
            <button className="auth-btn auth-btn--google" onClick={handleGoogle} disabled={loading}>
              <GoogleIcon />
              Continue with Google
            </button>
            <button className="auth-btn" onClick={() => { setMode('signin'); setEmail(''); setPassword(''); setError(''); }} disabled={loading}>
              Sign in with Email
            </button>
            <button className="auth-btn auth-btn--ghost" onClick={() => { setMode('signup'); setEmail(''); setPassword(''); setError(''); }} disabled={loading}>
              Create Account
            </button>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <button className="auth-btn auth-btn--guest" onClick={handleGuest} disabled={loading}>
              {loading ? <IonSpinner name="crescent" /> : 'Continue as Guest'}
            </button>
            <p className="auth-guest-note">Guests can generate and download — sign in to save favorites.</p>
          </div>
        )}

        {(mode === 'signin' || mode === 'signup') && (
          <div className="auth-actions">
            <p className="auth-mode-label">{mode === 'signin' ? 'Sign In' : 'Create Account'}</p>
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-btn" onClick={handleEmailAuth} disabled={loading || !email || !password}>
              {loading ? <IonSpinner name="crescent" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
            <button className="auth-btn auth-btn--ghost" onClick={() => { setMode('landing'); setEmail(''); setPassword(''); setError(''); }}>
              Back
            </button>
          </div>
        )}
      </div>
    </IonPage>
  );
};

function friendlyError(msg: string): string {
  if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential'))
    return 'Invalid email or password.';
  if (msg.includes('email-already-in-use')) return 'An account with this email already exists.';
  if (msg.includes('weak-password')) return 'Password must be at least 6 characters.';
  if (msg.includes('invalid-email')) return 'Please enter a valid email.';
  if (msg.includes('popup-closed') || msg.includes('sign_in_cancelled') || msg.includes('canceled')) return 'Sign-in cancelled.';
  if (msg.includes('DEVELOPER_ERROR') || msg.includes('10:')) return 'Google Sign-In misconfigured (check console).';
  if (msg.includes('network') || msg.includes('Network')) return 'Network error. Check your connection.';
  return `Error: ${msg}`;
}

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default Auth;
