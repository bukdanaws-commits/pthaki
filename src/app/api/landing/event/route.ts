import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get the active event
    const event = await db.event.findFirst({
      where: { isActive: true }
    })

    if (!event) {
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
      data: event
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event data' },
      { status: 500 }
    )
  }
}
