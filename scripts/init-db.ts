#!/usr/bin/env bun
/**
 * Database initialization script using direct PostgreSQL connection
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import pg from 'pg'

const { Client } = pg

async function main() {
  console.log('🚀 Initializing database...')
  
  // Get connection details from DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment')
    process.exit(1)
  }
  
  // Parse the URL - format: https://project:password@host:port/database
  // We need to convert it to a proper postgres connection
  const url = databaseUrl
  
  // Extract components
  const match = url.match(/https?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(\w+)/)
  
  if (!match) {
    console.error('❌ Could not parse DATABASE_URL')
    console.error('URL format:', url.replace(/:[^:@]+@/, ':****@'))
    process.exit(1)
  }
  
  const [, project, encodedPassword, host, port, database] = match
  const password = decodeURIComponent(encodedPassword)
  
  console.log(`📍 Connecting to ${host}:${port}/${database}`)
  console.log(`👤 User: ${project}`)
  
  const client = new Client({
    host,
    port: parseInt(port),
    database,
    user: project,
    password,
    ssl: {
      rejectUnauthorized: false
    }
  })
  
  try {
    await client.connect()
    console.log('✅ Connected to database')
    
    // Read schema file
    const schemaPath = join(import.meta.dir, '..', 'supabase', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')
    console.log('📄 Schema file loaded')
    
    // Execute schema
    await client.query(schema)
    console.log('✅ Schema executed successfully')
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    
    console.log('\n📊 Tables created:')
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })
    
    await client.end()
    console.log('\n✨ Database initialization complete!')
    
  } catch (error) {
    console.error('❌ Error:', error)
    try { await client.end() } catch {}
    process.exit(1)
  }
}

main()
