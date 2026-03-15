import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'event-management-secret-key-2025'
)

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'panitia'
  assignedType?: string | null
  assignedId?: string | null
}

export interface AuthResult {
  success: boolean
  user?: SessionUser
  error?: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Create session token
export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ 
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    assignedType: user.assignedType,
    assignedId: user.assignedId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY)
  
  return token
}

// Verify session token
export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

// Login function
export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await db.adminUser.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return { success: false, error: 'Email tidak ditemukan' }
    }

    if (!user.isActive) {
      return { success: false, error: 'Akun tidak aktif' }
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return { success: false, error: 'Password salah' }
    }

    // Update last login
    await db.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'panitia',
      assignedType: user.assignedType,
      assignedId: user.assignedId,
    }

    return { success: true, user: sessionUser }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Terjadi kesalahan' }
  }
}

// Get current session
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    
    if (!token) return null
    
    return verifySession(token)
  } catch {
    return null
  }
}

// Set session cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
