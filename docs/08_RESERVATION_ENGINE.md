# DJO COIFFE

# RESERVATION ENGINE

Version 1.0

---

# OBJECTIVE

The reservation engine is the heart of Djo Coiffe.

It must guarantee that:

• Two customers can never reserve the same chair at the same time.

• Reservation durations are respected.

• Waiting lists work automatically.

• Loyalty updates automatically.

• Subscription updates automatically.

• QR validation is secure.

• Every reservation is traceable.

The engine must remain fast even after years of data.

---

##########################################################

RESERVATION FLOW

##########################################################

Customer

↓

Choose Service

↓

Choose Barber

↓

Choose Date

↓

Generate Available Time Slots

↓

Choose Time

↓

Reservation Validation

↓

Generate QR

↓

Firestore

↓

Notification

↓

Success Screen

---

##########################################################

SHOP OPENING HOURS

##########################################################

Reservations can only be created during opening hours.

Opening hours are configured in:

settings/app

Example

Monday

08:00 → 19:00

Tuesday

08:00 → 19:00

Sunday

Closed

If shop closed

↓

Reservation impossible

---

##########################################################

TIME SLOT SYSTEM

##########################################################

Time slot size

30 minutes

Example

08:00

08:30

09:00

09:30

10:00

...

Last possible slot depends on

Closing Hour

Service Duration

---

##########################################################

SERVICE DURATIONS

##########################################################

Examples

Haircut

30 min

Haircut + Beard

60 min

Beard

30 min

Hair Coloring

90 min

Protein

120 min

Brushing

60 min

Administrator can modify durations.

---

##########################################################

AUTOMATIC SLOT CALCULATION

##########################################################

Reservation duration determines blocked slots.

Example

Haircut

30 min

↓

08:00 reserved

Example

Haircut + Beard

60 min

↓

08:00 reserved

08:30 reserved

Example

Protein

120 min

↓

08:00

08:30

09:00

09:30

All blocked automatically.

---

##########################################################

BARBER AVAILABILITY

##########################################################

Every barber has an independent calendar.

Reservation only affects

Selected barber.

Other barbers remain available.

---

##########################################################

GENERATING AVAILABLE TIMES

##########################################################

Algorithm

Opening Hour

↓

Generate all slots

↓

Remove reserved slots

↓

Remove unavailable slots

↓

Remove slots that cannot fit service duration

↓

Display remaining slots

---

##########################################################

EXAMPLE

##########################################################

Opening

08:00

Closing

18:00

Service

90 minutes

Last reservation

16:30

Because

16:30

17:00

17:30

Ends

18:00

18:00 reservation impossible.

---

##########################################################

OVERLAP DETECTION

##########################################################

Never allow

Reservation overlap.

Example

Customer A

09:00 → 10:00

Customer B

09:30

↓

Rejected.

---

##########################################################

DOUBLE BOOKING

##########################################################

Customer cannot have

Two active reservations

At overlapping times.

Administrator can override.

---

##########################################################

RESERVATION VALIDATION

##########################################################

Before saving

Validate

Customer exists

↓

Service enabled

↓

Barber enabled

↓

Date valid

↓

Shop open

↓

Enough slots

↓

No overlap

↓

Reservation enabled

↓

Save

---

##########################################################

QR GENERATION

##########################################################

Immediately after reservation

Generate

UUID v4

Store

qrToken

Generate QR Image

Display

Save

Download

Share

---

QR NEVER contains

Firestore ID

Customer ID

Phone Number

Name

Only

Secure Token

---

##########################################################

RESERVATION STATUS

##########################################################

Pending

↓

Confirmed

↓

Completed

OR

Cancelled

OR

Expired

---

Pending

Created

Confirmed

Accepted

Completed

QR Scanned

Cancelled

Customer cancelled

Expired

Past reservation never scanned

---

##########################################################

RESERVATION EXPIRATION

##########################################################

Reservation not scanned

↓

After appointment passes

↓

Expired

↓

Archived

---

##########################################################

CUSTOMER CANCELLATION

##########################################################

Allowed until

Configurable

Example

2 hours before appointment

Administrator can modify.

Cancellation

↓

Free slots

↓

Notify Waitlist

---

##########################################################

WAITLIST

##########################################################

Customer presses

Join Waitlist

↓

Position assigned

↓

Stored

↓

Wait

Cancellation

↓

First customer notified

↓

15 minute countdown

Accept

↓

Reservation created automatically

Decline

↓

Next customer

Timeout

↓

Next customer

---

##########################################################

WAITLIST PRIORITY

##########################################################

FIFO

First Joined

↓

First Offered

No manual ordering.

---

##########################################################

ADMIN UNAVAILABLE SLOT

##########################################################

Administrator selects

Barber

↓

Date

↓

Time

↓

Unavailable

Color

Gray

Reason optional

Example

Lunch

Vacation

Meeting

Maintenance

---

##########################################################

ADMIN RESERVATION

##########################################################

Administrator may create reservation manually.

Used for

Walk-in customer

Phone reservation

Manual correction

Uses same engine.

---

##########################################################

TODAY'S QUEUE

##########################################################

Admin Dashboard

Today's Reservations

Sorted

Time

↓

Chair

↓

Customer

↓

Status

Card Example

09:30

Ahmed

Haircut

Chair 2

Pending

Scan QR

---

Completed

↓

Green Card

---

Cancelled

↓

Gray Card

---

##########################################################

QR SCAN

##########################################################

Scan

↓

Token Exists

↓

Reservation Exists

↓

Already Completed?

↓

NO

↓

Complete Reservation

↓

Move to Completed Today

↓

Update Loyalty

↓

Update Subscription

↓

Create Event

↓

Send Notification

---

##########################################################

INVALID QR

##########################################################

Unknown QR

↓

Red Animation

↓

Sound

↓

Invalid QR

Already used

↓

Already redeemed

Expired

↓

Reservation expired

---

##########################################################

LOYALTY INTEGRATION

##########################################################

Eligible service?

↓

YES

↓

Completed

↓

Counter++

Counter == 5

↓

Reward Generated

↓

Customer Notification

---

##########################################################

SUBSCRIPTION INTEGRATION

##########################################################

Subscription Active?

↓

YES

↓

Completed

↓

Remaining--

Remaining == 0

↓

Finished

↓

Notification

---

##########################################################

EVENT LOG

##########################################################

Every reservation creates events.

Created

Updated

Cancelled

Completed

Reward Generated

Subscription Used

Waitlist Accepted

QR Scanned

Everything logged.

---

##########################################################

NOTIFICATIONS

##########################################################

Customer

Reservation Confirmed

Reminder

Tomorrow

Reminder

1 Hour

Reservation Cancelled

Reward Earned

Subscription Updated

Waitlist Available

Admin

New Reservation

Cancellation

Waitlist Accepted

Invalid Scan

---

##########################################################

EDGE CASES

##########################################################

Barber Disabled

↓

Reservations impossible

Shop Closed

↓

Reservations impossible

Maintenance Mode

↓

Reservations disabled

No Internet

↓

Reservation unavailable

Expired Subscription

↓

Ignored

Reward Already Used

↓

Reject

QR Already Used

↓

Reject

---

##########################################################

PERFORMANCE

##########################################################

Never download all reservations.

Query

Selected Barber

Selected Date

Only

This keeps reads extremely low.

Compatible with Spark Plan.

---

##########################################################

FINAL OBJECTIVE

The reservation engine must behave like a commercial booking platform.

Every reservation is validated.

Every conflict prevented.

Every action logged.

Every customer receives immediate feedback.

No inconsistent data is ever created.
