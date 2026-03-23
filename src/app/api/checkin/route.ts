import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkInSchema } from '@/lib/validations'

/**
 * GET /api/checkin - Get recent check-ins
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const checkIns = await db.checkIn.findMany({
      where: {
        eventId: 'main-event',
      },
      orderBy: {
        checkedInAt: 'desc',
      },
      take: limit,
    })
    
    // Fetch related participants
    const participantIds = [...new Set(checkIns.map(c => c.participantId))]
    const participants = await Promise.all(
      participantIds.map(id => db.participant.findUnique({ where: { id } }))
    )
    const participantMap = new Map(participants.filter(Boolean).map(p => [p!.id, p]))
    
    const enrichedCheckIns = checkIns.map(checkIn => ({
      ...checkIn,
      participant: participantMap.get(checkIn.participantId),
    }))
    
    return NextResponse.json({
      success: true,
      data: enrichedCheckIns,
      total: checkIns.length,
    })
  } catch (error) {
    console.error('Get check-ins error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get check-ins' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = checkInSchema.parse(body)
    
    // Find participant by QR code
    const participant = await db.participant.findFirst({
      where: {
        qrCode: validatedData.qrCode,
        eventId: 'main-event',
      },
    })
    
    if (!participant) {
      // Log failed scan
      await db.scanLog.create({
        data: {
          eventId: 'main-event',
          scanType: 'checkin',
          scanResult: 'invalid_qr',
          message: 'Invalid QR code',
          deskNumber: validatedData.deskNumber,
        },
      })
      
      return NextResponse.json(
        { success: false, error: 'Invalid QR code. Participant not found.' },
        { status: 404 }
      )
    }
    
    // Check if already checked in
    if (participant.isCheckedIn) {
      // Log already checked in
      await db.scanLog.create({
        data: {
          eventId: 'main-event',
          participantId: participant.id,
          scanType: 'checkin',
          scanResult: 'already_checked_in',
          message: 'Already checked in',
          deskNumber: validatedData.deskNumber,
        },
      })
      
      return NextResponse.json({
        success: false,
        alreadyCheckedIn: true,
        error: `${participant.name} has already checked in.`,
        participant: {
          id: participant.id,
          name: participant.name,
          company: participant.company,
          photoUrl: participant.aiPhotoUrl || participant.photoUrl, // Prioritaskan AI Avatar
        },
      })
    }
    
    // Process check-in
    await db.participant.update({
      where: { id: participant.id },
      data: {
        isCheckedIn: true,
        checkInTime: new Date(),
      },
    })
    
    // Create check-in record
    const checkIn = await db.checkIn.create({
      data: {
        eventId: 'main-event',
        participantId: participant.id,
        deskNumber: validatedData.deskNumber,
      },
    })
    
    // Add to display queue (with AI Avatar)
    const expiresAt = new Date(Date.now() + 30000) // 30 seconds
    await db.displayQueue.create({
      data: {
        eventId: 'main-event',
        participantId: participant.id,
        name: participant.name,
        company: participant.company,
        photoUrl: participant.aiPhotoUrl || participant.photoUrl, // Prioritaskan AI Avatar
        expiresAt,
        isDisplayed: false,
      },
    })
    
    // Log successful scan
    await db.scanLog.create({
      data: {
        eventId: 'main-event',
        participantId: participant.id,
        scanType: 'checkin',
        scanResult: 'success',
        message: 'Check-in successful',
        deskNumber: validatedData.deskNumber,
        checkInId: checkIn.id,
      },
    })
    
    return NextResponse.json({
      success: true,
      message: `Welcome, ${participant.name}!`,
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        company: participant.company,
        photoUrl: participant.aiPhotoUrl || participant.photoUrl, // Prioritaskan AI Avatar
        qrCode: participant.qrCode,
      },
    })
  } catch (error) {
    console.error('Check-in error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to process check-in' },
      { status: 500 }
    )
  }
}
