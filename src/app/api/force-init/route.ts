import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const results: string[] = []

    // Step 1: Create Setting table by inserting default settings
    const defaultSettings = [
      { key: 'totalDesks', value: '4', description: 'Total number of check-in desks' },
      { key: 'maxFoodClaims', value: '2', description: 'Default max food claims per participant' },
      { key: 'maxDrinkClaims', value: '1', description: 'Default max drink claims per participant' },
    ]

    for (const setting of defaultSettings) {
      const { error } = await supabase
        .from('Setting')
        .upsert(setting)
      
      if (error) {
        results.push(`Setting ${setting.key}: ${error.message}`)
      } else {
        results.push(`Setting ${setting.key}: OK`)
      }
    }

    // Step 2: Create Event table
    const { error: eventError } = await supabase
      .from('Event')
      .upsert({
        id: 'main-event',
        name: 'Tech Summit Indonesia 2025',
        description: 'Konferensi teknologi terbesar di Indonesia',
        tagline: 'Innovate. Connect. Transform.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Jakarta Convention Center',
        organizer: 'Goopps Indonesia',
        isActive: true,
      })
    
    if (eventError) {
      results.push(`Event: ${eventError.message}`)
    } else {
      results.push('Event: OK')
    }

    // Step 3: Create MenuCategory table
    const { error: foodCatError } = await supabase
      .from('MenuCategory')
      .upsert({
        id: 'food-category',
        eventId: 'main-event',
        name: 'Food',
        description: 'Makanan utama',
        maxClaimsPerParticipant: 2,
      })

    const { error: drinkCatError } = await supabase
      .from('MenuCategory')
      .upsert({
        id: 'drink-category',
        eventId: 'main-event',
        name: 'Drink',
        description: 'Minuman',
        maxClaimsPerParticipant: 1,
      })

    // Step 4: Create MenuItem table
    const menuItems = [
      { id: 'menu-1', eventId: 'main-event', categoryId: 'food-category', name: 'Nasi Goreng Spesial', initialStock: 1000, currentStock: 1000, isActive: true },
      { id: 'menu-2', eventId: 'main-event', categoryId: 'food-category', name: 'Mie Goreng', initialStock: 800, currentStock: 800, isActive: true },
      { id: 'menu-3', eventId: 'main-event', categoryId: 'food-category', name: 'Ayam Bakar', initialStock: 500, currentStock: 500, isActive: true },
      { id: 'menu-4', eventId: 'main-event', categoryId: 'drink-category', name: 'Es Teh Manis', initialStock: 2000, currentStock: 2000, isActive: true },
      { id: 'menu-5', eventId: 'main-event', categoryId: 'drink-category', name: 'Kopi', initialStock: 1500, currentStock: 1500, isActive: true },
    ]

    for (const item of menuItems) {
      const { error } = await supabase.from('MenuItem').upsert(item)
      if (error) {
        results.push(`MenuItem ${item.name}: ${error.message}`)
      } else {
        results.push(`MenuItem ${item.name}: OK`)
      }
    }

    // Step 5: Create Booth table
    const booths = [
      { id: 'booth-food-1', eventId: 'main-event', name: 'Food Booth 1', boothType: 'food', boothNumber: 1, isActive: true },
      { id: 'booth-food-2', eventId: 'main-event', name: 'Food Booth 2', boothType: 'food', boothNumber: 2, isActive: true },
      { id: 'booth-drink-1', eventId: 'main-event', name: 'Drink Booth 1', boothType: 'drink', boothNumber: 1, isActive: true },
      { id: 'booth-drink-2', eventId: 'main-event', name: 'Drink Booth 2', boothType: 'drink', boothNumber: 2, isActive: true },
    ]

    for (const booth of booths) {
      const { error } = await supabase.from('Booth').upsert(booth)
      if (error) {
        results.push(`Booth ${booth.name}: ${error.message}`)
      } else {
        results.push(`Booth ${booth.name}: OK`)
      }
    }

    // Step 6: Create admin user
    const { data: existingAdmin } = await supabase
      .from('AdminUser')
      .select('id, email')
      .eq('email', 'admin@goopps.id')
      .maybeSingle()

    if (!existingAdmin) {
      const { error: adminError } = await supabase
        .from('AdminUser')
        .insert({
          id: 'admin-main',
          email: 'admin@goopps.id',
          name: 'Admin',
          password: 'admin123',
          role: 'admin',
          isActive: true,
        })
        .select('id')
        .single()

      if (adminError) {
        results.push(`AdminUser: ${adminError.message}`)
      } else {
        results.push('AdminUser: OK')
      }
    } else {
      results.push('AdminUser: Already exists')
    }

    // Step 7: Verify all tables
    const tables = ['Event', 'AdminUser', 'Participant', 'CheckIn', 'MenuCategory', 'MenuItem', 'Booth', 'Claim', 'ScanLog', 'EventStats', 'Announcement', 'Schedule', 'Sponsor', 'Setting']
    const tableStatus: { name: string; exists: boolean }[] = []

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1)
      tableStatus.push({ name: table, exists: !error })
    }

    const existingTables = tableStatus.filter(t => t.exists).map(t => t.name)
    const missingTables = tableStatus.filter(t => !t.exists).map(t => t.name)

    return NextResponse.json({
      success: missingTables.length === 0,
      message: missingTables.length === 0 ? 'Database initialized!' : 'Partial initialization',
      results,
      tablesCreated: existingTables,
      tablesMissing: missingTables,
    }, { status: missingTables.length > 0 ? 500 : 200 })

  } catch (error) {
    console.error('Force init error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
