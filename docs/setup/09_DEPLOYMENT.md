# Deployment Guide

When all features have been tested, you are ready to deploy Djo Coiffe to production.

## 1. Firebase Hosting (Frontend)
Firebase Hosting provides fast, secure CDN delivery for the web application.

1. Build the production application locally:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` directory to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```
3. Firebase will provide a URL (e.g., `https://djo-coiffe.web.app`).

## 2. Firestore Security Rules & Indexes
Ensure your backend is locked down before directing users to the application.
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 3. APK Distribution (Android)
If you are distributing the app via Android:
1. Follow `07_ANDROID_SETUP.md` to generate the Signed Release APK.
2. Log into the [Google Play Console](https://play.google.com/console).
3. Create a new App release, fill in the store listing details, upload the APK (or App Bundle `.aab`), and submit for review.
   - *Note*: If distributing manually (without Google Play), you can email or host the `app-release.apk` file directly, though users will need to allow "Install from Unknown Sources" on their phones.

## 4. Version Updates & Cache Invalidation
When deploying new versions in the future:
1. Increment the version number in `package.json`.
2. Run `npm run build` and `firebase deploy`.
3. Because Djo Coiffe is a PWA, users' browsers will cache the old version. The `vite-plugin-pwa` configuration includes an "Update Available" banner. When users see this banner and click "Update", the Service Worker will fetch the newly deployed assets from Firebase Hosting.

## 5. Cloudinary Production Considerations
- No code changes are required for Cloudinary production deployment, as images are served dynamically.
- Monitor your Cloudinary usage dashboard to ensure you do not exceed the free tier bandwidth limits.

---
**Next Step:** Refer to [10_TROUBLESHOOTING.md](./10_TROUBLESHOOTING.md) if you encounter post-deployment issues.
