import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    console.log('🔍 Search request for email:', email)

    if (!email || email.length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Search participants by email (case-insensitive, partial match)
    // Using mode: 'insensitive' for SQLite
    const participants = await db.participant.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive',
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        isCheckedIn: true,
        qrCode: true,
        photoUrl: true,
      },
      take: 10, // Limit results
      orderBy: {
        name: 'asc'
      }
    })

    console.log('✅ Found participants:', participants.length)

    return NextResponse.json({
      success: true,
      data: participants
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to search participants'
    }, { status: 500 })
  }
}
