import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateQRCode, generateUniqueQRCode } from '@/lib/qrcode'
import { registrationSchema } from '@/lib/validations'
import { uploadAIAvatar, uploadQRCodeImage, BUCKETS, initializeStorageBuckets } from '@/lib/storage'

// Avatar prompts based on profession/style
const AVATAR_PROMPTS = [
  "professional portrait of a business conference attendee, friendly smile, modern professional attire, clean white background, corporate headshot style, high quality",
  "professional portrait of a tech conference attendee, confident expression, smart casual attire, clean background, modern lighting, corporate headshot style",
  "professional portrait of an event attendee, warm smile, business casual outfit, simple studio background, professional headshot, high quality",
  "portrait of a professional at a corporate event, approachable expression, modern business attire, clean backdrop, studio lighting, corporate photography",
  "professional headshot of a conference participant, friendly demeanor, professional clothing, minimalist background, high quality portrait",
]

// Mock avatar URLs for immediate assignment (fallback)
const MOCK_AVATARS = [
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM2MzY2ZjEiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNlYzQ4OTkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiMxMGI5ODEiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM4YjVjZjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
]

// Generate AI avatar using z-ai-web-dev-sdk
async function generateAIAvatar(participant: { name: string; bio: string | null; company: string | null }): Promise<string> {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    // Build prompt based on participant info
    const promptIndex = Math.floor(Math.random() * AVATAR_PROMPTS.length)
    const basePrompt = AVATAR_PROMPTS[promptIndex]
    
    // Create contextual prompt
    let prompt = basePrompt
    if (participant.company?.toLowerCase().includes('tech')) {
      prompt = `professional portrait of a tech professional, modern smart casual attire, confident expression, clean background, corporate headshot style, high quality`
    } else if (participant.company?.toLowerCase().includes('consulting') || participant.company?.toLowerCase().includes('consultant')) {
      prompt = `professional portrait of a business consultant, formal business attire, trustworthy expression, clean background, executive headshot style, high quality`
    }

    console.log(`Generating AI avatar for ${participant.name}...`)

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1024x1024'
    })

    if (response.data && response.data[0] && response.data[0].base64) {
      // Return base64 data URL
      return `data:image/png;base64,${response.data[0].base64}`
    }
  } catch (error) {
    console.error('AI Avatar generation failed:', error)
  }

  // Fallback to mock avatar
  const mockIndex = Math.floor(Math.random() * MOCK_AVATARS.length)
  return MOCK_AVATARS[mockIndex]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registrationSchema.parse(body)
    
    // Check if email already exists
    const existingParticipant = await db.participant.findFirst({
      where: {
        email: validatedData.email,
        eventId: 'main-event',
      },
    })
    
    if (existingParticipant) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Initialize storage buckets (ensure they exist)
    try {
      await initializeStorageBuckets()
    } catch (storageError) {
      console.log('Storage init warning:', storageError)
    }
    
    // Generate unique QR code
    const qrCode = generateUniqueQRCode()
    const qrCodeBase64 = await generateQRCode(qrCode)
    
    // Generate mock avatar immediately as fallback
    const mockAvatarIndex = Math.floor(Math.random() * MOCK_AVATARS.length)
    const initialAvatarUrl = MOCK_AVATARS[mockAvatarIndex]
    
    // Create participant with mock avatar first
    const participant = await db.participant.create({
      data: {
        eventId: 'main-event',
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company || null,
        bio: validatedData.bio || null,
        photoUrl: body.photo || null,
        aiPhotoUrl: initialAvatarUrl, // Initial mock avatar
        qrCode,
        qrCodeUrl: qrCodeBase64, // Initial base64 QR
      },
    })
    
    // Upload QR code to storage
    let qrCodeStorageUrl = qrCodeBase64
    try {
      const qrUpload = await uploadQRCodeImage(qrCode, qrCodeBase64)
      if (qrUpload.success && qrUpload.url) {
        qrCodeStorageUrl = qrUpload.url
        console.log(`QR code uploaded: ${qrCodeStorageUrl}`)
      }
    } catch (qrError) {
      console.error('QR upload error:', qrError)
    }
    
    // Generate AI avatar synchronously (wait for it)
    let aiAvatarUrl = initialAvatarUrl
    try {
      const avatarBase64 = await generateAIAvatar({
        name: participant.name,
        bio: participant.bio,
        company: participant.company,
      })
      
      // Upload AI avatar to storage
      const avatarUpload = await uploadAIAvatar(participant.id, avatarBase64)
      
      if (avatarUpload.success && avatarUpload.url) {
        aiAvatarUrl = avatarUpload.url
        console.log(`AI avatar uploaded: ${aiAvatarUrl}`)
      } else {
        // Keep base64 if upload failed
        aiAvatarUrl = avatarBase64
      }
      
      // Update participant with storage URLs
      await db.participant.update({
        where: { id: participant.id },
        data: { 
          aiPhotoUrl: aiAvatarUrl,
          qrCodeUrl: qrCodeStorageUrl,
        },
      })
      
    } catch (avatarError) {
      console.error('Avatar generation/upload failed:', avatarError)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        company: participant.company,
        qrCode: participant.qrCode,
        qrCodeUrl: qrCodeStorageUrl,
        aiPhotoUrl: aiAvatarUrl,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to register participant' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const participants = await db.participant.findMany({
      where: {
        eventId: 'main-event',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })
    
    return NextResponse.json({
      success: true,
      data: participants,
    })
  } catch (error) {
    console.error('Get participants error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get participants' },
      { status: 500 }
    )
  }
}
