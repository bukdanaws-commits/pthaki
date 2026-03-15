import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    })

    response.cookies.set('session_user_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
