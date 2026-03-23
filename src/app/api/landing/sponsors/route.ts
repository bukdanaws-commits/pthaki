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

    const { data: sponsors, error } = await supabase
      .from('Sponsor')
      .select('*')
      .eq('eventId', event.id)
      .eq('isActive', true)
      .order('order', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: sponsors || []
    })
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sponsors' },
      { status: 500 }
    )
  }
}
