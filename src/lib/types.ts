// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Participant Types
export interface Participant {
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
  checkInTime: Date | null
  foodClaims: number
  drinkClaims: number
  maxFoodClaims: number
  maxDrinkClaims: number
  createdAt: Date
  updatedAt: Date
}

export interface ParticipantFormData {
  name: string
  email: string
  phone: string
  company?: string
  bio?: string
  photo?: string
}

// Check-in Types
export interface CheckInData {
  qrCode: string
  deskNumber: number
}

export interface CheckInResult {
  success: boolean
  participant?: Participant
  message: string
  alreadyCheckedIn?: boolean
}

// Claim Types
export interface ClaimData {
  qrCode: string
  boothId: string
  menuItemId: string
}

export interface ClaimResult {
  success: boolean
  participant?: Participant
  menuItem?: MenuItem
  message: string
  remainingFoodClaims?: number
  remainingDrinkClaims?: number
}

// Menu Types
export interface MenuCategory {
  id: string
  name: string
  description: string | null
  createdAt: Date
}

export interface MenuItem {
  id: string
  eventId: string
  categoryId: string
  category?: MenuCategory
  name: string
  description: string | null
  imageUrl: string | null
  initialStock: number
  currentStock: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MenuItemFormData {
  name: string
  description?: string
  categoryId: string
  initialStock: number
  imageUrl?: string
}

// Booth Types
export interface Booth {
  id: string
  eventId: string
  name: string
  boothType: 'food' | 'drink'
  boothNumber: number
  isActive: boolean
  createdAt: Date
}

// Statistics Types
export interface DashboardStats {
  totalParticipants: number
  checkedInParticipants: number
  totalClaims: number
  foodClaims: number
  drinkClaims: number
  remainingFoodStock: number
  remainingDrinkStock: number
  recentCheckIns: Array<{
    id: string
    name: string
    company: string | null
    checkedInAt: Date
  }>
  boothActivity: Array<{
    id: string
    name: string
    type: string
    claims: number
  }>
  claimTrends: Array<{
    date: string
    food: number
    drink: number
  }>
}

// Display Queue Types
export interface DisplayQueueItem {
  id: string
  participantId: string
  participant: {
    name: string
    company: string | null
    photoUrl: string | null
  }
  displayedAt: Date
  isDisplayed: boolean
}

// WebSocket Event Types
export interface WebSocketEvents {
  'check-in': (data: { participantId: string; name: string; company: string | null; photoUrl: string | null }) => void
  'display-update': (data: DisplayQueueItem) => void
}
