# DJO COIFFE

# AUTHENTICATION & SECURITY

Version 1.0

---

# OBJECTIVE

The authentication system must be extremely simple for customers while remaining secure for the administrator.

The customer should never need:

• Email

• Password

• OTP

• Verification code

The administrator must have a secure authentication system.

---

##########################################################

CUSTOMER AUTHENTICATION

##########################################################

Login requires only:

Full Name

Phone Number

No password.

No email.

No verification SMS.

---

FLOW

Customer opens app

↓

Login page

↓

Enter Full Name

↓

Enter Phone Number

↓

Continue

↓

Application searches Firestore

↓

Phone Number exists?

YES

↓

Update Last Login

↓

Login

NO

↓

Create account automatically

↓

Login

---

ACCOUNT CREATION

Required fields

Full Name

Phone Number

CreatedAt

UpdatedAt

Customer QR

Loyalty Counter

Reward Available

Notification Preference

---

PHONE NUMBER VALIDATION

Only Tunisian numbers.

Accept

+216XXXXXXXX

216XXXXXXXX

XXXXXXXX

Automatically normalize

↓

XXXXXXXX

Store normalized value.

Reject invalid formats.

Reject letters.

Reject symbols.

Reject duplicate phone numbers.

---

SESSION

Customer remains connected.

Do not require login every visit.

Session persists until Logout.

---

LOGOUT

Logout removes:

Current session

Cached user information

Notification listeners

Reservation listeners

---

##########################################################

ADMIN AUTHENTICATION

##########################################################

Use Firebase Authentication.

Email

Password

Only one administrator account.

No registration page.

The administrator account is manually created in Firebase Console.

---

ADMIN LOGIN

Email

Password

↓

Firebase Authentication

↓

Success

↓

Dashboard

---

FAILED LOGIN

Show friendly message.

Never expose technical errors.

Example

Incorrect email or password.

Please try again.

---

##########################################################

ROUTE PROTECTION

##########################################################

Public

Landing

Gallery

Products

Contact

Login

Private Customer

Reservation

My Reservations

Profile

Notifications

Subscriptions

Loyalty

Private Admin

Dashboard

Reservations

Clients

Products

Gallery

Services

Barbers

Settings

Scanner

---

##########################################################

PERMISSIONS

##########################################################

Customer

Cannot modify products.

Cannot modify reservations of others.

Cannot access dashboard.

Administrator

Full access.

---

##########################################################

CUSTOMER SESSION

##########################################################

Stored locally.

Use localStorage.

Remember session.

Restore automatically.

---

##########################################################

ADMIN SESSION

##########################################################

Firebase Authentication.

Automatic persistence.

Automatic refresh.

Logout expires session.

---

##########################################################

QR SECURITY

##########################################################

QR must never contain

Firestore Document ID

Phone Number

Personal information

QR contains

Secure random token

Scanner searches

↓

Firestore

↓

Reservation

---

##########################################################

TOKEN GENERATION

##########################################################

Generate random UUID.

Minimum

128 bits.

Impossible to guess.

---

##########################################################

ANTI DUPLICATION

##########################################################

Prevent

Same phone number twice.

Prevent

Same reservation twice.

Prevent

Same QR twice.

Prevent

Duplicate reward.

Prevent

Duplicate subscription.

---

##########################################################

RESERVATION VALIDATION

##########################################################

Before creating reservation

Check

Customer logged in

↓

Service enabled

↓

Barber enabled

↓

Date valid

↓

Time valid

↓

Slots free

↓

Reservation enabled

↓

Maintenance mode disabled

↓

Create reservation

---

##########################################################

WAITLIST VALIDATION

##########################################################

Customer cannot join

twice

for same slot.

Customer cannot join waitlist

if already has reservation.

---

##########################################################

SUBSCRIPTION VALIDATION

##########################################################

Before decrement

Check

Subscription active

↓

Remaining Haircuts > 0

↓

Not expired

↓

Reservation completed

↓

Decrease

---

##########################################################

LOYALTY VALIDATION

##########################################################

Only eligible services.

Reservation completed.

Reward not already generated.

Reward not redeemed.

---

##########################################################

SCAN VALIDATION

##########################################################

Scan

↓

Token exists?

↓

YES

↓

Already used?

↓

NO

↓

Reservation valid?

↓

YES

↓

Complete reservation

Otherwise

↓

Show invalid QR.

---

##########################################################

CLIENT SECURITY

##########################################################

Never trust browser.

Always validate before write.

Every Firestore write

↓

Validation

↓

Write

---

##########################################################

FIRESTORE SECURITY RULES

##########################################################

Customers

Read only own profile.

Read own reservations.

Read own notifications.

Read products.

Read gallery.

Read services.

Cannot modify other users.

Administrator

Full read/write access.

---

##########################################################

RATE LIMITING

##########################################################

Prevent rapid reservation creation.

Prevent QR spam.

Prevent repeated login attempts.

Debounce search fields.

---

##########################################################

ERROR HANDLING

##########################################################

Authentication failed

↓

Friendly message

Retry button

Network unavailable

↓

Offline message

Reconnect automatically

---

##########################################################

DEVICE CHANGE

##########################################################

Customer changes phone?

Simply login again.

Profile restored automatically.

---

##########################################################

PWA BEHAVIOR

##########################################################

Installed application

↓

Remain logged in.

Browser

↓

Remain logged in.

Session restored automatically.

---

##########################################################

ANDROID APK

##########################################################

Authentication identical to PWA.

Single backend.

Single database.

Single logic.

---

##########################################################

FINAL GOAL

Authentication must require less than 10 seconds for a customer while maintaining a professional level of security for the administrator.

The user should never think about authentication.

It should simply work.
