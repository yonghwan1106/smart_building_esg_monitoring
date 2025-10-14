'use client'

import { useState } from 'react'
import { Database } from '@/lib/database.types'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import AlertActionModal from './AlertActionModal'

type Alert = Database['public']['Tables']['alerts']['Row'] & {
  sensors: { name: string; location_detail: string | null } | null
}

interface AlertsFeedProps {
  alerts: Alert[]
  onRefresh?: () => void
}

export default function AlertsFeed({ alerts, onRefresh }: AlertsFeedProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800'
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-red-100 text-red-800'
      case 'ACKNOWLEDGED':
        return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">실시간 알림 피드</h2>
        <p className="text-sm text-gray-500 mt-1">최근 알림 {alerts.length}개</p>
      </div>
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">새로운 알림이 없습니다</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadge(
                        alert.severity
                      )}`}
                    >
                      {alert.severity === 'CRITICAL'
                        ? '긴급'
                        : alert.severity === 'WARNING'
                        ? '경고'
                        : '정보'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(
                        alert.status || 'NEW'
                      )}`}
                    >
                      {alert.status === 'NEW'
                        ? '신규'
                        : alert.status === 'ACKNOWLEDGED'
                        ? '확인됨'
                        : '해결'}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                  {alert.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {alert.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    {alert.sensors && (
                      <span>
                        {alert.sensors.name}
                        {alert.sensors.location_detail && ` (${alert.sensors.location_detail})`}
                      </span>
                    )}
                    {alert.triggered_at && (
                      <>
                        <span>·</span>
                        <span>
                          {formatDistanceToNow(new Date(alert.triggered_at), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                  {alert.status === 'NEW' && (
                    <div className="mt-3">
                      <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                        조치하기 →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {selectedAlert && (
        <AlertActionModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onSuccess={() => {
            setSelectedAlert(null)
            onRefresh?.()
          }}
        />
      )}
    </div>
  )
}
