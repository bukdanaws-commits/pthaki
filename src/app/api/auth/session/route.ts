import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Simple session check based on user ID from cookie
    const userId = request.cookies.get('session_user_id')?.value

    if (!userId) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
      })
    }

    const user = await db.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        eventId: true,
        assignedType: true,
        assignedId: true,
        isActive: true,
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
      })
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        eventId: user.eventId,
        assignedType: user.assignedType,
        assignedId: user.assignedId,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { success: false, error: 'Session check failed' },
      { status: 500 }
    )
  }
}
