'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'
import { X, AlertCircle, CheckCircle, Send } from 'lucide-react'

type Alert = Database['public']['Tables']['alerts']['Row']

interface AlertActionModalProps {
  alert: Alert & {
    sensors: { name: string; location_detail: string | null } | null
  }
  onClose: () => void
  onSuccess: () => void
}

export default function AlertActionModal({
  alert,
  onClose,
  onSuccess,
}: AlertActionModalProps) {
  const [action, setAction] = useState<'acknowledge' | 'create_ticket' | ''>('')
  const [ticketTitle, setTicketTitle] = useState('')
  const [ticketDescription, setTicketDescription] = useState('')
  const [ticketPriority, setTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>(
    alert.severity === 'CRITICAL' ? 'URGENT' : 'HIGH'
  )
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleAcknowledge = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('alerts')
        .update({
          status: 'ACKNOWLEDGED',
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alert.id)

      if (updateError) throw updateError

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!ticketTitle.trim() || !ticketDescription.trim()) {
      setError('제목과 설명을 모두 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('인증되지 않은 사용자입니다.')

      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('issue_tickets')
        .insert({
          alert_id: alert.id,
          title: ticketTitle,
          details: ticketDescription,
          status: 'OPEN',
          created_by: user.id,
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Update alert status
      const { error: updateError } = await supabase
        .from('alerts')
        .update({
          status: 'ACKNOWLEDGED',
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alert.id)

      if (updateError) throw updateError

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('alerts')
        .update({
          status: 'RESOLVED',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alert.id)

      if (updateError) throw updateError

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">알림 처리</h2>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-100 text-red-700'
                    : alert.severity === 'WARNING'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {alert.severity}
              </span>
              <span className="text-sm text-gray-600">{alert.sensors?.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alert Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">알림 정보</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">메시지:</span> {alert.message}
              </p>
              <p>
                <span className="font-medium">위치:</span>{' '}
                {alert.sensors?.location_detail || '위치 정보 없음'}
              </p>
              {alert.threshold_value && (
                <p>
                  <span className="font-medium">임계값:</span> {alert.threshold_value}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Selection */}
          {!action && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">처리 방법 선택</h3>

              {alert.status === 'NEW' && (
                <>
                  <button
                    onClick={() => setAction('acknowledge')}
                    className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <CheckCircle className="w-6 h-6 text-indigo-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">확인 완료</div>
                      <div className="text-sm text-gray-600">
                        알림을 확인했으며, 추가 조치가 필요하지 않음
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setAction('create_ticket')}
                    className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <Send className="w-6 h-6 text-orange-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">작업 지시 생성</div>
                      <div className="text-sm text-gray-600">
                        현장 관리팀에 수리/점검 티켓 발송
                      </div>
                    </div>
                  </button>
                </>
              )}

              {alert.status === 'ACKNOWLEDGED' && (
                <button
                  onClick={handleResolve}
                  disabled={loading}
                  className="w-full flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">해결 완료</div>
                    <div className="text-sm text-gray-600">
                      문제가 해결되었음을 확인
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Acknowledge Form */}
          {action === 'acknowledge' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">확인 노트 (선택사항)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="알림 확인 내용을 입력하세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setAction('')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAcknowledge}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? '처리 중...' : '확인 완료'}
                </button>
              </div>
            </div>
          )}

          {/* Create Ticket Form */}
          {action === 'create_ticket' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">작업 지시서 작성</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 *
                </label>
                <input
                  type="text"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="예: 3층 자동문 고장 - 긴급 수리 필요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우선순위
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) =>
                    setTicketPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="LOW">낮음</option>
                  <option value="MEDIUM">보통</option>
                  <option value="HIGH">높음</option>
                  <option value="URGENT">긴급</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상세 설명 *
                </label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="문제 상황, 발견 시각, 조치가 필요한 이유 등을 상세히 작성해주세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAction('')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateTicket}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {loading ? '생성 중...' : '티켓 생성'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
