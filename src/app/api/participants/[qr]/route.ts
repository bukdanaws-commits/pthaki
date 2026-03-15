import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qr: string }> }
) {
  try {
    const { qr } = await params
    
    const participant = await db.participant.findFirst({
      where: {
        qrCode: qr,
        eventId: 'main-event',
      },
      include: {
        claims: {
          include: {
            menuItem: true,
            booth: true,
          },
        },
      },
    })
    
    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: participant,
    })
  } catch (error) {
    console.error('Get participant error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get participant' },
      { status: 500 }
    )
  }
}
