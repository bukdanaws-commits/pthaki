'use client'

import { useState, useEffect } from 'react'
import { Settings, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import ParticipantLandingPage from '@/components/sections/ParticipantLandingPage'
import AdminDashboard from '@/components/sections/AdminDashboard'
import PanitiaDashboard from '@/components/sections/PanitiaDashboard'
import LoginPage from '@/components/sections/LoginPage'
import { useToast } from '@/hooks/use-toast'

interface SessionUser {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'panitia'
  assignedType?: string | null
  assignedId?: string | null
}

/**
 * Main Entry Point
 * - Default: Participant Landing Page dengan form pendaftaran
 * - Admin/Panitia: Login dulu → Dashboard sesuai role
 */
export default function Home() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const result = await response.json()
        
        if (result.success && result.authenticated && result.user) {
          setUser(result.user)
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkSession()
  }, [])

  const handleLoginSuccess = (loggedInUser: SessionUser) => {
    setUser(loggedInUser)
    setShowLogin(false)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      toast({
        title: 'Logout Berhasil',
        description: 'Anda telah keluar dari sistem',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#47b2e4] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show Login Page
  if (showLogin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onBack={() => setShowLogin(false)} />
  }

  // Show Admin Dashboard if logged in
  if (user) {
    // Panitia gets a simplified dashboard
    if (user.role === 'panitia') {
      return (
        <PanitiaDashboard 
          userName={user.name || user.email} 
          onLogout={handleLogout}
        />
      )
    }
    
    // Admin gets the full dashboard
    return (
      <div className="relative">
        {/* User Info Bar - Fixed at top */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b px-4 py-2">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#37517e] text-white text-sm">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 
                   user.email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.name || user.email}</p>
                <Badge className={`text-xs text-white ${user.role === 'admin' ? 'bg-[#37517e]' : 'bg-[#47b2e4]'}`}>
                  {user.role === 'admin' ? 'Admin' : 'Panitia'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setUser(null)}
                className="text-slate-600"
              >
                Kembali ke Landing
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
        <div className="pt-14">
          <AdminDashboard userRole={user.role} />
        </div>
      </div>
    )
  }

  // Show Participant Landing Page with Login Button
  return (
    <div className="relative">
      {/* Admin Access Button */}
      <Button
        variant="default"
        onClick={() => setShowLogin(true)}
        className="fixed top-4 right-4 z-50 bg-[#37517e] hover:bg-[#37517e]/90 shadow-lg gap-2"
      >
        <User className="h-4 w-4" />
        Admin/Panitia Login
      </Button>
      <ParticipantLandingPage />
    </div>
  )
}
