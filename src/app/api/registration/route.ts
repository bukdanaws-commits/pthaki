import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { generateQRCode, generateUniqueQRCode } from '@/lib/qrcode'
import { registrationSchema } from '@/lib/validations'
import { uploadAIAvatar, uploadQRCodeImage, initializeStorageBuckets } from '@/lib/storage'
import { generateImageWithAlibaba } from '@/lib/alibaba-image'

// Avatar prompts based on profession/style with personality-based colors
const AVATAR_PROMPTS = [
  "professional portrait of a business conference attendee, friendly smile, modern professional attire, clean white background, corporate headshot style, high quality",
  "professional portrait of a tech conference attendee, confident expression, smart casual attire, clean background, modern lighting, corporate headshot style",
  "professional portrait of an event attendee, warm smile, business casual outfit, simple studio background, professional headshot, high quality",
  "portrait of a professional at a corporate event, approachable expression, modern business attire, clean backdrop, studio lighting, corporate photography",
  "professional headshot of a conference participant, friendly demeanor, professional clothing, minimalist background, high quality portrait",
]

// Personality color mappings for avatar generation
const PERSONALITY_COLORS: Record<string, string> = {
  creative: 'vibrant purple and orange',
  analytical: 'cool blue and grey',
  leadership: 'bold red and gold',
  friendly: 'warm yellow and green',
  professional: 'navy blue and silver',
  innovative: 'teal and cyan',
}

// Mock avatar URLs for immediate assignment (fallback)
const MOCK_AVATARS = [
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM2MzY2ZjEiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNlYzQ4OTkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiMxMGI5ODEiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNmNTllMGIiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM4YjVjZjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTQwIiByeD0iMzUiIHJ5PSIyMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
]

// Generate AI avatar using Alibaba Cloud DashScope API
async function generateAIAvatar(participant: { name: string; bio: string | null; company: string | null }): Promise<string> {
  try {
    // Build prompt based on participant info and bio
    const promptIndex = Math.floor(Math.random() * AVATAR_PROMPTS.length)
    const basePrompt = AVATAR_PROMPTS[promptIndex]
    
    // Create contextual prompt based on bio/personality
    let prompt = basePrompt
    let personalityStyle = ''
    
    // Analyze bio for personality traits
    if (participant.bio) {
      const bioLower = participant.bio.toLowerCase()
      if (bioLower.includes('creative') || bioLower.includes('artist') || bioLower.includes('designer')) {
        personalityStyle = PERSONALITY_COLORS.creative
      } else if (bioLower.includes('analytical') || bioLower.includes('engineer') || bioLower.includes('developer')) {
        personalityStyle = PERSONALITY_COLORS.analytical
      } else if (bioLower.includes('leader') || bioLower.includes('manager') || bioLower.includes('director')) {
        personalityStyle = PERSONALITY_COLORS.leadership
      } else if (bioLower.includes('friendly') || bioLower.includes('collaborative') || bioLower.includes('team')) {
        personalityStyle = PERSONALITY_COLORS.friendly
      } else if (bioLower.includes('innovative') || bioLower.includes('startup') || bioLower.includes('entrepreneur')) {
        personalityStyle = PERSONALITY_COLORS.innovative
      }
    }
    
    // Override based on company if no personality detected
    if (!personalityStyle && participant.company) {
      const companyLower = participant.company.toLowerCase()
      if (companyLower.includes('tech')) {
        personalityStyle = PERSONALITY_COLORS.analytical
      } else if (companyLower.includes('consulting') || companyLower.includes('consultant')) {
        personalityStyle = PERSONALITY_COLORS.professional
      }
    }
    
    // Build final prompt with personality colors
    if (personalityStyle) {
      prompt = `professional portrait of ${participant.name}, ${personalityStyle} accent colors in background, corporate headshot style, clean modern background, friendly professional expression, high quality photography`
    } else {
      prompt = `professional portrait of ${participant.name}, clean white background, corporate headshot style, friendly professional expression, high quality photography`
    }

    console.log(`Generating AI avatar for ${participant.name} with prompt: ${prompt}`)

    // Try Alibaba Cloud API first
    const base64Image = await generateImageWithAlibaba(prompt)
    
    if (base64Image) {
      return base64Image
    }

    // Try z-ai-web-dev-sdk as fallback
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const response = await zai.images.generations.create({
        prompt: prompt,
        size: '1024x1024'
      })

      if (response.data && response.data[0] && response.data[0].base64) {
        return `data:image/png;base64,${response.data[0].base64}`
      }
    } catch (sdkError) {
      console.error('z-ai-web-dev-sdk fallback failed:', sdkError)
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
    
    // Check if email already exists using Supabase directly
    const { data: existingParticipant, error: findError } = await supabase
      .from('Participant')
      .select('*')
      .eq('email', validatedData.email)
      .eq('eventId', 'main-event')
      .maybeSingle()

    if (findError) {
      console.error('Error checking existing participant:', findError)
    }
    
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
    
    // Create participant using Supabase directly
    const { data: participant, error: createError } = await supabase
      .from('Participant')
      .insert({
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
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating participant:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to create participant' },
        { status: 500 }
      )
    }
    
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
      
      // Update participant with storage URLs using Supabase directly
      const { error: updateError } = await supabase
        .from('Participant')
        .update({ 
          aiPhotoUrl: aiAvatarUrl,
          qrCodeUrl: qrCodeStorageUrl,
        })
        .eq('id', participant.id)

      if (updateError) {
        console.error('Error updating participant:', updateError)
      }
      
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
    // Get participants using Supabase directly
    const { data: participants, error } = await supabase
      .from('Participant')
      .select('*')
      .eq('eventId', 'main-event')
      .order('createdAt', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching participants:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get participants' },
        { status: 500 }
      )
    }
    
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
