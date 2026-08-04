import { Cloudinary } from '@cloudinary/url-gen'

// Cloudinary Configuration
// These should ideally be in a .env file and validated, but we use meta.env here for Vite
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset'

// Initialize Cloudinary instance for URL generation and transformations
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUD_NAME,
  },
  url: {
    secure: true,
  },
})

/**
 * Utility function to compress an image file before upload.
 * It resizes the image so the longest side is max 1920px and converts to WebP.
 * Targets ~500KB max file size using quality adjustment.
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  quality = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image'))
    }

    const img = new Image()
    img.src = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(img.src)

      let width = img.width
      let height = img.height

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxWidth) / height)
          height = maxWidth
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Failed to get canvas context'))
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convert to WebP format
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Failed to compress image'))
          }

          // Generate UUID-like name
          const uuid = crypto.randomUUID().split('-')[0] // short UUID
          const filename = `${uuid}.webp`

          const compressedFile = new File([blob], filename, {
            type: 'image/webp',
            lastModified: Date.now(),
          })

          resolve(compressedFile)
        },
        'image/webp',
        quality,
      )
    }

    img.onerror = (err) => reject(err)
  })
}

/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'temporary',
): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to upload image')
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

/**
 * Convenience function that compresses an image and then uploads it.
 */
export async function compressAndUploadImage(
  file: File,
  folder = 'temporary',
): Promise<string> {
  // Max size is 2MB based on documentation
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Image exceeds maximum size of 2MB')
  }

  const compressedFile = await compressImage(file)
  const imageUrl = await uploadToCloudinary(compressedFile, folder)
  return imageUrl
}
