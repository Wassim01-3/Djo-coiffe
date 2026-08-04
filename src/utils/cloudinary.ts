/** Cloudinary cloud name from env */
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string

/**
 * Build an optimized Cloudinary URL for a given public ID.
 * Applies automatic format, quality, and optional width transform.
 */
export function getCloudinaryUrl(
  publicId: string,
  options: { width?: number; quality?: string } = {},
): string {
  const { width, quality = 'auto' } = options
  const transforms = [`f_auto`, `q_${quality}`]
  if (width) transforms.push(`w_${width}`)
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`
}

/**
 * Upload a file to Cloudinary via unsigned upload preset.
 * Returns the public_id and secure_url.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<{ publicId: string; secureUrl: string }> {
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  )

  if (!response.ok) {
    throw new Error("Échec du téléversement de l'image")
  }

  const data = (await response.json()) as {
    public_id: string
    secure_url: string
  }
  return { publicId: data.public_id, secureUrl: data.secure_url }
}
