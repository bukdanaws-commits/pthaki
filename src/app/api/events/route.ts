import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

// Get event details
export async function GET() {
  try {
    const { data: event, error } = await supabase
      .from('Event')
      .select('*')
      .eq('id', 'main-event')
      .maybeSingle()
    
    // Create default event if not exists
    if (!event) {
      const { data: newEvent, error: createError } = await supabase
        .from('Event')
        .insert({
          id: 'main-event',
          name: 'Gathering PT HKI',
          description: 'Annual company gathering',
          date: new Date('2026-09-20T08:00:00').toISOString(),
          location: 'Grand Ballroom, Hotel Mulia',
          isActive: true,
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Create event error:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to create event' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: {
          id: newEvent.id,
          name: newEvent.name,
          description: newEvent.description,
          date: typeof newEvent.date === 'string' ? newEvent.date.split('T')[0] : new Date(newEvent.date).toISOString().split('T')[0],
          location: newEvent.location,
          isActive: newEvent.isActive,
        },
      })
    }
    
    if (error) {
      console.error('Get event error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get event' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        name: event.name,
        description: event.description,
        date: typeof event.date === 'string' ? event.date.split('T')[0] : new Date(event.date).toISOString().split('T')[0],
        location: event.location,
        isActive: event.isActive,
      },
    })
  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get event' },
      { status: 500 }
    )
  }
}

// Update event settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, date, location } = body
    
    const { data: event, error } = await supabase
      .from('Event')
      .update({
        name,
        description,
        date: new Date(date).toISOString(),
        location,
      })
      .eq('id', 'main-event')
      .select()
      .single()
    
    if (error) {
      console.error('Update event error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update event' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        name: event.name,
        description: event.description,
        date: typeof event.date === 'string' ? event.date.split('T')[0] : new Date(event.date).toISOString().split('T')[0],
        location: event.location,
      },
      message: 'Event settings updated successfully',
    })
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    )
  }
}
