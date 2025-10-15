'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Filter,
} from 'lucide-react'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']
type Building = Database['public']['Tables']['buildings']['Row']
type Ticket = Database['public']['Tables']['issue_tickets']['Row']

interface TicketsClientProps {
  user: User
  profile: Profile
  building: Building
  initialTickets: Ticket[]
}

export default function TicketsClient({
  user,
  profile,
  building,
  initialTickets,
}: TicketsClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>(
    'ALL'
  )
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'RESOLVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'CLOSED':
        return <XCircle className="w-5 h-5 text-gray-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '접수'
      case 'IN_PROGRESS':
        return '처리중'
      case 'RESOLVED':
        return '해결'
      case 'CLOSED':
        return '종료'
      default:
        return status
    }
  }

  const filteredTickets =
    filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter)

  // Group tickets by status
  const openTickets = tickets.filter((t) => t.status === 'OPEN')
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS')
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">작업 지시서 관리</h1>
                <p className="text-sm text-gray-600">{building.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                <p className="text-xs text-gray-500">
                  {profile.role === 'AGENT'
                    ? '모니터링 요원'
                    : profile.role === 'MANAGER'
                    ? '현장 관리자'
                    : '관리자'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체</p>
                <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
              </div>
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">접수</p>
                <p className="text-3xl font-bold text-red-600">{openTickets.length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">처리중</p>
                <p className="text-3xl font-bold text-blue-600">{inProgressTickets.length}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">해결</p>
                <p className="text-3xl font-bold text-green-600">{resolvedTickets.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">필터:</span>
            <div className="flex gap-2">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? '전체' : getStatusText(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              작업 지시서 목록 ({filteredTickets.length}개)
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">작업 지시서가 없습니다</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getStatusIcon(ticket.status)}</div>

                    <div className="flex-1 min-w-0">
                      {/* Title and badges */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {ticket.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                                ticket.status
                              )}`}
                            >
                              {getStatusText(ticket.status)}
                            </span>
                            {ticket.alert_id && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                알림 ID: {ticket.alert_id.substring(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {formatDistanceToNow(new Date(ticket.created_at), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </div>
                      </div>

                      {/* Description */}
                      {ticket.details && (
                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                          {ticket.details}
                        </p>
                      )}

                      {/* Closed info */}
                      {ticket.closed_at && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <span className="font-medium">종료:</span>{' '}
                            {formatDistanceToNow(new Date(ticket.closed_at), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
