import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TicketsClient from './TicketsClient'

export default async function TicketsPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get building for this user
  const { data: building } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', profile.building_id)
    .single()

  if (!building) {
    return <div>빌딩 정보를 찾을 수 없습니다.</div>
  }

  // Get sensors for this building
  const { data: sensors } = await supabase
    .from('sensors')
    .select('id')
    .eq('building_id', building.id)

  const sensorIds = sensors?.map((s) => s.id) || []

  // Get tickets related to this building's alerts
  let tickets: any[] = []

  if (sensorIds.length > 0) {
    // Get alerts for these sensors
    const { data: alerts } = await supabase
      .from('alerts')
      .select('id')
      .in('sensor_id', sensorIds)

    const alertIds = alerts?.map((a) => a.id) || []

    if (alertIds.length > 0) {
      // Get tickets for these alerts
      const { data: ticketsData } = await supabase
        .from('issue_tickets')
        .select(
          `
          *,
          alerts (
            id,
            title,
            severity,
            sensor_id,
            sensors (
              name,
              location_detail
            )
          ),
          created_by_profile:profiles!issue_tickets_created_by_fkey (
            full_name
          ),
          assigned_to_profile:profiles!issue_tickets_assigned_to_fkey (
            full_name
          )
        `
        )
        .in('alert_id', alertIds)
        .order('created_at', { ascending: false })
        .limit(50)

      tickets = ticketsData || []
    }
  }

  return (
    <TicketsClient
      user={user}
      profile={profile}
      building={building}
      initialTickets={tickets}
    />
  )
}
