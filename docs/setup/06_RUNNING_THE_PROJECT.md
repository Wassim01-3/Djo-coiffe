# Running the Project

This document explains the various scripts available in the `package.json` and how to test different aspects of the application.

## 1. Development Mode
To start the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
**What happens:** Starts a local server at `http://localhost:5173`. Any changes to React components will instantly reflect in the browser without a full reload.

## 2. Production Build
To generate the optimized production bundles:
```bash
npm run build
```
**What happens:** 
1. `tsc -b`: TypeScript compiler performs strict type-checking. If there are any TS errors, the build fails.
2. `vite build`: Compiles, minifies, and chunks the code into the `dist/` folder. It also generates the PWA Service Worker (`sw.js`).

## 3. Preview Production Build
To test the generated production build locally:
```bash
npm run preview
```
**What happens:** Starts a local server serving the contents of the `dist/` folder. This is crucial for testing Service Workers, as Service Workers are disabled in `npm run dev`.

## 4. Capacitor (Android)
If you want to test the native Android wrapper:
1. Ensure you have built the web app first:
   ```bash
   npm run build
   ```
2. Sync the web assets (`dist/`) into the Android project:
   ```bash
   npm run cap:sync
   ```
   **What happens:** Copies `dist/` into `android/app/src/main/assets/public/` and updates native Android dependencies.
3. Open Android Studio:
   ```bash
   npm run cap:android
   ```
   **What happens:** Opens the `android/` directory in Android Studio where you can run the emulator or build the APK.

## 5. Storybook (UI Library)
To view the isolated UI components:
```bash
npm run storybook
```
**What happens:** Starts Storybook at `http://localhost:6006`. Use this to test Buttons, Cards, and Dialogs outside of the main application state.

---
**Next Step:** For native mobile deployment, proceed to [07_ANDROID_SETUP.md](./07_ANDROID_SETUP.md).
