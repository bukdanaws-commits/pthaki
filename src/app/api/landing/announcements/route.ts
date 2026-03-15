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

    const announcements = await db.announcement.findMany({
      where: {
        eventId: event.id,
        showOnLanding: true
      },
      orderBy: { publishAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      success: true,
      data: announcements
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}
