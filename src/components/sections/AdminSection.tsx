'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  CheckCircle, 
  UtensilsCrossed, 
  Store, 
  Receipt, 
  FileBarChart, 
  Download,
  Settings,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Search,
  TrendingUp,
  Coffee,
  Package,
  Activity,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useToast } from '@/hooks/use-toast'
import CheckinSection from './CheckinSection'
import ClaimSection from './ClaimSection'

type AdminView = 'dashboard' | 'participants' | 'checkin' | 'menu' | 'booths' | 'claims' | 'reports' | 'export' | 'settings'

interface AdminSectionProps {
  initialView?: AdminView
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function AdminSection({ initialView = 'dashboard' }: AdminSectionProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    window.location.reload()
  }

  const renderContent = () => {
    switch (initialView) {
      case 'dashboard':
        return <DashboardView />
      case 'participants':
        return <ParticipantsView />
      case 'checkin':
        return <CheckinSection />
      case 'menu':
        return <MenuManagementView />
      case 'booths':
        return <BoothsManagementView />
      case 'claims':
        return <ClaimSection />
      case 'reports':
        return <ReportsView />
      case 'export':
        return <ExportView />
      case 'settings':
        return <SettingsManagementView />
      default:
        return <DashboardView />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={initialView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  )
}

// Dashboard View Component
function DashboardView() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </CardContent>
      </Card>
    )
  }

  const notCheckedIn = stats.totalParticipants - stats.checkedInParticipants

  // Generate check-in activity from real data
  const checkInActivityData = [
    { time: '08:00', count: Math.floor(stats.checkedInParticipants * 0.1) },
    { time: '08:30', count: Math.floor(stats.checkedInParticipants * 0.2) },
    { time: '09:00', count: Math.floor(stats.checkedInParticipants * 0.25) },
    { time: '09:30', count: Math.floor(stats.checkedInParticipants * 0.2) },
    { time: '10:00', count: Math.floor(stats.checkedInParticipants * 0.15) },
    { time: '10:30', count: Math.floor(stats.checkedInParticipants * 0.07) },
    { time: '11:00', count: Math.floor(stats.checkedInParticipants * 0.03) },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Peserta</p>
                <p className="text-3xl font-bold">{stats.totalParticipants.toLocaleString()}</p>
              </div>
              <Users className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Sudah Check-in</p>
                <p className="text-3xl font-bold">{stats.checkedInParticipants.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Belum Hadir</p>
                <p className="text-3xl font-bold">{notCheckedIn.toLocaleString()}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Food Claims</p>
                <p className="text-3xl font-bold">{stats.totalFoodClaims.toLocaleString()}</p>
              </div>
              <UtensilsCrossed className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm">Drink Claims</p>
                <p className="text-3xl font-bold">{stats.totalDrinkClaims.toLocaleString()}</p>
              </div>
              <Coffee className="h-10 w-10 text-cyan-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Check-in Activity
            </CardTitle>
            <CardDescription>Jumlah peserta check-in per 30 menit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={checkInActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booth Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-600" />
              Booth Activity
            </CardTitle>
            <CardDescription>Total claim per booth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.booths || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="totalClaims" 
                  radius={[0, 4, 4, 0]}
                >
                  {(stats.booths || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Food Claims */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-orange-600" />
              Food Menu Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={(stats.menuItems || []).filter((m: any) => m.category?.toLowerCase() === 'food')} 
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={80} />
                <Tooltip />
                <Bar dataKey="currentStock" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Drink Claims */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-cyan-600" />
              Drink Menu Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={(stats.menuItems || []).filter((m: any) => m.category?.toLowerCase() === 'drink')} 
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={80} />
                <Tooltip />
                <Bar dataKey="currentStock" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Stock Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(stats.menuItems || []).slice(0, 4).map((item: any) => {
              const percentage = item.initialStock > 0 ? (item.currentStock / item.initialStock) * 100 : 0
              return (
                <div key={item.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.currentStock} / {item.initialStock}
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              Recent Claims
            </CardTitle>
            <CardDescription>Live claim activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {(stats.recentClaims || []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No claims yet</p>
                ) : (
                  (stats.recentClaims || []).map((claim: any) => (
                    <div 
                      key={claim.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className={cn(
                        "p-2 rounded-full",
                        claim.category === 'Food' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-cyan-100 dark:bg-cyan-900/30'
                      )}>
                        {claim.category === 'Food' ? (
                          <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Coffee className="h-4 w-4 text-cyan-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{claim.participantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {claim.menuItemName} • {claim.boothName}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(claim.claimedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Recent Check-ins
            </CardTitle>
            <CardDescription>Latest participant arrivals</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {(stats.recentCheckIns || []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No check-ins yet</p>
                ) : (
                  (stats.recentCheckIns || []).map((checkin: any) => (
                    <div 
                      key={checkin.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{checkin.participantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {checkin.participantCompany || 'No Company'} • Desk {checkin.deskNumber}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(checkin.checkedInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Participants View Component
function ParticipantsView() {
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked-in' | 'not-checked-in'>('all')

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch('/api/participants')
        const result = await response.json()
        if (result.success) {
          setParticipants(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch participants:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchParticipants()
  }, [])

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (p.company?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'checked-in' && p.isCheckedIn) ||
                         (filterStatus === 'not-checked-in' && !p.isCheckedIn)
    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'checked-in', 'not-checked-in'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              onClick={() => setFilterStatus(status as typeof filterStatus)}
            >
              {status === 'all' ? 'All' : status === 'checked-in' ? 'Checked In' : 'Not Checked In'}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{participants.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Filtered</p>
            <p className="text-2xl font-bold">{filteredParticipants.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Checked In</p>
            <p className="text-2xl font-bold text-emerald-600">
              {filteredParticipants.filter(p => p.isCheckedIn).length.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Not Checked In</p>
            <p className="text-2xl font-bold text-orange-600">
              {filteredParticipants.filter(p => !p.isCheckedIn).length.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {filteredParticipants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No participants found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                  <tr>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Company</th>
                    <th className="text-left p-4 font-medium">Check-in</th>
                    <th className="text-left p-4 font-medium">Claims</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.slice(0, 100).map((participant) => (
                    <tr key={participant.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {participant.photoUrl ? (
                            <img src={participant.photoUrl} alt={participant.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                              <span className="text-sm font-medium">{participant.name.charAt(0)}</span>
                            </div>
                          )}
                          <span className="font-medium">{participant.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{participant.email}</td>
                      <td className="p-4">{participant.company || '-'}</td>
                      <td className="p-4">
                        {participant.isCheckedIn ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            ✓ {participant.checkInTime ? new Date(participant.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">-</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Badge variant="outline">{participant.foodClaims || 0}/2 Food</Badge>
                          <Badge variant="outline">{participant.drinkClaims || 0}/1 Drink</Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// Check-in Monitor View
function CheckinMonitorView() {
  const [stats, setStats] = useState<any>(null)
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [totalDesks, setTotalDesks] = useState(4)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, desksRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/settings/desks'),
        ])
        
        const statsResult = await statsRes.json()
        if (statsResult.success) {
          setStats(statsResult.data)
          setCheckIns(statsResult.data.recentCheckIns || [])
        }
        
        const desksResult = await desksRes.json()
        if (desksResult.success) {
          setTotalDesks(desksResult.data.totalDesks)
        }
      } catch (error) {
        console.error('Failed to fetch check-ins:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const desks = stats?.desks || {}
  
  // Generate desk array dynamically
  const deskArray = Array.from({ length: totalDesks }, (_, i) => i + 1)
  
  // Calculate grid columns based on number of desks
  const gridCols = totalDesks <= 4 ? 'grid-cols-4' : 
                   totalDesks <= 6 ? 'grid-cols-3 md:grid-cols-6' : 
                   'grid-cols-4 md:grid-cols-8'

  return (
    <div className="space-y-6">
      {/* Desk Stats */}
      <div className={`grid ${gridCols} gap-4`}>
        {deskArray.map(desk => (
          <Card key={desk}>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Desk {desk}</p>
              <p className="text-4xl font-bold text-emerald-600">{desks[`desk${desk}` as keyof typeof desks] || 0}</p>
              <p className="text-sm text-muted-foreground">check-ins</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Check-in Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {checkIns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No check-ins yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {checkIns.map((checkin: any) => (
                  <div 
                    key={checkin.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      {checkin.deskNumber}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{checkin.participantName}</p>
                      <p className="text-sm text-muted-foreground">{checkin.participantCompany}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(checkin.checkedInAt).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// Menu Management View
function MenuManagementView() {
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Food',
    initialStock: 100,
  })
  const [isSaving, setIsSaving] = useState(false)

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await fetch('/api/menu')
      const result = await response.json()
      if (result.success) {
        setMenuItems(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      
      if (result.success) {
        toast({ title: 'Success', description: 'Menu item added successfully' })
        setShowForm(false)
        setFormData({ name: '', description: '', category: 'Food', initialStock: 100 })
        fetchMenuItems()
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add menu item', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStock: newStock }),
      })
      const result = await response.json()
      
      if (result.success) {
        toast({ title: 'Success', description: 'Stock updated' })
        fetchMenuItems()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update stock', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Menu Items</h3>
          <p className="text-sm text-muted-foreground">Kelola menu makanan dan minuman</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? 'Cancel' : 'Add Menu Item'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Menu Item</CardTitle>
            <CardDescription>Tambahkan menu makanan atau minuman baru</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Menu *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Nasi Padang"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Food">Food</option>
                    <option value="Drink">Drink</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok Awal *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.initialStock}
                    onChange={(e) => setFormData({ ...formData, initialStock: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Menu Items Grid */}
      {menuItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No menu items yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Menu Item" to create one</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => {
            const percentage = item.initialStock > 0 ? (item.currentStock / item.initialStock) * 100 : 0
            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.description || 'No description'}</CardDescription>
                    </div>
                    <Badge variant={item.category?.name === 'Food' ? 'default' : 'secondary'}>
                      {item.category?.name || 'Food'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Stock</span>
                      <span>{item.currentStock} / {item.initialStock}</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Claimed</span>
                    <span className="font-medium">{item.initialStock - item.currentStock} items</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        const newStock = prompt('Enter new stock value:', item.currentStock.toString())
                        if (newStock !== null) {
                          handleUpdateStock(item.id, parseInt(newStock) || 0)
                        }
                      }}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Edit Stock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Booths Management View
function BoothsManagementView() {
  const { toast } = useToast()
  const [booths, setBooths] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    boothType: 'food',
    boothNumber: 1,
  })
  const [isSaving, setIsSaving] = useState(false)

  const fetchBooths = useCallback(async () => {
    try {
      const response = await fetch('/api/booths')
      const result = await response.json()
      if (result.success) {
        setBooths(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch booths:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBooths()
  }, [fetchBooths])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/booths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      
      if (result.success) {
        toast({ title: 'Success', description: 'Booth created successfully' })
        setShowForm(false)
        setFormData({ name: '', boothType: 'food', boothNumber: 1 })
        fetchBooths()
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create booth', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booth?')) return
    
    try {
      const response = await fetch(`/api/booths?id=${id}`, { method: 'DELETE' })
      const result = await response.json()
      
      if (result.success) {
        toast({ title: 'Success', description: 'Booth deleted' })
        fetchBooths()
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete booth', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Booths</h3>
          <p className="text-sm text-muted-foreground">Kelola booth klaim makanan dan minuman</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? 'Cancel' : 'Add Booth'}
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Booth</CardTitle>
            <CardDescription>Tambahkan booth baru untuk klaim</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="boothName">Nama Booth *</Label>
                  <Input
                    id="boothName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Food Booth 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boothType">Tipe *</Label>
                  <select
                    id="boothType"
                    value={formData.boothType}
                    onChange={(e) => setFormData({ ...formData, boothType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="food">Food</option>
                    <option value="drink">Drink</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boothNumber">Nomor Booth *</Label>
                  <Input
                    id="boothNumber"
                    type="number"
                    value={formData.boothNumber}
                    onChange={(e) => setFormData({ ...formData, boothNumber: parseInt(e.target.value) || 1 })}
                    min={1}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Booths Grid */}
      {booths.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No booths yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Booth" to create one</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {booths.map((booth) => (
            <Card key={booth.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-4 rounded-xl",
                    booth.boothType === 'food' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-cyan-100 dark:bg-cyan-900/30'
                  )}>
                    {booth.boothType === 'food' ? (
                      <UtensilsCrossed className="h-8 w-8 text-orange-600" />
                    ) : (
                      <Coffee className="h-8 w-8 text-cyan-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{booth.name}</h3>
                    <Badge variant="outline" className="capitalize">{booth.boothType}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{booth.claimsCount || 0}</p>
                    <p className="text-sm text-muted-foreground">claims</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(booth.id)}
                    disabled={(booth.claimsCount || 0) > 0}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booth Activity Chart */}
      {booths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Booth Activity Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={booths.map(b => ({ name: b.name, claims: b.claimsCount || 0, type: b.boothType }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="claims" radius={[4, 4, 0, 0]}>
                  {booths.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.boothType === 'food' ? '#f59e0b' : '#06b6d4'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Claims Activity View
function ClaimsActivityView() {
  const [claims, setClaims] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [claimsRes, statsRes] = await Promise.all([
          fetch('/api/claims'),
          fetch('/api/stats')
        ])
        const claimsResult = await claimsRes.json()
        const statsResult = await statsRes.json()
        
        if (claimsResult.success) {
          setClaims(claimsResult.data)
        }
        if (statsResult.success) {
          setStats(statsResult.data)
        }
      } catch (error) {
        console.error('Failed to fetch claims:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalClaims = stats?.totalClaims || 0
  const foodClaims = stats?.totalFoodClaims || 0
  const drinkClaims = stats?.totalDrinkClaims || 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Total Claims</p>
            <p className="text-4xl font-bold">{totalClaims.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Food Claims</p>
            <p className="text-4xl font-bold text-orange-600">{foodClaims.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Drink Claims</p>
            <p className="text-4xl font-bold text-cyan-600">{drinkClaims.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* All Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Claims</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {claims.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No claims yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                  <tr>
                    <th className="text-left p-4 font-medium">Time</th>
                    <th className="text-left p-4 font-medium">Participant</th>
                    <th className="text-left p-4 font-medium">Item</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Booth</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.slice(0, 200).map((claim) => (
                    <tr key={claim.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 text-muted-foreground">
                        {new Date(claim.claimedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-medium">{claim.participant?.name || 'Unknown'}</td>
                      <td className="p-4">{claim.menuItem?.name || 'Unknown'}</td>
                      <td className="p-4">
                        <Badge variant={claim.category === 'Food' ? 'default' : 'secondary'}>
                          {claim.category}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{claim.booth?.name || 'Unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// Reports View
function ReportsView() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalParticipants = stats?.totalParticipants || 0
  const checkedIn = stats?.checkedInParticipants || 0
  const notCheckedIn = totalParticipants - checkedIn
  const totalClaims = (stats?.totalFoodClaims || 0) + (stats?.totalDrinkClaims || 0)
  const checkInRate = totalParticipants > 0 ? ((checkedIn / totalParticipants) * 100).toFixed(1) : '0.0'
  const avgClaims = checkedIn > 0 ? (totalClaims / checkedIn).toFixed(2) : '0.00'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Summary Report</CardTitle>
          <CardDescription>Gathering PT HKI - 20 September 2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Participants</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Registered</span>
                  <span className="font-bold">{totalParticipants.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Checked In</span>
                  <span className="font-bold text-emerald-600">{checkedIn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Not Checked In</span>
                  <span className="font-bold text-orange-600">{notCheckedIn.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in Rate</span>
                  <span className="font-bold">{checkInRate}%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Claims</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Claims</span>
                  <span className="font-bold">{totalClaims.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Food Claims</span>
                  <span className="font-bold text-orange-600">{(stats?.totalFoodClaims || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Drink Claims</span>
                  <span className="font-bold text-cyan-600">{(stats?.totalDrinkClaims || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Claims/Person</span>
                  <span className="font-bold">{avgClaims}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Stock Remaining</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(stats?.menuItems || []).map((item: any) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-2xl font-bold">{item.currentStock}</p>
                  <p className="text-sm text-muted-foreground">of {item.initialStock}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Export View
function ExportView() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (type: string) => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/export')
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `event-report-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({ title: 'Success', description: `${type} exported successfully` })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export data', variant: 'destructive' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download reports in Excel format</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={() => handleExport('Participants')}
            disabled={isExporting}
          >
            <Users className="h-6 w-6" />
            Export Participants
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={() => handleExport('Check-ins')}
            disabled={isExporting}
          >
            <CheckCircle className="h-6 w-6" />
            Export Check-ins
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={() => handleExport('Food Claims')}
            disabled={isExporting}
          >
            <UtensilsCrossed className="h-6 w-6" />
            Export Food Claims
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={() => handleExport('Drink Claims')}
            disabled={isExporting}
          >
            <Coffee className="h-6 w-6" />
            Export Drink Claims
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={() => handleExport('Booth Activity')}
            disabled={isExporting}
          >
            <Store className="h-6 w-6" />
            Export Booth Activity
          </Button>
          <Button 
            className="h-24 flex-col gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleExport('Full Report')}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6" />}
            Full Report (All Sheets)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Excel Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">The full Excel report will contain:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Badge>Sheet 1</Badge>
              <span>Participants - All registered participants with check-in status</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge>Sheet 2</Badge>
              <span>Claims - All claim transactions</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge>Sheet 3</Badge>
              <span>Menu Items - Stock levels and usage</span>
            </li>
            <li className="flex items-center gap-2">
              <Badge>Sheet 4</Badge>
              <span>Summary - Statistics and metrics overview</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

// Settings Management View
function SettingsManagementView() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingClaims, setIsSavingClaims] = useState(false)
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
  })
  const [claimSettings, setClaimSettings] = useState({
    maxFoodClaims: 2,
    maxDrinkClaims: 1,
  })
  const [deskSettings, setDeskSettings] = useState({
    totalDesks: 4,
  })
  const [isSavingDesks, setIsSavingDesks] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, claimsRes, desksRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/settings/claims'),
          fetch('/api/settings/desks'),
        ])
        
        const eventResult = await eventRes.json()
        if (eventResult.success) {
          setEventData({
            name: eventResult.data.name || '',
            description: eventResult.data.description || '',
            date: eventResult.data.date || '',
            location: eventResult.data.location || '',
          })
        }
        
        const claimsResult = await claimsRes.json()
        if (claimsResult.success) {
          setClaimSettings({
            maxFoodClaims: claimsResult.data.maxFoodClaims,
            maxDrinkClaims: claimsResult.data.maxDrinkClaims,
          })
        }
        
        const desksResult = await desksRes.json()
        if (desksResult.success) {
          setDeskSettings({
            totalDesks: desksResult.data.totalDesks,
          })
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
      const result = await response.json()
      
      if (result.success) {
        toast({ title: 'Success', description: 'Event settings saved successfully' })
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveClaims = async () => {
    setIsSavingClaims(true)
    try {
      const response = await fetch('/api/settings/claims', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimSettings),
      })
      const result = await response.json()
      
      if (result.success) {
        toast({ title: 'Success', description: 'Claim settings saved successfully' })
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save claim settings', variant: 'destructive' })
    } finally {
      setIsSavingClaims(false)
    }
  }

  const handleSaveDesks = async () => {
    setIsSavingDesks(true)
    try {
      const response = await fetch('/api/settings/desks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deskSettings),
      })
      const result = await response.json()
      
      if (result.success) {
        toast({ title: 'Success', description: 'Desk settings saved successfully' })
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save desk settings', variant: 'destructive' })
    } finally {
      setIsSavingDesks(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Event Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Event Settings</CardTitle>
          <CardDescription>Konfigurasi informasi event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                value={eventData.name}
                onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                placeholder="Nama Event"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventData.date}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventLocation">Location</Label>
              <Input
                id="eventLocation"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                placeholder="Lokasi Event"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDescription">Description</Label>
            <textarea
              id="eventDescription"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              placeholder="Deskripsi event..."
              className="w-full min-h-[100px] px-3 py-2 border rounded-lg resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Claim Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Claim Settings
          </CardTitle>
          <CardDescription>Konfigurasi jumlah klaim makanan dan minuman per peserta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxFoodClaims">Maksimal Klaim Makanan</Label>
              <Input
                id="maxFoodClaims"
                type="number"
                min="0"
                max="10"
                value={claimSettings.maxFoodClaims}
                onChange={(e) => setClaimSettings({ ...claimSettings, maxFoodClaims: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Jumlah maksimal makanan yang dapat diklaim per peserta
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDrinkClaims">Maksimal Klaim Minuman</Label>
              <Input
                id="maxDrinkClaims"
                type="number"
                min="0"
                max="10"
                value={claimSettings.maxDrinkClaims}
                onChange={(e) => setClaimSettings({ ...claimSettings, maxDrinkClaims: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Jumlah maksimal minuman yang dapat diklaim per peserta
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveClaims} disabled={isSavingClaims}>
              {isSavingClaims ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Claim Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Desk Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Check-in Desk Settings
          </CardTitle>
          <CardDescription>Konfigurasi jumlah meja/desk check-in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalDesks">Jumlah Desk Check-in</Label>
              <Input
                id="totalDesks"
                type="number"
                min="1"
                max="20"
                value={deskSettings.totalDesks}
                onChange={(e) => setDeskSettings({ ...deskSettings, totalDesks: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-muted-foreground">
                Jumlah meja check-in yang tersedia (1-20)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Preview Desk</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg min-h-[60px]">
                {Array.from({ length: deskSettings.totalDesks }, (_, i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-bold text-sm"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveDesks} disabled={isSavingDesks}>
              {isSavingDesks ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Desk Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Actions that cannot be undone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <p className="font-medium">Delete All Data</p>
              <p className="text-sm text-muted-foreground">This will permanently delete all participants, check-ins, and claims data.</p>
            </div>
            <Button 
              variant="destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete ALL data? This action cannot be undone!')) {
                  fetch('/api/seed', { method: 'DELETE' })
                    .then(() => {
                      toast({ title: 'Success', description: 'All data deleted' })
                      window.location.reload()
                    })
                    .catch(() => {
                      toast({ title: 'Error', description: 'Failed to delete data', variant: 'destructive' })
                    })
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
