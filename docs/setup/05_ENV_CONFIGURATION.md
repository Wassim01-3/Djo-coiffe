# Environment Variables

The project requires the following environment variables to be defined in a `.env` file at the root of the project.

| Variable | Purpose | Public/Secret | Example Value | Where to Obtain |
|---|---|---|---|---|
| `VITE_FIREBASE_API_KEY` | Authenticates Firebase API calls | Public | `AIzaSyD...` | Firebase Console > Project Settings > Web App |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | Public | `djo-coiffe.firebaseapp.com` | Firebase Console > Project Settings > Web App |
| `VITE_FIREBASE_PROJECT_ID` | Firestore Project ID | Public | `djo-coiffe` | Firebase Console > Project Settings > Web App |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage location | Public | `djo-coiffe.appspot.com` | Firebase Console > Project Settings > Web App |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM Messaging ID | Public | `123456789012` | Firebase Console > Project Settings > Web App |
| `VITE_FIREBASE_APP_ID` | Unique Web App ID | Public | `1:123456...` | Firebase Console > Project Settings > Web App |
| `VITE_FIREBASE_VAPID_KEY` | Secures Web Push Notifications | Public | `BEl6...` | Firebase Console > Cloud Messaging > Web Push certs |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary endpoint identifier | Public | `djoimages` | Cloudinary Dashboard |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Authorizes unsigned uploads | Public | `djo_coiffe_preset` | Cloudinary Settings > Upload |
| `VITE_GOOGLE_MAPS_API_KEY` | (Optional) Future Maps integrations | Secret | `AIzaSyX...` | Google Cloud Console |

> **Note on Security:** Because this is a Vite client-side application, any variable prefixed with `VITE_` is statically embedded into the final JavaScript bundle. Therefore, these keys are technically "public" and exposed to the browser. Security is enforced via **Firestore Security Rules** and **Cloudinary Upload Presets**, NOT by keeping these keys secret. Never put true secrets (like server-to-server API keys) in a Vite `.env` file unless explicitly designed for public access.

---
**Next Step:** Learn how to run the project in [06_RUNNING_THE_PROJECT.md](./06_RUNNING_THE_PROJECT.md).
