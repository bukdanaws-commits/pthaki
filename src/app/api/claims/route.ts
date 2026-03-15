import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Claims API - Get all claims
 * 
 * GET /api/claims - Get all claims with participant, menu item, and booth details
 */

export async function GET() {
  try {
    const claims = await db.claim.findMany({
      where: {
        eventId: 'main-event',
      },
      orderBy: {
        claimedAt: 'desc',
      },
      take: 500,
    })
    
    // Fetch related data separately
    const participantIds = [...new Set(claims.map(c => c.participantId))]
    const menuItemIds = [...new Set(claims.map(c => c.menuItemId))]
    const boothIds = [...new Set(claims.map(c => c.boothId))]
    
    const [participants, menuItems, booths] = await Promise.all([
      Promise.all(participantIds.map(id => db.participant.findUnique({ where: { id } }))),
      Promise.all(menuItemIds.map(id => db.menuItem.findUnique({ where: { id } }))),
      Promise.all(boothIds.map(id => db.booth.findUnique({ where: { id } }))),
    ])
    
    // Create lookup maps
    const participantMap = new Map(participants.filter(Boolean).map(p => [p!.id, p]))
    const menuItemMap = new Map(menuItems.filter(Boolean).map(m => [m!.id, m]))
    const boothMap = new Map(booths.filter(Boolean).map(b => [b!.id, b]))
    
    // Combine data
    const enrichedClaims = claims.map(claim => ({
      ...claim,
      participant: participantMap.get(claim.participantId),
      menuItem: menuItemMap.get(claim.menuItemId),
      booth: boothMap.get(claim.boothId),
    }))
    
    return NextResponse.json({
      success: true,
      data: enrichedClaims,
      total: claims.length,
    })
  } catch (error) {
    console.error('Get claims error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get claims' },
      { status: 500 }
    )
  }
}
