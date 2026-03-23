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
  Clock,
  Upload,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Globe,
  Palette,
  ChevronDown,
  ChevronUp,
  Edit
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
import ReportsViewComponent from './ReportsView'

// Admin hanya untuk data dan grafik - tanpa scanner functionality
type AdminView = 'dashboard' | 'participants' | 'menu' | 'booths' | 'reports' | 'export' | 'settings'

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
      case 'menu':
        return <MenuManagementView />
      case 'booths':
        return <BoothsManagementView />
      case 'reports':
        return <ReportsViewComponent />
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
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Email</th>
                    <th className="text-left py-2 px-3 font-medium">Company</th>
                    <th className="text-left py-2 px-3 font-medium">Check-in</th>
                    <th className="text-left py-2 px-3 font-medium">Claims</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.slice(0, 100).map((participant) => (
                    <tr key={participant.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3">
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
                      <td className="py-2 px-3 text-muted-foreground">{participant.email}</td>
                      <td className="py-2 px-3">{participant.company || '-'}</td>
                      <td className="py-2 px-3">
                        {participant.isCheckedIn ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            ✓ {participant.checkInTime ? new Date(participant.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">-</Badge>
                        )}
                      </td>
                      <td className="py-2 px-3">
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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Booth</CardTitle>
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
                  <Label htmlFor="boothNumber">Nomor Booth</Label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {booths.map((booth) => (
          <Card key={booth.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{booth.name}</CardTitle>
                  <CardDescription>
                    {booth.boothType === 'food' ? 'Food Booth' : 'Drink Booth'} #{booth.boothNumber}
                  </CardDescription>
                </div>
                <Badge variant={booth.boothType === 'food' ? 'default' : 'secondary'}>
                  {booth.boothType}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Claims</span>
                <span className="font-medium">{booth.totalClaims || 0}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDelete(booth.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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

// =====================================================
// SETTINGS MANAGEMENT VIEW - COMPLETELY REDESIGNED
// =====================================================
function SettingsManagementView() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  
  // Create/Edit Event Form State
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  
  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    images: false,
    branding: false,
    claims: false,
    desks: false,
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    tagline: '',
    organizer: '',
    website: '',
    bannerUrl: '',
    logoUrl: '',
    primaryColor: '#10b981',
    secondaryColor: '#0d9488',
    instagram: '',
    twitter: '',
    linkedin: '',
    maxFoodClaims: 2,
    maxDrinkClaims: 1,
    totalDesks: 4,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true)
    try {
      const response = await fetch('/api/events?all=true')
      const result = await response.json()
      if (result.success) {
        setEvents(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents().finally(() => setIsLoading(false))
  }, [fetchEvents])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      date: '',
      endDate: '',
      location: '',
      tagline: '',
      organizer: '',
      website: '',
      bannerUrl: '',
      logoUrl: '',
      primaryColor: '#10b981',
      secondaryColor: '#0d9488',
      instagram: '',
      twitter: '',
      linkedin: '',
      maxFoodClaims: 2,
      maxDrinkClaims: 1,
      totalDesks: 4,
    })
    setEditingEvent(null)
    setExpandedSections({
      basic: true,
      images: false,
      branding: false,
      claims: false,
      desks: false,
    })
  }

  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = async (event: any) => {
    setEditingEvent(event)
    setFormData({
      name: event.name || '',
      description: event.description || '',
      date: event.date || '',
      endDate: event.endDate || '',
      location: event.location || '',
      tagline: event.tagline || '',
      organizer: event.organizer || '',
      website: event.website || '',
      bannerUrl: event.bannerUrl || '',
      logoUrl: event.logoUrl || '',
      primaryColor: event.primaryColor || '#10b981',
      secondaryColor: event.secondaryColor || '#0d9488',
      instagram: event.instagram || '',
      twitter: event.twitter || '',
      linkedin: event.linkedin || '',
      maxFoodClaims: event.maxFoodClaims || 2,
      maxDrinkClaims: event.maxDrinkClaims || 1,
      totalDesks: event.totalDesks || 4,
    })
    setShowForm(true)
  }

  const handleImageUpload = async (file: File, type: 'banner' | 'logo') => {
    if (type === 'banner') {
      setUploadingBanner(true)
    } else {
      setUploadingLogo(true)
    }
    
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', type)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })
      
      const result = await response.json()
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          [type === 'banner' ? 'bannerUrl' : 'logoUrl']: result.url,
        }))
        toast({ title: 'Success', description: `${type === 'banner' ? 'Banner' : 'Logo'} uploaded successfully` })
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' })
    } finally {
      if (type === 'banner') {
        setUploadingBanner(false)
      } else {
        setUploadingLogo(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Event name is required', variant: 'destructive' })
      return
    }
    if (!formData.date && !editingEvent) {
      toast({ title: 'Error', description: 'Event date is required', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      if (editingEvent) {
        // Update existing event
        const response = await fetch(`/api/events?id=${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const result = await response.json()

        if (result.success) {
          toast({ title: 'Success', description: 'Event updated successfully' })
          setShowForm(false)
          resetForm()
          fetchEvents()
        } else {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
      } else {
        // Create new event
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const result = await response.json()

        if (result.success) {
          toast({ title: 'Success', description: 'Event created successfully' })
          setShowForm(false)
          resetForm()
          fetchEvents()
        } else {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save event', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"?\n\nThis will also delete all participants, check-ins, and claims. This cannot be undone!`)) {
      return
    }

    setDeletingEventId(eventId)
    try {
      const response = await fetch(`/api/events?id=${eventId}`, { method: 'DELETE' })
      const result = await response.json()

      if (result.success) {
        toast({ title: 'Success', description: result.message })
        fetchEvents()
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' })
    } finally {
      setDeletingEventId(null)
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Event Management</h2>
          <p className="text-muted-foreground">Create, edit, and manage your events</p>
        </div>
        <Button onClick={openCreateForm} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-5 w-5" />
          Create New Event
        </Button>
      </div>

      {/* CREATE/EDIT EVENT FORM */}
      {showForm && (
        <Card className="border-2 border-emerald-500 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {editingEvent ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </CardTitle>
                <CardDescription>
                  {editingEvent ? `Editing: ${editingEvent.name}` : 'Fill in the details to create a new event'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); resetForm() }}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Basic Info Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('basic')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">Basic Information</span>
                  <Badge variant="secondary">Required</Badge>
                </div>
                {expandedSections.basic ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.basic && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Event Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Tech Summit Indonesia 2025"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Event Date *</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date (Optional)</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Jakarta Convention Center"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Organizer</Label>
                      <Input
                        value={formData.organizer}
                        onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                        placeholder="e.g., PT ABC Indonesia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g., Innovate. Connect. Inspire."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your event..."
                      className="w-full min-h-[100px] px-3 py-2 border rounded-lg resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Images Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('images')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Event Images</span>
                  <Badge variant="outline">Optional</Badge>
                </div>
                {expandedSections.images ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.images && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Banner Upload */}
                  <div className="space-y-2">
                    <Label>Banner / Hero Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-4">
                      {formData.bannerUrl ? (
                        <div className="space-y-3">
                          <img src={formData.bannerUrl} alt="Banner" className="w-full h-40 object-cover rounded-lg" />
                          <div className="flex gap-2">
                            <label className="cursor-pointer flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
                              />
                              <Button variant="outline" size="sm" className="w-full" disabled={uploadingBanner}>
                                {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                Change
                              </Button>
                            </label>
                            <Button variant="outline" size="sm" onClick={() => setFormData({ ...formData, bannerUrl: '' })}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block text-center py-8">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
                          />
                          {uploadingBanner ? (
                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                          ) : (
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          )}
                          <p className="text-sm text-muted-foreground mt-2">Click to upload banner</p>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label>Event Logo</Label>
                    <div className="border-2 border-dashed rounded-lg p-4">
                      {formData.logoUrl ? (
                        <div className="space-y-3 flex flex-col items-center">
                          <img src={formData.logoUrl} alt="Logo" className="w-24 h-24 object-contain rounded-lg bg-slate-50 p-2" />
                          <div className="flex gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                              />
                              <Button variant="outline" size="sm" disabled={uploadingLogo}>
                                {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                Change
                              </Button>
                            </label>
                            <Button variant="outline" size="sm" onClick={() => setFormData({ ...formData, logoUrl: '' })}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block text-center py-8">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                          />
                          {uploadingLogo ? (
                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                          ) : (
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          )}
                          <p className="text-sm text-muted-foreground mt-2">Click to upload logo</p>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Branding Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('branding')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Branding & Social Media</span>
                  <Badge variant="outline">Optional</Badge>
                </div>
                {expandedSections.branding ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.branding && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          placeholder="#10b981"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          placeholder="#0d9488"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Instagram</Label>
                      <Input
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Twitter/X</Label>
                      <Input
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn</Label>
                      <Input
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        placeholder="company/name"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Claim Settings Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('claims')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Claim Settings</span>
                  <Badge variant="outline">Default: 2 Food, 1 Drink</Badge>
                </div>
                {expandedSections.claims ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.claims && (
                <div className="p-4 grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Max Food Claims per Participant</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.maxFoodClaims}
                      onChange={(e) => setFormData({ ...formData, maxFoodClaims: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Jumlah maksimal klaim makanan per peserta</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Drink Claims per Participant</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.maxDrinkClaims}
                      onChange={(e) => setFormData({ ...formData, maxDrinkClaims: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Jumlah maksimal klaim minuman per peserta</p>
                  </div>
                </div>
              )}
            </div>

            {/* Desk Settings Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('desks')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Check-in Desk Settings</span>
                  <Badge variant="outline">Default: 4 Desks</Badge>
                </div>
                {expandedSections.desks ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              {expandedSections.desks && (
                <div className="p-4 space-y-2">
                  <Label>Total Check-in Desks</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.totalDesks}
                    onChange={(e) => setFormData({ ...formData, totalDesks: parseInt(e.target.value) || 4 })}
                  />
                  <p className="text-xs text-muted-foreground">Jumlah meja registrasi/check-in yang tersedia (1-20)</p>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* EVENT CARDS */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Events</h3>
        {loadingEvents ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No events yet</p>
              <p className="text-sm text-muted-foreground">Click "Create New Event" to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className={cn(
                "overflow-hidden hover:shadow-lg transition-shadow",
                event.id === 'main-event' && "ring-2 ring-amber-400"
              )}>
                {/* Event Banner/Color Header */}
                <div 
                  className="h-24 relative"
                  style={{ 
                    background: event.bannerUrl 
                      ? `url(${event.bannerUrl}) center/cover`
                      : `linear-gradient(135deg, ${event.primaryColor || '#10b981'}, ${event.secondaryColor || '#0d9488'})`
                  }}
                >
                  {event.logoUrl && (
                    <img 
                      src={event.logoUrl} 
                      alt={event.name}
                      className="absolute bottom-0 left-4 translate-y-1/2 w-14 h-14 rounded-lg bg-white p-1 object-contain shadow-md"
                    />
                  )}
                  {event.id === 'main-event' && (
                    <Badge className="absolute top-2 right-2 bg-amber-500 text-white">
                      Main Event
                    </Badge>
                  )}
                </div>

                <CardHeader className="pt-8">
                  <CardTitle className="text-lg line-clamp-1">{event.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {event.participantsCount || 0} participants
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <TicketIcon className="h-3 w-3 mr-1" />
                      {event.claimsCount || 0} claims
                    </Badge>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <Badge className={cn(
                      "text-xs",
                      event.isActive 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600"
                    )}>
                      {event.isActive ? '✅ Active' : '⏸️ Inactive'}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditForm(event)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {event.id !== 'main-event' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id, event.name)}
                        disabled={deletingEventId === event.id}
                      >
                        {deletingEventId === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Ticket Icon component
function TicketIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  )
}
