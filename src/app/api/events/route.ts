import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

// Force recompile - v2

// Get all events (for management)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const listAll = searchParams.get('all') === 'true'
  const eventId = searchParams.get('id')
  
  // Get specific event by ID
  if (eventId) {
    try {
      const { data: event, error } = await supabase
        .from('Event')
        .select('*')
        .eq('id', eventId)
        .maybeSingle()
      
      if (error) throw error
      
      if (!event) {
        return NextResponse.json(
          { success: false, error: 'Event not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: formatEventResponse(event),
      })
    } catch (error) {
      console.error('Get event error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get event' },
        { status: 500 }
      )
    }
  }
  
  if (listAll) {
    try {
      const { data: events, error } = await supabase
        .from('Event')
        .select('*')
        .order('createdAt', { ascending: false })
      
      if (error) throw error
      
      // Get counts separately for each event
      const eventsWithCounts = await Promise.all(
        (events || []).map(async (event) => {
          const [participantsRes, checkInsRes, claimsRes] = await Promise.all([
            supabase.from('Participant').select('id', { count: 'exact', head: true }).eq('eventId', event.id),
            supabase.from('CheckIn').select('id', { count: 'exact', head: true }).eq('eventId', event.id),
            supabase.from('Claim').select('id', { count: 'exact', head: true }).eq('eventId', event.id),
          ])
          
          return {
            ...formatEventResponse(event),
            participantsCount: participantsRes.count || 0,
            checkInsCount: checkInsRes.count || 0,
            claimsCount: claimsRes.count || 0,
          }
        })
      )
      
      return NextResponse.json({
        success: true,
        data: eventsWithCounts,
      })
    } catch (error) {
      console.error('Get events error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get events' },
        { status: 500 }
      )
    }
  }
  
  // Get single event (default behavior - main event)
  try {
    let { data: event, error } = await supabase
      .from('Event')
      .select('*')
      .eq('id', 'main-event')
      .maybeSingle()
    
    // Create default event if not exists
    if (!event) {
      const { data: newEvent, error: createError } = await supabase
        .from('Event')
        .insert({
          id: 'main-event',
          name: 'Gathering PT HKI',
          description: 'Annual company gathering',
          date: new Date('2026-09-20T08:00:00').toISOString(),
          location: 'Grand Ballroom, Hotel Mulia',
          isActive: true,
        })
        .select()
        .single()
      
      if (createError) throw createError
      event = newEvent
    }
    
    return NextResponse.json({
      success: true,
      data: formatEventResponse(event),
    })
  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get event' },
      { status: 500 }
    )
  }
}

// Helper function to format event response
function formatEventResponse(event: Record<string, unknown>) {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    date: typeof event.date === 'string' ? event.date.split('T')[0] : new Date(event.date as string).toISOString().split('T')[0],
    endDate: event.endDate ? (typeof event.endDate === 'string' ? (event.endDate as string).split('T')[0] : new Date(event.endDate as string).toISOString().split('T')[0]) : null,
    location: event.location,
    isActive: event.isActive,
    tagline: event.tagline,
    logoUrl: event.logoUrl,
    bannerUrl: event.bannerUrl,
    primaryColor: event.primaryColor || '#10b981',
    secondaryColor: event.secondaryColor || '#0d9488',
    organizer: event.organizer,
    website: event.website,
    registrationStart: event.registrationStart,
    registrationEnd: event.registrationEnd,
    instagram: event.instagram,
    twitter: event.twitter,
    linkedin: event.linkedin,
    // totalDesks is stored separately in Setting table
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }
}

// Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      name, 
      description, 
      date, 
      endDate,
      location,
      tagline,
      organizer,
      website,
      bannerUrl,
      logoUrl,
      primaryColor,
      secondaryColor,
      instagram,
      twitter,
      linkedin,
      maxFoodClaims,
      maxDrinkClaims,
      totalDesks,
    } = body
    
    if (!name || !date) {
      return NextResponse.json(
        { success: false, error: 'Name and date are required' },
        { status: 400 }
      )
    }
    
    // Generate unique event ID
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    const { data: event, error: eventError } = await supabase
      .from('Event')
      .insert({
        id: eventId,
        name,
        description: description || '',
        date: new Date(date).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        location: location || '',
        tagline: tagline || '',
        organizer: organizer || '',
        website: website || '',
        bannerUrl: bannerUrl || null,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || '#10b981',
        secondaryColor: secondaryColor || '#0d9488',
        instagram: instagram || '',
        twitter: twitter || '',
        linkedin: linkedin || '',
        totalDesks: totalDesks || 4,
        isActive: true,
      })
      .select()
      .single()
    
    if (eventError) throw eventError
    
    // Create default menu categories for the new event
    const { error: foodCatError } = await supabase
      .from('MenuCategory')
      .insert({
        eventId: event.id,
        name: 'Food',
        description: 'Food items',
        maxClaimsPerParticipant: maxFoodClaims || 2,
      })
    
    if (foodCatError) console.error('Failed to create Food category:', foodCatError)
    
    const { error: drinkCatError } = await supabase
      .from('MenuCategory')
      .insert({
        eventId: event.id,
        name: 'Drink',
        description: 'Drink items',
        maxClaimsPerParticipant: maxDrinkClaims || 1,
      })
    
    if (drinkCatError) console.error('Failed to create Drink category:', drinkCatError)
    
    return NextResponse.json({
      success: true,
      data: formatEventResponse(event),
      message: 'Event created successfully',
    })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

// Update event settings
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')
    
    const body = await request.json()
    const { 
      name, 
      description, 
      date, 
      endDate,
      location,
      tagline,
      logoUrl,
      bannerUrl,
      primaryColor,
      secondaryColor,
      organizer,
      website,
      instagram,
      twitter,
      linkedin,
      maxFoodClaims,
      maxDrinkClaims,
      totalDesks,
      isActive,
    } = body
    
    // Determine which event to update
    const targetEventId = eventId || 'main-event'
    
    // Check if event exists
    const { data: existingEvent, error: findError } = await supabase
      .from('Event')
      .select('*')
      .eq('id', targetEventId)
      .maybeSingle()
    
    if (findError) throw findError
    
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (date) updateData.date = new Date(date).toISOString()
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate).toISOString() : null
    if (location !== undefined) updateData.location = location
    if (tagline !== undefined) updateData.tagline = tagline
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor
    if (organizer !== undefined) updateData.organizer = organizer
    if (website !== undefined) updateData.website = website
    if (instagram !== undefined) updateData.instagram = instagram
    if (twitter !== undefined) updateData.twitter = twitter
    if (linkedin !== undefined) updateData.linkedin = linkedin
    // Note: totalDesks is stored in Setting table, not Event table
    if (isActive !== undefined) updateData.isActive = isActive
    
    const { data: event, error: updateError } = await supabase
      .from('Event')
      .update(updateData)
      .eq('id', targetEventId)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    // Update menu categories if claim limits changed
    if (maxFoodClaims !== undefined) {
      await supabase
        .from('MenuCategory')
        .update({ maxClaimsPerParticipant: maxFoodClaims })
        .eq('eventId', targetEventId)
        .eq('name', 'Food')
    }
    
    if (maxDrinkClaims !== undefined) {
      await supabase
        .from('MenuCategory')
        .update({ maxClaimsPerParticipant: maxDrinkClaims })
        .eq('eventId', targetEventId)
        .eq('name', 'Drink')
    }
    
    return NextResponse.json({
      success: true,
      data: formatEventResponse(event),
      message: 'Event settings updated successfully',
    })
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// Delete event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    // Prevent deleting the main event
    if (eventId === 'main-event') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the main event. Use reset instead.' },
        { status: 400 }
      )
    }
    
    // Check if event exists and get counts
    const { data: event, error: findError } = await supabase
      .from('Event')
      .select('id, name')
      .eq('id', eventId)
      .maybeSingle()
    
    if (findError) throw findError
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // Get counts before deletion
    const [participantsRes, claimsRes] = await Promise.all([
      supabase.from('Participant').select('id', { count: 'exact', head: true }).eq('eventId', eventId),
      supabase.from('Claim').select('id', { count: 'exact', head: true }).eq('eventId', eventId),
    ])
    
    // Delete related data first (cascade)
    await Promise.all([
      supabase.from('Participant').delete().eq('eventId', eventId),
      supabase.from('CheckIn').delete().eq('eventId', eventId),
      supabase.from('Claim').delete().eq('eventId', eventId),
      supabase.from('DisplayQueue').delete().eq('eventId', eventId),
      supabase.from('ScanLog').delete().eq('eventId', eventId),
      supabase.from('Announcement').delete().eq('eventId', eventId),
      supabase.from('Schedule').delete().eq('eventId', eventId),
      supabase.from('Sponsor').delete().eq('eventId', eventId),
      supabase.from('MenuCategory').delete().eq('eventId', eventId),
      supabase.from('Booth').delete().eq('eventId', eventId),
      supabase.from('MenuItem').delete().eq('eventId', eventId),
    ])
    
    // Delete event
    const { error: deleteError } = await supabase
      .from('Event')
      .delete()
      .eq('id', eventId)
    
    if (deleteError) throw deleteError
    
    return NextResponse.json({
      success: true,
      message: `Event "${event.name}" deleted successfully`,
      deletedData: {
        participants: participantsRes.count || 0,
        claims: claimsRes.count || 0,
      },
    })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
