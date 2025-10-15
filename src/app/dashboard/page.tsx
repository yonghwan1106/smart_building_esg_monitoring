import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get all buildings
  const { data: buildings } = await supabase.from('buildings').select('*').order('name')

  if (!buildings || buildings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>빌딩 데이터가 없습니다. 관리자에게 문의하세요.</p>
      </div>
    )
  }

  // Get default building (user's assigned building or first one)
  let selectedBuildingId = profile?.building_id || buildings[0].id

  // Get all sensors for all buildings
  const { data: allSensors } = await supabase.from('sensors').select('*')

  // Get all alerts for all sensors
  const { data: allAlerts } = await supabase
    .from('alerts')
    .select(`
      *,
      sensors (
        name,
        location_detail,
        building_id
      )
    `)
    .order('triggered_at', { ascending: false })
    .limit(50)

  return (
    <DashboardClient
      user={user}
      profile={profile}
      buildings={buildings}
      initialBuildingId={selectedBuildingId}
      allSensors={allSensors || []}
      initialAlerts={allAlerts || []}
    />
  )
}
