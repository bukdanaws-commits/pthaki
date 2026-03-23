import { z } from 'zod'

// Registration validation schema
export const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number is too long'),
  company: z.string().max(100, 'Company name is too long').optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
})

// Check-in validation schema
export const checkInSchema = z.object({
  qrCode: z.string().min(1, 'QR Code is required'),
  deskNumber: z.number().int().min(1).max(4),
})

// Claim validation schema
export const claimSchema = z.object({
  qrCode: z.string().min(1, 'QR Code is required'),
  boothId: z.string().min(1, 'Booth is required'),
  menuItemId: z.string().min(1, 'Menu item is required'),
})

// Menu item validation schema
export const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  initialStock: z.number().int().min(0, 'Stock must be a positive number'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
})

// Update menu item stock schema
export const updateMenuStockSchema = z.object({
  currentStock: z.number().int().min(0, 'Stock must be a positive number'),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>
export type CheckInFormData = z.infer<typeof checkInSchema>
export type ClaimFormData = z.infer<typeof claimSchema>
export type MenuItemFormData = z.infer<typeof menuItemSchema>
