'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  Utensils, 
  Monitor, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import CheckinSection from './CheckinSection'
import ClaimSection from './ClaimSection'
import DisplayMonitorSection from './DisplayMonitorSection'

interface PanitiaDashboardProps {
  userName?: string
  onLogout?: () => void
}

type PanitiaView = 'checkin' | 'claim' | 'display'

const menuItems = [
  { 
    id: 'checkin', 
    label: 'Check-in', 
    icon: CheckCircle, 
    color: 'from-emerald-500 to-emerald-600',
    description: 'Scan QR peserta untuk check-in'
  },
  { 
    id: 'claim', 
    label: 'Claim Makanan', 
    icon: Utensils, 
    color: 'from-orange-500 to-orange-600',
    description: 'Proses klaim makanan & minuman'
  },
  { 
    id: 'display', 
    label: 'Display Screen', 
    icon: Monitor, 
    color: 'from-blue-500 to-blue-600',
    description: 'Monitor display welcome screen'
  },
]

export default function PanitiaDashboard({ userName = 'Panitia', onLogout }: PanitiaDashboardProps) {
  const [currentView, setCurrentView] = useState<PanitiaView>('checkin')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      fetch('/api/auth/logout', { method: 'POST' })
      window.location.reload()
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case 'checkin':
        return <CheckinSection />
      case 'claim':
        return <ClaimSection />
      case 'display':
        return <DisplayMonitorSection />
      default:
        return <CheckinSection />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="bg-gradient-to-b from-[#37517e] to-[#2a3d5e] text-white flex flex-col fixed h-full z-50 shadow-2xl"
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#47b2e4] to-[#37517e] p-2.5 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <h1 className="font-bold text-lg">Panitia Panel</h1>
                  <p className="text-xs text-slate-300">Event Management</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#47b2e4] flex items-center justify-center font-bold">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="font-medium text-sm">{userName}</p>
                <p className="text-xs text-slate-300">Panitia</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="flex-1 p-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as PanitiaView)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all text-left group",
                  isActive 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                    : "hover:bg-white/10 text-slate-200 hover:text-white"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-lg transition-all",
                  isActive ? "bg-white/20" : "bg-white/10 group-hover:bg-white/20"
                )}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                </div>
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1"
                    >
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>

        {/* Logout & Collapse */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-all"
          >
            <div className="p-2.5 rounded-lg bg-white/10">
              <LogOut className="h-5 w-5" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full justify-center text-slate-300 hover:text-white hover:bg-white/10"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 flex flex-col transition-all"
        style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      >
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#37517e]">
                {menuItems.find(m => m.id === currentView)?.label || 'Dashboard'}
              </h2>
              <p className="text-slate-500 text-sm">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-3xl font-bold text-[#47b2e4]">
                  {currentTime.toLocaleTimeString('id-ID')}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="gap-2 border-[#47b2e4] text-[#47b2e4] hover:bg-[#47b2e4] hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span>Event Management System</span>
              <span className="text-slate-300">|</span>
              <span>Panitia Panel</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <a href="https://goopps.id/" target="_blank" rel="noopener noreferrer" className="font-medium text-[#47b2e4] hover:underline">
                Goopps.id
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
