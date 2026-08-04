# DJO COIFFE

# FIREBASE ARCHITECTURE

Version 1.0

---

# OBJECTIVE

This document defines the complete backend architecture.

The backend must remain:

• Fast

• Secure

• Scalable

• Compatible with Firebase Spark

• Easy to maintain

No Cloud Functions.

No Firebase Storage.

Only Firestore.

Cloudinary stores every image.

---

# DATABASE

Firestore

Collections only.

Every document must contain

createdAt

updatedAt

---

# COLLECTION STRUCTURE

users

admins

barbers

services

reservations

reservation_events

waitlists

products

gallery

subscription_plans

subscriptions

loyalty_rewards

notifications

settings

contact

---

##########################################################

USERS

##########################################################

Collection

users

Document ID

Auto ID

Fields

id

fullName

phoneNumber

createdAt

updatedAt

isBlocked

completedHaircuts

loyaltyCounter

rewardAvailable

activeSubscriptionId

lastReservation

lastLogin

customerQr

notificationEnabled

deviceTokens[]

platform

android

ios

web

Every phone number must be unique.

---

##########################################################

ADMINS

##########################################################

admins

Only one administrator.

Fields

name

phone

pin

createdAt

---

Authentication handled separately.

---

##########################################################

BARBERS

##########################################################

barbers

Fields

name

phone

seatNumber

enabled

createdAt

updatedAt

displayOrder

Each barber represents one chair.

Maximum

4

Minimum

1

---

##########################################################

SERVICES

##########################################################

services

Fields

name

price

durationMinutes

enabled

description

displayOrder

icon

Only enabled services appear to customers.

---

##########################################################

RESERVATIONS

##########################################################

Fields

customerId

barberId

serviceId

date

startTime

endTime

duration

status

qrToken

subscriptionUsed

rewardUsed

seat

notes

createdAt

updatedAt

---

Reservation Status

pending

confirmed

completed

cancelled

expired

---

##########################################################

RESERVATION EVENTS

##########################################################

Every reservation action creates an event.

Fields

reservationId

customerId

performedBy

type

timestamp

details

Possible types

CREATED

UPDATED

WAITLISTED

CANCELLED

COMPLETED

QR_SCANNED

LOYALTY_UPDATED

SUBSCRIPTION_USED

REWARD_USED

---

##########################################################

WAITLIST

##########################################################

Fields

customerId

reservationDate

requestedTime

serviceId

barberPreference

position

offerSent

offerExpiresAt

accepted

createdAt

---

When cancellation occurs

↓

First waiting customer

↓

Notification

↓

15 minutes

↓

If ignored

↓

Second customer

---

##########################################################

PRODUCTS

##########################################################

Fields

name

price

description

imageUrl

enabled

displayOrder

createdAt

updatedAt

---

Image stored

Cloudinary

---

##########################################################

GALLERY

##########################################################

Fields

category

imageUrl

displayOrder

enabled

createdAt

updatedAt

---

Categories

Enfant

Jeune

Adulte

---

##########################################################

SUBSCRIPTION PLANS

##########################################################

Fields

name

price

haircutsIncluded

validityDays

enabled

description

displayOrder

---

##########################################################

SUBSCRIPTIONS

##########################################################

Fields

customerId

planId

remainingHaircuts

startDate

expirationDate

status

assignedBy

createdAt

updatedAt

---

Status

active

expired

finished

---

Expired automatically when

Remaining Haircuts = 0

OR

Today > Expiration Date

---

##########################################################

LOYALTY REWARDS

##########################################################

Fields

customerId

rewardQr

status

generatedAt

redeemedAt

reservationId

---

Status

available

redeemed

expired

---

##########################################################

NOTIFICATIONS

##########################################################

Fields

customerId

title

message

type

read

createdAt

actionUrl

metadata

---

Types

Reservation

Reminder

Subscription

Loyalty

Waitlist

General

---

##########################################################

SETTINGS

##########################################################

Only one document

settings/app

Fields

shopName

logoUrl

phone

whatsapp

facebook

instagram

address

googleMapsUrl

latitude

longitude

openingHours

activeSeats

reservationEnabled

galleryEnabled

productsEnabled

loyaltyEnabled

subscriptionEnabled

maintenanceMode

iosAppMessageEnabled

androidApkUrl

version

---

##########################################################

CONTACT

##########################################################

Fields

address

phone

email

facebook

instagram

whatsapp

googleMapsUrl

businessHours

---

##########################################################

OPENING HOURS

##########################################################

Stored as

monday

open

close

tuesday

...

sunday

closed

---

Example

Monday

08:00

19:00

---

##########################################################

TIME SLOT ENGINE

##########################################################

Time Slot Length

30 minutes

Example

08:00

08:30

09:00

09:30

10:00

...

Reservation duration

↓

Automatically blocks

Required slots.

---

##########################################################

LOYALTY ENGINE

##########################################################

Eligible Services

Haircut

Haircut + Beard

Completed Reservation

↓

loyaltyCounter++

Counter == 5

↓

rewardAvailable = true

↓

Create reward

↓

Generate Reward QR

Reward redeemed

↓

Counter = 0

↓

rewardAvailable = false

---

##########################################################

SUBSCRIPTION ENGINE

##########################################################

Reservation completed

↓

Subscription Active?

↓

YES

↓

remainingHaircuts--

↓

remainingHaircuts == 0

↓

Subscription Finished

---

##########################################################

QR TOKEN

##########################################################

Never expose Firestore IDs.

Generate random secure token.

Store token.

Scanner searches token.

Never scan document IDs.

---

##########################################################

NOTIFICATION ENGINE

##########################################################

Notification stored

↓

Firestore

↓

Displayed inside app

↓

Push Notification

(if permission granted)

---

##########################################################

IMAGE STORAGE

##########################################################

Cloudinary

Folders

gallery/

products/

logo/

background/

Only URLs inside Firestore.

---

##########################################################

CLIENT SIDE CLEANUP

##########################################################

No Cloud Functions.

Whenever application starts

↓

Check expired subscriptions

↓

Mark expired

↓

Delete if necessary

Whenever reservation page opens

↓

Archive expired reservations

Whenever loyalty page opens

↓

Refresh rewards

Everything maintained client-side.

---

##########################################################

SECURITY

##########################################################

Never trust client.

Validate every reservation.

Prevent double booking.

Prevent overlapping reservations.

Prevent duplicate phone numbers.

Prevent invalid QR.

Prevent invalid loyalty.

Prevent invalid subscriptions.

---

##########################################################

FIRESTORE INDEXES

Composite Indexes

Reservations

date + barberId

date + status

customerId + status

Notifications

customerId + read

Gallery

category + displayOrder

Products

enabled + displayOrder

Subscriptions

customerId + status

---

##########################################################

FINAL GOAL

The Firestore structure must remain readable.

Every collection has one responsibility.

No duplicated information.

Every relationship is clear.

Reads and writes remain optimized for the Spark plan.
