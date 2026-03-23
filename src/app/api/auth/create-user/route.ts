import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'panitia', eventId } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await db.adminUser.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || email.split('@')[0],
        role,
        eventId: eventId || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: 'User berhasil dibuat'
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if any admin exists (for initial setup)
export async function GET() {
  try {
    const adminCount = await db.adminUser.count({
      where: { role: 'admin' }
    })

    const panitiaCount = await db.adminUser.count({
      where: { role: 'panitia' }
    })

    return NextResponse.json({
      success: true,
      data: {
        hasAdmin: adminCount > 0,
        adminCount,
        panitiaCount,
      }
    })
  } catch (error) {
    console.error('Check admin error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
