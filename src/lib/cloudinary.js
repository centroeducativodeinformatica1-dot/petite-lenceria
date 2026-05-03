// src/lib/cloudinary.js

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.error('ENV ERROR ❌', { cloudName: CLOUD_NAME, preset: UPLOAD_PRESET })
}

/**
 * Sube una imagen a Cloudinary usando un upload preset unsigned.
 * @param {File} file - El archivo de imagen a subir
 * @returns {Promise<string>} - La URL segura de la imagen subida
 */
export async function uploadImage(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Faltan variables de entorno de Cloudinary')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message || 'Error al subir imagen a Cloudinary')
  }

  const data = await res.json()
  return data.secure_url
}
