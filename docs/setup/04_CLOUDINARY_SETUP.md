# Cloudinary Setup

Djo Coiffe uses Cloudinary for robust image hosting, on-the-fly transformations, and optimized delivery. 

## 1. Create a Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account.
2. Once logged in, go to your **Dashboard**.
3. Note your **Cloud Name** located at the top of the dashboard.
4. Add it to your `.env` file:
   `VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name`

## 2. Configure Unsigned Uploads
By default, uploads to Cloudinary require server-side signature validation. Since Djo Coiffe is a client-heavy application (without a Node.js backend), we use **Unsigned Uploads** via an Upload Preset.

1. In the Cloudinary Console, go to **Settings** (gear icon) > **Upload**.
2. Scroll down to **Upload presets**.
3. Click **Add upload preset**.
4. Set the **Upload preset name** to something recognizable (e.g., `djo_coiffe_preset`).
5. Change **Signing Mode** to **Unsigned**.
6. (Optional) Under **Upload Manipulations**, set incoming image formats to convert to `webp` automatically for performance.
7. Click **Save**.
8. Add the preset name to your `.env` file:
   `VITE_CLOUDINARY_UPLOAD_PRESET=djo_coiffe_preset`

## 3. Verify Configuration
With `.env` populated, the application uses `src/services/upload.service.ts` to push files directly to Cloudinary.

1. Run the app (`npm run dev`).
2. Log in as an Admin (`/admin`).
3. Navigate to **Gallery** or **Products**.
4. Attempt to add a new image.
5. **Expected Outcome**: The image should upload quickly, and the Cloudinary URL (e.g., `https://res.cloudinary.com/...`) should immediately render on the page.

### Common Errors
- **Error: 401 Unauthorized**: This means your `VITE_CLOUDINARY_UPLOAD_PRESET` is either incorrect or is set to "Signed" instead of "Unsigned".
- **Error: 400 Bad Request**: This usually means the `VITE_CLOUDINARY_CLOUD_NAME` is invalid.

---
**Next Step:** Review all environment variables in [05_ENV_CONFIGURATION.md](./05_ENV_CONFIGURATION.md).
