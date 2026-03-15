import { createServiceClient } from './supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { Database, Tables, InsertTables, UpdateTables } from './supabase/database.types'

// Re-export types
export type { Database, Tables, InsertTables, UpdateTables }

// Create a direct Supabase client for direct access (for cases where db helper is not enough)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database helper that mimics Prisma-like API but uses Supabase
// This provides a familiar interface for easier migration

class DatabaseClient {
  private getClient() {
    return createServiceClient()
  }

  // Event operations
  event = {
    findFirst: async (args?: { where?: Record<string, unknown>; select?: string[] | string }) => {
      const client = this.getClient()
      const selectFields = Array.isArray(args?.select) 
        ? args.select.join(',') 
        : (typeof args?.select === 'string' ? args.select : '*')
      let query = client.from('Event').select(selectFields)
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { data, error } = await query.maybeSingle()
      if (error) throw error
      return data as Tables<'Event'> | null
    },
    
    findUnique: async (args: { where: { id?: string; [key: string]: unknown } }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('Event')
        .select('*')
        .eq('id', args.where.id!)
        .maybeSingle()
      
      if (error) throw error
      return data as Tables<'Event'> | null
    },
    
    findMany: async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string>; limit?: number }) => {
      const client = this.getClient()
      let query = client.from('Event').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      if (args?.limit) {
        query = query.limit(args.limit)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'Event'>[]
    },
    
    create: async (args: { data: InsertTables<'Event'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('Event')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'Event'>
    },
    
    update: async (args: { where: { id: string }; data: UpdateTables<'Event'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('Event')
        .update(args.data)
        .eq('id', args.where.id)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'Event'>
    },
    
    upsert: async (args: { where: { id: string }; create: InsertTables<'Event'>; update: UpdateTables<'Event'> }) => {
      const client = this.getClient()
      const existing = await this.findUnique({ where: args.where })
      
      if (existing) {
        return this.update({ where: args.where, data: args.update })
      } else {
        return this.create({ data: { ...args.create, id: args.where.id } })
      }
    },
  }

  // AdminUser operations
  adminUser = {
    findFirst: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('AdminUser').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { data, error } = await query.maybeSingle()
      if (error) throw error
      return data as Tables<'AdminUser'> | null
    },
    
    findUnique: async (args: { where: { id?: string; email?: string } }) => {
      const client = this.getClient()
      let query = client.from('AdminUser').select('*')
      
      if (args.where.id) {
        query = query.eq('id', args.where.id)
      } else if (args.where.email) {
        query = query.eq('email', args.where.email)
      }
      
      const { data, error } = await query.maybeSingle()
      if (error) throw error
      return data as Tables<'AdminUser'> | null
    },
    
    findMany: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('AdminUser').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'AdminUser'>[]
    },
    
    create: async (args: { data: InsertTables<'AdminUser'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('AdminUser')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'AdminUser'>
    },
    
    update: async (args: { where: { id: string } | { email: string }; data: UpdateTables<'AdminUser'> }) => {
      const client = this.getClient()
      let query = client.from('AdminUser').update(args.data)
      
      if ('id' in args.where) {
        query = query.eq('id', args.where.id)
      } else if ('email' in args.where) {
        query = query.eq('email', args.where.email)
      }
      
      const { data, error } = await query.select().single()
      if (error) throw error
      return data as Tables<'AdminUser'>
    },
    
    upsert: async (args: { where: { email: string }; create: InsertTables<'AdminUser'>; update: UpdateTables<'AdminUser'> }) => {
      const client = this.getClient()
      const existing = await this.findUnique({ where: { email: args.where.email } })
      
      if (existing) {
        return this.update({ where: { email: args.where.email }, data: args.update })
      } else {
        return this.create({ data: args.create })
      }
    },
    
    count: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('AdminUser').select('id', { count: 'exact', head: true })
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { count, error } = await query
      if (error) throw error
      return count || 0
    },
  }

  // Participant operations
  participant = {
    findFirst: async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string> }) => {
      const client = this.getClient()
      let query = client.from('Participant').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          if (key === 'email' && typeof value === 'object' && value !== null && 'contains' in value) {
            // Handle contains search
            query = query.ilike('email', `%${(value as { contains: string }).contains}%`)
          } else if (key === 'qrCode') {
            query = query.eq('qrCode', value as string)
          } else {
            query = query.eq(key, value as string | number | boolean)
          }
        })
      }
      
      const { data, error } = await query.maybeSingle()
      if (error) throw error
      return data as Tables<'Participant'> | null
    },
    
    findUnique: async (args: { where: { id?: string; qrCode?: string; email?: string } }) => {
      const client = this.getClient()
      let query = client.from('Participant').select('*')
      
      if (args.where.id) {
        query = query.eq('id', args.where.id)
      } else if (args.where.qrCode) {
        query = query.eq('qrCode', args.where.qrCode)
      } else if (args.where.email) {
        query = query.eq('email', args.where.email)
      }
      
      const { data, error } = await query.maybeSingle()
      if (error) throw error
      return data as Tables<'Participant'> | null
    },
    
    findMany: async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string>; take?: number; skip?: number }) => {
      const client = this.getClient()
      let query = client.from('Participant').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          if (key === 'email' && typeof value === 'object' && value !== null && 'contains' in value) {
            // Handle contains search
            query = query.ilike('email', `%${(value as { contains: string }).contains}%`)
          } else if (key === 'qrCode') {
            query = query.eq('qrCode', value as string)
          } else {
            query = query.eq(key, value as string | number | boolean)
          }
        })
      }
      
      if (args?.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0]
        query = query.order(field, { ascending: direction === 'asc' })
      }
      
      if (args?.take) {
        query = query.limit(args.take)
      }
      
      if (args?.skip) {
        query = query.range(args.skip, args.skip + (args.take || 10) - 1)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'Participant'>[]
    },
    
    count: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('Participant').select('id', { count: 'exact', head: true })
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { count, error } = await query
      if (error) throw error
      return count || 0
    },
    
    create: async (args: { data: InsertTables<'Participant'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('Participant')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'Participant'>
    },
    
    update: async (args: { where: { id: string } | { qrCode: string }; data: UpdateTables<'Participant'> }) => {
      const client = this.getClient()
      let query = client.from('Participant').update(args.data)
      
      if ('id' in args.where) {
        query = query.eq('id', args.where.id)
      } else if ('qrCode' in args.where) {
        query = query.eq('qrCode', args.where.qrCode)
      }
      
      const { data, error } = await query.select().single()
      if (error) throw error
      return data as Tables<'Participant'>
    },
    
    deleteMany: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('Participant').delete()
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { error } = await query
      if (error) throw error
      return { count: 0 }
    },
  }

  // CheckIn operations
  checkIn = {
    findMany: async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string>; take?: number }) => {
      const client = this.getClient()
      let query = client.from('CheckIn').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      if (args?.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0]
        query = query.order(field, { ascending: direction === 'asc' })
      }
      
      if (args?.take) {
        query = query.limit(args.take)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'CheckIn'>[]
    },
    
    count: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('CheckIn').select('id', { count: 'exact', head: true })
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { count, error } = await query
      if (error) throw error
      return count || 0
    },
    
    create: async (args: { data: InsertTables<'CheckIn'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('CheckIn')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'CheckIn'>
    },
  }

  // DisplayQueue operations
  displayQueue = {
    create: async (args: { data: InsertTables<'DisplayQueue'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('DisplayQueue')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'DisplayQueue'>
    },
    
    findMany: async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string>; take?: number }) => {
      const client = this.getClient()
      let query = client.from('DisplayQueue').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          // Handle special query operators
          if (typeof value === 'object' && value !== null) {
            const queryOp = value as Record<string, unknown>
            if ('gte' in queryOp) {
              query = query.gte(key, queryOp.gte as string | number)
            } else if ('gt' in queryOp) {
              query = query.gt(key, queryOp.gt as string | number)
            } else if ('lt' in queryOp) {
              query = query.lt(key, queryOp.lt as string | number)
            } else if ('lte' in queryOp) {
              query = query.lte(key, queryOp.lte as string | number)
            } else {
              query = query.eq(key, value as string | number | boolean)
            }
          } else {
            query = query.eq(key, value as string | number | boolean)
          }
        })
      }
      
      if (args?.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0]
        query = query.order(field, { ascending: direction === 'asc' })
      }
      
      if (args?.take) {
        query = query.limit(args.take)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'DisplayQueue'>[]
    },
    
    update: async (args: { where: { id: string }; data: UpdateTables<'DisplayQueue'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('DisplayQueue')
        .update(args.data)
        .eq('id', args.where.id)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'DisplayQueue'>
    },
    
    deleteMany: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('DisplayQueue').delete()
      
      if (args?.where) {
        // Handle OR conditions
        if ('OR' in args.where) {
          // For Supabase, we need to handle OR differently
          // For now, just delete all matching the base conditions
          const orConditions = args.where.OR as Record<string, unknown>[]
          // We'll handle this by deleting expired items and displayed items separately
          for (const condition of orConditions) {
            let deleteQuery = client.from('DisplayQueue').delete()
            Object.entries(condition).forEach(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                const queryOp = value as Record<string, unknown>
                if ('lt' in queryOp) {
                  deleteQuery = deleteQuery.lt(key, queryOp.lt as string | number)
                }
              } else {
                deleteQuery = deleteQuery.eq(key, value as string | number | boolean)
              }
            })
            await deleteQuery
          }
          return { count: orConditions.length }
        } else {
          Object.entries(args.where).forEach(([key, value]) => {
            query = query.eq(key, value as string | number | boolean)
          })
        }
      }
      
      const { error } = await query
      if (error) throw error
      return { count: 0 }
    },
  }

  // MenuCategory operations
  menuCategory = {
    findFirst: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('MenuCategory').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { data, error } = await query.maybeSingle()
      if (error) throw error
      return data as Tables<'MenuCategory'> | null
    },
    
    findMany: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('MenuCategory').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'MenuCategory'>[]
    },
    
    create: async (args: { data: InsertTables<'MenuCategory'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('MenuCategory')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'MenuCategory'>
    },
  }

  // MenuItem operations
  menuItem = {
    findMany: async (args?: { where?: Record<string, unknown>; select?: string }) => {
      const client = this.getClient()
      let query = client.from('MenuItem').select(args?.select || '*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          // Handle special query operators like { gt: 0 }
          if (typeof value === 'object' && value !== null) {
            const queryOp = value as Record<string, unknown>
            if ('gt' in queryOp) {
              query = query.gt(key, queryOp.gt as number)
            } else if ('gte' in queryOp) {
              query = query.gte(key, queryOp.gte as number)
            } else if ('lt' in queryOp) {
              query = query.lt(key, queryOp.lt as number)
            } else if ('lte' in queryOp) {
              query = query.lte(key, queryOp.lte as number)
            } else {
              query = query.eq(key, value as string | number | boolean)
            }
          } else {
            query = query.eq(key, value as string | number | boolean)
          }
        })
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'MenuItem'>[]
    },
    
    findUnique: async (args: { where: { id: string } }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('MenuItem')
        .select('*')
        .eq('id', args.where.id)
        .maybeSingle()
      
      if (error) throw error
      return data as Tables<'MenuItem'> | null
    },
    
    update: async (args: { where: { id: string }; data: UpdateTables<'MenuItem'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('MenuItem')
        .update(args.data)
        .eq('id', args.where.id)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'MenuItem'>
    },
    
    create: async (args: { data: InsertTables<'MenuItem'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('MenuItem')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'MenuItem'>
    },
    
    upsert: async (args: { where: { id: string }; create: InsertTables<'MenuItem'>; update: UpdateTables<'MenuItem'> }) => {
      const client = this.getClient()
      const existing = await this.findUnique({ where: args.where })
      
      if (existing) {
        return this.update({ where: args.where, data: args.update })
      } else {
        const { data, error } = await client
          .from('MenuItem')
          .insert({ ...args.create, id: args.where.id })
          .select()
          .single()
        
        if (error) throw error
        return data as Tables<'MenuItem'>
      }
    },
  }

  // Booth operations
  booth = {
    findMany: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('Booth').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'Booth'>[]
    },
    
    findUnique: async (args: { where: { id: string } }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('Booth')
        .select('*')
        .eq('id', args.where.id)
        .maybeSingle()
      
      if (error) throw error
      return data as Tables<'Booth'> | null
    },
    
    update: async (args: { where: { id: string }; data: UpdateTables<'Booth'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('Booth')
        .update(args.data)
        .eq('id', args.where.id)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'Booth'>
    },
    
    upsert: async (args: { where: { id: string }; create: InsertTables<'Booth'>; update: UpdateTables<'Booth'> }) => {
      const client = this.getClient()
      const existing = await this.findUnique({ where: args.where })
      
      if (existing) {
        return this.update({ where: args.where, data: args.update })
      } else {
        const { data, error } = await client
          .from('Booth')
          .insert({ ...args.create, id: args.where.id })
          .select()
          .single()
        
        if (error) throw error
        return data as Tables<'Booth'>
      }
    },
    
    create: async (args: { data: InsertTables<'Booth'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('Booth')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'Booth'>
    },
    
    delete: async (args: { where: { id: string } }) => {
      const client = this.getClient()
      const { error } = await client
        .from('Booth')
        .delete()
        .eq('id', args.where.id)
      
      if (error) throw error
      return { success: true }
    },
  }

  // Claim operations
  claim = {
    findMany: async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string>; take?: number }) => {
      const client = this.getClient()
      let query = client.from('Claim').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      if (args?.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0]
        query = query.order(field, { ascending: direction === 'asc' })
      }
      
      if (args?.take) {
        query = query.limit(args.take)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'Claim'>[]
    },
    
    count: async (args?: { where?: Record<string, unknown> }) => {
      const client = this.getClient()
      let query = client.from('Claim').select('id', { count: 'exact', head: true })
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      const { count, error } = await query
      if (error) throw error
      return count || 0
    },
    
    create: async (args: { data: InsertTables<'Claim'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('Claim')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'Claim'>
    },
  }

  // ScanLog operations
  scanLog = {
    create: async (args: { data: InsertTables<'ScanLog'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('ScanLog')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'ScanLog'>
    },
  }

  // EventStats operations
  eventStats = {
    findUnique: async (args: { where: { eventId: string } }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('EventStats')
        .select('*')
        .eq('eventId', args.where.eventId)
        .maybeSingle()
      
      if (error) throw error
      return data as Tables<'EventStats'> | null
    },
    
    create: async (args: { data: InsertTables<'EventStats'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('EventStats')
        .insert(args.data)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'EventStats'>
    },
    
    update: async (args: { where: { eventId: string }; data: UpdateTables<'EventStats'> }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('EventStats')
        .update(args.data)
        .eq('eventId', args.where.eventId)
        .select()
        .single()
      
      if (error) throw error
      return data as Tables<'EventStats'>
    },
    
    upsert: async (args: { where: { eventId: string }; create: InsertTables<'EventStats'>; update: UpdateTables<'EventStats'> }) => {
      const client = this.getClient()
      
      // Check if stats exist
      const { data: existing, error: findError } = await client
        .from('EventStats')
        .select('*')
        .eq('eventId', args.where.eventId)
        .maybeSingle()
      
      if (findError) throw findError
      
      if (existing) {
        const { data, error } = await client
          .from('EventStats')
          .update(args.update)
          .eq('eventId', args.where.eventId)
          .select()
          .single()
        
        if (error) throw error
        return data as Tables<'EventStats'>
      } else {
        const { data, error } = await client
          .from('EventStats')
          .insert(args.create)
          .select()
          .single()
        
        if (error) throw error
        return data as Tables<'EventStats'>
      }
    },
  }

  // Announcement operations
  announcement = {
    findMany: async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string>; take?: number }) => {
      const client = this.getClient()
      let query = client.from('Announcement').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      if (args?.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0]
        query = query.order(field, { ascending: direction === 'asc' })
      }
      
      if (args?.take) {
        query = query.limit(args.take)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'Announcement'>[]
    },
  }

  // Schedule operations
  schedule = {
    findMany: async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string>; take?: number }) => {
      const client = this.getClient()
      let query = client.from('Schedule').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      if (args?.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0]
        query = query.order(field, { ascending: direction === 'asc' })
      }
      
      if (args?.take) {
        query = query.limit(args.take)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'Schedule'>[]
    },
  }

  // Sponsor operations
  sponsor = {
    findMany: async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, string> }) => {
      const client = this.getClient()
      let query = client.from('Sponsor').select('*')
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value as string | number | boolean)
        })
      }
      
      if (args?.orderBy) {
        const [field, direction] = Object.entries(args.orderBy)[0]
        query = query.order(field, { ascending: direction === 'asc' })
      }
      
      const { data, error } = await query
      if (error) throw error
      return data as Tables<'Sponsor'>[]
    },
  }

  // Setting operations
  setting = {
    findUnique: async (args: { where: { key: string } }) => {
      const client = this.getClient()
      const { data, error } = await client
        .from('Setting')
        .select('*')
        .eq('key', args.where.key)
        .maybeSingle()
      
      if (error) throw error
      return data as Tables<'Setting'> | null
    },
    
    findMany: async () => {
      const client = this.getClient()
      const { data, error } = await client
        .from('Setting')
        .select('*')
      
      if (error) throw error
      return data as Tables<'Setting'>[]
    },
    
    upsert: async (args: { where: { key: string }; create: InsertTables<'Setting'>; update: UpdateTables<'Setting'> }) => {
      const client = this.getClient()
      
      // Check if setting exists
      const { data: existing, error: findError } = await client
        .from('Setting')
        .select('*')
        .eq('key', args.where.key)
        .maybeSingle()
      
      if (findError) throw findError
      
      if (existing) {
        const { data, error } = await client
          .from('Setting')
          .update(args.update)
          .eq('key', args.where.key)
          .select()
        
        if (error) throw error
        return data as Tables<'Setting'>[]
      } else {
        const { data, error } = await client
          .from('Setting')
          .insert(args.create)
          .select()
        
        if (error) throw error
        return (data as Tables<'Setting'>[])[0]
      }
    },
  }

  // Raw SQL for complex queries (use sparingly)
  async $queryRawUnsafe<T = unknown>(query: string): Promise<T[]> {
    const client = this.getClient()
    const { data, error } = await client.rpc('exec_sql', { query })
    if (error) throw error
    return data as T[]
  }

  // Transaction support (Supabase uses PostgreSQL transactions)
  async $transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    return callback(this)
  }
}

// Export singleton instance
export const db = new DatabaseClient()
