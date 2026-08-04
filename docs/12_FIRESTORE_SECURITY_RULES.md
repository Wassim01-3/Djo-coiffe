# DJO COIFFE

# FIRESTORE SECURITY RULES

Version 1.0

---

# OBJECTIVE

This document defines every Firestore security rule.

Goals

• Protect customer data

• Prevent unauthorized access

• Prevent data corruption

• Minimize abuse

• Keep compatibility with Firebase Spark

---

##########################################################

SECURITY PRINCIPLES

##########################################################

Default rule

DENY EVERYTHING

Every permission must be explicitly granted.

Never rely only on frontend validation.

---

##########################################################

ADMIN AUTHENTICATION

##########################################################

Administrator

Firebase Authentication

Role

admin

Only authenticated administrators may

Create

Update

Delete

Business data.

---

##########################################################

CUSTOMER AUTHENTICATION

##########################################################

Customer

Stored session

Customer ID

Every write operation must verify ownership.

Customers never become administrators.

---

##########################################################

COLLECTION RULES

##########################################################

users

Admins

Full Access

Customers

Read own profile

Update

Only

Name

Phone

Notification Settings

Preferred Barber

Never modify

Completed Haircuts

Reward

Subscription

CreatedAt

---

##########################################################

RESERVATIONS

##########################################################

Customer

Create

Own reservation only

Read

Own reservations

Cancel

Own future reservation

Cannot

Edit completed reservation

Edit another customer

Delete reservation

Administrator

Full access.

---

##########################################################

RESERVATION EVENTS

##########################################################

Customer

Read

Own events

Cannot create.

Cannot delete.

Administrator

Full access.

---

##########################################################

SERVICES

##########################################################

Customer

Read only.

Administrator

Create

Update

Delete

---

##########################################################

BARBERS

##########################################################

Customer

Read only.

Administrator

Full CRUD.

---

##########################################################

PRODUCTS

##########################################################

Customer

Read only.

Administrator

Full CRUD.

---

##########################################################

GALLERY

##########################################################

Customer

Read only.

Administrator

Full CRUD.

---

##########################################################

NOTIFICATIONS

##########################################################

Customer

Read

Own notifications

Update

Read status only

Cannot

Delete

Create

Administrator

Full access.

---

##########################################################

LOYALTY

##########################################################

Customer

Read own reward

Cannot modify

Administrator

Full access

---

##########################################################

SUBSCRIPTIONS

##########################################################

Customer

Read own subscription

Administrator

Full CRUD.

---

##########################################################

WAITLIST

##########################################################

Customer

Create own request

Read own request

Cancel own request

Administrator

Full CRUD.

---

##########################################################

SETTINGS

##########################################################

Customer

Read only.

Administrator

Update only.

---

##########################################################

CONTACT

##########################################################

Everyone

Read

Administrator

Update

---

##########################################################

VALIDATION RULES

##########################################################

Phone Number

8 digits

Customer Name

3-60 characters

Reservation Date

Future only

Duration

Positive

Price

Positive

Seat Number

1-4

---

##########################################################

RESERVATION VALIDATION

##########################################################

Before write

Check

Reservation Enabled

↓

Maintenance Mode Off

↓

Barber Enabled

↓

Service Enabled

↓

Valid Date

↓

Valid Time

↓

Enough Slots

↓

No Conflict

---

##########################################################

ANTI-SPAM

##########################################################

Customer cannot create

Multiple identical reservations.

Customer cannot

Spam waitlist.

Customer cannot

Generate rewards.

Customer cannot

Generate subscriptions.

---

##########################################################

IMMUTABLE FIELDS

##########################################################

Customers cannot modify

createdAt

updatedAt

rewardAvailable

completedHaircuts

subscriptionId

reservationHistory

eventHistory

---

##########################################################

SERVER TIMESTAMPS

##########################################################

Always use

serverTimestamp()

Never client clock.

---

##########################################################

DOCUMENT IDS

##########################################################

Never predictable.

Always UUID.

Never use

Phone Number

Name

Date

As document ID.

---

##########################################################

QUERY RULES

##########################################################

Always query

Indexed fields.

Never download

Entire collections.

Limit

20

Default.

Pagination required.

---

##########################################################

COMPOSITE INDEXES

##########################################################

Reservations

date + barberId

date + status

customerId + date

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

RATE LIMITING

##########################################################

Frontend

Debounce

Reservation Button

Login Button

Search

Scanner

---

##########################################################

CLIENT VALIDATION

##########################################################

Frontend validates

↓

Backend validates

↓

Firestore rules validate

Three validation layers.

---

##########################################################

ERROR MESSAGES

##########################################################

Never expose

Firestore path

Permission names

Internal IDs

Friendly messages only.

---

##########################################################

OFFLINE

##########################################################

Offline writes

Queued.

Validation

Occurs when synchronized.

Conflicts

Resolved gracefully.

---

##########################################################

BACKUP STRATEGY

##########################################################

Daily Firestore export

Future feature.

Not required in MVP.

---

##########################################################

AUDIT

##########################################################

Every admin modification

↓

Reservation Event

or

Audit Event

Examples

Product Deleted

Service Updated

Barber Disabled

Settings Changed

Subscription Assigned

---

##########################################################

PROTECTED COLLECTIONS

##########################################################

Admins only

admins

settings

services

barbers

products

gallery

subscription_plans

---

##########################################################

PUBLIC COLLECTIONS

##########################################################

Read only

gallery

products

services

contact

settings

---

##########################################################

FINAL GOAL

A malicious customer should never be able to:

Modify another customer.

Generate free rewards.

Create fake subscriptions.

Reserve unavailable slots.

Modify products.

Modify gallery.

Access administrator data.

The administrator should have complete control while customers can only interact with their own information.
