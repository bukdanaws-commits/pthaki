import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get event details
export async function GET() {
  try {
    let event = await db.event.findFirst({
      where: { id: 'main-event' },
    })
    
    // Create default event if not exists
    if (!event) {
      event = await db.event.create({
        data: {
          id: 'main-event',
          name: 'Gathering PT HKI',
          description: 'Annual company gathering',
          date: new Date('2026-09-20T08:00:00'),
          location: 'Grand Ballroom, Hotel Mulia',
          isActive: true,
        },
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        name: event.name,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
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
    
    const event = await db.event.update({
      where: { id: 'main-event' },
      data: {
        name,
        description,
        date: new Date(date),
        location,
      },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        name: event.name,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
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
