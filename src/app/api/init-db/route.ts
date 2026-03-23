import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * Database Initialization API
 * 
 * GET /api/init-db - Initialize database tables via Supabase Management API
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

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test if tables exist by querying the Event table
    const { error: testError } = await supabase.from('Event').select('id').limit(1)
    
    if (!testError) {
      return NextResponse.json({
        success: true,
        message: 'Database tables already exist'
      })
    }

    // Tables don't exist - provide instructions
    if (testError.message.includes('Could not find')) {
      return NextResponse.json({
        success: false,
        error: 'Database tables not found. Please create them in Supabase Dashboard.',
        instructions: [
          '=== MANUAL SETUP REQUIRED ===',
          '',
          '1. Open Supabase Dashboard: https://supabase.com/dashboard',
          '2. Select your project (ibrdwbsfwrrxeqglpppk)',
          '3. Go to SQL Editor (left sidebar)',
          '4. Click "New query"',
          '5. Copy and paste the ENTIRE contents of supabase/schema.sql',
          '6. Click "Run" (or press Cmd/Ctrl + Enter)',
          '',
          'Alternative: Use the Supabase CLI:',
          '  supabase db push',
          '',
          'The schema file is located at: /supabase/schema.sql'
        ]
      }, { status: 500 })
    }

    return NextResponse.json({
      success: false,
      error: `Database error: ${testError.message}`
    }, { status: 500 })

  } catch (error) {
    console.error('Init database error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
