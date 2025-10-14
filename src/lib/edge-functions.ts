import { createClient } from '@/lib/supabase/client'

/**
 * Call the anomaly detection Edge Function
 */
export async function detectAnomalies(buildingId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.functions.invoke('detect-anomalies', {
    body: { building_id: buildingId },
  })

  if (error) {
    console.error('Error calling detect-anomalies function:', error)
    throw error
  }

  return data
}

/**
 * Call the AI analysis Edge Function
 */
export async function generateAIAnalysis(buildingId: string, sensorId?: string) {
  const supabase = createClient()

  const { data, error } = await supabase.functions.invoke('generate-ai-analysis', {
    body: {
      building_id: buildingId,
      sensor_id: sensorId,
    },
  })

  if (error) {
    console.error('Error calling generate-ai-analysis function:', error)
    throw error
  }

  return data
}
