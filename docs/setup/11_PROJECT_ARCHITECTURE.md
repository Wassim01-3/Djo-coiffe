# Project Architecture

Djo Coiffe is designed as a client-heavy, serverless Progressive Web App (PWA) using React, Vite, and Firebase. 

## 1. Folder Structure
- `src/app/`: Global entry points, routing (`AppRoutes.tsx`), and context providers.
- `src/components/`: Reusable, domain-agnostic UI elements (buttons, inputs, layouts).
- `src/features/`: Domain-specific components, split into `/admin`, `/auth`, `/reservations`, etc.
- `src/services/`: Firebase logic and external API wrappers.
- `src/types/`: TypeScript definitions (`@appTypes/models.ts`).
- `src/hooks/`: Custom React hooks (e.g., `useFcmPermission`).

## 2. Firebase Architecture
The app operates on the **Firebase Spark Plan** (Free tier), meaning there are no Cloud Functions. All logic is executed on the client, secured by Firestore Rules.

### Collections:
- `users`: Contains customer profiles and Admin roles.
- `reservations`: The core booking documents.
- `reservationEvents`: An audit log of state changes for a reservation (CREATED, QR_SCANNED, CANCELLED).
- `notifications`: Push and in-app notifications.
- `waitlist`: Tracks users waiting for a specific date.

## 3. Authentication Flow
- **Customers**: Utilize Firebase Anonymous Authentication. When a user first opens the app, a hidden anonymous account is generated, linked to a persistent session. They can later add a Name and Phone number to this anonymous profile.
- **Admins**: Utilize standard Email/Password authentication. Routes under `/admin` check for the `role: 'admin'` claim.

## 4. Reservation Flow
1. **Selection**: User selects Service > Barber > Date > Time.
2. **Validation**: The `reservation.service.ts` queries Firestore to find overlapping bookings and calculates 30-minute intervals.
3. **Creation**: A `reservation` document is written with `status: 'pending'` and a generated `qrToken` (UUID).
4. **QR Display**: The `react-qr-code` library renders the `qrToken` visually.

## 5. QR Flow & Validation
When the customer arrives at the salon:
1. Admin opens the `/admin/scanner` route.
2. Uses `html5-qrcode` to parse the `qrToken` from the customer's screen.
3. The app queries the `reservations` collection for that token.
4. If valid, the app updates the reservation `status` to `completed`.

## 6. Loyalty & Subscriptions (Client-Side Logic)
Since there are no Cloud Functions, the QR Scanning step triggers secondary updates:
- **Loyalty**: If scanning is successful, `loyalty.service.ts` increments the customer's `loyaltyCounter`. If it hits 5, it resets and flags `rewardAvailable: true`.
- **Subscriptions**: If the user has a VIP pass, `subscription.service.ts` decrements the `remainingHaircuts`.

## 7. Cloudinary Usage
Images (Gallery, Products, Barber Avatars) are not stored in Firebase Storage to save bandwidth. They are sent directly to Cloudinary using an **Unsigned Upload Preset**. The resulting URL is stored in Firestore.

## 8. State Management
- **Local State**: Managed by standard `useState` and `useReducer`.
- **Server State**: Managed by **TanStack Query** (`@tanstack/react-query`). This handles caching, background fetching, and loading states for Firestore data.
- **Global State**: Managed by React Context (`AuthContext`, `ReservationContext`) and **Zustand** for lightweight UI states.
