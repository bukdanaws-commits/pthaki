import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId') || 'main-event'
    
    // Get event info
    const { data: event, error: eventError } = await supabase
      .from('Event')
      .select('*')
      .eq('id', eventId)
      .maybeSingle()
    
    if (eventError) throw eventError
    
    const eventName = event?.name || 'Event'
    const eventDate = event?.date ? new Date(event.date as string).toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : ''
    const eventLocation = event?.location || ''
    
    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('Participant')
      .select('*')
      .eq('eventId', eventId)
      .order('name', { ascending: true })
    
    if (participantsError) throw participantsError
    
    if (!participants || participants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No participants found' },
        { status: 404 }
      )
    }
    
    // Create PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Colors
    const primaryColor: [number, number, number] = [55, 81, 126]
    const successColor: [number, number, number] = [16, 185, 129]
    
    // Header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 45, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('ATTENDANCE SHEET', pageWidth / 2, 18, { align: 'center' })
    
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.text(eventName, pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(10)
    if (eventDate) {
      doc.text(eventDate, pageWidth / 2, 38, { align: 'center' })
    }
    
    // Event details
    let currentY = 55
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    
    if (eventLocation) {
      doc.text(`Location: ${eventLocation}`, 14, currentY)
      currentY += 7
    }
    
    doc.text(`Total Participants: ${participants.length}`, 14, currentY)
    currentY += 7
    
    const checkedInCount = participants.filter((p: { isCheckedIn: boolean }) => p.isCheckedIn).length
    doc.text(`Checked In: ${checkedInCount}`, 14, currentY)
    currentY += 7
    
    const notCheckedInCount = participants.length - checkedInCount
    doc.text(`Not Checked In: ${notCheckedInCount}`, 14, currentY)
    currentY += 15
    
    // Attendance table
    const tableData = participants.map((p: {
      name: string
      email: string
      company?: string
      isCheckedIn: boolean
      checkInTime?: string
    }, index: number) => [
      (index + 1).toString(),
      p.name,
      p.company || '-',
      p.email,
      p.isCheckedIn ? 'Yes' : '',
      p.checkInTime ? new Date(p.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
      '', // Signature column
    ])
    
    autoTable(doc, {
      startY: currentY,
      head: [['No', 'Name', 'Company', 'Email', 'Present', 'Time', 'Signature']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor, 
        fontSize: 9,
        halign: 'center',
      },
      bodyStyles: { 
        fontSize: 8,
      },
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 45 },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 25 },
      },
      didParseCell: (data) => {
        // Style the "Present" column
        if (data.column.index === 4 && data.section === 'body') {
          if (data.cell.raw === 'Yes') {
            data.cell.styles.textColor = successColor
            data.cell.styles.fontStyle = 'bold'
          }
        }
      },
    })
    
    // Footer on each page
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Footer
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Page ${i} of ${pageCount} | Printed: ${new Date().toLocaleString('id-ID')} | Powered by Goopps.id`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${eventName.replace(/[^a-zA-Z0-9]/g, '-')}-attendance-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Attendance PDF export error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate attendance PDF' },
      { status: 500 }
    )
  }
}
