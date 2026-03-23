import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get all participants with their data
    const participants = await db.participant.findMany({
      where: { eventId: 'main-event' },
      include: {
        claims: {
          include: {
            menuItem: true,
            booth: true,
          },
        },
        checkIns: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    
    // Get all menu items
    const menuItems = await db.menuItem.findMany({
      where: { eventId: 'main-event' },
      include: { category: true },
    })
    
    // Get all claims
    const claims = await db.claim.findMany({
      where: { eventId: 'main-event' },
      include: {
        participant: true,
        menuItem: {
          include: { category: true }
        },
        booth: true,
      },
      orderBy: { claimedAt: 'desc' },
    })
    
    // Create workbook
    const workbook = XLSX.utils.book_new()
    
    // Sheet 1: Participants
    const participantsData = participants.map(p => ({
      Name: p.name,
      Email: p.email,
      Phone: p.phone,
      Company: p.company || '',
      Bio: p.bio || '',
      'QR Code': p.qrCode,
      'Checked In': p.isCheckedIn ? 'Yes' : 'No',
      'Check-in Time': p.checkInTime ? new Date(p.checkInTime).toLocaleString() : '',
      'Food Claims': `${p.foodClaims}/${p.maxFoodClaims}`,
      'Drink Claims': `${p.drinkClaims}/${p.maxDrinkClaims}`,
      'Registered At': new Date(p.createdAt).toLocaleString(),
    }))
    const participantsSheet = XLSX.utils.json_to_sheet(participantsData)
    XLSX.utils.book_append_sheet(workbook, participantsSheet, 'Participants')
    
    // Sheet 2: Claims
    const claimsData = claims.map(c => ({
      Participant: c.participant.name,
      Email: c.participant.email,
      'Menu Item': c.menuItem.name,
      Category: c.menuItem.category?.name || '',
      Booth: c.booth.name,
      'Claimed At': new Date(c.claimedAt).toLocaleString(),
    }))
    const claimsSheet = XLSX.utils.json_to_sheet(claimsData)
    XLSX.utils.book_append_sheet(workbook, claimsSheet, 'Claims')
    
    // Sheet 3: Menu Items
    const menuData = menuItems.map(m => ({
      Name: m.name,
      Description: m.description || '',
      Category: m.category?.name || '',
      'Initial Stock': m.initialStock,
      'Current Stock': m.currentStock,
      'Items Claimed': m.initialStock - m.currentStock,
    }))
    const menuSheet = XLSX.utils.json_to_sheet(menuData)
    XLSX.utils.book_append_sheet(workbook, menuSheet, 'Menu Items')
    
    // Sheet 4: Summary
    const summaryData = [
      { Metric: 'Total Participants', Value: participants.length },
      { Metric: 'Checked In', Value: participants.filter(p => p.isCheckedIn).length },
      { Metric: 'Not Checked In', Value: participants.filter(p => !p.isCheckedIn).length },
      { Metric: 'Total Claims', Value: claims.length },
      { Metric: 'Food Claims', Value: claims.filter(c => c.menuItem.category?.name?.toLowerCase() === 'food').length },
      { Metric: 'Drink Claims', Value: claims.filter(c => c.menuItem.category?.name?.toLowerCase() === 'drink').length },
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
