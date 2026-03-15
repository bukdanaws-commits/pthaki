import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

/**
 * Seed Admin Users API
 * Creates default admin and panitia accounts
 * 
 * Default accounts:
 * - admin@event.com / admin123 (Admin - Full Access)
 * - panitia@event.com / panitia123 (Panitia - Scanner Only)
 */
export async function GET() {
  return POST()
}

export async function POST() {
  try {
    // Get or create event
    let event = await db.event.findFirst({
      where: { id: 'main-event' }
    })

    if (!event) {
      event = await db.event.create({
        data: {
          id: 'main-event',
          name: 'Tech Summit Indonesia 2025',
          description: 'Konferensi teknologi terbesar di Indonesia',
          tagline: 'Innovate. Connect. Transform.',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          location: 'Jakarta Convention Center',
          organizer: 'Goopps Indonesia',
          website: 'https://goopps.id',
          primaryColor: '#10b981',
          secondaryColor: '#0d9488',
          isActive: true,
        }
      })
    }

    // Create admin user
    const adminPassword = await hashPassword('admin123')
    const admin = await db.adminUser.upsert({
      where: { email: 'admin@event.com' },
      update: {},
      create: {
        email: 'admin@event.com',
        name: 'Administrator',
        password: adminPassword,
        role: 'admin',
        isActive: true,
      }
    })

    // Create panitia user
    const panitiaPassword = await hashPassword('panitia123')
    const panitia = await db.adminUser.upsert({
      where: { email: 'panitia@event.com' },
      update: {},
      create: {
        email: 'panitia@event.com',
        name: 'Panitia Scanner',
        password: panitiaPassword,
        role: 'panitia',
        isActive: true,
      }
    })

    // Create another panitia for claim booth
    const claimPassword = await hashPassword('claim123')
    const claimPanitia = await db.adminUser.upsert({
      where: { email: 'claim@event.com' },
      update: {},
      create: {
        email: 'claim@event.com',
        name: 'Panitia Claim Booth',
        password: claimPassword,
        role: 'panitia',
        assignedType: 'claim',
        isActive: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin users created successfully',
      users: [
        { email: 'admin@event.com', password: 'admin123', role: 'admin', access: 'Full Dashboard' },
        { email: 'panitia@event.com', password: 'panitia123', role: 'panitia', access: 'Check-in & Claim Scanner' },
        { email: 'claim@event.com', password: 'claim123', role: 'panitia', access: 'Claim Scanner Only' },
      ]
    })
  } catch (error) {
    console.error('Seed admin error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed admin users' },
      { status: 500 }
    )
  }
}
