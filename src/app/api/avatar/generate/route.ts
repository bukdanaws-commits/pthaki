import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploadAIAvatar, initializeStorageBuckets } from '@/lib/storage'

/**
 * AI Avatar Generation API
 * 
 * POST /api/avatar/generate
 * Body: { participantId: string }
 * 
 * Generates AI avatar based on participant bio
 * Falls back to mock avatar if generation fails
 */

// Avatar prompts based on profession/style
const AVATAR_PROMPTS = [
  "professional portrait of a business conference attendee, friendly smile, modern professional attire, clean white background, corporate headshot style, high quality",
  "professional portrait of a tech conference attendee, confident expression, smart casual attire, clean background, modern lighting, corporate headshot style",
  "professional portrait of an event attendee, warm smile, business casual outfit, simple studio background, professional headshot, high quality",
  "portrait of a professional at a corporate event, approachable expression, modern business attire, clean backdrop, studio lighting, corporate photography",
  "professional headshot of a conference participant, friendly demeanor, professional clothing, minimalist background, high quality portrait",
]

// Mock avatar URLs (SVG placeholders with different colors)
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

    // Get participant
    const participant = await db.participant.findUnique({
      where: { id: participantId },
    })

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
    const avatarBase64 = await generateAIAvatar(participant)

    // Upload to storage
    let avatarUrl = avatarBase64
    const uploadResult = await uploadAIAvatar(participant.id, avatarBase64)
    
    if (uploadResult.success && uploadResult.url) {
      avatarUrl = uploadResult.url
    }

    // Update participant with avatar URL
    await db.participant.update({
      where: { id: participantId },
      data: { aiPhotoUrl: avatarUrl },
    })

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
    
    // Find participants without AI avatar or with mock avatar
    const participantsWithoutAvatar = await db.participant.findMany({
      where: {
        eventId,
        OR: [
          { aiPhotoUrl: null },
          { aiPhotoUrl: { contains: 'data:image/svg+xml' } }, // Mock avatar
        ]
      },
      take: 10, // Limit to 10 at a time
    })

    if (participantsWithoutAvatar.length === 0) {
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
        const avatarBase64 = await generateAIAvatar(participant)
        
        // Upload to storage
        let avatarUrl = avatarBase64
        const uploadResult = await uploadAIAvatar(participant.id, avatarBase64)
        
        if (uploadResult.success && uploadResult.url) {
          avatarUrl = uploadResult.url
        }
        
        await db.participant.update({
          where: { id: participant.id },
          data: { aiPhotoUrl: avatarUrl },
        })
        
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
