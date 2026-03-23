import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

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

    // Search participants by email using Supabase
    // Using ilike for case-insensitive partial match
    const { data: participants, error } = await supabase
      .from('Participant')
      .select('id, name, email, company, isCheckedIn, qrCode, photoUrl')
      .ilike('email', `%${email}%`)
      .order('name', { ascending: true })
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      throw error
    }

    console.log('✅ Found participants:', participants?.length || 0)

    return NextResponse.json({
      success: true,
      data: participants || []
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to search participants'
    }, { status: 500 })
  }
}
