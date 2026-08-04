# Developer Setup Checklist

Use this checklist to ensure you have correctly installed, configured, and verified the Djo Coiffe project.

### 1. Prerequisites & Installation
- [ ] Node.js 20+ installed.
- [ ] Git installed.
- [ ] Repository cloned locally.
- [ ] `npm install` executed successfully.

### 2. Environment Configuration
- [ ] `.env.example` copied to `.env`.
- [ ] Firebase config injected into `.env` (`VITE_FIREBASE_*`).
- [ ] Firebase VAPID key injected (`VITE_FIREBASE_VAPID_KEY`).
- [ ] Cloudinary config injected (`VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`).

### 3. Firebase Setup
- [ ] Firebase project created.
- [ ] Anonymous Auth enabled.
- [ ] Email/Password Auth enabled.
- [ ] Firestore Database enabled (production mode).
- [ ] Firebase CLI installed (`npm i -g firebase-tools`).
- [ ] Firestore Rules & Indexes deployed (`firebase deploy`).
- [ ] Admin user created manually in Firebase Auth console.

### 4. Cloudinary Setup
- [ ] Cloudinary account created.
- [ ] Unsigned Upload Preset created.

### 5. Local Verification
- [ ] `npm run dev` starts without errors.
- [ ] Application loads in browser at `http://localhost:5173`.
- [ ] Admin login succeeds at `/admin`.

### 6. Production Build & PWA
- [ ] `npm run build` succeeds without TS or ESLint errors.
- [ ] `npm run preview` serves the production build.
- [ ] Chrome DevTools confirms the Service Worker is registered.

### 7. Android Setup (Optional)
- [ ] Android Studio and JDK 17 installed.
- [ ] `npm run cap:sync` executes successfully.
- [ ] `npm run cap:android` opens the project in Android Studio.
- [ ] App builds and runs on a virtual or physical device.

If all boxes are checked, the project is perfectly configured and ready for continued development or production deployment!
