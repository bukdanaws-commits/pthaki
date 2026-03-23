import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const participants = await db.participant.findMany({
      where: {
        eventId: 'main-event',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // Get claims for each participant
    const participantIds = participants.map(p => p.id)
    const allClaims = await Promise.all(
      participantIds.map(id => db.claim.findMany({ where: { participantId: id } }))
    )
    
    // Get menu items and booths for claims
    const claimsFlat = allClaims.flat()
    const menuItemIds = [...new Set(claimsFlat.map(c => c.menuItemId))]
    const boothIds = [...new Set(claimsFlat.map(c => c.boothId))]
    
    const [menuItems, booths] = await Promise.all([
      Promise.all(menuItemIds.map(id => db.menuItem.findUnique({ where: { id } }))),
      Promise.all(boothIds.map(id => db.booth.findUnique({ where: { id } }))),
    ])
    
    const menuItemMap = new Map(menuItems.filter(Boolean).map(m => [m!.id, m!]))
    const boothMap = new Map(booths.filter(Boolean).map(b => [b!.id, b!]))
    
    // Create claims map by participant
    const claimsMap = new Map<string, any[]>()
    participantIds.forEach((id, index) => {
      const participantClaims = allClaims[index] || []
      claimsMap.set(id, participantClaims.map(c => ({
        ...c,
        menuItem: menuItemMap.get(c.menuItemId),
        booth: boothMap.get(c.boothId),
      })))
    })
    
    // Combine data
    const enrichedParticipants = participants.map(p => ({
      ...p,
      claims: claimsMap.get(p.id) || [],
    }))
    
    return NextResponse.json({
      success: true,
      data: enrichedParticipants,
      total: participants.length,
    })
  } catch (error) {
    console.error('Get participants error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get participants' },
      { status: 500 }
    )
  }
}
