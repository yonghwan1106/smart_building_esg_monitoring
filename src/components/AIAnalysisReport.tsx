'use client'

import { useState } from 'react'
import { detectAnomalies, generateAIAnalysis } from '@/lib/edge-functions'
import { Sparkles, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface AIAnalysisReportProps {
  buildingId: string
  buildingName: string
}

export default function AIAnalysisReport({ buildingId, buildingName }: AIAnalysisReportProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  const [showAgentInput, setShowAgentInput] = useState(false)
  const [agentObservations, setAgentObservations] = useState('')
  const [agentRecommendations, setAgentRecommendations] = useState('')

  const handleDetectAnomalies = async () => {
    setIsDetecting(true)
    setError(null)

    try {
      const result = await detectAnomalies(buildingId)
      console.log('Anomaly detection result:', result)

      if (result.anomalies_detected > 0) {
        alert(
          `${result.anomalies_detected}개의 이상 패턴이 감지되어 알림이 생성되었습니다. 알림 피드를 확인해주세요.`
        )
      } else {
        alert('현재 이상 패턴이 감지되지 않았습니다. 모든 센서가 정상 범위 내에서 작동하고 있습니다.')
      }
    } catch (err) {
      console.error('Error detecting anomalies:', err)
      setError('이상 패턴 탐지 중 오류가 발생했습니다.')
    } finally {
      setIsDetecting(false)
    }
  }

  const handleGenerateAnalysis = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Include agent observations in the analysis
      const contextAddition = agentObservations || agentRecommendations
        ? `\n\n모니터링 요원의 관찰 및 의견:\n${agentObservations ? `관찰 사항: ${agentObservations}\n` : ''}${agentRecommendations ? `개선 제안: ${agentRecommendations}` : ''}`
        : ''

      const result = await generateAIAnalysis(buildingId)
      console.log('AI analysis result:', result)

      if (result.success) {
        // Append agent input to the AI analysis
        const fullAnalysis = result.analysis + (contextAddition ? '\n\n---\n## 모니터링 요원의 의견\n' + contextAddition : '')
        setAnalysis(fullAnalysis)
        setLastGenerated(new Date(result.generated_at))
      } else {
        throw new Error('Failed to generate analysis')
      }
    } catch (err) {
      console.error('Error generating AI analysis:', err)
      setError('AI 분석 보고서 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              AI 분석 보고서
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Claude AI가 빌딩 데이터를 분석하여 상세한 ESG 보고서를 생성합니다
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDetectAnomalies}
              disabled={isDetecting}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  탐지 중...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  이상 패턴 탐지
                </>
              )}
            </button>
            <button
              onClick={handleGenerateAnalysis}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {analysis ? '보고서 재생성' : '보고서 생성'}
                </>
              )}
            </button>
          </div>
        </div>
        {lastGenerated && (
          <p className="text-xs text-gray-500 mt-2">
            마지막 생성: {lastGenerated.toLocaleString('ko-KR')}
          </p>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">AI 분석 보고서를 생성하는 중입니다...</p>
            <p className="text-sm text-gray-500 mt-2">
              센서 데이터와 알림을 분석하여 상세한 보고서를 작성하고 있습니다. 약 10-20초 소요됩니다.
            </p>
          </div>
        )}

        {!isGenerating && !analysis && !error && (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">아직 생성된 보고서가 없습니다</p>
            <p className="text-sm text-gray-500 mb-4">
              "보고서 생성" 버튼을 클릭하여 AI 분석 보고서를 생성해보세요
            </p>
            <button
              onClick={() => setShowAgentInput(!showAgentInput)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {showAgentInput ? '입력 창 닫기' : '+ 모니터링 요원 의견 추가'}
            </button>
          </div>
        )}

        {/* Agent Input Section */}
        {showAgentInput && !analysis && (
          <div className="mb-6 bg-indigo-50 rounded-lg p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              모니터링 요원의 전문가 의견
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              데이터 분석을 통해 발견한 패턴, 우려사항, 개선 제안 등을 작성해주세요.
              이 내용은 AI 분석 보고서와 함께 포함됩니다.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관찰 사항
                </label>
                <textarea
                  value={agentObservations}
                  onChange={(e) => setAgentObservations(e.target.value)}
                  placeholder="예: 최근 3일간 3층 에너지 사용량이 평소보다 15% 증가했습니다. 공조 시스템 설정을 확인할 필요가 있어 보입니다."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  개선 제안
                </label>
                <textarea
                  value={agentRecommendations}
                  onChange={(e) => setAgentRecommendations(e.target.value)}
                  placeholder="예: 야간 시간대(22:00-06:00) 조명 자동 감광 설정을 권장합니다. 월 전기료 약 10% 절감 예상됩니다."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAgentInput(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowAgentInput(false)
                    alert('의견이 저장되었습니다. 이제 "보고서 생성" 버튼을 클릭하여 AI 분석과 함께 의견을 포함한 보고서를 생성하세요.')
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  disabled={!agentObservations && !agentRecommendations}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {!isGenerating && analysis && (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h3>
                ),
                p: ({ children }) => <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-gray-700">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                code: ({ children }) => (
                  <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
