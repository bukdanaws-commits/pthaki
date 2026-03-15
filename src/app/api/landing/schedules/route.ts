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

    const schedules = await db.schedule.findMany({
      where: { eventId: event.id },
      orderBy: { startTime: 'asc' },
      take: 20
    })

    return NextResponse.json({
      success: true,
      data: schedules
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}
