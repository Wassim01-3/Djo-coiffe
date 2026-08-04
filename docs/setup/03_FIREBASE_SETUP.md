# Firebase Setup

The Djo Coiffe application relies on Firebase for Authentication, Database (Firestore), Storage (metadata only), Cloud Messaging (Notifications), and Hosting.

## 1. Create the Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**.
3. Name the project (e.g., "Djo Coiffe").
4. Disable Google Analytics (or enable it if desired).
5. Click **Create project**.

## 2. Register the Web App and get API Keys
1. In the Firebase console, click the **Web icon (`</>`)** to add an app.
2. Name it "Djo Coiffe Web".
3. Check **Also set up Firebase Hosting for this app**.
4. Click **Register app**.
5. You will see a `firebaseConfig` object. Copy the values and paste them into your `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## 3. Enable Authentication
1. On the left menu, click **Authentication**, then **Get Started**.
2. Click the **Sign-in method** tab.
3. Enable **Anonymous** provider. (This is how customers are created implicitly).
4. Enable **Email/Password** provider. (This is used for the Admin Login).
5. **Create the Admin Account**:
   - Go to the **Users** tab in Authentication.
   - Click **Add user**.
   - Create an admin user (e.g., `admin@djocoiffe.com` / `password123`).

## 4. Enable Firestore Database
1. On the left menu, click **Firestore Database**, then **Create database**.
2. Select **Start in production mode** (we will configure rules via CLI).
3. Choose a location close to your users (e.g., `eur3` for Europe).
4. Click **Enable**.

## 5. Deploy Security Rules and Indexes
The project contains pre-configured security rules (`firestore.rules`) and indexes (`firestore.indexes.json`).
1. In your local terminal, install the Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize Firebase to link your local project to the cloud project:
   ```bash
   firebase use --add
   ```
   Select the project you just created.
4. Deploy the rules and indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
*Expected Output:* `Deploy complete!`

## 6. Configure Cloud Messaging (VAPID Key)
1. In the Firebase Console, go to **Project Settings** (gear icon) > **Cloud Messaging**.
2. Under "Web configuration", click **Generate key pair**.
3. Copy the generated Key Pair and paste it into your `.env` file as:
   `VITE_FIREBASE_VAPID_KEY=your_generated_key`

## Verification
Run `npm run dev`. If Firebase is configured correctly, there should be no errors in the browser console. If you navigate to `http://localhost:5173/admin` and log in with your admin credentials, you should successfully access the dashboard.

---
**Next Step:** Proceed to [04_CLOUDINARY_SETUP.md](./04_CLOUDINARY_SETUP.md).
