import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const event = await db.event.findFirst({
      where: { isActive: true }
    })

    if (!event) {
      return NextResponse.json({ success: true, data: [] })
    }

    const sponsors = await db.sponsor.findMany({
      where: { 
        eventId: event.id,
        isActive: true 
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: sponsors
    })
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sponsors' },
      { status: 500 }
    )
  }
}
