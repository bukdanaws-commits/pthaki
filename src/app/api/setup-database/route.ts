import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * Database Setup API
 * 
 * GET /api/setup-database - Check database status and get setup instructions
 * POST /api/setup-database - Try to create tables via Supabase API
 */

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase credentials not configured'
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Check if Setting table exists (simple test)
    const { error: settingError } = await supabase.from('Setting').select('key').limit(1)
    
    // Check if Event table exists
    const { error: eventError } = await supabase.from('Event').select('id').limit(1)
    
    if (!settingError && !eventError) {
      return NextResponse.json({
        success: true,
        message: 'Database tables exist'
      })
    }

    // Tables don't exist - return setup instructions
    return NextResponse.json({
      success: false,
      needsSetup: true,
      error: 'Database tables not found',
      instructions: [
        '=== DATABASE SETUP REQUIRED ===',
        '',
        'The Supabase database tables have not been created yet.',
        'Please follow these steps:',
        '',
        '1. Open Supabase Dashboard:',
        '   https://supabase.com/dashboard/project/ibrdwbsfwrrxeqglpppk',
        '',
        '2. Go to SQL Editor (left sidebar)',
        '',
        '3. Click "New query"',
        '',
        '4. Copy and paste the following SQL schema:',
        '',
        '--- SCHEMA START ---',
      ],
      schemaUrl: '/api/setup-database/schema'
    }, { status: 500 })

  } catch (error) {
    console.error('Database setup check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Return the schema SQL
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      success: false,
      error: 'Supabase credentials not configured'
    }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Try to create tables using Supabase Management API
  // Note: This won't work through REST API, but let's try anyway
  
  const results: string[] = []
  
  // Test each table
  const tables = ['Event', 'AdminUser', 'Participant', 'CheckIn', 'DisplayQueue', 
                  'MenuCategory', 'MenuItem', 'Booth', 'Claim', 'ScanLog', 
                  'EventStats', 'Announcement', 'Schedule', 'Sponsor', 'Setting']
  
  const missingTables: string[] = []
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error?.message?.includes('Could not find')) {
      missingTables.push(table)
    }
  }

  if (missingTables.length > 0) {
    return NextResponse.json({
      success: false,
      error: 'Tables not found. Please run the schema in Supabase SQL Editor.',
      missingTables,
      instructions: [
        '1. Open https://supabase.com/dashboard/project/ibrdwbsfwrrxeqglpppk/sql/new',
        '2. Copy the entire contents of supabase/schema.sql',
        '3. Paste and run the query',
      ]
    }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'All tables exist'
  })
}
