# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node is managed via **nvm**. Prefix commands with `export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"` if node is not on PATH, or source nvm first.

```bash
# Development
npm run dev          # Vite dev server (browser)
ionic serve          # Ionic dev server with live reload

# Build
npm run build        # tsc + vite build → dist/

# Sync web build to native projects (run after every build)
npx cap sync

# Lint
npm run lint         # ESLint

# Tests
npm run test.unit           # Vitest (unit tests)
npx vitest run src/Foo.test.tsx  # Run a single unit test file
npm run test.e2e            # Cypress end-to-end tests

# Open native IDEs
npx cap open ios     # Opens Xcode
npx cap open android # Opens Android Studio
```

## Architecture

**Stack:** Ionic 8 + React 19 + TypeScript, built with Vite, native layer via Capacitor 8.

**Web → Native flow:**
1. `npm run build` compiles TypeScript and bundles to `dist/`
2. `npx cap sync` copies `dist/` into `ios/App/App/public/` and `android/app/src/main/assets/public/`, then updates native plugins
3. Open the native IDE to run on a device/simulator

**Routing:** Uses `react-router-dom` v5 wrapped in `IonReactRouter` + `IonRouterOutlet`. All routes are declared in `src/App.tsx`. Add new pages there.

**Theming:** CSS custom properties live in `src/theme/variables.css`. Dark mode is enabled via `dark.system.css` (follows OS preference). Override Ionic design tokens there.

**Native plugins available:** `@capacitor/app`, `@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/status-bar`. Add more with `npm install @capacitor/<plugin>` then `npx cap sync`.

**Key config files:**
- `capacitor.config.ts` — app ID (`com.haze.app`), app name, web dir
- `ionic.config.json` — project type (`react-vite`)
- `vite.config.ts` — Vitest config (jsdom environment, setupFiles at `src/setupTests.ts`)

**Testing setup:** Vitest with `@testing-library/react`. Unit test files use `.test.tsx` suffix alongside source files. Cypress tests are in `cypress/`.
