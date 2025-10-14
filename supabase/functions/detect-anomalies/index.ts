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
}

interface AnomalyResult {
  sensor_id: string
  sensor_name: string
  current_value: number
  mean: number
  std_dev: number
  z_score: number
  is_anomaly: boolean
  severity: 'CRITICAL' | 'WARNING'
}

/**
 * Calculate mean (average) of an array of numbers
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Calculate Z-score for anomaly detection
 * Z-score = (x - mean) / std_dev
 * |Z| > 3 indicates a strong anomaly
 * |Z| > 2 indicates a potential anomaly
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

/**
 * Detect anomalies using statistical method (Z-score)
 */
async function detectAnomalies(buildingId: string): Promise<AnomalyResult[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get all sensors for the building
  const { data: sensors, error: sensorsError } = await supabase
    .from('sensors')
    .select('*')
    .eq('building_id', buildingId)

  if (sensorsError || !sensors) {
    throw new Error(`Failed to fetch sensors: ${sensorsError?.message}`)
  }

  const anomalies: AnomalyResult[] = []

  // Analyze each sensor
  for (const sensor of sensors as Sensor[]) {
    // Skip facility status sensors (they use binary values)
    if (['DOOR_STATUS', 'ELEVATOR_STATUS', 'CHARGER_STATUS'].includes(sensor.type)) {
      // For facility sensors, check if current status is 0 (error)
      const { data: latestReading } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('sensor_id', sensor.id)
        .order('read_at', { ascending: false })
        .limit(1)
        .single()

      if (latestReading && latestReading.value === 0) {
        anomalies.push({
          sensor_id: sensor.id,
          sensor_name: sensor.name,
          current_value: 0,
          mean: 1,
          std_dev: 0,
          z_score: -999, // Special indicator for facility error
          is_anomaly: true,
          severity: 'CRITICAL',
        })
      }
      continue
    }

    // Get last 48 hours of readings for statistical analysis
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const { data: readings, error: readingsError } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('sensor_id', sensor.id)
      .gte('read_at', fortyEightHoursAgo)
      .order('read_at', { ascending: false })

    if (readingsError || !readings || readings.length < 10) {
      console.log(`Insufficient data for sensor ${sensor.name}`)
      continue
    }

    const sensorReadings = readings as SensorReading[]
    const values = sensorReadings.map((r) => r.value)
    const currentValue = values[0]

    // Calculate statistical measures
    const mean = calculateMean(values)
    const stdDev = calculateStdDev(values, mean)
    const zScore = calculateZScore(currentValue, mean, stdDev)

    // Detect anomaly based on Z-score
    const isStrongAnomaly = Math.abs(zScore) > 3
    const isPotentialAnomaly = Math.abs(zScore) > 2

    if (isStrongAnomaly || isPotentialAnomaly) {
      anomalies.push({
        sensor_id: sensor.id,
        sensor_name: sensor.name,
        current_value: currentValue,
        mean,
        std_dev: stdDev,
        z_score: zScore,
        is_anomaly: true,
        severity: isStrongAnomaly ? 'CRITICAL' : 'WARNING',
      })
    }
  }

  return anomalies
}

/**
 * Create alerts for detected anomalies
 */
async function createAlertsForAnomalies(anomalies: AnomalyResult[]): Promise<void> {
  if (anomalies.length === 0) return

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  for (const anomaly of anomalies) {
    // Check if there's already a recent alert for this sensor
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentAlerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('sensor_id', anomaly.sensor_id)
      .eq('status', 'NEW')
      .gte('triggered_at', oneHourAgo)

    // Don't create duplicate alerts
    if (recentAlerts && recentAlerts.length > 0) {
      console.log(`Skipping duplicate alert for ${anomaly.sensor_name}`)
      continue
    }

    let title = ''
    let description = ''

    if (anomaly.z_score === -999) {
      // Facility error
      title = `${anomaly.sensor_name} 작동 불능`
      description = `${anomaly.sensor_name}이(가) 정상적으로 작동하지 않습니다. 즉시 점검이 필요합니다.`
    } else {
      // Statistical anomaly
      const direction = anomaly.z_score > 0 ? '증가' : '감소'
      title = `${anomaly.sensor_name} 이상 패턴 감지`
      description = `현재 값: ${anomaly.current_value.toFixed(2)}, 평균: ${anomaly.mean.toFixed(
        2
      )}, Z-점수: ${anomaly.z_score.toFixed(
        2
      )}. 평소 대비 비정상적인 ${direction} 패턴이 감지되었습니다.`
    }

    // Create alert
    const { error: alertError } = await supabase.from('alerts').insert({
      sensor_id: anomaly.sensor_id,
      alert_type: anomaly.z_score === -999 ? 'FACILITY_ERROR' : 'ANOMALY',
      severity: anomaly.severity,
      title,
      description,
      status: 'NEW',
      triggered_at: new Date().toISOString(),
    })

    if (alertError) {
      console.error(`Failed to create alert for ${anomaly.sensor_name}:`, alertError)
    } else {
      console.log(`Created alert for ${anomaly.sensor_name}`)
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { building_id } = await req.json()

    if (!building_id) {
      return new Response(JSON.stringify({ error: 'building_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Detecting anomalies for building: ${building_id}`)

    // Detect anomalies
    const anomalies = await detectAnomalies(building_id)
    console.log(`Found ${anomalies.length} anomalies`)

    // Create alerts for detected anomalies
    await createAlertsForAnomalies(anomalies)

    return new Response(
      JSON.stringify({
        success: true,
        anomalies_detected: anomalies.length,
        anomalies,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error detecting anomalies:', error)
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
