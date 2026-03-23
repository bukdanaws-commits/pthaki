import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Schema SQL Endpoint
 * Returns the database schema SQL for manual setup
 */
export async function GET() {
  try {
    const schemaPath = join(process.cwd(), 'supabase', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')
    
    return new NextResponse(schema, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="schema.sql"'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Could not read schema file'
    }, { status: 500 })
  }
}
