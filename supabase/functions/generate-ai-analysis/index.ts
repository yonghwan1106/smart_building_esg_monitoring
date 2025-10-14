import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface SensorReading {
  id: string
  sensor_id: string
  value: number
  read_at: string
}

interface Sensor {
  id: string
  building_id: string
  type: string
  name: string
  location_detail: string | null
  unit: string | null
}

interface Alert {
  id: string
  sensor_id: string
  alert_type: string
  severity: string
  title: string
  description: string
  status: string
  triggered_at: string
}

interface Building {
  id: string
  name: string
  address: string
}

/**
 * Fetch building data including sensors, readings, and alerts
 */
async function fetchBuildingData(buildingId: string, sensorId?: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get building info
  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', buildingId)
    .single()

  if (buildingError || !building) {
    throw new Error(`Failed to fetch building: ${buildingError?.message}`)
  }

  // Get sensors
  let sensorsQuery = supabase.from('sensors').select('*').eq('building_id', buildingId)

  if (sensorId) {
    sensorsQuery = sensorsQuery.eq('id', sensorId)
  }

  const { data: sensors, error: sensorsError } = await sensorsQuery

  if (sensorsError || !sensors) {
    throw new Error(`Failed to fetch sensors: ${sensorsError?.message}`)
  }

  // Get recent readings for each sensor (last 24 hours)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const readings: Record<string, SensorReading[]> = {}

  for (const sensor of sensors) {
    const { data: sensorReadings } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('sensor_id', sensor.id)
      .gte('read_at', twentyFourHoursAgo)
      .order('read_at', { ascending: false })
      .limit(24)

    if (sensorReadings) {
      readings[sensor.id] = sensorReadings as SensorReading[]
    }
  }

  // Get recent alerts (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .in(
      'sensor_id',
      sensors.map((s: Sensor) => s.id)
    )
    .gte('triggered_at', sevenDaysAgo)
    .order('triggered_at', { ascending: false })

  return {
    building: building as Building,
    sensors: sensors as Sensor[],
    readings,
    alerts: (alerts as Alert[]) || [],
  }
}

/**
 * Format data for Claude API
 */
function formatDataForClaude(data: any) {
  const { building, sensors, readings, alerts } = data

  let prompt = `당신은 스마트 빌딩 ESG 모니터링 전문가입니다. 다음 데이터를 분석하고 상세한 보고서를 한국어로 작성해주세요.

# 빌딩 정보
- 이름: ${building.name}
- 주소: ${building.address}

# 센서 현황 (총 ${sensors.length}개)
`

  for (const sensor of sensors) {
    const sensorReadings = readings[sensor.id] || []
    if (sensorReadings.length === 0) continue

    const latestValue = sensorReadings[0].value
    const values = sensorReadings.map((r: SensorReading) => r.value)
    const avgValue = values.reduce((a: number, b: number) => a + b, 0) / values.length
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    prompt += `
## ${sensor.name} (${sensor.location_detail || '위치 미상'})
- 센서 타입: ${sensor.type}
- 현재 값: ${latestValue.toFixed(2)} ${sensor.unit || ''}
- 24시간 평균: ${avgValue.toFixed(2)} ${sensor.unit || ''}
- 최소값: ${minValue.toFixed(2)} ${sensor.unit || ''}
- 최대값: ${maxValue.toFixed(2)} ${sensor.unit || ''}
- 데이터 포인트: ${sensorReadings.length}개
`
  }

  if (alerts.length > 0) {
    prompt += `\n# 최근 알림 (최근 7일, 총 ${alerts.length}개)\n`
    for (const alert of alerts.slice(0, 10)) {
      prompt += `
- [${alert.severity}] ${alert.title}
  - 설명: ${alert.description}
  - 상태: ${alert.status}
  - 발생 시간: ${new Date(alert.triggered_at).toLocaleString('ko-KR')}
`
    }
  }

  prompt += `

# 분석 요청사항
다음 항목들을 포함한 상세한 분석 보고서를 작성해주세요:

1. **전체 요약**: 현재 빌딩의 전반적인 ESG 상태를 3-4문장으로 요약
2. **에너지 효율성 분석** (Environment):
   - 전력 사용 패턴 분석
   - 효율성 평가 및 개선 방안
3. **환경 품질 분석** (Environment):
   - 온도, 습도, CO2 수준 평가
   - 실내 환경 품질 개선 제안
4. **사회적 편의시설 분석** (Social):
   - 장애인 편의시설 상태 평가
   - 접근성 개선 방안
5. **알림 및 이슈 분석**:
   - 최근 발생한 알림의 패턴 분석
   - 주요 이슈 및 긴급도 평가
6. **권장 조치사항**:
   - 즉시 조치가 필요한 항목 (우선순위 높음)
   - 단기 개선 방안 (1-2주 이내)
   - 장기 개선 방안 (1-3개월)
7. **ESG 점수 평가**:
   - Environment (환경): 0-100점
   - Social (사회): 0-100점
   - Governance (거버넌스): 0-100점
   - 전체 종합 점수 및 평가 근거

보고서는 전문적이고 실용적이며, 구체적인 수치와 함께 명확한 개선 방안을 제시해주세요.`

  return prompt
}

/**
 * Call Claude API
 */
async function callClaudeAPI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.content[0].text
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { building_id, sensor_id } = await req.json()

    if (!building_id) {
      return new Response(JSON.stringify({ error: 'building_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Generating AI analysis for building: ${building_id}`)

    // Fetch building data
    const buildingData = await fetchBuildingData(building_id, sensor_id)

    // Format data for Claude
    const prompt = formatDataForClaude(buildingData)

    // Call Claude API
    const analysis = await callClaudeAPI(prompt)

    return new Response(
      JSON.stringify({
        success: true,
        building_id,
        building_name: buildingData.building.name,
        generated_at: new Date().toISOString(),
        analysis,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error generating AI analysis:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
