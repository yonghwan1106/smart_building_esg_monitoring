'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Shield, UserCog, Loader2 } from 'lucide-react'

const demoAccounts = [
  {
    name: '김모니터',
    role: 'AGENT',
    roleLabel: '모니터링 요원',
    description: '배출자',
    email: 'monitor@bemo.com',
    password: 'demo1234',
    icon: User,
    color: 'bg-green-100 text-green-700 border-green-200',
    hoverColor: 'hover:border-green-500 hover:bg-green-50',
  },
  {
    name: '이관리',
    role: 'MANAGER',
    roleLabel: '현장 관리자',
    description: '수거 파트너',
    email: 'manager@bemo.com',
    password: 'demo1234',
    icon: UserCog,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    hoverColor: 'hover:border-orange-500 hover:bg-orange-50',
  },
  {
    name: '박관리자',
    role: 'ADMIN',
    roleLabel: '시스템 관리자',
    description: '코디네이터',
    email: 'admin@bemo.com',
    password: 'demo1234',
    icon: Shield,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    hoverColor: 'hover:border-blue-500 hover:bg-blue-50',
  },
]

export default function DemoPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDemoLogin = async (account: typeof demoAccounts[0]) => {
    setLoading(account.email)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      })

      if (signInError) throw signInError

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            데모 계정으로 빠른 체험
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            클릭 한 번으로 각 역할의 대시보드를 체험해보세요
          </p>
          <p className="text-sm text-indigo-600 font-medium">
            🏆 2025 중증장애인 고용확대 아이디어 공모전 출품작
          </p>
        </div>

        {/* Demo Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {demoAccounts.map((account) => {
            const Icon = account.icon
            const isLoading = loading === account.email

            return (
              <button
                key={account.email}
                onClick={() => handleDemoLogin(account)}
                disabled={loading !== null}
                className={`relative p-6 border-2 rounded-2xl transition-all duration-200 ${account.color} ${
                  loading === null ? account.hoverColor : 'opacity-50'
                } disabled:cursor-not-allowed text-left`}
              >
                {/* Icon */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{account.name}</h3>
                    <p className="text-sm opacity-75">{account.roleLabel}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                  <p className="text-xs opacity-75 mb-1">이메일</p>
                  <p className="text-sm font-mono font-medium">{account.email}</p>
                </div>

                {/* Login Button */}
                <div className="flex items-center justify-center py-2 px-4 bg-white rounded-lg shadow-sm">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="text-sm font-medium">로그인 중...</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium">클릭하여 로그인 →</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800 text-center">{error}</p>
          </div>
        )}

        {/* Alternative Login */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">또는</p>
          <button
            onClick={() => router.push('/login')}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm underline"
          >
            기존 계정으로 로그인하기
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            💡 각 역할별 주요 기능
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
            <div>
              <p className="font-medium text-green-700 mb-1">모니터링 요원</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>실시간 센서 모니터링</li>
                <li>알림 확인 및 조치</li>
                <li>작업 지시서 생성</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-orange-700 mb-1">현장 관리자</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>작업 지시서 관리</li>
                <li>현장 점검 처리</li>
                <li>시설물 유지보수</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-blue-700 mb-1">시스템 관리자</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>전체 빌딩 관리</li>
                <li>사용자 권한 관리</li>
                <li>AI 분석 보고서</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
