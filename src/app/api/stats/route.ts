import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Event Stats API - Dashboard statistics
 * 
 * GET /api/stats - Get current event stats
 * POST /api/stats - Force refresh stats
 */

// GET - Retrieve stats
export async function GET(request: NextRequest) {
  try {
    const eventId = 'main-event'
    
    // Get desk settings first
    let totalDesks = 4
    try {
      const deskSetting = await db.setting.findUnique({ where: { key: 'totalDesks' } })
      if (deskSetting) {
        totalDesks = Math.min(20, Math.max(1, parseInt(deskSetting.value) || 4))
      }
    } catch (e) {
      // Use default
    }
    
    // Get basic counts in parallel
    const [
      totalParticipants,
      checkedInCount,
      foodClaimsCount,
      drinkClaimsCount,
    ] = await Promise.all([
      db.participant.count({ where: { eventId } }),
      db.participant.count({ where: { eventId, isCheckedIn: true } }),
      db.claim.count({ where: { eventId, category: 'Food' } }),
      db.claim.count({ where: { eventId, category: 'Drink' } }),
    ])
    
    // Get desk counts dynamically
    const deskCounts = await Promise.all(
      Array.from({ length: totalDesks }, (_, i) => i + 1).map(deskNumber => 
        db.checkIn.count({ where: { eventId, deskNumber } })
      )
    )
    
    // Build desks object
    const desks: Record<string, number> = {}
    deskCounts.forEach((count, index) => {
      desks[`desk${index + 1}`] = count
    })
    
    // Get recent check-ins
    const recentCheckInsRaw = await db.checkIn.findMany({
      where: { eventId },
      orderBy: { checkedInAt: 'desc' },
      take: 15,
    })
    
    // Get participant details for check-ins
    const checkInParticipantIds = [...new Set(recentCheckInsRaw.map(c => c.participantId))]
    const checkInParticipants = await Promise.all(
      checkInParticipantIds.map(id => db.participant.findUnique({ where: { id } }))
    )
    const checkInParticipantMap = new Map(checkInParticipants.filter(Boolean).map(p => [p!.id, p!]))
    
    const recentCheckIns = recentCheckInsRaw.map(c => ({
      id: c.id,
      participantName: checkInParticipantMap.get(c.participantId)?.name || 'Unknown',
      participantCompany: checkInParticipantMap.get(c.participantId)?.company || null,
      deskNumber: c.deskNumber,
      checkedInAt: c.checkedInAt,
    }))
    
    // Get recent claims
    const recentClaimsRaw = await db.claim.findMany({
      where: { eventId },
      orderBy: { claimedAt: 'desc' },
      take: 15,
    })
    
    // Get related data for claims
    const claimParticipantIds = [...new Set(recentClaimsRaw.map(c => c.participantId))]
    const claimMenuItemIds = [...new Set(recentClaimsRaw.map(c => c.menuItemId))]
    const claimBoothIds = [...new Set(recentClaimsRaw.map(c => c.boothId))]
    
    const [claimParticipants, claimMenuItems, claimBooths] = await Promise.all([
      Promise.all(claimParticipantIds.map(id => db.participant.findUnique({ where: { id } }))),
      Promise.all(claimMenuItemIds.map(id => db.menuItem.findUnique({ where: { id } }))),
      Promise.all(claimBoothIds.map(id => db.booth.findUnique({ where: { id } }))),
    ])
    
    const claimParticipantMap = new Map(claimParticipants.filter(Boolean).map(p => [p!.id, p!]))
    const claimMenuItemMap = new Map(claimMenuItems.filter(Boolean).map(m => [m!.id, m!]))
    const claimBoothMap = new Map(claimBooths.filter(Boolean).map(b => [b!.id, b!]))
    
    const recentClaims = recentClaimsRaw.map(c => ({
      id: c.id,
      participantName: claimParticipantMap.get(c.participantId)?.name || 'Unknown',
      participantCompany: claimParticipantMap.get(c.participantId)?.company || null,
      menuItemName: claimMenuItemMap.get(c.menuItemId)?.name || 'Unknown',
      category: c.category,
      boothName: claimBoothMap.get(c.boothId)?.name || 'Unknown',
      claimedAt: c.claimedAt,
    }))
    
    // Get menu items with category
    const menuItemsRaw = await db.menuItem.findMany({
      where: { eventId, isActive: true },
    })
    
    // Get categories for menu items
    const categoryIds = [...new Set(menuItemsRaw.map(m => m.categoryId).filter(Boolean))]
    const categories = await Promise.all(
      categoryIds.map(id => db.menuCategory.findFirst({ where: { id } }))
    )
    const categoryMap = new Map(categories.filter(Boolean).map(c => [c!.id, c!]))
    
    const menuItems = menuItemsRaw.map(m => ({
      id: m.id,
      name: m.name,
      category: categoryMap.get(m.categoryId!)?.name || 'Unknown',
      currentStock: m.currentStock,
      initialStock: m.initialStock,
      totalClaims: m.totalClaims,
    }))
    
    // Get booths
    const boothsRaw = await db.booth.findMany({
      where: { eventId, isActive: true },
    })
    
    const booths = boothsRaw.map(b => ({
      id: b.id,
      name: b.name,
      boothType: b.boothType,
      totalClaims: b.totalClaims,
    }))
    
    const totalClaims = foodClaimsCount + drinkClaimsCount
    
    return NextResponse.json({
      success: true,
      data: {
        totalParticipants,
        checkedInParticipants: checkedInCount,
        totalClaims,
        totalFoodClaims: foodClaimsCount,
        totalDrinkClaims: drinkClaimsCount,
        totalDesks,
        desks,
        recentCheckIns,
        recentClaims,
        menuItems,
        booths,
      },
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}

// POST - Force refresh/update stats cache
export async function POST(request: NextRequest) {
  try {
    const eventId = 'main-event'
    
    // Get desk settings
    let totalDesks = 4
    try {
      const deskSetting = await db.setting.findUnique({ where: { key: 'totalDesks' } })
      if (deskSetting) {
        totalDesks = Math.min(20, Math.max(1, parseInt(deskSetting.value) || 4))
      }
    } catch (e) {
      // Use default
    }
    
    const [
      totalParticipants,
      checkedInCount,
      foodClaimsCount,
      drinkClaimsCount,
    ] = await Promise.all([
      db.participant.count({ where: { eventId } }),
      db.participant.count({ where: { eventId, isCheckedIn: true } }),
      db.claim.count({ where: { eventId, category: 'Food' } }),
      db.claim.count({ where: { eventId, category: 'Drink' } }),
    ])
    
    // Get desk counts dynamically
    const deskCounts = await Promise.all(
      Array.from({ length: totalDesks }, (_, i) => i + 1).map(deskNumber => 
        db.checkIn.count({ where: { eventId, deskNumber } })
      )
    )
    
    // Build update object for EventStats
    const deskStatsUpdate: Record<string, number> = {}
    deskCounts.forEach((count, index) => {
      deskStatsUpdate[`desk${index + 1}CheckIns`] = count
    })
    
    // Upsert to EventStats cache
    const stats = await db.eventStats.upsert({
      where: { eventId },
      update: {
        totalParticipants,
        totalCheckIns: checkedInCount,
        totalNotCheckedIn: totalParticipants - checkedInCount,
        totalFoodClaims: foodClaimsCount,
        totalDrinkClaims: drinkClaimsCount,
        totalClaims: foodClaimsCount + drinkClaimsCount,
        ...deskStatsUpdate,
      },
      create: {
        eventId,
        totalParticipants,
        totalCheckIns: checkedInCount,
        totalNotCheckedIn: totalParticipants - checkedInCount,
        totalFoodClaims: foodClaimsCount,
        totalDrinkClaims: drinkClaimsCount,
        totalClaims: foodClaimsCount + drinkClaimsCount,
        ...deskStatsUpdate,
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Stats refreshed',
      data: stats,
    })
  } catch (error) {
    console.error('Refresh stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to refresh stats' },
      { status: 500 }
    )
  }
}
