# DJO COIFFE

# PROJECT STRUCTURE

Version 1.0

---

# OBJECTIVE

The repository must be clean.

Everything must have its own place.

Never mix unrelated features.

The project must remain maintainable for years.

Use Feature-First Architecture.

---

# ROOT STRUCTURE

djo-coiffe/

├── public/
├── src/
├── capacitor/
├── docs/
├── firebase/
├── scripts/
├── .env
├── .env.example
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── README.md

---

# PUBLIC

public/

manifest.webmanifest

favicon.ico

robots.txt

icons/

splash/

---

# SRC

src/

app/

assets/

components/

constants/

contexts/

features/

firebase/

hooks/

layouts/

pages/

routes/

services/

styles/

types/

utils/

---

# APP

Contains:

App.tsx

Providers.tsx

ErrorBoundary.tsx

AppRoutes.tsx

Theme.ts

---

# ASSETS

assets/

logo.png

images/

illustrations/

icons/

animations/

empty-states/

---

# CONSTANTS

colors.ts

routes.ts

services.ts

notifications.ts

subscriptions.ts

loyalty.ts

reservation.ts

timeSlots.ts

openingHours.ts

---

# TYPES

user.ts

reservation.ts

service.ts

barber.ts

product.ts

gallery.ts

subscription.ts

notification.ts

settings.ts

loyalty.ts

contact.ts

---

# UTILS

date.ts

phone.ts

currency.ts

firestore.ts

cloudinary.ts

notifications.ts

reservationEngine.ts

subscriptionEngine.ts

loyaltyEngine.ts

qr.ts

validators.ts

time.ts

animations.ts

---

# HOOKS

useAuth

useFirestore

useCloudinary

useReservation

useNotification

useSettings

useInstallPrompt

useScanner

useOnlineStatus

usePWA

useBottomSheet

useDebounce

useToast

---

# CONTEXTS

AuthContext

NotificationContext

SettingsContext

ReservationContext

ThemeContext

---

# LAYOUTS

MainLayout

AdminLayout

AuthLayout

EmptyLayout

---

# ROUTES

PublicRoutes

PrivateRoutes

AdminRoutes

---

# SERVICES

firebase.ts

cloudinary.ts

reservation.service.ts

gallery.service.ts

product.service.ts

subscription.service.ts

loyalty.service.ts

notification.service.ts

settings.service.ts

client.service.ts

barber.service.ts

---

# COMPONENT LIBRARY

components/

buttons/

cards/

dialogs/

forms/

inputs/

navigation/

feedback/

common/

tables/

scanner/

qr/

---

# BUTTONS

PrimaryButton

SecondaryButton

DangerButton

IconButton

FloatingButton

---

# CARDS

BarberCard

ProductCard

GalleryCard

ReservationCard

SubscriptionCard

LoyaltyCard

NotificationCard

StatisticCard

InformationCard

---

# INPUTS

TextInput

PhoneInput

SearchInput

SelectInput

DateInput

TimeInput

TextArea

---

# DIALOGS

ConfirmationDialog

DeleteDialog

SuccessDialog

ErrorDialog

ImageViewer

QRDialog

---

# NAVIGATION

BottomNavigation

TopBar

Drawer

Sidebar

Breadcrumb

---

# FEEDBACK

Toast

Loader

Skeleton

ProgressBar

EmptyState

ErrorState

OfflineBanner

---

# COMMON

Avatar

Badge

Chip

Divider

Logo

SectionTitle

PageHeader

Container

FloatingActionButton

---

# QR

QRCodeCard

QRCodeGenerator

QRCodeReader

ScannerFrame

ScannerResult

---

# FEATURES

features/

authentication/

reservation/

gallery/

products/

subscriptions/

loyalty/

notifications/

contact/

profile/

admin/

---

# AUTHENTICATION

components/

pages/

services/

hooks/

types/

---

# RESERVATION

components/

pages/

services/

hooks/

utils/

types/

---

# COMPONENTS

ReservationCalendar

ServiceSelector

BarberSelector

TimeSelector

ReservationSummary

ReservationQRCode

ReservationTimeline

WaitlistDialog

---

# GALLERY

GalleryGrid

GalleryCategory

GalleryViewer

GalleryCard

---

# PRODUCTS

ProductGrid

ProductCard

ProductDetails

---

# SUBSCRIPTIONS

SubscriptionCard

SubscriptionProgress

SubscriptionStatus

---

# LOYALTY

ProgressCircle

RewardCard

RewardQRCode

---

# PROFILE

ProfileHeader

ReservationHistory

Statistics

SettingsCard

---

# CONTACT

BusinessHours

GoogleMap

SocialLinks

CallButtons

---

# ADMIN

dashboard/

reservations/

barbers/

services/

gallery/

products/

clients/

subscriptions/

scanner/

settings/

contact/

---

# ADMIN PAGES

Dashboard

Reservations

Barbers

Services

Gallery

Products

Clients

Subscriptions

QR Scanner

Contact

Settings

---

# FIREBASE

firebase/

config.ts

firestore.ts

queries.ts

collections.ts

rules.ts

indexes.ts

---

# FIRESTORE COLLECTIONS

users

reservations

reservation_history

services

barbers

products

gallery

subscriptions

subscription_plans

notifications

settings

contact

waitlists

loyalty_rewards

---

# PAGES

Landing

Reservation

Gallery

Products

Loyalty

Subscriptions

Notifications

My Reservations

Profile

Contact

Login

Not Found

---

# ADMIN PAGES

Admin Login

Dashboard

Reservations

Clients

Barbers

Services

Gallery

Products

Subscriptions

Scanner

Contact

Settings

---

# GLOBAL COMPONENTS

LoadingScreen

SplashScreen

OfflineBanner

InstallBanner

NotificationBell

FloatingWhatsAppButton

BottomNavigation

---

# ERROR HANDLING

Every page

↓

Loading

↓

Success

↓

Empty

↓

Error

Every state must be implemented.

---

# REUSABILITY RULES

Never duplicate code.

Every repeated UI becomes a component.

Every repeated query becomes a service.

Every repeated calculation becomes a utility.

---

# NAMING RULES

PascalCase

Components

camelCase

Functions

kebab-case

Folders

UPPER_SNAKE_CASE

Constants

---

# IMPORT RULES

Absolute imports.

Never use "../../../"

Use aliases.

Example

@components

@hooks

@features

@services

@firebase

@types

---

# FILE SIZE

Try to keep every component below

250 lines.

Split large files.

---

# COMMENTS

Write comments only when they explain business logic.

Do not comment obvious code.

---

# FINAL GOAL

A developer opening the repository for the first time should immediately understand the project structure.

Every feature must be isolated.

Every component must be reusable.

Every folder must have a clear purpose.

The architecture must support future features without requiring major refactoring.
