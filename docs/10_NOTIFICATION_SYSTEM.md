# DJO COIFFE

# NOTIFICATION SYSTEM

Version 1.0

---

# OBJECTIVE

The notification system keeps customers and the barber informed.

Notifications must be:

• Useful

• Timely

• Non-intrusive

• Fast

• Reliable

The application should never spam users.

Every notification should have a purpose.

---

##########################################################

NOTIFICATION TYPES

##########################################################

There are two categories.

1.

Push Notifications

Displayed by the browser or Android application.

2.

In-App Notifications

Displayed inside the application.

Every push notification must also exist inside the notification center.

---

##########################################################

CUSTOMER NOTIFICATIONS

##########################################################

Reservation Created

Reservation Cancelled

Reservation Reminder

Waitlist Offer

Reservation Completed

Loyalty Reward

Subscription Assigned

Subscription Expired

Subscription Finished

General Announcement

Maintenance Notice

---

##########################################################

ADMIN NOTIFICATIONS

##########################################################

New Reservation

Reservation Cancelled

Waitlist Accepted

Invalid QR

Cloudinary Upload Failed

System Error

General Announcement

---

##########################################################

FIRESTORE COLLECTION

##########################################################

notifications

Fields

id

customerId

title

message

type

icon

priority

read

createdAt

action

actionId

metadata

---

##########################################################

NOTIFICATION PRIORITY

##########################################################

Low

Information

Medium

Reservation

High

Waitlist

Critical

Maintenance

---

##########################################################

NOTIFICATION ICONS

##########################################################

Reservation

Calendar

Reminder

Clock

Reward

Gift

Subscription

Credit Card

Waitlist

Users

Announcement

Megaphone

Error

Triangle Alert

Success

Circle Check

---

##########################################################

WHEN TO CREATE NOTIFICATIONS

##########################################################

Reservation Created

↓

Reservation Confirmation

Reservation Cancelled

↓

Cancellation

QR Scanned

↓

Reservation Completed

Reward Generated

↓

Congratulations

Subscription Assigned

↓

Membership Active

Subscription Finished

↓

Membership Finished

Waitlist Offer

↓

Seat Available

Maintenance Enabled

↓

Shop Closed

---

##########################################################

RESERVATION REMINDERS

##########################################################

Reminder

24 Hours Before

Reminder

1 Hour Before

If reservation cancelled

↓

Do not send reminder.

---

##########################################################

WAITLIST NOTIFICATION

##########################################################

Seat becomes available.

↓

First customer notified.

↓

Countdown

15 minutes

Customer accepts

↓

Reservation created

Customer declines

↓

Next customer

Customer ignores

↓

Next customer

Notification expires automatically.

---

##########################################################

LOYALTY NOTIFICATION

##########################################################

Completed haircut number 5

↓

Reward created

↓

Customer notified

Title

Congratulations!

Message

Your free haircut is ready.

Action

Open Loyalty Page

---

##########################################################

SUBSCRIPTION NOTIFICATIONS

##########################################################

Assigned

↓

Welcome

Remaining Haircuts

↓

Updated after every completed reservation.

One Haircut Remaining

↓

Reminder

Expired

↓

Expired notification

Finished

↓

Subscription completed

---

##########################################################

GENERAL ANNOUNCEMENTS

##########################################################

Administrator may create announcement.

Examples

Holiday Closing

New Service

Promotion

Working Hours Updated

Displayed to

Everyone

or

Selected Customers

---

##########################################################

PUSH NOTIFICATIONS

##########################################################

Use

Firebase Cloud Messaging

Permission requested

Only after login.

Never immediately.

If denied

↓

Application continues normally.

---

##########################################################

PERMISSION FLOW

##########################################################

Login

↓

Use app normally

↓

Second reservation OR second visit

↓

Ask

Allow Notifications?

Explain benefits before asking permission.

---

##########################################################

NOTIFICATION CENTER

##########################################################

Grouped

Today

Yesterday

Earlier

Unread

Gold dot

Read

Gray

Tap

↓

Open related page

---

##########################################################

NOTIFICATION ACTIONS

##########################################################

Reservation

↓

Reservation Details

Reward

↓

Loyalty Page

Subscription

↓

Subscription Page

Waitlist

↓

Accept Offer

General

↓

Home

---

##########################################################

READ STATUS

##########################################################

Opening notification

↓

Marked Read

Button

Mark All Read

Delete notification

Admin only

Customer cannot delete history.

---

##########################################################

IN-APP TOASTS

##########################################################

Success

Green

Error

Red

Information

Blue

Reward

Gold

Duration

3 seconds

Animated

Slide Down

---

##########################################################

OFFLINE

##########################################################

Offline

↓

Store notifications locally.

Reconnect

↓

Synchronize

Never lose notifications.

---

##########################################################

FAILED DELIVERY

##########################################################

Push failed

↓

Still stored

Firestore

Customer sees notification when app opens.

---

##########################################################

NOTIFICATION BADGE

##########################################################

Bottom Navigation

More

↓

Unread count

Profile

↓

Notification icon

Admin Dashboard

↓

Bell badge

---

##########################################################

NOTIFICATION SETTINGS

##########################################################

Customer

Enable Push

Reservation Reminders

Waitlist

Rewards

Subscriptions

Announcements

Administrator

System Notifications

Reservation Alerts

Waitlist Alerts

---

##########################################################

AUTOMATIC CLEANUP

##########################################################

Notifications older than

180 days

↓

Archived

Unread notifications

Never deleted automatically.

---

##########################################################

SOUNDS

##########################################################

Optional

Reservation

Soft Bell

Reward

Celebration

Waitlist

Urgent Bell

Error

Soft Alert

Can be muted.

---

##########################################################

VIBRATION

##########################################################

Android

Short vibration

Important notifications only.

---

##########################################################

SECURITY

##########################################################

Customers

Read only own notifications.

Administrator

Read all.

Only administrator may create announcements.

---

##########################################################

PERFORMANCE

##########################################################

Query only

Latest 20 notifications.

Load more

On scroll.

Infinite scrolling.

Never download everything.

---

##########################################################

EMPTY STATE

##########################################################

Illustration

Bell

Message

No notifications yet.

Button

Return Home

---

##########################################################

FINAL GOAL

Customers should always know what is happening.

Notifications should feel helpful.

Never overwhelming.

Every important event must be communicated.

Every notification must have a clear destination.
