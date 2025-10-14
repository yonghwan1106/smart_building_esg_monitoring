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

  // Get building data
  const { data: buildings } = await supabase
    .from('buildings')
    .select('*')
    .limit(1)

  const building = buildings?.[0]

  if (!building) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>빌딩 데이터가 없습니다. 관리자에게 문의하세요.</p>
      </div>
    )
  }

  // Get sensors for the building
  const { data: sensors } = await supabase
    .from('sensors')
    .select('*')
    .eq('building_id', building.id)

  // Get recent alerts
  const { data: alerts } = await supabase
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
      sensors?.map((s) => s.id) || []
    )
    .order('triggered_at', { ascending: false })
    .limit(10)

  return (
    <DashboardClient
      user={user}
      profile={profile}
      building={building}
      sensors={sensors || []}
      initialAlerts={alerts || []}
    />
  )
}
