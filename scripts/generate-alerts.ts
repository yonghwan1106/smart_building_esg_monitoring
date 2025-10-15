import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Alert templates matching the actual schema
const alertTemplates = {
  ENERGY: [
    {
      severity: 'CRITICAL' as const,
      alert_type: 'THRESHOLD' as const,
      title: '전력 사용량 임계 초과',
      description: '전력 사용량이 안전 임계값(90kW)을 초과했습니다. 즉시 확인이 필요합니다.',
      threshold: 90,
    },
    {
      severity: 'WARNING' as const,
      alert_type: 'THRESHOLD' as const,
      title: '전력 사용량 증가',
      description: '전력 사용량이 평균보다 높습니다(80kW 이상).',
      threshold: 80,
    },
  ],
  TEMP: [
    {
      severity: 'CRITICAL' as const,
      alert_type: 'THRESHOLD' as const,
      title: '온도 이상',
      description: '실내 온도가 안전 범위를 벗어났습니다(28°C 이상 또는 18°C 이하).',
      threshold: 28,
    },
    {
      severity: 'WARNING' as const,
      alert_type: 'THRESHOLD' as const,
      title: '온도 주의',
      description: '실내 온도가 권장 범위를 벗어났습니다(26°C 이상).',
      threshold: 26,
    },
  ],
  HUMIDITY: [
    {
      severity: 'WARNING' as const,
      alert_type: 'THRESHOLD' as const,
      title: '습도 이상',
      description: '실내 습도가 권장 범위를 벗어났습니다(70% 이상 또는 30% 이하).',
      threshold: 70,
    },
  ],
  CO2: [
    {
      severity: 'CRITICAL' as const,
      alert_type: 'THRESHOLD' as const,
      title: 'CO2 농도 위험',
      description: 'CO2 농도가 위험 수준에 도달했습니다(1500ppm 이상). 즉시 환기가 필요합니다.',
      threshold: 1500,
    },
    {
      severity: 'WARNING' as const,
      alert_type: 'THRESHOLD' as const,
      title: 'CO2 농도 증가',
      description: 'CO2 농도가 높습니다(1200ppm 이상). 환기를 권장합니다.',
      threshold: 1200,
    },
  ],
  DOOR_STATUS: [
    {
      severity: 'CRITICAL' as const,
      alert_type: 'FACILITY_ERROR' as const,
      title: '출입문 시스템 오류',
      description: '출입문 제어 시스템에 오류가 발생했습니다. 긴급 점검이 필요합니다.',
      threshold: 0,
    },
  ],
  ELEVATOR_STATUS: [
    {
      severity: 'CRITICAL' as const,
      alert_type: 'FACILITY_ERROR' as const,
      title: '엘리베이터 시스템 오류',
      description: '엘리베이터 제어 시스템에 오류가 발생했습니다. 긴급 점검이 필요합니다.',
      threshold: 0,
    },
  ],
  CHARGER_STATUS: [
    {
      severity: 'WARNING' as const,
      alert_type: 'FACILITY_ERROR' as const,
      title: '전기차 충전기 오류',
      description: '전기차 충전기에 오류가 발생했습니다. 점검이 필요합니다.',
      threshold: 0,
    },
  ],
}

async function generateAlerts() {
  console.log('🔔 실시간 알림 데이터 생성 시작...')

  // Get all sensors
  const { data: sensors, error: sensorsError } = await supabase.from('sensors').select('*')

  if (sensorsError) {
    console.error('센서 조회 오류:', sensorsError)
    return
  }

  console.log(`📡 ${sensors?.length}개 센서 발견`)

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  let alertsCreated = 0
  let alertsSkipped = 0

  for (const sensor of sensors!) {
    // Get latest reading
    const { data: readings } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('sensor_id', sensor.id)
      .order('read_at', { ascending: false })
      .limit(1)

    if (!readings || readings.length === 0) {
      alertsSkipped++
      continue
    }

    const latestReading = readings[0]
    const templates = alertTemplates[sensor.type as keyof typeof alertTemplates]

    if (!templates) {
      alertsSkipped++
      continue
    }

    // Check if value triggers any alerts
    for (const template of templates) {
      let shouldAlert = false

      if (sensor.type === 'ENERGY' || sensor.type === 'CO2') {
        shouldAlert = Number(latestReading.value) >= template.threshold
      } else if (sensor.type === 'TEMP') {
        shouldAlert =
          Number(latestReading.value) >= template.threshold ||
          Number(latestReading.value) < 18
      } else if (sensor.type === 'HUMIDITY') {
        shouldAlert =
          Number(latestReading.value) >= template.threshold ||
          Number(latestReading.value) < 30
      } else if (['DOOR_STATUS', 'ELEVATOR_STATUS', 'CHARGER_STATUS'].includes(sensor.type)) {
        shouldAlert = Number(latestReading.value) === template.threshold
      }

      if (shouldAlert) {
        // Check if similar alert already exists for this sensor in the last hour
        const { data: existingAlerts } = await supabase
          .from('alerts')
          .select('*')
          .eq('sensor_id', sensor.id)
          .eq('severity', template.severity)
          .gte('triggered_at', oneHourAgo.toISOString())

        if (existingAlerts && existingAlerts.length > 0) {
          alertsSkipped++
          continue
        }

        // Determine status (70% NEW, 20% ACKNOWLEDGED, 10% RESOLVED)
        const randomStatus = Math.random()
        const status =
          randomStatus < 0.7 ? 'NEW' : randomStatus < 0.9 ? 'ACKNOWLEDGED' : 'RESOLVED'
        const triggeredTime = new Date(now.getTime() - Math.random() * 30 * 60 * 1000) // Random time in last 30 min

        // Create new alert
        const { error: alertError } = await supabase.from('alerts').insert({
          sensor_id: sensor.id,
          alert_type: template.alert_type,
          severity: template.severity,
          title: template.title,
          description: template.description,
          status: status,
          triggered_at: triggeredTime.toISOString(),
          acknowledged_at:
            status === 'ACKNOWLEDGED' || status === 'RESOLVED'
              ? new Date(triggeredTime.getTime() + Math.random() * 10 * 60 * 1000).toISOString()
              : null,
          resolved_at:
            status === 'RESOLVED'
              ? new Date(triggeredTime.getTime() + Math.random() * 20 * 60 * 1000).toISOString()
              : null,
        })

        if (alertError) {
          console.error('알림 생성 오류:', alertError)
        } else {
          alertsCreated++
          console.log(`  ✅ 알림 생성: ${sensor.name} - ${template.title}`)
        }
      }
    }
  }

  console.log(`\n✨ 완료: ${alertsCreated}개 알림 생성, ${alertsSkipped}개 스킵`)
}

generateAlerts()
  .then(() => {
    console.log('✅ 알림 생성 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
