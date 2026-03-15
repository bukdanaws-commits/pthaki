import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { uploadAIAvatar, initializeStorageBuckets } from '@/lib/storage'
import { generateImageWithAlibaba } from '@/lib/alibaba-image'

/**
 * AI Avatar Generation API
 * 
 * POST /api/avatar/generate
 * Body: { participantId: string }
 * 
 * Generates AI avatar based on participant bio
 * Falls back to mock avatar if generation fails
 */

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

// Mock avatar URLs (SVG placeholders with different colors)
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

// POST - Generate avatar for participant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId } = body

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    // Get participant using Supabase directly
    const { data: participant, error: findError } = await supabase
      .from('Participant')
      .select('*')
      .eq('id', participantId)
      .maybeSingle()

    if (findError) {
      console.error('Error finding participant:', findError)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Initialize storage buckets
    try {
      await initializeStorageBuckets()
    } catch (e) {
      console.log('Storage init warning:', e)
    }

    // Generate AI avatar
    const avatarBase64 = await generateAIAvatar({
      name: participant.name,
      bio: participant.bio,
      company: participant.company,
    })

    // Upload to storage
    let avatarUrl = avatarBase64
    const uploadResult = await uploadAIAvatar(participant.id, avatarBase64)
    
    if (uploadResult.success && uploadResult.url) {
      avatarUrl = uploadResult.url
    }

    // Update participant with avatar URL using Supabase directly
    const { error: updateError } = await supabase
      .from('Participant')
      .update({ aiPhotoUrl: avatarUrl })
      .eq('id', participantId)

    if (updateError) {
      console.error('Error updating participant:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update participant' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar generated successfully',
      data: {
        participantId: participant.id,
        aiPhotoUrl: avatarUrl,
      },
    })
  } catch (error) {
    console.error('Avatar generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate avatar' },
      { status: 500 }
    )
  }
}

// GET - Batch generate avatars for all participants without one
export async function GET(request: NextRequest) {
  try {
    // Initialize storage buckets
    try {
      await initializeStorageBuckets()
    } catch (e) {
      console.log('Storage init warning:', e)
    }

    const eventId = 'main-event'
    
    // Find participants without AI avatar or with mock avatar using Supabase directly
    const { data: participantsWithoutAvatar, error: findError } = await supabase
      .from('Participant')
      .select('*')
      .eq('eventId', eventId)
      .or('aiPhotoUrl.is.null,aiPhotoUrl.like.%data:image/svg+xml%')
      .limit(10)

    if (findError) {
      console.error('Error finding participants:', findError)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    if (!participantsWithoutAvatar || participantsWithoutAvatar.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All participants have avatars',
        generated: 0,
      })
    }

    // Generate avatars
    let generated = 0
    for (const participant of participantsWithoutAvatar) {
      try {
        const avatarBase64 = await generateAIAvatar({
          name: participant.name,
          bio: participant.bio,
          company: participant.company,
        })
        
        // Upload to storage
        let avatarUrl = avatarBase64
        const uploadResult = await uploadAIAvatar(participant.id, avatarBase64)
        
        if (uploadResult.success && uploadResult.url) {
          avatarUrl = uploadResult.url
        }
        
        // Update participant using Supabase directly
        await supabase
          .from('Participant')
          .update({ aiPhotoUrl: avatarUrl })
          .eq('id', participant.id)
        
        generated++
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Failed to generate avatar for ${participant.name}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${generated} avatars`,
      generated,
      remaining: participantsWithoutAvatar.length - generated,
    })
  } catch (error) {
    console.error('Batch avatar generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate avatars' },
      { status: 500 }
    )
  }
}
