# Troubleshooting Guide

This guide covers common issues specific to the Djo Coiffe architecture.

## 1. Firebase Permission Denied
**Cause:** The user is trying to read or write a document they do not own, or the Firestore Security Rules have not been deployed.
**Diagnosis:** Open the browser console (F12). Look for `FirebaseError: Missing or insufficient permissions`.
**Solution:** 
1. Ensure `firebase deploy --only firestore:rules` was run.
2. If accessing the Admin Dashboard, ensure the user has the `role: 'admin'` field in their `users/{userId}` document.

## 2. Firestore Indexes Missing
**Cause:** The application attempts a complex query (e.g., ordering by date AND filtering by customer ID) without an index.
**Diagnosis:** The browser console will show an error containing a direct link to the Firebase Console: `The query requires an index. You can create it here: https://console.firebase...`.
**Solution:** Click the link in the error message to build the index automatically, or run `firebase deploy --only firestore:indexes`.

## 3. Cloudinary Upload Failure
**Cause:** Incorrect Upload Preset configuration or missing `.env` variables.
**Diagnosis:** The network tab shows a 401 or 400 error on the request to `api.cloudinary.com`.
**Solution:** Verify that `VITE_CLOUDINARY_UPLOAD_PRESET` exactly matches an **Unsigned** preset in your Cloudinary Dashboard.

## 4. QR Scanner Not Opening
**Cause:** The browser denies camera access, or the device does not have a camera.
**Diagnosis:** The admin clicks "Scanner" but the screen remains black, or the console shows `NotAllowedError: Permission denied`.
**Solution:** 
- On Web: Ensure the site is served over HTTPS (or localhost) and the user clicks "Allow" on the camera prompt.
- On Android: Ensure the Capacitor camera permissions are included in `AndroidManifest.xml` and granted in OS Settings.

## 5. Android Build Failure
**Cause:** JDK mismatch or missing Gradle dependencies.
**Diagnosis:** Running `npm run cap:android` fails with Java compilation errors.
**Solution:** Ensure Android Studio is using JDK 17. Go to **File > Project Structure** and set the SDK to 17. Sync Gradle.

## 6. PWA Not Installing / "Add to Home Screen" missing
**Cause:** Missing manifest configuration, invalid icons, or service worker failure.
**Diagnosis:** Open Chrome DevTools > Application tab. Check "Manifest" for errors.
**Solution:** Ensure you are testing on `npm run preview` or production. `npm run dev` intentionally disables the PWA manifest for faster hot-reloading.

## 7. Capacitor Sync Problems
**Cause:** Outdated `dist/` directory.
**Diagnosis:** The Android app does not reflect the latest React code changes.
**Solution:** Always remember to run `npm run build` *before* `npx cap sync`.

## 8. Environment Variable Issues
**Cause:** Variables are missing from `.env` or were not prefixed with `VITE_`.
**Diagnosis:** The application crashes on load with `undefined` configuration errors.
**Solution:** Ensure all keys are in `.env` and prefixed with `VITE_`. Restart the dev server (`npm run dev`) after changing the `.env` file.
