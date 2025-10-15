'use client'

import { useEffect, useState } from 'react'
import { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { Activity, Zap, Thermometer, Droplets, Wind, DoorOpen, Gauge } from 'lucide-react'

type Sensor = Database['public']['Tables']['sensors']['Row']
type SensorReading = Database['public']['Tables']['sensor_readings']['Row']

interface SensorStatsProps {
  title: string
  sensors: Sensor[]
  buildingId: string
}

export default function SensorStats({ title, sensors, buildingId }: SensorStatsProps) {
  const [readings, setReadings] = useState<Map<string, number>>(new Map())
  const supabase = createClient()

  useEffect(() => {
    const fetchLatestReadings = async () => {
      for (const sensor of sensors) {
        const { data } = await supabase
          .from('sensor_readings')
          .select('*')
          .eq('sensor_id', sensor.id)
          .order('read_at', { ascending: false })
          .limit(1)
          .single()

        if (data) {
          setReadings((prev) => new Map(prev).set(sensor.id, data.value))
        }
      }
    }

    fetchLatestReadings()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('sensor-readings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
        },
        (payload) => {
          const newReading = payload.new as SensorReading
          if (sensors.some((s) => s.id === newReading.sensor_id)) {
            setReadings((prev) => new Map(prev).set(newReading.sensor_id, newReading.value))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sensors, supabase])

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'ENERGY':
        return <Zap className="h-5 w-5" />
      case 'TEMP':
        return <Thermometer className="h-5 w-5" />
      case 'HUMIDITY':
        return <Droplets className="h-5 w-5" />
      case 'CO2':
        return <Wind className="h-5 w-5" />
      case 'DOOR_STATUS':
        return <DoorOpen className="h-5 w-5" />
      case 'ELEVATOR_STATUS':
      case 'CHARGER_STATUS':
        return <Activity className="h-5 w-5" />
      default:
        return <Gauge className="h-5 w-5" />
    }
  }

  const getValueColor = (sensor: Sensor, value: number) => {
    // For facility sensors, 0 = error, 1 = ok
    if (['DOOR_STATUS', 'ELEVATOR_STATUS', 'CHARGER_STATUS'].includes(sensor.type)) {
      return value === 1 ? 'text-green-600' : 'text-red-600'
    }
    return 'text-gray-900'
  }

  const formatValue = (sensor: Sensor, value: number) => {
    if (['DOOR_STATUS', 'ELEVATOR_STATUS', 'CHARGER_STATUS'].includes(sensor.type)) {
      return value === 1 ? '정상' : '오류'
    }
    return `${value.toFixed(1)} ${sensor.unit || ''}`
  }

  // Get gauge percentage and color for environmental sensors
  const getGaugeData = (sensor: Sensor, value: number | undefined) => {
    if (value === undefined) return { percentage: 0, color: 'bg-gray-300', status: '로딩 중' }

    switch (sensor.type) {
      case 'ENERGY': {
        // Energy: 0-100 kW, optimal < 80
        const percentage = Math.min((value / 100) * 100, 100)
        if (value < 60) return { percentage, color: 'bg-green-500', status: '우수' }
        if (value < 80) return { percentage, color: 'bg-yellow-500', status: '양호' }
        return { percentage, color: 'bg-red-500', status: '높음' }
      }
      case 'TEMP': {
        // Temperature: 15-30°C, optimal 20-24
        const percentage = Math.min(((value - 15) / 15) * 100, 100)
        if (value >= 20 && value <= 24) return { percentage, color: 'bg-green-500', status: '적정' }
        if (value >= 18 && value <= 26) return { percentage, color: 'bg-yellow-500', status: '양호' }
        return { percentage, color: 'bg-red-500', status: '부적정' }
      }
      case 'HUMIDITY': {
        // Humidity: 0-100%, optimal 40-60
        const percentage = value
        if (value >= 40 && value <= 60) return { percentage, color: 'bg-green-500', status: '적정' }
        if (value >= 30 && value <= 70) return { percentage, color: 'bg-yellow-500', status: '양호' }
        return { percentage, color: 'bg-red-500', status: '부적정' }
      }
      case 'CO2': {
        // CO2: 0-2000 ppm, optimal < 1000
        const percentage = Math.min((value / 2000) * 100, 100)
        if (value < 1000) return { percentage, color: 'bg-green-500', status: '우수' }
        if (value < 1500) return { percentage, color: 'bg-yellow-500', status: '양호' }
        return { percentage, color: 'bg-red-500', status: '높음' }
      }
      default:
        return { percentage: 0, color: 'bg-gray-300', status: '-' }
    }
  }

  if (sensors.length === 0) {
    return null
  }

  const isEnvironmentalSensor = (type: string) =>
    ['ENERGY', 'TEMP', 'HUMIDITY', 'CO2'].includes(type)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => {
          const value = readings.get(sensor.id)
          const gaugeData = isEnvironmentalSensor(sensor.type)
            ? getGaugeData(sensor, value)
            : null

          return (
            <div
              key={sensor.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  {getSensorIcon(sensor.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{sensor.name}</h4>
                  {sensor.location_detail && (
                    <p className="text-xs text-gray-500 truncate">{sensor.location_detail}</p>
                  )}
                </div>
              </div>

              <div className={`text-2xl font-bold mb-2 ${value !== undefined ? getValueColor(sensor, value) : 'text-gray-400'}`}>
                {value !== undefined ? formatValue(sensor, value) : '로딩 중...'}
              </div>

              {/* Visual gauge for environmental sensors */}
              {gaugeData && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${gaugeData.color}`}
                      style={{ width: `${gaugeData.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">상태</span>
                    <span className={`text-xs font-semibold ${
                      gaugeData.status === '우수' || gaugeData.status === '적정'
                        ? 'text-green-600'
                        : gaugeData.status === '양호'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {gaugeData.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
