import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TicketsClient from './TicketsClient'

export default async function TicketsPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('[TICKETS] User:', user?.id)

  if (!user) {
    console.log('[TICKETS] No user, redirecting to login')
    redirect('/login')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log('[TICKETS] Profile:', profile?.id, 'building_id:', profile?.building_id)
  console.log('[TICKETS] Profile error:', profileError)

  if (!profile) {
    console.log('[TICKETS] No profile, redirecting to login')
    redirect('/login')
  }

  // Get building for this user
  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', profile.building_id)
    .single()

  console.log('[TICKETS] Building:', building?.id, building?.name)
  console.log('[TICKETS] Building error:', buildingError)

  if (!building) {
    console.log('[TICKETS] No building found')
    return <div>빌딩 정보를 찾을 수 없습니다.</div>
  }

  // Get sensors for this building
  const { data: sensors, error: sensorsError } = await supabase
    .from('sensors')
    .select('id')
    .eq('building_id', building.id)

  console.log('[TICKETS] Sensors:', sensors?.length, 'Error:', sensorsError)

  const sensorIds = sensors?.map((s) => s.id) || []

  // Get tickets related to this building's alerts
  let tickets: any[] = []

  if (sensorIds.length > 0) {
    // Get alerts for these sensors
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('id')
      .in('sensor_id', sensorIds)

    console.log('[TICKETS] Alerts:', alerts?.length, 'Error:', alertsError)

    const alertIds = alerts?.map((a) => a.id) || []

    if (alertIds.length > 0) {
      // Get tickets for these alerts
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('issue_tickets')
        .select('*')
        .in('alert_id', alertIds)
        .order('created_at', { ascending: false })
        .limit(50)

      console.log('[TICKETS] Tickets:', ticketsData?.length, 'Error:', ticketsError)

      if (ticketsError) {
        console.error('[TICKETS] Error fetching tickets:', ticketsError)
      }

      tickets = ticketsData || []
    }
  }

  console.log('[TICKETS] Final tickets count:', tickets.length)
  console.log('[TICKETS] Rendering TicketsClient component')

  return (
    <TicketsClient
      user={user}
      profile={profile}
      building={building}
      initialTickets={tickets}
    />
  )
}
