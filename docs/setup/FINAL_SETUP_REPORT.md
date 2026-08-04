# Final Setup Report

This report summarizes the current state of the Djo Coiffe project configuration as audited against the source code, highlighting any missing elements or required actions before a true production launch.

## 1. Missing Configuration & API Keys
Because the repository uses `.env` files which are correctly excluded via `.gitignore`, the cloned codebase inherently lacks these keys. A developer *must* supply them:
- **Missing Firebase Config**: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
- **Missing Cloud Messaging Cert**: `VITE_FIREBASE_VAPID_KEY` is required for web push notifications.
- **Missing Cloudinary Config**: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`.

## 2. Missing Firebase Configuration
- **Admin Account**: There is no hardcoded admin credential. The Firebase project owner must manually create an Email/Password account in the Firebase Console and assign the `role: 'admin'` claim (or manually create a `users/{uid}` document with `role: 'admin'`).
- **Billing Plan**: The project relies heavily on client-side logic because it assumes the free "Spark" plan. 

## 3. Missing Cloudinary Configuration
- **Upload Preset**: The project relies on Unsigned Uploads. A preset must be manually created in the Cloudinary dashboard, and the name must exactly match the `VITE_CLOUDINARY_UPLOAD_PRESET` env variable.

## 4. Missing Android Configuration
- **Keystore**: A release keystore is not (and should not be) committed to version control. The developer must generate a `.jks` file via Android Studio to sign the production APK.
- **Google-Services.json**: For native Android push notifications (FCM), a `google-services.json` file must be downloaded from Firebase and placed in `android/app/`. Currently, FCM works via the web service worker, but native Android push requires this file.

## 5. Missing Build & Deployment Configuration
- The build configuration (`vite.config.ts`) is complete and strictly typed.
- Deployment configuration (`firebase.json`) is complete for Hosting, Firestore, and Indexes.

## 6. Bugs or Inconsistencies Found During Audit
- **Client-Side Admin Logic**: Because Cloud Functions are not used (to remain on the free tier), "secure" operations like decrementing a subscription or granting loyalty rewards are performed client-side during the QR scanning process. While Firestore Rules restrict this to Admins, this architecture means the business logic resides on the client device.
- **Double Booking Race Condition**: The overlap check relies on a client-side Firestore read before write. Under extreme concurrency (two users booking the exact same second), a double booking is theoretically possible without backend transactions.

## 7. Recommendations Before Production Deployment
1. **Migrate to Cloud Functions (V2)**: Move the QR validation, Subscription decrements, and Loyalty increments to a secure Node.js backend. This eliminates client-side tampering risks and solves race conditions using Firestore Transactions.
2. **Setup Custom Domain**: Connect a custom domain (e.g., `djocoiffe.com`) in Firebase Hosting rather than using the default `.web.app` domain.
3. **App Store Listing**: Prepare marketing screenshots, privacy policies, and a developer account ($25 one-time fee) for Google Play distribution.
4. **Data Backups**: Enable automatic scheduled exports of the Firestore database via Google Cloud Console to prevent data loss.
