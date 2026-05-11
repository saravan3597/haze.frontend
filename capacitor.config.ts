import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.haze.app",
  appName: "Haze",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    GoogleAuth: {
      // iOS client ID — CLIENT_ID from GoogleService-Info.plist
      iosClientId:
        "871730441706-jgcm2l5chp6034vfchaia2igd0na1o9n.apps.googleusercontent.com",
      // Web client ID — used on Android and web to request the ID token for Firebase
      // (No separate Android OAuth client; serverClientId covers both)
      serverClientId:
        "871730441706-lpdamn85vrb24bqpqlrars5mr35i2akq.apps.googleusercontent.com",
      scopes: ["profile", "email"],
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
