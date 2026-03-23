// Database Types for Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Event: {
        Row: {
          id: string
          name: string
          description: string | null
          date: string
          endDate: string | null
          location: string | null
          isActive: boolean
          tagline: string | null
          logoUrl: string | null
          bannerUrl: string | null
          primaryColor: string | null
          secondaryColor: string | null
          organizer: string | null
          website: string | null
          registrationStart: string | null
          registrationEnd: string | null
          instagram: string | null
          twitter: string | null
          linkedin: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          date: string
          endDate?: string | null
          location?: string | null
          isActive?: boolean
          tagline?: string | null
          logoUrl?: string | null
          bannerUrl?: string | null
          primaryColor?: string | null
          secondaryColor?: string | null
          organizer?: string | null
          website?: string | null
          registrationStart?: string | null
          registrationEnd?: string | null
          instagram?: string | null
          twitter?: string | null
          linkedin?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          date?: string
          endDate?: string | null
          location?: string | null
          isActive?: boolean
          tagline?: string | null
          logoUrl?: string | null
          bannerUrl?: string | null
          primaryColor?: string | null
          secondaryColor?: string | null
          organizer?: string | null
          website?: string | null
          registrationStart?: string | null
          registrationEnd?: string | null
          instagram?: string | null
          twitter?: string | null
          linkedin?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      AdminUser: {
        Row: {
          id: string
          email: string
          name: string | null
          password: string
          role: string
          eventId: string | null
          assignedType: string | null
          assignedId: string | null
          isActive: boolean
          lastLoginAt: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          password: string
          role?: string
          eventId?: string | null
          assignedType?: string | null
          assignedId?: string | null
          isActive?: boolean
          lastLoginAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          password?: string
          role?: string
          eventId?: string | null
          assignedType?: string | null
          assignedId?: string | null
          isActive?: boolean
          lastLoginAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      Participant: {
        Row: {
          id: string
          eventId: string
          name: string
          email: string
          phone: string
          company: string | null
          bio: string | null
          photoUrl: string | null
          aiPhotoUrl: string | null
          qrCode: string
          qrCodeUrl: string | null
          isCheckedIn: boolean
          checkInTime: string | null
          checkInDesk: number | null
          foodClaims: number
          drinkClaims: number
          maxFoodClaims: number
          maxDrinkClaims: number
          lastClaimAt: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          eventId: string
          name: string
          email: string
          phone: string
          company?: string | null
          bio?: string | null
          photoUrl?: string | null
          aiPhotoUrl?: string | null
          qrCode: string
          qrCodeUrl?: string | null
          isCheckedIn?: boolean
          checkInTime?: string | null
          checkInDesk?: number | null
          foodClaims?: number
          drinkClaims?: number
          maxFoodClaims?: number
          maxDrinkClaims?: number
          lastClaimAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          eventId?: string
          name?: string
          email?: string
          phone?: string
          company?: string | null
          bio?: string | null
          photoUrl?: string | null
          aiPhotoUrl?: string | null
          qrCode?: string
          qrCodeUrl?: string | null
          isCheckedIn?: boolean
          checkInTime?: string | null
          checkInDesk?: number | null
          foodClaims?: number
          drinkClaims?: number
          maxFoodClaims?: number
          maxDrinkClaims?: number
          lastClaimAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      CheckIn: {
        Row: {
          id: string
          eventId: string
          participantId: string
          deskNumber: number
          checkedInAt: string
          deviceName: string | null
          operatorId: string | null
        }
        Insert: {
          id?: string
          eventId: string
          participantId: string
          deskNumber: number
          checkedInAt?: string
          deviceName?: string | null
          operatorId?: string | null
        }
        Update: {
          id?: string
          eventId?: string
          participantId?: string
          deskNumber?: number
          checkedInAt?: string
          deviceName?: string | null
          operatorId?: string | null
        }
      }
      DisplayQueue: {
        Row: {
          id: string
          eventId: string
          participantId: string
          name: string
          company: string | null
          photoUrl: string | null
          displayOrder: number
          isDisplayed: boolean
          displayDuration: number
          displayedAt: string | null
          expiresAt: string
          createdAt: string
        }
        Insert: {
          id?: string
          eventId: string
          participantId: string
          name: string
          company?: string | null
          photoUrl?: string | null
          displayOrder?: number
          isDisplayed?: boolean
          displayDuration?: number
          displayedAt?: string | null
          expiresAt?: string
          createdAt?: string
        }
        Update: {
          id?: string
          eventId?: string
          participantId?: string
          name?: string
          company?: string | null
          photoUrl?: string | null
          displayOrder?: number
          isDisplayed?: boolean
          displayDuration?: number
          displayedAt?: string | null
          expiresAt?: string
          createdAt?: string
        }
      }
      MenuCategory: {
        Row: {
          id: string
          eventId: string
          name: string
          description: string | null
          maxClaimsPerParticipant: number
          createdAt: string
        }
        Insert: {
          id?: string
          eventId: string
          name: string
          description?: string | null
          maxClaimsPerParticipant?: number
          createdAt?: string
        }
        Update: {
          id?: string
          eventId?: string
          name?: string
          description?: string | null
          maxClaimsPerParticipant?: number
          createdAt?: string
        }
      }
      MenuItem: {
        Row: {
          id: string
          eventId: string
          categoryId: string
          name: string
          description: string | null
          imageUrl: string | null
          initialStock: number
          currentStock: number
          totalClaims: number
          isActive: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          eventId: string
          categoryId: string
          name: string
          description?: string | null
          imageUrl?: string | null
          initialStock?: number
          currentStock?: number
          totalClaims?: number
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          eventId?: string
          categoryId?: string
          name?: string
          description?: string | null
          imageUrl?: string | null
          initialStock?: number
          currentStock?: number
          totalClaims?: number
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      Booth: {
        Row: {
          id: string
          eventId: string
          name: string
          boothType: string
          boothNumber: number
          allowedCategory: string | null
          totalClaims: number
          deviceName: string | null
          isActive: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          eventId: string
          name: string
          boothType: string
          boothNumber: number
          allowedCategory?: string | null
          totalClaims?: number
          deviceName?: string | null
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          eventId?: string
          name?: string
          boothType?: string
          boothNumber?: number
          allowedCategory?: string | null
          totalClaims?: number
          deviceName?: string | null
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      Claim: {
        Row: {
          id: string
          eventId: string
          participantId: string
          menuItemId: string
          boothId: string
          category: string
          claimedAt: string
          deviceName: string | null
          operatorId: string | null
        }
        Insert: {
          id?: string
          eventId: string
          participantId: string
          menuItemId: string
          boothId: string
          category: string
          claimedAt?: string
          deviceName?: string | null
          operatorId?: string | null
        }
        Update: {
          id?: string
          eventId?: string
          participantId?: string
          menuItemId?: string
          boothId?: string
          category?: string
          claimedAt?: string
          deviceName?: string | null
          operatorId?: string | null
        }
      }
      ScanLog: {
        Row: {
          id: string
          eventId: string
          participantId: string | null
          scanType: string
          scanResult: string
          message: string | null
          boothId: string | null
          deskNumber: number | null
          deviceName: string | null
          operatorId: string | null
          ipAddress: string | null
          checkInId: string | null
          claimId: string | null
          scannedAt: string
        }
        Insert: {
          id?: string
          eventId: string
          participantId?: string | null
          scanType: string
          scanResult: string
          message?: string | null
          boothId?: string | null
          deskNumber?: number | null
          deviceName?: string | null
          operatorId?: string | null
          ipAddress?: string | null
          checkInId?: string | null
          claimId?: string | null
          scannedAt?: string
        }
        Update: {
          id?: string
          eventId?: string
          participantId?: string | null
          scanType?: string
          scanResult?: string
          message?: string | null
          boothId?: string | null
          deskNumber?: number | null
          deviceName?: string | null
          operatorId?: string | null
          ipAddress?: string | null
          checkInId?: string | null
          claimId?: string | null
          scannedAt?: string
        }
      }
      EventStats: {
        Row: {
          id: string
          eventId: string
          totalParticipants: number
          totalCheckIns: number
          totalNotCheckedIn: number
          totalFoodClaims: number
          totalDrinkClaims: number
          totalClaims: number
          desk1CheckIns: number
          desk2CheckIns: number
          desk3CheckIns: number
          desk4CheckIns: number
          updatedAt: string
        }
        Insert: {
          id?: string
          eventId: string
          totalParticipants?: number
          totalCheckIns?: number
          totalNotCheckedIn?: number
          totalFoodClaims?: number
          totalDrinkClaims?: number
          totalClaims?: number
          desk1CheckIns?: number
          desk2CheckIns?: number
          desk3CheckIns?: number
          desk4CheckIns?: number
          updatedAt?: string
        }
        Update: {
          id?: string
          eventId?: string
          totalParticipants?: number
          totalCheckIns?: number
          totalNotCheckedIn?: number
          totalFoodClaims?: number
          totalDrinkClaims?: number
          totalClaims?: number
          desk1CheckIns?: number
          desk2CheckIns?: number
          desk3CheckIns?: number
          desk4CheckIns?: number
          updatedAt?: string
        }
      }
      Announcement: {
        Row: {
          id: string
          eventId: string
          title: string
          content: string
          type: string
          priority: number
          isPinned: boolean
          showOnLanding: boolean
          publishAt: string
          expiresAt: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          eventId: string
          title: string
          content: string
          type?: string
          priority?: number
          isPinned?: boolean
          showOnLanding?: boolean
          publishAt?: string
          expiresAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          eventId?: string
          title?: string
          content?: string
          type?: string
          priority?: number
          isPinned?: boolean
          showOnLanding?: boolean
          publishAt?: string
          expiresAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      Schedule: {
        Row: {
          id: string
          eventId: string
          title: string
          description: string | null
          startTime: string
          endTime: string | null
          location: string | null
          speaker: string | null
          speakerTitle: string | null
          order: number
          category: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          eventId: string
          title: string
          description?: string | null
          startTime: string
          endTime?: string | null
          location?: string | null
          speaker?: string | null
          speakerTitle?: string | null
          order?: number
          category?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          eventId?: string
          title?: string
          description?: string | null
          startTime?: string
          endTime?: string | null
          location?: string | null
          speaker?: string | null
          speakerTitle?: string | null
          order?: number
          category?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      Sponsor: {
        Row: {
          id: string
          eventId: string
          name: string
          logoUrl: string | null
          website: string | null
          tier: string
          order: number
          isActive: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          eventId: string
          name: string
          logoUrl?: string | null
          website?: string | null
          tier?: string
          order?: number
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          eventId?: string
          name?: string
          logoUrl?: string | null
          website?: string | null
          tier?: string
          order?: number
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      Setting: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience type exports
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific table types
export type Event = Tables<'Event'>
export type AdminUser = Tables<'AdminUser'>
export type Participant = Tables<'Participant'>
export type CheckIn = Tables<'CheckIn'>
export type DisplayQueue = Tables<'DisplayQueue'>
export type MenuCategory = Tables<'MenuCategory'>
export type MenuItem = Tables<'MenuItem'>
export type Booth = Tables<'Booth'>
export type Claim = Tables<'Claim'>
export type ScanLog = Tables<'ScanLog'>
export type EventStats = Tables<'EventStats'>
export type Announcement = Tables<'Announcement'>
export type Schedule = Tables<'Schedule'>
export type Sponsor = Tables<'Sponsor'>
export type Setting = Tables<'Setting'>
