import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId') || 'main-event'
    const reportType = searchParams.get('type') || 'full' // full, participants, checkins, claims, inventory
    
    // Get event info
    const { data: event, error: eventError } = await supabase
      .from('Event')
      .select('*')
      .eq('id', eventId)
      .maybeSingle()
    
    if (eventError) throw eventError
    
    const eventName = event?.name || 'Event Report'
    
    // Get all data in parallel
    const [
      participantsRes,
      checkInsRes,
      claimsRes,
      menuItemsRes,
      boothsRes,
      scanLogsRes,
      menuCategoriesRes,
    ] = await Promise.all([
      supabase.from('Participant').select('*').eq('eventId', eventId).order('name', { ascending: true }),
      supabase.from('CheckIn').select('*').eq('eventId', eventId).order('checkedInAt', { ascending: false }),
      supabase.from('Claim').select(`
        *,
        participant:Participant(*),
        menuItem:MenuItem(*),
        booth:Booth(*)
      `).eq('eventId', eventId).order('claimedAt', { ascending: false }),
      supabase.from('MenuItem').select(`
        *,
        category:MenuCategory(*)
      `).eq('eventId', eventId),
      supabase.from('Booth').select('*').eq('eventId', eventId),
      supabase.from('ScanLog').select('*').eq('eventId', eventId).order('scannedAt', { ascending: false }),
      supabase.from('MenuCategory').select('*').eq('eventId', eventId),
    ])
    
    const participants = participantsRes.data || []
    const checkIns = checkInsRes.data || []
    const claims = (claimsRes.data || []) as Array<{
      id: string
      category: string
      claimedAt: string
      participantId: string
      menuItemId: string
      boothId: string
      participant: { name: string; email: string; company?: string } | null
      menuItem: { name: string } | null
      booth: { name: string } | null
    }>
    const menuItems = menuItemsRes.data || []
    const booths = boothsRes.data || []
    const scanLogs = scanLogsRes.data || []
    const menuCategories = menuCategoriesRes.data || []

    // Calculate stats
    const totalParticipants = participants.length
    const checkedInParticipants = participants.filter((p: { isCheckedIn: boolean }) => p.isCheckedIn).length
    const notCheckedIn = totalParticipants - checkedInParticipants
    const checkInRate = totalParticipants > 0 ? ((checkedInParticipants / totalParticipants) * 100).toFixed(1) : '0.0'
    const foodClaims = claims.filter((c: { category: string }) => c.category?.toLowerCase() === 'food').length
    const drinkClaims = claims.filter((c: { category: string }) => c.category?.toLowerCase() === 'drink').length
    const totalClaims = claims.length
    
    // Scan stats
    const successfulScans = scanLogs.filter((s: { scanResult: string }) => s.scanResult === 'success').length
    const failedScans = scanLogs.filter((s: { scanResult: string }) => s.scanResult === 'failed').length
    const duplicateScans = scanLogs.filter((s: { scanResult: string }) => s.scanResult === 'duplicate').length
    const limitReachedScans = scanLogs.filter((s: { scanResult: string }) => s.scanResult === 'limit_reached').length

    // Desk stats
    const deskCounts: Record<number, number> = {}
    checkIns.forEach((c: { deskNumber: number }) => {
      deskCounts[c.deskNumber] = (deskCounts[c.deskNumber] || 0) + 1
    })

    // Company breakdown
    const companyMap: Record<string, { total: number; checkedIn: number }> = {}
    participants.forEach((p: { company?: string; isCheckedIn: boolean }) => {
      const company = p.company || 'No Company'
      if (!companyMap[company]) {
        companyMap[company] = { total: 0, checkedIn: 0 }
      }
      companyMap[company].total++
      if (p.isCheckedIn) {
        companyMap[company].checkedIn++
      }
    })
    const companies = Object.entries(companyMap)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total)

    // Create PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Colors
    const primaryColor: [number, number, number] = [55, 81, 126] // Goopps primary
    const accentColor: [number, number, number] = [71, 178, 228] // Goopps accent
    const successColor: [number, number, number] = [16, 185, 129]
    const warningColor: [number, number, number] = [245, 158, 11]
    const dangerColor: [number, number, number] = [239, 68, 68]
    
    // Header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(eventName, pageWidth / 2, 18, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Event Report', pageWidth / 2, 28, { align: 'center' })
    
    doc.setFontSize(9)
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, 36, { align: 'center' })
    
    let currentY = 55
    
    // Executive Summary Section
    doc.setTextColor(...primaryColor)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Executive Summary', 14, currentY)
    currentY += 8
    
    const summaryData = [
      ['Total Participants', totalParticipants.toString()],
      ['Checked In', `${checkedInParticipants} (${checkInRate}%)`],
      ['Not Checked In', notCheckedIn.toString()],
      ['Total Food Claims', foodClaims.toString()],
      ['Total Drink Claims', drinkClaims.toString()],
      ['Total Claims', totalClaims.toString()],
    ]
    
    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right' },
      },
    })
    
    currentY = (doc as any).lastAutoTable.finalY + 15
    
    // Scan Activity Summary
    if (currentY > 220) {
      doc.addPage()
      currentY = 20
    }
    
    doc.setTextColor(...primaryColor)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Scan Activity Summary', 14, currentY)
    currentY += 8
    
    const scanData = [
      ['Total Scans', scanLogs.length.toString()],
      ['Successful', successfulScans.toString()],
      ['Failed', failedScans.toString()],
      ['Duplicate', duplicateScans.toString()],
      ['Limit Reached', limitReachedScans.toString()],
    ]
    
    autoTable(doc, {
      startY: currentY,
      head: [['Scan Type', 'Count']],
      body: scanData,
      theme: 'grid',
      headStyles: { fillColor: accentColor, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    })
    
    currentY = (doc as any).lastAutoTable.finalY + 15
    
    // Check-in by Desk Section
    if (currentY > 220) {
      doc.addPage()
      currentY = 20
    }
    
    doc.setTextColor(...primaryColor)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Check-in by Desk', 14, currentY)
    currentY += 8
    
    const deskData = Object.entries(deskCounts)
      .map(([desk, count]) => [`Desk ${desk}`, count.toString(), `${((count / checkedInParticipants) * 100).toFixed(1)}%`])
      .sort((a, b) => parseInt(a[0].replace('Desk ', '')) - parseInt(b[0].replace('Desk ', '')))
    
    if (deskData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Desk', 'Check-ins', 'Percentage']],
        body: deskData,
        theme: 'grid',
        headStyles: { fillColor: successColor, fontSize: 10 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })
      currentY = (doc as any).lastAutoTable.finalY + 15
    }
    
    // Booth Performance Section
    if (currentY > 220) {
      doc.addPage()
      currentY = 20
    }
    
    doc.setTextColor(...primaryColor)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Booth Performance', 14, currentY)
    currentY += 8
    
    const boothData = booths
      .sort((a: { totalClaims: number }, b: { totalClaims: number }) => b.totalClaims - a.totalClaims)
      .map((b: { name: string; boothType: string; totalClaims: number }) => [
        b.name,
        b.boothType.toUpperCase(),
        b.totalClaims.toString(),
      ])
    
    if (boothData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Booth Name', 'Type', 'Total Claims']],
        body: boothData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], fontSize: 10 },
        bodyStyles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      })
      currentY = (doc as any).lastAutoTable.finalY + 15
    }
    
    // Menu Stock Section
    if (currentY > 220) {
      doc.addPage()
      currentY = 20
    }
    
    doc.setTextColor(...primaryColor)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Menu Stock Status', 14, currentY)
    currentY += 8
    
    const menuData = menuItems.map((m: { 
      name: string
      currentStock: number
      initialStock: number
      category: { name: string } | null
      totalClaims: number
    }) => [
      m.name,
      m.category?.name || 'Unknown',
      `${m.currentStock}/${m.initialStock}`,
      m.initialStock > 0 ? `${((1 - m.currentStock / m.initialStock) * 100).toFixed(0)}%` : '0%',
    ])
    
    if (menuData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Item', 'Category', 'Stock (Rem/Initial)', 'Used']],
        body: menuData,
        theme: 'grid',
        headStyles: { fillColor: warningColor, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      })
    }
    
    // Top Companies Section (New Page)
    doc.addPage()
    currentY = 20
    
    doc.setTextColor(...primaryColor)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Top Companies by Attendance', 14, currentY)
    currentY += 8
    
    const companyData = companies.slice(0, 15).map(c => [
      c.name,
      c.total.toString(),
      c.checkedIn.toString(),
      `${c.total > 0 ? ((c.checkedIn / c.total) * 100).toFixed(0) : 0}%`,
    ])
    
    if (companyData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Company', 'Total', 'Checked In', 'Rate']],
        body: companyData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      })
      currentY = (doc as any).lastAutoTable.finalY + 15
    }
    
    // Participants List Section
    if (reportType === 'full' || reportType === 'participants') {
      doc.addPage()
      currentY = 20
      
      doc.setTextColor(...primaryColor)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Participants List', 14, currentY)
      currentY += 8
      
      const participantData = participants.slice(0, 100).map((p: {
        name: string
        email: string
        company?: string
        isCheckedIn: boolean
        foodClaims: number
        maxFoodClaims: number
        drinkClaims: number
        maxDrinkClaims: number
      }) => [
        p.name,
        p.email,
        p.company || '-',
        p.isCheckedIn ? 'Yes' : 'No',
        `${p.foodClaims}/${p.maxFoodClaims}F, ${p.drinkClaims}/${p.maxDrinkClaims}D`,
      ])
      
      autoTable(doc, {
        startY: currentY,
        head: [['Name', 'Email', 'Company', 'Checked In', 'Claims']],
        body: participantData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 50 },
          2: { cellWidth: 35 },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
        },
      })
    }
    
    // Recent Claims Section
    if ((reportType === 'full' || reportType === 'claims') && claims.length > 0) {
      doc.addPage()
      currentY = 20
      
      doc.setTextColor(...primaryColor)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Recent Claims', 14, currentY)
      currentY += 8
      
      const claimData = claims.slice(0, 100).map((c) => [
        c.participant?.name || 'Unknown',
        c.menuItem?.name || 'Unknown',
        c.category,
        c.booth?.name || 'Unknown',
        new Date(c.claimedAt).toLocaleString('id-ID'),
      ])
      
      autoTable(doc, {
        startY: currentY,
        head: [['Participant', 'Item', 'Category', 'Booth', 'Time']],
        body: claimData,
        theme: 'grid',
        headStyles: { fillColor: [236, 72, 153], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      })
    }
    
    // Recent Check-ins Section
    if ((reportType === 'full' || reportType === 'checkins') && checkIns.length > 0) {
      doc.addPage()
      currentY = 20
      
      doc.setTextColor(...primaryColor)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Recent Check-ins', 14, currentY)
      currentY += 8
      
      // Get participant names for check-ins
      const participantMap: Record<string, { name: string; company?: string }> = {}
      participants.forEach((p: { id: string; name: string; company?: string }) => {
        participantMap[p.id] = { name: p.name, company: p.company }
      })
      
      const checkInData = checkIns.slice(0, 100).map((c: {
        participantId: string
        deskNumber: number
        checkedInAt: string
      }) => {
        const participant = participantMap[c.participantId] || { name: 'Unknown', company: '-' }
        return [
          participant.name,
          participant.company || '-',
          `Desk ${c.deskNumber}`,
          new Date(c.checkedInAt).toLocaleString('id-ID'),
        ]
      })
      
      autoTable(doc, {
        startY: currentY,
        head: [['Name', 'Company', 'Desk', 'Time']],
        body: checkInData,
        theme: 'grid',
        headStyles: { fillColor: successColor, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      })
    }
    
    // Scan Log Section (Audit)
    if (reportType === 'full' && scanLogs.length > 0) {
      doc.addPage()
      currentY = 20
      
      doc.setTextColor(...primaryColor)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Scan Log (Audit Trail)', 14, currentY)
      currentY += 8
      
      // Get participant names for scan logs
      const participantMap: Record<string, string> = {}
      participants.forEach((p: { id: string; name: string }) => {
        participantMap[p.id] = p.name
      })
      
      const scanData = scanLogs.slice(0, 100).map((s: {
        scanType: string
        scanResult: string
        participantId?: string
        message?: string
        deskNumber?: number
        scannedAt: string
      }) => [
        s.scanType,
        s.scanResult,
        s.participantId ? (participantMap[s.participantId] || 'Unknown') : '-',
        s.message || '-',
        new Date(s.scannedAt).toLocaleString('id-ID'),
      ])
      
      autoTable(doc, {
        startY: currentY,
        head: [['Type', 'Result', 'Participant', 'Message', 'Time']],
        body: scanData,
        theme: 'grid',
        headStyles: { fillColor: [100, 100, 100], fontSize: 9 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 50 },
          4: { cellWidth: 35 },
        },
      })
    }
    
    // Footer on each page
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Footer background
      doc.setFillColor(240, 240, 240)
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F')
      
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Page ${i} of ${pageCount} | ${eventName} | Powered by Goopps.id`,
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      )
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${eventName.replace(/[^a-zA-Z0-9]/g, '-')}-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
