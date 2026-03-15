import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/db'

export async function GET() {
  try {
    // Get all participants
    const { data: participants, error: participantsError } = await supabase
      .from('Participant')
      .select('*')
      .eq('eventId', 'main-event')
      .order('createdAt', { ascending: true })

    if (participantsError) {
      console.error('Error fetching participants:', participantsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch participants' },
        { status: 500 }
      )
    }

    // Get all menu items with category
    const { data: menuItems, error: menuError } = await supabase
      .from('MenuItem')
      .select(`
        *,
        MenuCategory(id, name)
      `)
      .eq('eventId', 'main-event')

    if (menuError) {
      console.error('Error fetching menu items:', menuError)
    }

    // Get all claims with participant, menu item, and booth
    const { data: claims, error: claimsError } = await supabase
      .from('Claim')
      .select(`
        *,
        Participant(id, name, email),
        MenuItem(id, name, MenuCategory(id, name)),
        Booth(id, name)
      `)
      .eq('eventId', 'main-event')
      .order('claimedAt', { ascending: false })

    if (claimsError) {
      console.error('Error fetching claims:', claimsError)
    }

    // Get all check-ins
    const { data: checkIns, error: checkInsError } = await supabase
      .from('CheckIn')
      .select('*')
      .eq('eventId', 'main-event')

    if (checkInsError) {
      console.error('Error fetching check-ins:', checkInsError)
    }

    // Create a map of check-ins by participant ID
    const checkInMap = new Map()
    if (checkIns) {
      for (const ci of checkIns) {
        if (!checkInMap.has(ci.participantId)) {
          checkInMap.set(ci.participantId, ci)
        }
      }
    }

    // Create workbook
    const workbook = XLSX.utils.book_new()
    
    // Sheet 1: Participants
    const participantsData = (participants || []).map(p => {
      const checkIn = checkInMap.get(p.id)
      return {
        Name: p.name || '',
        Email: p.email || '',
        Phone: p.phone || '',
        Company: p.company || '',
        Bio: p.bio || '',
        'QR Code': p.qrCode || '',
        'Checked In': p.isCheckedIn ? 'Yes' : 'No',
        'Check-in Time': checkIn ? new Date(checkIn.checkedInAt).toLocaleString() : '',
        'Food Claims': `${p.foodClaims || 0}/${p.maxFoodClaims || 2}`,
        'Drink Claims': `${p.drinkClaims || 0}/${p.maxDrinkClaims || 2}`,
        'Registered At': p.createdAt ? new Date(p.createdAt).toLocaleString() : '',
      }
    })
    const participantsSheet = XLSX.utils.json_to_sheet(participantsData)
    XLSX.utils.book_append_sheet(workbook, participantsSheet, 'Participants')
    
    // Sheet 2: Claims
    const claimsData = (claims || []).map(c => {
      const menuItem = c.MenuItem || c.menuItem
      const participant = c.Participant || c.participant
      const booth = c.Booth || c.booth
      const category = menuItem?.MenuCategory || menuItem?.menuCategory
      
      return {
        Participant: participant?.name || '',
        Email: participant?.email || '',
        'Menu Item': menuItem?.name || '',
        Category: category?.name || '',
        Booth: booth?.name || '',
        'Claimed At': c.claimedAt ? new Date(c.claimedAt).toLocaleString() : '',
      }
    })
    const claimsSheet = XLSX.utils.json_to_sheet(claimsData)
    XLSX.utils.book_append_sheet(workbook, claimsSheet, 'Claims')
    
    // Sheet 3: Menu Items
    const menuData = (menuItems || []).map(m => {
      const category = m.MenuCategory || m.menuCategory
      return {
        Name: m.name || '',
        Description: m.description || '',
        Category: category?.name || '',
        'Initial Stock': m.initialStock || 0,
        'Current Stock': m.currentStock || 0,
        'Items Claimed': (m.initialStock || 0) - (m.currentStock || 0),
      }
    })
    const menuSheet = XLSX.utils.json_to_sheet(menuData)
    XLSX.utils.book_append_sheet(workbook, menuSheet, 'Menu Items')

    // Sheet 4: Check-ins
    const checkInsData = (checkIns || []).map(ci => {
      const participant = participants?.find(p => p.id === ci.participantId)
      return {
        Name: participant?.name || '',
        Email: participant?.email || '',
        'Desk Number': ci.deskNumber || '',
        'Check-in Time': ci.checkedInAt ? new Date(ci.checkedInAt).toLocaleString() : '',
      }
    })
    const checkInsSheet = XLSX.utils.json_to_sheet(checkInsData)
    XLSX.utils.book_append_sheet(workbook, checkInsSheet, 'Check-ins')
    
    // Sheet 5: Summary
    const totalParticipants = participants?.length || 0
    const checkedIn = participants?.filter(p => p.isCheckedIn).length || 0
    const notCheckedIn = totalParticipants - checkedIn
    const totalClaims = claims?.length || 0
    const foodClaims = claims?.filter(c => {
      const menuItem = c.MenuItem || c.menuItem
      const category = menuItem?.MenuCategory || menuItem?.menuCategory
      return category?.name?.toLowerCase() === 'food'
    }).length || 0
    const drinkClaims = claims?.filter(c => {
      const menuItem = c.MenuItem || c.menuItem
      const category = menuItem?.MenuCategory || menuItem?.menuCategory
      return category?.name?.toLowerCase() === 'drink'
    }).length || 0

    const summaryData = [
      { Metric: 'Total Participants', Value: totalParticipants },
      { Metric: 'Checked In', Value: checkedIn },
      { Metric: 'Not Checked In', Value: notCheckedIn },
      { Metric: 'Total Claims', Value: totalClaims },
      { Metric: 'Food Claims', Value: foodClaims },
      { Metric: 'Drink Claims', Value: drinkClaims },
    ]
    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="event-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
