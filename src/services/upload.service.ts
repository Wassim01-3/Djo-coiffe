// This file provides client-side image compression and upload to Cloudinary.

// Cloudinary settings
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dfqymj55x'
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'djo_coiffe_preset'
const MAX_DIMENSION = 1920
const MAX_FILE_SIZE_KB = 500

/**
 * Resizes and compresses an image file before upload.
 */
export const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Le fichier doit être une image.'))
    }
    // Accept gif, svg, etc but compression is mostly for jpeg, png, webp.
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)

      let width = img.width
      let height = img.height

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width)
          width = MAX_DIMENSION
        } else {
          width = Math.round((width * MAX_DIMENSION) / height)
          height = MAX_DIMENSION
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Canvas non supporté.'))
      }
      ctx.drawImage(img, 0, 0, width, height)

      // Try webp first, fallback to jpeg
      let quality = 0.85
      const compress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Erreur de compression.'))
            if (blob.size / 1024 > MAX_FILE_SIZE_KB && quality > 0.5) {
              quality -= 0.1
              compress()
            } else {
              resolve(blob)
            }
          },
          'image/webp',
          quality,
        )
      }
      compress()
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image invalide.'))
    }
    img.src = url
  })
}

export type CloudinaryFolder = 'logo' | 'gallery' | 'products' | 'barbers' | 'backgrounds' | 'temporary'

export const uploadToCloudinary = async (
  fileOrBlob: File | Blob,
  folder: CloudinaryFolder,
): Promise<string> => {
  const formData = new FormData()
  formData.append('file', fileOrBlob)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', `djo_coiffe/${folder}`)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error?.message || "Erreur lors de l'upload")
    }
    // Return secure url
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}
