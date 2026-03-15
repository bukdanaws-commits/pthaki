import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Ticket API - Get participant ticket info
 * 
 * GET /api/ticket/[id] - Get participant by ID with full ticket info
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const participant = await db.participant.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            name: true,
            date: true,
            location: true,
          },
        },
        checkIns: {
          select: {
            checkedInAt: true,
            deskNumber: true,
          },
          orderBy: { checkedInAt: 'desc' },
          take: 1,
        },
        claims: {
          select: {
            claimedAt: true,
            category: true,
            menuItem: { select: { name: true } },
            booth: { select: { name: true } },
          },
          orderBy: { claimedAt: 'desc' },
        },
      },
    })
    
    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Participant not found' },
        { status: 404 }
      )
    }
    
    // Calculate remaining claims
    const foodClaimsRemaining = participant.maxFoodClaims - participant.foodClaims
    const drinkClaimsRemaining = participant.maxDrinkClaims - participant.drinkClaims
    
    return NextResponse.json({
      success: true,
      data: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        phone: participant.phone,
        company: participant.company,
        bio: participant.bio,
        photoUrl: participant.photoUrl,
        aiPhotoUrl: participant.aiPhotoUrl,
        qrCode: participant.qrCode,
        qrCodeUrl: participant.qrCodeUrl,
        isCheckedIn: participant.isCheckedIn,
        checkInTime: participant.checkInTime,
        checkInDesk: participant.checkInDesk,
        foodClaims: participant.foodClaims,
        drinkClaims: participant.drinkClaims,
        maxFoodClaims: participant.maxFoodClaims,
        maxDrinkClaims: participant.maxDrinkClaims,
        foodClaimsRemaining,
        drinkClaimsRemaining,
        event: participant.event,
        lastCheckIn: participant.checkIns[0] || null,
        claims: participant.claims,
        createdAt: participant.createdAt,
      },
    })
  } catch (error) {
    console.error('Get ticket error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get ticket' },
      { status: 500 }
    )
  }
}
