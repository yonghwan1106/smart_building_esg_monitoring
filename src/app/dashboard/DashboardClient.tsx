'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NaverMap from '@/components/NaverMap'
import AlertsFeed from '@/components/AlertsFeed'
import SensorStats from '@/components/SensorStats'
import AIAnalysisReport from '@/components/AIAnalysisReport'

type Profile = Database['public']['Tables']['profiles']['Row']
type Building = Database['public']['Tables']['buildings']['Row']
type Sensor = Database['public']['Tables']['sensors']['Row']
type Alert = Database['public']['Tables']['alerts']['Row'] & {
  sensors: { name: string; location_detail: string | null } | null
}

interface DashboardClientProps {
  user: User
  profile: Profile | null
  building: Building
  sensors: Sensor[]
  initialAlerts: Alert[]
}

export default function DashboardClient({
  user,
  profile,
  building,
  sensors,
  initialAlerts,
}: DashboardClientProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const router = useRouter()
  const supabase = createClient()

  // Subscribe to real-time alerts
  useEffect(() => {
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        async (payload) => {
          console.log('Alert change:', payload)

          // Fetch updated alerts
          const { data: newAlerts } = await supabase
            .from('alerts')
            .select(`
              *,
              sensors (
                name,
                location_detail
              )
            `)
            .in(
              'sensor_id',
              sensors.map((s) => s.id)
            )
            .order('triggered_at', { ascending: false })
            .limit(10)

          if (newAlerts) {
            setAlerts(newAlerts as Alert[])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sensors, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Get energy sensors
  const energySensors = sensors.filter((s) => s.type === 'ENERGY')
  const envSensors = sensors.filter((s) => ['TEMP', 'HUMIDITY', 'CO2'].includes(s.type))
  const facilitySensors = sensors.filter((s) =>
    ['DOOR_STATUS', 'ELEVATOR_STATUS', 'CHARGER_STATUS'].includes(s.type)
  )

  // Count alerts by severity
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'NEW')
  const warningAlerts = alerts.filter((a) => a.severity === 'WARNING' && a.status === 'NEW')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BEMO Platform</h1>
              <p className="text-sm text-gray-600">Building ESG Monitoring Officer</p>
              <p className="text-xs text-indigo-600 font-medium mt-1">
                🏆 2025 중증장애인 고용확대 아이디어 공모전 출품작
              </p>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md"
                >
                  대시보드
                </Link>
                <Link
                  href="/tickets"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  작업 지시서
                </Link>
              </nav>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500">
                  {profile?.role === 'AGENT'
                    ? '모니터링 요원'
                    : profile?.role === 'MANAGER'
                    ? '현장 관리자'
                    : '관리자'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Building Info & Map */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">담당 빌딩</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{building.name}</h3>
                <p className="text-gray-600 mt-1">{building.address}</p>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">긴급 알림</p>
                    <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">경고 알림</p>
                    <p className="text-2xl font-bold text-yellow-600">{warningAlerts.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">센서</p>
                    <p className="text-2xl font-bold text-green-600">{sensors.length}</p>
                  </div>
                </div>
              </div>
              <div className="h-64 rounded-lg overflow-hidden">
                <NaverMap building={building} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Report */}
        <div className="mb-8">
          <AIAnalysisReport buildingId={building.id} buildingName={building.name} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sensor Stats */}
          <div className="lg:col-span-2 space-y-6">
            <SensorStats
              title="환경 (Environment)"
              sensors={energySensors}
              buildingId={building.id}
            />
            <SensorStats
              title="환경 품질 (Environment Quality)"
              sensors={envSensors}
              buildingId={building.id}
            />
            <SensorStats
              title="사회 (Social) - 편의시설"
              sensors={facilitySensors}
              buildingId={building.id}
            />
          </div>

          {/* Right Column - Alerts Feed */}
          <div className="lg:col-span-1">
            <AlertsFeed
              alerts={alerts}
              onRefresh={() => router.refresh()}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
