'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, FileCheck, Activity, CheckCircle2 } from 'lucide-react'

interface GovernanceStatsProps {
  buildingId: string
  totalSensors: number
  totalAlerts: number
}

export default function GovernanceStats({
  buildingId,
  totalSensors,
  totalAlerts,
}: GovernanceStatsProps) {
  const [stats, setStats] = useState({
    sensorUptime: 0, // 센서 정상 작동률
    responseTime: 0, // 평균 알림 대응 시간 (분)
    complianceRate: 0, // 규정 준수율
    dataQuality: 0, // 데이터 품질 점수
  })

  useEffect(() => {
    async function calculateStats() {
      const supabase = createClient()

      // 1. 센서 정상 작동률 계산
      const { data: sensorReadings } = await supabase
        .from('sensor_readings')
        .select('sensor_id, sensors!inner(building_id)')
        .eq('sensors.building_id', buildingId)
        .gte('read_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      const uniqueSensorsWithData = new Set(sensorReadings?.map((r: any) => r.sensor_id))
      const sensorUptime = totalSensors > 0 ? (uniqueSensorsWithData.size / totalSensors) * 100 : 100

      // 2. 평균 알림 대응 시간 계산 (확인된 알림의 대응 시간)
      const { data: resolvedAlerts } = await supabase
        .from('alerts')
        .select('triggered_at, acknowledged_at, sensors!inner(building_id)')
        .eq('sensors.building_id', buildingId)
        .not('acknowledged_at', 'is', null)
        .limit(10)

      let avgResponseTime = 0
      if (resolvedAlerts && resolvedAlerts.length > 0) {
        const responseTimes = resolvedAlerts.map((alert: any) => {
          const triggered = new Date(alert.triggered_at).getTime()
          const acknowledged = new Date(alert.acknowledged_at).getTime()
          return (acknowledged - triggered) / (1000 * 60) // 분 단위
        })
        avgResponseTime =
          responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      } else {
        avgResponseTime = 15 // 기본값: 15분
      }

      // 3. 규정 준수율 계산 (긴급 알림 중 미해결 비율로 계산)
      const { data: criticalAlerts } = await supabase
        .from('alerts')
        .select('status, sensors!inner(building_id)')
        .eq('sensors.building_id', buildingId)
        .eq('severity', 'CRITICAL')

      const totalCritical = criticalAlerts?.length || 0
      const resolvedCritical =
        criticalAlerts?.filter((a: any) => a.status !== 'NEW').length || 0
      const complianceRate = totalCritical > 0 ? (resolvedCritical / totalCritical) * 100 : 100

      // 4. 데이터 품질 점수 (최근 24시간 데이터 수집률)
      const expectedReadings = totalSensors * 288 // 5분마다 수집 가정
      const actualReadings = sensorReadings?.length || 0
      const dataQuality =
        expectedReadings > 0 ? Math.min((actualReadings / expectedReadings) * 100, 100) : 100

      setStats({
        sensorUptime: Math.round(sensorUptime),
        responseTime: Math.round(avgResponseTime),
        complianceRate: Math.round(complianceRate),
        dataQuality: Math.round(dataQuality),
      })
    }

    calculateStats()
  }, [buildingId, totalSensors])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">거버넌스 (Governance)</h3>
        <p className="text-sm text-gray-600 mt-1">
          데이터 투명성, 컴플라이언스, 리스크 관리
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 센서 정상 작동률 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">센서 정상 작동률</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(stats.sensorUptime)}`}>
                {stats.sensorUptime}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                  stats.sensorUptime
                )}`}
                style={{ width: `${stats.sensorUptime}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {totalSensors}개 센서 중 {Math.round((stats.sensorUptime / 100) * totalSensors)}개
              정상 작동
            </p>
          </div>

          {/* 평균 대응 시간 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">평균 알림 대응 시간</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.responseTime}분</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  stats.responseTime <= 15
                    ? 'bg-green-500'
                    : stats.responseTime <= 30
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((30 / stats.responseTime) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {stats.responseTime <= 15
                ? '우수 - 빠른 대응'
                : stats.responseTime <= 30
                ? '양호 - 적정 수준'
                : '개선 필요'}
            </p>
          </div>

          {/* 규정 준수율 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">안전 규정 준수율</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(stats.complianceRate)}`}>
                {stats.complianceRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                  stats.complianceRate
                )}`}
                style={{ width: `${stats.complianceRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">긴급 알림 처리 및 대응 완료율</p>
          </div>

          {/* 데이터 품질 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">데이터 품질 점수</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(stats.dataQuality)}`}>
                {stats.dataQuality}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                  stats.dataQuality
                )}`}
                style={{ width: `${stats.dataQuality}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">최근 24시간 센서 데이터 수집 완료율</p>
          </div>
        </div>

        {/* Governance Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                거버넌스 종합 평가
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                중증장애인 모니터링 요원이 빌딩 ESG 데이터를 투명하게 관리하고 있습니다. 모든
                센서 데이터는 실시간으로 수집·검증되며, 안전 규정 준수 여부를 상시
                모니터링합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
