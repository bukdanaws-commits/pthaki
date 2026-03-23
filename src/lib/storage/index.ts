import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Storage bucket names
export const BUCKETS = {
  AI_AVATARS: 'ai-avatars',
  PARTICIPANT_PHOTOS: 'participant-photos',
  QR_CODES: 'qr-codes',
  EVENT_ASSETS: 'event-assets', // Banner, logo, etc.
} as const

// Create Supabase admin client for storage operations
function getStorageClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Initialize storage buckets
 * This creates the buckets if they don't exist and sets public access
 */
export async function initializeStorageBuckets() {
  const supabase = getStorageClient()
  const results: string[] = []

  for (const bucketName of Object.values(BUCKETS)) {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        results.push(`${bucketName}: List error - ${listError.message}`)
        continue
      }

      const exists = buckets?.some(b => b.name === bucketName)
      
      if (!exists) {
        // Create bucket
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        })
        
        if (createError) {
          results.push(`${bucketName}: Create error - ${createError.message}`)
        } else {
          results.push(`${bucketName}: Created successfully`)
        }
      } else {
        results.push(`${bucketName}: Already exists`)
      }
    } catch (error) {
      results.push(`${bucketName}: Error - ${String(error)}`)
    }
  }

  return results
}

/**
 * Ensure a bucket exists, create if it doesn't
 * @param bucketName - Name of the bucket
 * @returns Success status
 */
async function ensureBucketExists(bucketName: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getStorageClient()
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      return { success: false, error: `Failed to list buckets: ${listError.message}` }
    }

    const exists = buckets?.some(b => b.name === bucketName)
    
    if (!exists) {
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      })
      
      if (createError) {
        return { success: false, error: `Failed to create bucket: ${createError.message}` }
      }
    }
    
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Upload image to Supabase storage
 * @param bucket - Bucket name
 * @param path - File path within bucket (e.g., 'avatars/user123.png')
 * @param imageData - Base64 image data or Buffer
 * @param contentType - MIME type
 * @returns Public URL of uploaded image
 */
export async function uploadImage(
  bucket: string,
  path: string,
  imageData: string | Buffer,
  contentType: string = 'image/png'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Ensure bucket exists first
    const bucketCheck = await ensureBucketExists(bucket)
    if (!bucketCheck.success) {
      return bucketCheck
    }
    
    const supabase = getStorageClient()

    // Convert base64 to buffer if needed
    let buffer: Buffer
    
    if (typeof imageData === 'string') {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
      buffer = Buffer.from(base64Data, 'base64')
    } else {
      buffer = imageData
    }

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: true, // Overwrite if exists
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Upload image error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Upload AI avatar to storage
 * @param participantId - Participant ID
 * @param imageData - Base64 image data
 * @returns Public URL of uploaded avatar
 */
export async function uploadAIAvatar(
  participantId: string,
  imageData: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const path = `${participantId}.png`
  return uploadImage(BUCKETS.AI_AVATARS, path, imageData, 'image/png')
}

/**
 * Upload participant photo to storage
 * @param participantId - Participant ID
 * @param imageData - Base64 image data
 * @returns Public URL of uploaded photo
 */
export async function uploadParticipantPhoto(
  participantId: string,
  imageData: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const path = `${participantId}.png`
  return uploadImage(BUCKETS.PARTICIPANT_PHOTOS, path, imageData, 'image/png')
}

/**
 * Upload QR code to storage
 * @param qrCode - QR code identifier
 * @param imageData - Base64 image data
 * @returns Public URL of uploaded QR code
 */
export async function uploadQRCodeImage(
  qrCode: string,
  imageData: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const path = `${qrCode}.png`
  return uploadImage(BUCKETS.QR_CODES, path, imageData, 'image/png')
}

/**
 * Delete image from storage
 * @param bucket - Bucket name
 * @param path - File path within bucket
 */
export async function deleteImage(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getStorageClient()
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Get public URL for an image
 * @param bucket - Bucket name
 * @param path - File path within bucket
 * @returns Public URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getStorageClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Upload event asset (banner, logo, etc.) to storage
 * @param type - Asset type (banner, logo, etc.)
 * @param imageData - Base64 image data
 * @param contentType - MIME type
 * @returns Public URL of uploaded asset
 */
export async function uploadEventAsset(
  type: 'banner' | 'logo' | 'other',
  imageData: string,
  contentType: string = 'image/png'
): Promise<{ success: boolean; url?: string; error?: string }> {
  const extension = contentType.split('/')[1] || 'png'
  const path = `${type}-${Date.now()}.${extension}`
  return uploadImage(BUCKETS.EVENT_ASSETS, path, imageData, contentType)
}
