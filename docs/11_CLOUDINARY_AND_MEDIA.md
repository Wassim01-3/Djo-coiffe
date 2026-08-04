# DJO COIFFE

# CLOUDINARY & MEDIA ARCHITECTURE

Version 1.0

---

# OBJECTIVE

Cloudinary is responsible for all media files.

Firebase Storage must NEVER be used.

Every image must be:

• Optimized

• Compressed

• Cached

• Responsive

• Fast

• Secure

Firestore stores ONLY image URLs.

---

##########################################################

MEDIA TYPES

##########################################################

Logo

Gallery Images

Product Images

Future Background Images

Future Barber Avatars

---

##########################################################

CLOUDINARY FOLDERS

##########################################################

logo/

gallery/

products/

barbers/

backgrounds/

temporary/

---

##########################################################

IMAGE FORMAT

##########################################################

Preferred format

WebP

Fallback

JPEG

PNG only when transparency is required.

---

##########################################################

UPLOAD FLOW

##########################################################

Admin selects image

↓

Preview displayed

↓

Compress locally

↓

Upload to Cloudinary

↓

Receive URL

↓

Store URL in Firestore

↓

Display Success

---

##########################################################

CLIENT SIDE COMPRESSION

##########################################################

Before upload

Resize

↓

Compress

↓

Convert

↓

Upload

Maximum upload size

2 MB

Target size

500 KB

Maximum dimensions

1920px

---

##########################################################

LOGO

##########################################################

Folder

logo/

Only one logo.

Replacing logo

↓

Delete previous

↓

Upload new

↓

Update Firestore

---

##########################################################

PRODUCT IMAGES

##########################################################

Folder

products/

Recommended

1200x1200

Square

Responsive

Displayed

Lazy Loaded

---

##########################################################

GALLERY

##########################################################

Folder

gallery/

Recommended

1200px longest side

Display

Masonry Grid

Fullscreen

Zoom

Swipe

---

##########################################################

BARBER AVATARS

##########################################################

Folder

barbers/

Square

600x600

Optional

Fallback

Default avatar

---

##########################################################

IMAGE NAMING

##########################################################

Never use original filenames.

Generate

UUID

Examples

gallery_4d5f8a.webp

product_8bf74e.webp

logo_2c6de.webp

---

##########################################################

CLOUDINARY TRANSFORMATIONS

##########################################################

Thumbnail

300px

Medium

800px

Original

1920px

Customer pages

↓

Load Thumbnail

Fullscreen

↓

Load Medium

Never download Original unless necessary.

---

##########################################################

LAZY LOADING

##########################################################

Every image

Lazy loaded.

Placeholder

↓

Skeleton

↓

Fade in

---

##########################################################

CACHING

##########################################################

Browser Cache

Enabled

Cloudinary CDN

Enabled

Do not manually cache image URLs.

---

##########################################################

IMAGE DELETION

##########################################################

Admin deletes image

↓

Delete from Firestore

↓

Delete from Cloudinary

↓

Refresh gallery

Never leave orphaned images.

---

##########################################################

UPLOAD VALIDATION

##########################################################

Accepted

JPEG

PNG

WEBP

Maximum

2 MB

Reject

GIF

SVG

TIFF

BMP

Executable files

---

##########################################################

ERROR HANDLING

##########################################################

Upload Failed

↓

Retry Button

Connection Lost

↓

Resume Upload

Invalid Image

↓

Friendly Error

---

##########################################################

RESPONSIVE IMAGES

##########################################################

Mobile

300px

Tablet

800px

Desktop

1200px

Fullscreen

Original optimized version

---

##########################################################

PRODUCT PLACEHOLDER

##########################################################

If image missing

↓

Default product placeholder

Never broken image.

---

##########################################################

GALLERY PLACEHOLDER

##########################################################

If image missing

↓

Gallery placeholder

Never empty container.

---

##########################################################

UPLOAD PROGRESS

##########################################################

Progress Bar

Percentage

Cancel Upload

Retry Upload

---

##########################################################

SECURITY

##########################################################

Only authenticated administrator

may upload.

Customers

Read only.

---

##########################################################

OPTIMIZATION

##########################################################

Automatic Quality

Auto Format

Responsive Width

CDN Delivery

Enable all Cloudinary optimizations.

---

##########################################################

OFFLINE

##########################################################

Offline

↓

Upload disabled

Friendly message

Images already loaded

↓

Remain cached

---

##########################################################

PERFORMANCE

##########################################################

Never load all gallery images.

Pagination

12 images

Load More

Infinite Scroll

Products

First 10

Load more if needed.

---

##########################################################

FUTURE READY

##########################################################

Support

Videos

360 Images

Stories

Short Reels

Without changing architecture.

---

##########################################################

FINAL GOAL

Media must load almost instantly.

Every upload should feel professional.

Every image should be optimized automatically.

Cloudinary should be completely transparent to the customer.
