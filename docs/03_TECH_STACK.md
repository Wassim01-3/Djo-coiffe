# DJO COIFFE

# TECHNICAL ARCHITECTURE

Version 1.0

---

# OBJECTIVE

This document defines the technical architecture of the project.

Every decision has been made to maximize:

• Performance

• Maintainability

• Scalability

• Simplicity

• Cost

The application must remain compatible with the FREE Firebase Spark Plan.

Never require paid Firebase services.

---

# PROJECT TYPE

Progressive Web Application (PWA)

Android APK

Single Codebase

Single Backend

Single Database

---

# MAIN TECHNOLOGIES

Frontend

React 19

TypeScript

Vite

TailwindCSS

React Router

Framer Motion

React Hook Form

Zod

Lucide React

React QR Code

html5-qrcode

React Hot Toast

date-fns

TanStack Query

Context API

PWA

Capacitor

---

# BACKEND

Firebase

Firestore Database

Firebase Hosting

Firebase Cloud Messaging

No Firebase Storage.

No Realtime Database.

No Cloud Functions.

No Authentication passwords.

---

# IMAGE STORAGE

Cloudinary

Every uploaded image must be stored inside Cloudinary.

Folders:

logo

gallery

products

backgrounds

Firestore stores only URLs.

---

# STATE MANAGEMENT

Use Context API.

Do not use Redux.

Create separate contexts:

AuthContext

ReservationContext

NotificationContext

SettingsContext

---

# DATA FETCHING

Use TanStack Query.

Benefits

Automatic cache

Automatic refetch

Loading states

Error handling

Optimistic updates

---

# FORM VALIDATION

React Hook Form

-

Zod

Every form must be validated.

Never trust client input.

---

# ROUTING

React Router

Use lazy loading.

Every page loaded only when needed.

---

# FILE STRUCTURE

src/

assets/

components/

layouts/

pages/

features/

contexts/

hooks/

firebase/

services/

types/

utils/

constants/

styles/

routes/

---

# FEATURE STRUCTURE

Example

features/

reservation/

components/

hooks/

services/

types/

pages/

utils/

Every feature is isolated.

---

# REUSABLE COMPONENTS

Button

Card

Input

Modal

BottomSheet

Dialog

Avatar

Badge

Toast

Loader

Skeleton

PageHeader

SectionTitle

QRCard

TimeSlot

BarberCard

GalleryCard

ProductCard

ReservationCard

SubscriptionCard

NotificationCard

Everything reusable.

---

# REUSABLE HOOKS

useAuth

useReservation

useNotification

useCloudinary

useFirestore

useOnlineStatus

useInstallPrompt

useQRCode

useScanner

---

# TYPESCRIPT RULES

Strict Mode

No "any"

Interfaces preferred

Enums only when useful

Utility types where appropriate

---

# STYLING

TailwindCSS only.

No Bootstrap.

No Material UI.

No Chakra.

No CSS Frameworks.

No inline styles.

---

# TAILWIND

Create custom theme.

Primary

Accent

Success

Danger

Reserved

Unavailable

Border Radius

Shadow

Spacing

Everything centralized.

---

# FONTS

Inter

Loaded locally or via Google Fonts.

Only one font family.

---

# ICONS

Lucide React only.

---

# IMAGES

Lazy Loading

Responsive

Optimized

Cloudinary transformations

Automatic compression

---

# PERFORMANCE

Target Lighthouse

Performance

95+

Accessibility

95+

SEO

95+

Best Practices

95+

---

# PWA

The application must behave like a native application.

Installable.

Offline support.

Splash screen.

App icon.

Standalone mode.

No browser UI after installation.

---

# IOS BEHAVIOR

Detect if application is opened from Safari.

If not installed

↓

Display beautiful installation guide.

Step 1

Tap Share

Step 2

Add to Home Screen

Step 3

Open from Home Screen

Never show this message again after installation.

---

# ANDROID

When browser supports installation

↓

Display Install App.

Otherwise

↓

Display

Download APK

APK generated using Capacitor.

---

# OFFLINE SUPPORT

Cache

Logo

Icons

Fonts

CSS

JavaScript

Previously visited pages

Never cache Firestore writes.

---

# ERROR HANDLING

Every request

try

catch

Friendly message

Retry button

Never crash application.

---

# LOGGING

Console logs only during development.

Production

No unnecessary logs.

---

# DATE FORMAT

DD/MM/YYYY

24-hour format

Timezone

Africa/Tunis

---

# CURRENCY

TND

Display example

25 TND

---

# LANGUAGE

French

The codebase should support future internationalization.

Prepare translation files.

Do not hardcode every string.

---

# SECURITY

Validate every form.

Validate phone number.

Prevent duplicate reservations.

Prevent invalid QR.

Prevent invalid subscriptions.

Never expose Firebase keys outside environment variables.

---

# ENVIRONMENT VARIABLES

Firebase

Cloudinary

Google Maps

Everything stored in .env

Never hardcode secrets.

---

# BUILD TARGETS

Development

Production

Android APK

PWA

---

# DEPENDENCIES

Only install packages that are actually used.

Avoid unnecessary libraries.

---

# TESTING

Every phase must compile successfully.

No TypeScript errors.

No console errors.

No warnings.

Responsive on

320px

375px

390px

768px

1024px

1440px

---

# CODE QUALITY

Small components.

Reusable functions.

Meaningful names.

No duplicated logic.

Feature-first architecture.

Readable code.

Production-ready.

---

# FINAL OBJECTIVE

This repository must be maintainable by another developer without confusion.

The code should feel handcrafted by an experienced software engineer rather than AI-generated.
