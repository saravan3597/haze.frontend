import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonPage, IonSpinner, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { SplashScreen } from '@capacitor/splash-screen';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import FavoritesViewer from './pages/FavoritesViewer';
import Settings from './pages/Settings';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './theme/variables.css';

setupIonicReact();

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  // Hide the native splash screen once auth state is resolved
  useEffect(() => {
    if (!loading) {
      SplashScreen.hide().catch(() => {/* web — no-op */});
    }
  }, [loading]);

  if (loading) {
    return (
      <IonPage>
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <IonSpinner name="crescent" />
        </div>
      </IonPage>
    );
  }

  return (
    <IonRouterOutlet>
      <Route exact path="/auth">
        {user && !user.isAnonymous ? <Redirect to="/home" /> : <Auth />}
      </Route>
      <Route exact path="/home">
        {user ? <Home /> : <Redirect to="/auth" />}
      </Route>
      <Route exact path="/favorites">
        {user ? <Favorites /> : <Redirect to="/auth" />}
      </Route>
      <Route exact path="/favorites-viewer">
        {user ? <FavoritesViewer /> : <Redirect to="/auth" />}
      </Route>
      <Route exact path="/settings">
        {user ? <Settings /> : <Redirect to="/auth" />}
      </Route>
      <Route exact path="/">
        <Redirect to={user ? '/home' : '/auth'} />
      </Route>
      <Route>
        <Redirect to={user ? '/home' : '/auth'} />
      </Route>
    </IonRouterOutlet>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <AppRoutes />
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
