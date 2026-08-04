# DJO COIFFE

## COMPLETE PROJECT OVERVIEW

---

# ROLE

You are an experienced Senior Software Architect, Senior UI/UX Designer, Senior React Developer, Firebase Architect and Mobile Application Developer.

Your mission is to build a production-ready barber shop management application.

This application must not look like an AI-generated project.

It must look like it was developed by an experienced software company.

Every page must be polished.

Every interaction must be intuitive.

Every animation must be smooth.

Every component must be reusable.

Every line of code must be scalable.

---

# PROJECT OBJECTIVE

Develop a premium barber shop reservation and management platform called **Djo Coiffe**.

The application must be:

• Mobile First

• Responsive

• Fast

• Secure

• Professional

• Easy to use

• Easy to maintain

• Easily scalable

The application will be accessed by:

• Customers

• Barbers

• Administrator

There is only one barber shop.

No multi-shop support is required.

---

# PROJECT PHILOSOPHY

The application should remove almost every phone call between customers and the barber.

Everything should happen digitally.

Reservation.

Gallery.

Subscriptions.

Products.

Loyalty.

Notifications.

QR Validation.

Everything should be managed from the application.

---

# USER TYPES

## CUSTOMER

A customer can:

Create an account

Login

Reserve

View reservations

Cancel reservation

View products

View gallery

View subscriptions

View loyalty

Receive notifications

Generate QR Codes

View contact page

Install the application

Logout

---

## BARBER

The barber uses the Admin Dashboard.

The barber can:

Scan QR Codes

Validate reservations

Manage reservations

Manage unavailable slots

Manage gallery

Manage products

Manage subscriptions

Manage services

Manage clients

Manage seats

Manage contact information

---

## ADMIN

The administrator has full access.

There is only one administrator account.

No role management is required.

---

# APPLICATION STRUCTURE

Customer Application

↓

Admin Dashboard

↓

Firebase

↓

Cloudinary

---

# CUSTOMER JOURNEY

The ideal customer experience should be:

Open application

↓

Beautiful landing page

↓

Reserve button

↓

Login using:

Full Name

Phone Number

↓

Choose service

↓

Choose barber

↓

Choose day

↓

Choose available time

↓

Confirm reservation

↓

Receive QR Code

↓

Receive notification

↓

Visit barber shop

↓

Barber scans QR

↓

Reservation becomes completed

↓

Loyalty updates automatically

↓

Customer receives notification

---

# BARBER JOURNEY

Open dashboard

↓

Today's reservations

↓

Customer arrives

↓

Scan reservation QR

↓

Reservation completed

↓

Loyalty automatically updated

↓

Subscription automatically updated

↓

Reservation archived

---

# HOME PAGE

The first page must impress customers.

It should feel modern.

It should not feel like an administration software.

Sections:

Hero

Reserve Button

Gallery Preview

Products Preview

Loyalty Banner

Subscription Banner

Why Choose Us

Contact Preview

Footer

---

# DESIGN STYLE

Luxury.

Minimal.

Premium.

White background.

Soft shadows.

Rounded cards.

Gold accent color.

Dark typography.

High-quality spacing.

Large touch targets.

Micro animations.

---

# APPLICATION MENU

Bottom Navigation (Mobile)

Home

Reservation

Gallery

Products

Loyalty

More

The "More" screen includes:

Subscriptions

My Reservations

Notifications

Contact

My Profile

Logout

---

# CUSTOMER ACCOUNT

Customer profile contains:

Full Name

Phone Number

Creation Date

Completed Haircuts

Free Haircut Available

Active Subscription

Reservation History

Notification Preferences

---

# RESERVATION RULES

A customer must be logged in.

Only one active reservation at the same date and time.

Cannot reserve unavailable slots.

Cannot reserve occupied slots.

Cannot reserve outside opening hours.

Reservation duration depends on selected service.

Multiple consecutive slots must be blocked automatically.

Example:

Haircut

30 min

↓

Block one slot.

Hair Coloring

90 min

↓

Block three consecutive 30-minute slots.

Protein

120 min

↓

Block four consecutive slots.

---

# SERVICES

The administrator can create unlimited services.

Each service contains:

Name

Price (TND)

Duration

Enabled

Description (optional)

Examples:

Haircut

Haircut + Beard

Beard

Hair Coloring

Protein

Brushing

Kids Haircut

---

# BARBER SEATS

Initially:

4 seats.

Administrator can reduce to:

3

2

1

Each seat contains:

Barber Name

Phone Number

Enabled

The reservation page displays only active seats.

---

# TIME SLOT STATES

Free

Reserved

Unavailable

Colors:

Green

Blue

Gray

Unavailable is manually set by the barber.

Reserved is automatic.

Free is default.

---

# WAITLIST

If a slot is full,

Customer may join the waiting list.

If a reservation is cancelled,

The first waiting customer receives a notification.

They have 15 minutes to accept.

If they ignore it,

The offer automatically passes to the next customer.

---

# QR CODE SYSTEM

Three QR code types exist.

Reservation QR

Generated after booking.

Scanned when customer arrives.

↓

Marks reservation completed.

↓

Updates loyalty.

↓

Updates subscription.

Reward QR

Generated after 5 eligible completed services.

Scanned when customer redeems the free haircut.

↓

Consumes reward.

Customer QR

Permanent personal QR.

Can be used to quickly open the customer's profile in the admin dashboard.

---

# LOYALTY PROGRAM

Only two services count:

Haircut

Haircut + Beard

Every completed eligible reservation increases the loyalty counter by one.

At 5 completed services:

Generate one free haircut reward.

Display reward QR.

Reset counter only after the reward has been redeemed.

---

# SUBSCRIPTIONS

The administrator creates subscription plans.

Each plan contains:

Name

Price

Number of Haircuts

Validity = 30 days

Enabled

Customers cannot buy subscriptions through the app.

The barber manually assigns subscriptions.

When an active subscriber reserves,

Their reservation QR identifies them as a subscription customer.

Scanning the QR decreases the remaining haircut count.

Subscriptions expire after:

30 days

or

0 remaining haircuts.

Expired subscriptions are automatically removed.

---

# PRODUCTS

Products are displayed only.

No online purchases.

Each product contains:

Photo

Name

Price

Description (optional)

---

# GALLERY

Categories:

Enfant

Jeune

Adulte

No haircut names.

No barber names.

Only beautiful photos.

Pinterest-style masonry grid.

Tap photo

↓

Fullscreen viewer.

---

# CONTACT PAGE

Contains:

Shop Name

Address

Google Maps

Phone

WhatsApp

Facebook

Instagram

Opening Hours

Logo

---

# NOTIFICATIONS

The application contains two notification systems:

Push Notifications

In-App Notification Center

Events:

Reservation Confirmed

Reservation Cancelled

Reminder 24h

Reminder 1h

Waitlist Available

Loyalty Reward

Subscription Assigned

Subscription Expiring

Subscription Expired

---

# OFFLINE MODE

The application should still open without internet.

Previously loaded pages should remain available.

Reservation requires internet.

Firestore writes require internet.

---

# ACCEPTANCE CRITERIA

The application will be considered complete only if:

Every page is responsive.

Every CRUD operation works.

Every QR works.

Every notification works.

Every reservation rule works.

Every loyalty rule works.

Every subscription rule works.

Everything uses Firebase.

Every image uses Cloudinary.

No mock data remains.

The application is ready for production deployment.
