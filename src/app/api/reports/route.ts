import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

/**
 * Comprehensive Reports API
 * 
 * GET /api/reports - Get comprehensive report data for admin dashboard
 */

export async function GET(request: NextRequest) {
  try {
    const eventId = 'main-event'
    
    // Get desk settings
    let totalDesks = 4
    try {
      const { data: deskSetting } = await supabase
        .from('Setting')
        .select('*')
        .eq('key', 'totalDesks')
        .maybeSingle()
      
      if (deskSetting) {
        totalDesks = Math.min(20, Math.max(1, parseInt(deskSetting.value) || 4))
      }
    } catch (e) {
      // Use default
    }

    // Basic counts using direct Supabase
    const [
      participantsCountRes,
      checkedInCountRes,
      foodClaimsCountRes,
      drinkClaimsCountRes,
    ] = await Promise.all([
      supabase.from('Participant').select('id', { count: 'exact', head: true }).eq('eventId', eventId),
      supabase.from('Participant').select('id', { count: 'exact', head: true }).eq('eventId', eventId).eq('isCheckedIn', true),
      supabase.from('Claim').select('id', { count: 'exact', head: true }).eq('eventId', eventId).eq('category', 'Food'),
      supabase.from('Claim').select('id', { count: 'exact', head: true }).eq('eventId', eventId).eq('category', 'Drink'),
    ])

    const totalParticipants = participantsCountRes.count || 0
    const checkedInParticipants = checkedInCountRes.count || 0
    const foodClaimsCount = foodClaimsCountRes.count || 0
    const drinkClaimsCount = drinkClaimsCountRes.count || 0

    // Desk counts
    const deskCounts = await Promise.all(
      Array.from({ length: totalDesks }, (_, i) => i + 1).map(deskNumber => 
        supabase.from('CheckIn').select('id', { count: 'exact', head: true }).eq('eventId', eventId).eq('deskNumber', deskNumber)
      )
    )
    
    const desks: Record<string, number> = {}
    deskCounts.forEach((res, index) => {
      desks[`desk${index + 1}`] = res.count || 0
    })

    // Booths
    const { data: boothsRaw } = await supabase
      .from('Booth')
      .select('*')
      .eq('eventId', eventId)
      .eq('isActive', true)
      .order('totalClaims', { ascending: false })

    const booths = (boothsRaw || []).map(b => ({
      id: b.id,
      name: b.name,
      boothType: b.boothType,
      totalClaims: b.totalClaims,
    }))

    // Menu items with category
    const { data: menuItemsRaw } = await supabase
      .from('MenuItem')
      .select(`
        *,
        category:MenuCategory(*)
      `)
      .eq('eventId', eventId)
      .eq('isActive', true)

    const menuItems = (menuItemsRaw || []).map((m: {
      id: string
      name: string
      currentStock: number
      initialStock: number
      totalClaims: number
      category: { name: string } | null
    }) => ({
      id: m.id,
      name: m.name,
      category: m.category?.name || 'Unknown',
      currentStock: m.currentStock,
      initialStock: m.initialStock,
      totalClaims: m.totalClaims,
    }))

    // Recent check-ins
    const { data: recentCheckInsRaw } = await supabase
      .from('CheckIn')
      .select(`
        *,
        participant:Participant(*)
      `)
      .eq('eventId', eventId)
      .order('checkedInAt', { ascending: false })
      .limit(20)

    const recentCheckIns = (recentCheckInsRaw || []).map((c: {
      id: string
      deskNumber: number
      checkedInAt: string
      participant: { name: string; company?: string } | null
    }) => ({
      id: c.id,
      participantName: c.participant?.name || 'Unknown',
      participantCompany: c.participant?.company || null,
      deskNumber: c.deskNumber,
      checkedInAt: c.checkedInAt,
    }))

    // Recent claims
    const { data: recentClaimsRaw } = await supabase
      .from('Claim')
      .select(`
        *,
        participant:Participant(*),
        menuItem:MenuItem(*),
        booth:Booth(*)
      `)
      .eq('eventId', eventId)
      .order('claimedAt', { ascending: false })
      .limit(20)

    const recentClaims = (recentClaimsRaw || []).map((c: {
      id: string
      category: string
      claimedAt: string
      participant: { name: string } | null
      menuItem: { name: string } | null
      booth: { name: string } | null
    }) => ({
      id: c.id,
      participantName: c.participant?.name || 'Unknown',
      menuItemName: c.menuItem?.name || 'Unknown',
      category: c.category,
      boothName: c.booth?.name || 'Unknown',
      claimedAt: c.claimedAt,
    }))

    // Company breakdown
    const { data: allParticipants } = await supabase
      .from('Participant')
      .select('company,isCheckedIn')
      .eq('eventId', eventId)

    const companyMap = new Map<string, { total: number; checkedIn: number }>()
    ;(allParticipants || []).forEach((p: { company?: string; isCheckedIn: boolean }) => {
      const company = p.company || 'No Company'
      const existing = companyMap.get(company) || { total: 0, checkedIn: 0 }
      companyMap.set(company, {
        total: existing.total + 1,
        checkedIn: existing.checkedIn + (p.isCheckedIn ? 1 : 0),
      })
    })

    const companies = Array.from(companyMap.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total)

    // Hourly check-ins
    const { data: allCheckIns } = await supabase
      .from('CheckIn')
      .select('checkedInAt')
      .eq('eventId', eventId)

    const hourlyCheckInMap = new Map<string, number>()
    ;(allCheckIns || []).forEach((c: { checkedInAt: string }) => {
      const hour = new Date(c.checkedInAt).getHours()
      const hourStr = `${hour.toString().padStart(2, '0')}:00`
      hourlyCheckInMap.set(hourStr, (hourlyCheckInMap.get(hourStr) || 0) + 1)
    })

    // Generate all hours from 7 to 17
    const hourlyCheckIns = Array.from({ length: 11 }, (_, i) => i + 7).map(hour => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count: hourlyCheckInMap.get(`${hour.toString().padStart(2, '0')}:00`) || 0,
    }))

    // Hourly claims
    const { data: allClaimsRaw } = await supabase
      .from('Claim')
      .select('claimedAt,category')
      .eq('eventId', eventId)

    const hourlyClaimMap = new Map<string, { food: number; drink: number }>()
    ;(allClaimsRaw || []).forEach((c: { claimedAt: string; category: string }) => {
      const hour = new Date(c.claimedAt).getHours()
      const hourStr = `${hour.toString().padStart(2, '0')}:00`
      const existing = hourlyClaimMap.get(hourStr) || { food: 0, drink: 0 }
      if (c.category.toLowerCase() === 'food') {
        existing.food++
      } else {
        existing.drink++
      }
      hourlyClaimMap.set(hourStr, existing)
    })

    const hourlyClaims = Array.from({ length: 11 }, (_, i) => i + 7).map(hour => {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`
      const data = hourlyClaimMap.get(hourStr) || { food: 0, drink: 0 }
      return {
        hour: hourStr,
        ...data,
      }
    })

    // Scan logs summary using direct Supabase
    const [
      totalScansRes,
      successfulScansRes,
      failedScansRes,
      duplicateScansRes,
      limitReachedScansRes,
    ] = await Promise.all([
      supabase.from('ScanLog').select('id', { count: 'exact', head: true }).eq('eventId', eventId),
      supabase.from('ScanLog').select('id', { count: 'exact', head: true }).eq('eventId', eventId).eq('scanResult', 'success'),
      supabase.from('ScanLog').select('id', { count: 'exact', head: true }).eq('eventId', eventId).eq('scanResult', 'failed'),
      supabase.from('ScanLog').select('id', { count: 'exact', head: true }).eq('eventId', eventId).eq('scanResult', 'duplicate'),
      supabase.from('ScanLog').select('id', { count: 'exact', head: true }).eq('eventId', eventId).eq('scanResult', 'limit_reached'),
    ])

    const scanLogsSummary = {
      totalScans: totalScansRes.count || 0,
      successful: successfulScansRes.count || 0,
      failed: failedScansRes.count || 0,
      duplicate: duplicateScansRes.count || 0,
      limitReached: limitReachedScansRes.count || 0,
    }

    const checkInRate = totalParticipants > 0 
      ? (checkedInParticipants / totalParticipants) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalParticipants,
        checkedInParticipants,
        notCheckedIn: totalParticipants - checkedInParticipants,
        checkInRate,
        totalFoodClaims: foodClaimsCount,
        totalDrinkClaims: drinkClaimsCount,
        totalClaims: foodClaimsCount + drinkClaimsCount,
        totalDesks,
        desks,
        booths,
        menuItems,
        recentCheckIns,
        recentClaims,
        companies,
        hourlyCheckIns,
        hourlyClaims,
        scanLogsSummary,
      },
    })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get report data' },
      { status: 500 }
    )
  }
}
