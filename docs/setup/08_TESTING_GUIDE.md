# Testing Guide

Before deploying Djo Coiffe to production, follow this checklist to manually verify all core flows.

## 1. Authentication
- [ ] **Anonymous Customer**: Open the app in Incognito mode. Verify you can access the Home Page. Check Firestore `users` collection to see a new user document created with `{ role: 'customer' }`.
- [ ] **Admin Login**: Go to `/admin`. Login with your Admin credentials. Verify redirection to the Admin Dashboard.

## 2. Reservations
- [ ] **Booking Flow**: Go to Home > Select a Service > Select a Barber > Pick Date/Time. 
- [ ] **Overlap Checking**: Try to book a second appointment at the exact same time. The app should reject it.
- [ ] **Waitlist**: Try to book a slot that is full. Click "Join Waitlist". Verify the waitlist entry appears in Firestore.

## 3. QR System & Admin Dashboard
- [ ] **Generate QR**: Complete a reservation and verify the QR code displays.
- [ ] **Admin Scanner**: Log in as Admin on a mobile device. Go to "Scanner". Scan the customer's QR code.
- [ ] **Completion**: Verify the reservation status changes to `completed`.

## 4. Loyalty & Rewards
- [ ] **Counter Increment**: Scan 5 completed reservations for a single customer. 
- [ ] **Reward Trigger**: Check the customer's profile to verify `loyaltyCounter` resets and `rewardAvailable` is `true`.
- [ ] **Redemption**: Present the reward QR. Have the admin scan it and verify `rewardAvailable` reverts to `false`.

## 5. Subscriptions
- [ ] **Purchase**: Use the Admin Dashboard to grant a user a "Premium" subscription (5 cuts).
- [ ] **Usage**: Scan a reservation for that user. Verify their remaining cuts drop to 4.

## 6. Gallery & Products
- [ ] **Admin Upload**: Go to Admin > Gallery. Upload a new image. 
- [ ] **Cloudinary**: Verify the image loads in the Customer Gallery and exists in your Cloudinary Dashboard.

## 7. Offline Mode & PWA
- [ ] **Install**: Open Chrome on Android, tap "Add to Home Screen".
- [ ] **Offline**: Put the device in Airplane mode. Open the app. Verify the "Offline Mode" banner appears and cached pages (like Home and Contact) still render.

## 8. Notifications
- [ ] **Push Request**: As a customer, accept the "Enable Notifications" prompt.
- [ ] **Admin Broadcast**: Go to Admin > Announcements. Send a test message.
- [ ] **Delivery**: Verify the customer receives the in-app toast or OS-level push notification.

---
**Next Step:** Once all tests pass, proceed to [09_DEPLOYMENT.md](./09_DEPLOYMENT.md).
