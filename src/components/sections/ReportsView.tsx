'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  CheckCircle, 
  UtensilsCrossed, 
  Coffee, 
  Store, 
  TrendingUp,
  Download,
  FileText,
  Calendar,
  Clock,
  Building,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
  RefreshCw,
  Printer,
  ChevronDown,
  FileSpreadsheet,
  ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
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
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { useToast } from '@/hooks/use-toast'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

interface ReportData {
  // Basic Stats
  totalParticipants: number
  checkedInParticipants: number
  notCheckedIn: number
  checkInRate: number
  
  // Claims
  totalFoodClaims: number
  totalDrinkClaims: number
  totalClaims: number
  
  // Desk breakdown
  desks: Record<string, number>
  totalDesks: number
  
  // Booth breakdown
  booths: Array<{
    id: string
    name: string
    boothType: string
    totalClaims: number
  }>
  
  // Menu items
  menuItems: Array<{
    id: string
    name: string
    category: string
    currentStock: number
    initialStock: number
    totalClaims: number
  }>
  
  // Recent activity
  recentCheckIns: Array<{
    id: string
    participantName: string
    participantCompany: string | null
    deskNumber: number
    checkedInAt: string
  }>
  recentClaims: Array<{
    id: string
    participantName: string
    menuItemName: string
    category: string
    boothName: string
    claimedAt: string
  }>
  
  // Company breakdown
  companies: Array<{
    name: string
    total: number
    checkedIn: number
  }>
  
  // Hourly activity
  hourlyCheckIns: Array<{
    hour: string
    count: number
  }>
  hourlyClaims: Array<{
    hour: string
    food: number
    drink: number
  }>
  
  // Scan logs summary
  scanLogsSummary: {
    totalScans: number
    successful: number
    failed: number
    duplicate: number
    limitReached: number
  }
}

export default function ReportsView() {
  const [data, setData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reports')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error)
      toast({ title: 'Error', description: 'Failed to load report data', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/export')
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `event-report-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({ title: 'Success', description: 'Excel report downloaded' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export Excel', variant: 'destructive' })
    }
  }

  const handleExportPDF = async (type: string = 'full') => {
    try {
      const response = await fetch(`/api/export/pdf?type=${type}`)
      if (!response.ok) throw new Error('PDF export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `event-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({ title: 'Success', description: 'PDF report downloaded' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export PDF', variant: 'destructive' })
    }
  }

  const handleExportAttendance = async () => {
    try {
      const response = await fetch('/api/export/pdf/attendance')
      if (!response.ok) throw new Error('Attendance PDF export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance-sheet-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({ title: 'Success', description: 'Attendance sheet downloaded' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export attendance PDF', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Failed to load report data</p>
          <Button onClick={fetchData} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Event Reports</h2>
          <p className="text-muted-foreground">Comprehensive analytics for Gathering PT HKI</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                Full Report (Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportPDF('full')}>
                <FileText className="h-4 w-4 mr-2" />
                Full Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExportPDF('participants')}>
                <Users className="h-4 w-4 mr-2" />
                Participants List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportPDF('checkins')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check-in Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportPDF('claims')}>
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Claims Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportAttendance}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Attendance Sheet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-6">
                <p className="text-blue-100 text-sm">Total Peserta</p>
                <p className="text-3xl font-bold">{data.totalParticipants.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="pt-6">
                <p className="text-emerald-100 text-sm">Hadir</p>
                <p className="text-3xl font-bold">{data.checkedInParticipants.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="pt-6">
                <p className="text-orange-100 text-sm">Tidak Hadir</p>
                <p className="text-3xl font-bold">{data.notCheckedIn.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <p className="text-purple-100 text-sm">Food Claims</p>
                <p className="text-3xl font-bold">{data.totalFoodClaims.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
              <CardContent className="pt-6">
                <p className="text-cyan-100 text-sm">Drink Claims</p>
                <p className="text-3xl font-bold">{data.totalDrinkClaims.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <CardContent className="pt-6">
                <p className="text-pink-100 text-sm">Check-in Rate</p>
                <p className="text-3xl font-bold">{data.checkInRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Check-in Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Check-in Timeline
                </CardTitle>
                <CardDescription>Jumlah check-in per jam</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.hourlyCheckIns}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#10b981" 
                      fill="#10b98133"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Claims Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-600" />
                  Claims Distribution
                </CardTitle>
                <CardDescription>Food vs Drink claims</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Food Claims', value: data.totalFoodClaims, color: '#f59e0b' },
                        { name: 'Drink Claims', value: data.totalDrinkClaims, color: '#06b6d4' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Company Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Attendance by Company
              </CardTitle>
              <CardDescription>Top companies by attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.companies.slice(0, 9).map((company, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium truncate flex-1">{company.name || 'No Company'}</p>
                      <Badge variant="outline">{company.checkedIn}/{company.total}</Badge>
                    </div>
                    <Progress 
                      value={company.total > 0 ? (company.checkedIn / company.total) * 100 : 0} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {company.total > 0 ? ((company.checkedIn / company.total) * 100).toFixed(0) : 0}% hadir
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Check-in Tab */}
        <TabsContent value="checkin" className="space-y-6">
          {/* Desk Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Check-in Desk Performance
              </CardTitle>
              <CardDescription>Jumlah check-in per desk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                {Object.entries(data.desks).map(([desk, count]) => (
                  <div key={desk} className="text-center p-4 border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                    <p className="text-sm text-muted-foreground">{desk.replace('desk', 'Desk ')}</p>
                    <p className="text-3xl font-bold text-emerald-600">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.checkedInParticipants > 0 
                        ? ((count / data.checkedInParticipants) * 100).toFixed(1) 
                        : 0}% dari total
                    </p>
                  </div>
                ))}
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={Object.entries(data.desks).map(([desk, count]) => ({
                    desk: desk.replace('desk', 'Desk '),
                    checkins: count
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="desk" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Bar dataKey="checkins" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Check-ins */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
              <CardDescription>Last 20 check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Name</th>
                      <th className="text-left py-2 px-3 font-medium">Company</th>
                      <th className="text-left py-2 px-3 font-medium">Desk</th>
                      <th className="text-left py-2 px-3 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentCheckIns.map((checkin) => (
                      <tr key={checkin.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-medium">{checkin.participantName}</td>
                        <td className="py-2 px-3 text-muted-foreground">{checkin.participantCompany || '-'}</td>
                        <td className="py-2 px-3">
                          <Badge variant="outline">Desk {checkin.deskNumber}</Badge>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {new Date(checkin.checkedInAt).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-6">
          {/* Booth Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-purple-600" />
                Booth Performance
              </CardTitle>
              <CardDescription>Total claims per booth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {data.booths.map((booth) => (
                  <div key={booth.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{booth.name}</p>
                      <Badge variant={booth.boothType === 'food' ? 'default' : 'secondary'}>
                        {booth.boothType}
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold">{booth.totalClaims}</p>
                    <p className="text-sm text-muted-foreground">total claims</p>
                  </div>
                ))}
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.booths} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={120} />
                  <Tooltip />
                  <Bar dataKey="totalClaims" radius={[0, 4, 4, 0]}>
                    {data.booths.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Claims Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                Claims Timeline
              </CardTitle>
              <CardDescription>Food and drink claims per jam</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.hourlyClaims}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="food" stackId="1" stroke="#f59e0b" fill="#f59e0b33" name="Food" />
                  <Area type="monotone" dataKey="drink" stackId="1" stroke="#06b6d4" fill="#06b6d433" name="Drink" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Claims Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <CardDescription>Last 20 claims</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Participant</th>
                      <th className="text-left py-2 px-3 font-medium">Item</th>
                      <th className="text-left py-2 px-3 font-medium">Category</th>
                      <th className="text-left py-2 px-3 font-medium">Booth</th>
                      <th className="text-left py-2 px-3 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentClaims.map((claim) => (
                      <tr key={claim.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-medium">{claim.participantName}</td>
                        <td className="py-2 px-3">{claim.menuItemName}</td>
                        <td className="py-2 px-3">
                          <Badge variant={claim.category === 'Food' ? 'default' : 'secondary'}>
                            {claim.category}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{claim.boothName}</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {new Date(claim.claimedAt).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Stock Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Stock Status
              </CardTitle>
              <CardDescription>Current stock levels for all items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Food Items */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                    Food Items
                  </h4>
                  <div className="space-y-4">
                    {data.menuItems.filter(m => m.category?.toLowerCase() === 'food').map((item) => {
                      const percentage = item.initialStock > 0 ? (item.currentStock / item.initialStock) * 100 : 0
                      const claimed = item.initialStock - item.currentStock
                      return (
                        <div key={item.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{item.name}</span>
                            <span className={cn(
                              "text-sm font-bold",
                              percentage < 20 ? "text-red-600" : percentage < 50 ? "text-orange-600" : "text-emerald-600"
                            )}>
                              {item.currentStock}/{item.initialStock}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {claimed} claimed ({(100 - percentage).toFixed(0)}% used)
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Drink Items */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-cyan-600" />
                    Drink Items
                  </h4>
                  <div className="space-y-4">
                    {data.menuItems.filter(m => m.category?.toLowerCase() === 'drink').map((item) => {
                      const percentage = item.initialStock > 0 ? (item.currentStock / item.initialStock) * 100 : 0
                      const claimed = item.initialStock - item.currentStock
                      return (
                        <div key={item.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{item.name}</span>
                            <span className={cn(
                              "text-sm font-bold",
                              percentage < 20 ? "text-red-600" : percentage < 50 ? "text-orange-600" : "text-emerald-600"
                            )}>
                              {item.currentStock}/{item.initialStock}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {claimed} claimed ({(100 - percentage).toFixed(0)}% used)
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Visualization</CardTitle>
              <CardDescription>Remaining vs Claimed for each item</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.menuItems}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="currentStock" stackId="a" fill="#10b981" name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-6">
          {/* Scan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Scan Activity Summary
              </CardTitle>
              <CardDescription>Overview of all scan activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="text-3xl font-bold">{data.scanLogsSummary.totalScans}</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-3xl font-bold text-emerald-600">{data.scanLogsSummary.successful}</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-3xl font-bold text-red-600">{data.scanLogsSummary.failed}</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <p className="text-sm text-muted-foreground">Duplicate</p>
                  <p className="text-3xl font-bold text-orange-600">{data.scanLogsSummary.duplicate}</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-sm text-muted-foreground">Limit Reached</p>
                  <p className="text-3xl font-bold text-purple-600">{data.scanLogsSummary.limitReached}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scan Results Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Results Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Successful', value: data.scanLogsSummary.successful, color: '#10b981' },
                      { name: 'Failed', value: data.scanLogsSummary.failed, color: '#ef4444' },
                      { name: 'Duplicate', value: data.scanLogsSummary.duplicate, color: '#f59e0b' },
                      { name: 'Limit Reached', value: data.scanLogsSummary.limitReached, color: '#8b5cf6' },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Report Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm"><strong>Check-in Process:</strong> Peserta melakukan scan QR code di meja registrasi (Desk 1-4). Sistem mencatat waktu dan desk check-in.</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm"><strong>Claim Process:</strong> Setelah check-in, peserta dapat mengklaim makanan (maksimal 2x) dan minuman (maksimal 1x) di booth yang tersedia.</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm"><strong>Scan Results:</strong> 
                  <br/>- <strong>Successful:</strong> Scan berhasil
                  <br/>- <strong>Failed:</strong> QR tidak valid/tidak ditemukan
                  <br/>- <strong>Duplicate:</strong> Sudah pernah scan/check-in
                  <br/>- <strong>Limit Reached:</strong> Klaim sudah mencapai batas maksimal
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
