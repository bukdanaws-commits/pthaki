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

    const { data: schedules, error } = await supabase
      .from('Schedule')
      .select('*')
      .eq('eventId', event.id)
      .order('startTime', { ascending: true })
      .limit(20)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: schedules || []
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}
