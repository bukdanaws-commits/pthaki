'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  CheckCircle, 
  UtensilsCrossed, 
  Store, 
  Receipt, 
  FileBarChart, 
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Calendar,
  ExternalLink,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import AdminSection from './AdminSection'
import { useToast } from '@/hooks/use-toast'

interface AdminDashboardProps {
  userRole?: 'admin' | 'panitia'
}

type AdminView = 'dashboard' | 'participants' | 'menu' | 'booths' | 'reports' | 'export' | 'settings'

// Admin menu - HANYA data dan grafik, tidak ada scanner/check-in/claim functionality
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-slate-600 to-slate-700' },
  { id: 'participants', label: 'Participants', icon: Users, color: 'from-blue-500 to-blue-600' },
  { id: 'menu', label: 'Food & Drink Menu', icon: UtensilsCrossed, color: 'from-orange-500 to-orange-600' },
  { id: 'booths', label: 'Booths', icon: Store, color: 'from-purple-500 to-purple-600' },
  { id: 'reports', label: 'Reports', icon: FileBarChart, color: 'from-cyan-500 to-cyan-600' },
  { id: 'export', label: 'Export Data', icon: Download, color: 'from-teal-500 to-teal-600' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
]

export default function AdminDashboard({ userRole = 'admin' }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState({
    totalParticipants: 0,
    checkedIn: 0,
    totalClaims: 0,
  })
  const { toast } = useToast()

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const result = await response.json()
        if (result.success) {
          setStats({
            totalParticipants: result.data.totalParticipants,
            checkedIn: result.data.checkedInParticipants,
            totalClaims: result.data.totalClaims,
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleRefresh = async () => {
    try {
      const response = await fetch('/api/stats')
      const result = await response.json()
      if (result.success) {
        setStats({
          totalParticipants: result.data.totalParticipants,
          checkedIn: result.data.checkedInParticipants,
          totalClaims: result.data.totalClaims,
        })
        toast({ title: 'Data refreshed', description: 'Statistics updated successfully' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to refresh data', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="bg-slate-900 text-white flex flex-col fixed h-full z-50"
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#47b2e4] to-[#37517e] p-2 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <h1 className="font-bold text-lg">Event Admin</h1>
                  <p className="text-xs text-slate-400">Management System</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Menu */}
        <ScrollArea className="flex-1 p-3">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as AdminView)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group",
                    isActive 
                      ? "bg-gradient-to-r from-[#47b2e4] to-[#37517e] text-white shadow-lg" 
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive ? "bg-white/20" : "bg-slate-800 group-hover:bg-slate-700"
                  )}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User & Logout */}
        <div className="p-3 border-t border-slate-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          >
            <div className="p-2 rounded-lg bg-slate-800">
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
          
          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full justify-center text-slate-400 hover:text-white hover:bg-slate-800"
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
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {menuItems.find(m => m.id === currentView)?.label || 'Dashboard'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Gathering PT HKI • {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-3xl font-bold text-[#47b2e4]">
                  {currentTime.toLocaleTimeString('id-ID')}
                </p>
              </div>
              <Button variant="outline" onClick={handleRefresh} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' ? (
              <motion.div
                key="dashboard-cards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Peserta</p>
                          <p className="text-4xl font-bold">{stats.totalParticipants.toLocaleString()}</p>
                        </div>
                        <Users className="h-12 w-12 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-sm">Sudah Check-in</p>
                          <p className="text-4xl font-bold">{stats.checkedIn.toLocaleString()}</p>
                        </div>
                        <CheckCircle className="h-12 w-12 text-emerald-200" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Total Claims</p>
                          <p className="text-4xl font-bold">{stats.totalClaims.toLocaleString()}</p>
                        </div>
                        <Receipt className="h-12 w-12 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Menu Cards Grid */}
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Menu Utama</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {menuItems.filter(item => item.id !== 'dashboard').map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden group"
                          onClick={() => setCurrentView(item.id as AdminView)}
                        >
                          <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <Icon className="h-6 w-6" />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-slate-800 dark:text-white">{item.label}</CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-slate-500 dark:text-slate-400">
                              {item.id === 'participants' && 'Kelola data peserta event'}
                              {item.id === 'menu' && 'Kelola menu makanan & minuman'}
                              {item.id === 'booths' && 'Kelola booth klaim'}
                              {item.id === 'reports' && 'Laporan statistik event'}
                              {item.id === 'export' && 'Export data ke Excel/PDF'}
                              {item.id === 'settings' && 'Pengaturan event & sistem'}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Quick Stats */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Belum Hadir</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <span className="text-2xl font-bold text-slate-800 dark:text-white">
                            {(stats.totalParticipants - stats.checkedIn).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Check-in Rate</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                          <span className="text-2xl font-bold text-slate-800 dark:text-white">
                            {stats.totalParticipants > 0 
                              ? Math.round((stats.checkedIn / stats.totalParticipants) * 100) 
                              : 0}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Food Claims</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-5 w-5 text-purple-500" />
                          <span className="text-2xl font-bold text-slate-800 dark:text-white">
                            {stats.totalClaims.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Active Booths</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Store className="h-5 w-5 text-cyan-500" />
                          <span className="text-2xl font-bold text-slate-800 dark:text-white">
                            -
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="admin-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <AdminSection initialView={currentView} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span>Event Management System © 2025</span>
              <span className="text-slate-300">|</span>
              <span>Supporting up to 5000+ participants</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <a 
                href="https://goopps.id/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo-goopps.jpg" 
                  alt="Goopps" 
                  className="h-6 w-6 rounded-full object-cover inline-block"
                />
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
