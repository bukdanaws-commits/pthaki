import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  try {
    // Get the main event
    const { data: event, error: eventError } = await supabase
      .from('Event')
      .select('id')
      .eq('id', 'main-event')
      .maybeSingle()

    if (eventError) {
      console.error('Error fetching event:', eventError)
      return NextResponse.json({ success: true, data: [] })
    }

    if (!event) {
      return NextResponse.json({ success: true, data: [] })
    }

    const { data: announcements, error } = await supabase
      .from('Announcement')
      .select('*')
      .eq('eventId', event.id)
      .eq('showOnLanding', true)
      .order('publishAt', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: announcements || []
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}
