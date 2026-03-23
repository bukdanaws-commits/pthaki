import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  try {
    // Get the main event or first active event
    const { data: event, error } = await supabase
      .from('Event')
      .select('*')
      .eq('id', 'main-event')
      .maybeSingle()

    if (error) throw error

    if (!event) {
      // Try to get any active event
      const { data: activeEvent, error: activeError } = await supabase
        .from('Event')
        .select('*')
        .eq('isActive', true)
        .limit(1)
        .single()

      if (activeError && activeError.code !== 'PGRST116') {
        throw activeError
      }

      if (activeEvent) {
        return NextResponse.json({
          success: true,
          data: formatEvent(activeEvent)
        })
      }

      // Return default event data if no event exists
      return NextResponse.json({
        success: true,
        data: {
          id: 'default',
          name: 'Tech Conference 2025',
          description: 'Acara teknologi terbesar di Indonesia dengan berbagai sesi menarik dari para ahli industri.',
          tagline: 'Innovate. Inspire. Impact.',
          primaryColor: '#10b981',
          secondaryColor: '#0d9488',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Jakarta Convention Center',
          organizer: 'Goopps Indonesia',
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: formatEvent(event)
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event data' },
      { status: 500 }
    )
  }
}

function formatEvent(event: Record<string, unknown>) {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    tagline: event.tagline,
    primaryColor: event.primaryColor || '#10b981',
    secondaryColor: event.secondaryColor || '#0d9488',
    date: event.date,
    endDate: event.endDate,
    location: event.location,
    organizer: event.organizer,
    website: event.website,
    logoUrl: event.logoUrl,
    bannerUrl: event.bannerUrl,
    instagram: event.instagram,
    twitter: event.twitter,
    linkedin: event.linkedin,
    isActive: event.isActive,
  }
}
