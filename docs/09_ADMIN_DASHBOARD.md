# DJO COIFFE

# ADMIN DASHBOARD

Version 1.0

---

# OBJECTIVE

The Admin Dashboard is the control center of Djo Coiffe.

Its purpose is to allow the barber to manage the shop quickly.

The barber should never need more than three taps to perform a daily task.

The dashboard must prioritize speed over decoration.

---

##########################################################

ADMIN LOGIN

##########################################################

Authentication

Firebase Authentication

Email

Password

Remember Session

Forgot Password (future)

---

##########################################################

DASHBOARD LAYOUT

##########################################################

Desktop

Sidebar

Top Bar

Main Content

Mobile

Drawer Navigation

Sticky Header

Bottom Action Bar

---

##########################################################

SIDEBAR MENU

##########################################################

Today's Queue

Reservations

QR Scanner

Barbers

Services

Products

Gallery

Clients

Subscriptions

Contact

Settings

Logout

---

##########################################################

DEFAULT PAGE

##########################################################

Today's Queue

Never statistics.

Never revenue.

Always today's appointments.

---

##########################################################

TODAY'S QUEUE

##########################################################

Display cards ordered by time.

Each card contains

Time

Customer Name

Phone

Service

Chair

Barber

Reservation Status

Subscription Badge

Reward Badge

Scan QR Button

Call Button

---

Example

09:30

Ahmed Ben Ali

Haircut

Chair 2

Barber

Mohamed

Pending

[ Scan QR ]

---

Completed

↓

Green Card

Cancelled

↓

Gray Card

Current Appointment

↓

Gold Border

---

##########################################################

QR SCANNER

##########################################################

Full-screen scanner.

Large camera preview.

Animated scan line.

Flash button.

Switch Camera.

Scanner automatically detects QR.

If valid

↓

Green animation

↓

Reservation completed

↓

Notification sent

↓

Today's Queue updated

If invalid

↓

Red animation

↓

Error message

---

##########################################################

RESERVATIONS

##########################################################

Tabs

Today's

Upcoming

Completed

Cancelled

Filters

Date

Barber

Service

Status

Search by

Name

Phone

Reservation Number

Actions

Open

Edit

Cancel

Move

Delete (Admin only)

---

##########################################################

CREATE RESERVATION

##########################################################

Manual reservation.

Used for

Walk-ins

Phone bookings

Correction

Uses the exact same reservation engine.

---

##########################################################

BARBERS

##########################################################

Maximum

4

Minimum

1

Each Barber

Name

Phone

Seat Number

Enabled

Avatar (optional)

Display Order

Buttons

Edit

Disable

Delete

---

Active Seats

Displayed at top.

Example

Currently Using

3 / 4 Chairs

---

##########################################################

SERVICES

##########################################################

Unlimited services.

Fields

Name

Price

Duration

Description

Enabled

Display Order

Icon

Actions

Create

Edit

Disable

Delete

Disabled services disappear from customer application.

---

##########################################################

PRODUCTS

##########################################################

Grid

Photo

Name

Price

Description

Enabled

Display Order

Upload Image

Cloudinary

Actions

Create

Edit

Delete

Disable

---

##########################################################

GALLERY

##########################################################

Categories

Enfant

Jeune

Adulte

Upload

Cloudinary

Reorder

Drag & Drop

Enable

Disable

Delete

Image Viewer

---

##########################################################

CLIENTS

##########################################################

Search

Name

Phone

Display

Avatar

Name

Phone

Completed Haircuts

Current Loyalty

Reward Available

Subscription

Last Visit

Buttons

Open

Assign Subscription

Generate Reward

Block Customer

---

Customer Details

Reservation History

Event Timeline

Notifications

Loyalty

Subscription

Preferred Barber

---

##########################################################

SUBSCRIPTION PLANS

##########################################################

Fields

Name

Price

Haircuts Included

Validity

Description

Enabled

Actions

Create

Edit

Disable

Delete

---

##########################################################

ASSIGN SUBSCRIPTION

##########################################################

Search Customer

↓

Select Plan

↓

Assign

↓

Customer notified

Subscription immediately active.

---

##########################################################

LOYALTY MANAGEMENT

##########################################################

Customer List

Current Counter

Reward Available

Reward QR

Actions

Generate Reward

Redeem Reward

Reset Counter

History

---

##########################################################

CONTACT MANAGEMENT

##########################################################

Editable Fields

Shop Name

Logo

Phone

WhatsApp

Facebook

Instagram

Address

Google Maps

Business Hours

Buttons

Save

Preview

---

##########################################################

SETTINGS

##########################################################

General

Maintenance Mode

Enable Reservations

Enable Products

Enable Gallery

Enable Loyalty

Enable Subscriptions

Active Chairs

Android APK URL

iOS Install Message

Theme Colors

Application Version

---

##########################################################

OPENING HOURS

##########################################################

Monday

Open

Close

Tuesday

...

Sunday

Closed

Automatically used by reservation engine.

---

##########################################################

NOTIFICATION CENTER

##########################################################

Display

Unread

Read

System

Customer

Admin

Actions

Mark Read

Delete

Open Related Reservation

---

##########################################################

SEARCH

##########################################################

Global Search

Customer

Reservation

Phone

Service

Barber

Fast filtering.

Debounced input.

---

##########################################################

UPLOADS

##########################################################

Images uploaded to Cloudinary.

Compression

Automatic.

Preview before upload.

Delete removes image from Cloudinary.

---

##########################################################

LOADING STATES

##########################################################

Every table

Skeleton

Every image

Placeholder

Buttons disabled while saving.

---

##########################################################

SUCCESS STATES

##########################################################

Service Created

Reservation Updated

Gallery Uploaded

Product Saved

Customer Assigned

Subscription Assigned

Display Toast.

---

##########################################################

ERROR STATES

##########################################################

Friendly.

Retry Button.

Never expose Firebase errors.

---

##########################################################

CONFIRMATION DIALOGS

##########################################################

Deleting Product

Delete Gallery Image

Cancel Reservation

Disable Barber

Reset Loyalty

Always require confirmation.

---

##########################################################

AUDIT LOG

##########################################################

Every admin action

↓

Event Log

Contains

Admin

Action

Date

Target

Result

Example

Created Service

Assigned Subscription

Deleted Product

Cancelled Reservation

Scanned QR

---

##########################################################

PERMISSIONS

##########################################################

Only authenticated admin.

No public dashboard routes.

Automatic logout after prolonged inactivity (future-ready).

---

##########################################################

RESPONSIVE

##########################################################

Desktop

Sidebar

Tablet

Collapsible Sidebar

Mobile

Drawer Navigation

Everything fully responsive.

---

##########################################################

FINAL GOAL

The barber should be able to manage an entire working day without leaving the dashboard.

Everything should feel immediate.

Everything should be accessible within a few taps.

The dashboard should behave like professional business software rather than a traditional admin panel.
