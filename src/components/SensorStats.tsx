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

  if (sensors.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => {
          const value = readings.get(sensor.id)
          return (
            <div
              key={sensor.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
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
              <div className={`text-2xl font-bold ${value !== undefined ? getValueColor(sensor, value) : 'text-gray-400'}`}>
                {value !== undefined ? formatValue(sensor, value) : '로딩 중...'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
