import Link from 'next/link'
import { Building2, LineChart, ShieldCheck, Users, Zap, TrendingDown } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">BEMO Platform</h1>
              <p className="text-sm text-gray-600">Building ESG Monitoring Officer</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/demo"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                데모 체험
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            🏆 2025 중증장애인 고용확대 아이디어 공모전 출품작
          </span>
        </div>
        <h2 className="text-5xl font-extrabold text-gray-900 text-center mb-6">
          스마트 빌딩 ESG<br />모니터링 요원
        </h2>
        <p className="text-xl text-gray-600 text-center mb-4 max-w-3xl mx-auto">
          IoT 기반 원격 빌딩 관리 전문가
        </p>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-4xl mx-auto leading-relaxed">
          이동에 제약이 있는 중증 지체장애인이 재택에서 IoT 기술을 활용하여<br />
          대형 빌딩의 에너지 효율, 실내 환경, 장애인 편의시설을 원격으로 관리하는<br />
          <span className="font-semibold text-indigo-600">신규 직무 창출 플랫폼</span>입니다.
        </p>

        <div className="flex justify-center gap-4 mb-16">
          <Link
            href="/demo"
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg"
          >
            데모 체험하기 →
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg"
          >
            로그인
          </Link>
          <a
            href="#features"
            className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-lg"
          >
            자세히 보기
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
            <div className="text-gray-600">실시간 모니터링</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">5-10%</div>
            <div className="text-gray-600">에너지 절감 목표</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">100+</div>
            <div className="text-gray-600">3년 내 일자리 목표</div>
          </div>
        </div>
      </section>

      {/* Disability Employment Focus */}
      <section className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold mb-4">
              중증장애인 고용 확대 핵심 솔루션
            </span>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-4">
              재택에서 전문가로 일하는<br />중증장애인 모니터링 요원
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              이동 제약이 있어도, 데이터로 빌딩을 관리하는<br />
              <span className="font-bold text-indigo-600">안정적이고 전문적인 일자리</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Remote Work */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-purple-500">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">🏠</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">완전 재택근무</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 text-purple-600">✓</span>
                  <span>출퇴근 부담 ZERO - 집에서 전문가로 근무</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-600">✓</span>
                  <span>장애 정도에 관계없이 동등한 기회</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-600">✓</span>
                  <span>지체/뇌병변 중증장애인에게 최적화</span>
                </li>
              </ul>
            </div>

            {/* Professional Role */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-indigo-500">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">📊</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">전문성 발휘</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-600">✓</span>
                  <span>실시간 IoT 센서 데이터 모니터링</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-600">✓</span>
                  <span>이상 패턴 분석 및 조치 판단</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-indigo-600">✓</span>
                  <span>AI 보조로 정확한 의사결정 지원</span>
                </li>
              </ul>
            </div>

            {/* Career Growth */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-blue-500">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">📈</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">커리어 성장</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600">✓</span>
                  <span>ESG 데이터 분석가로 성장 가능</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600">✓</span>
                  <span>빌딩 에너지 관리 전문가 인증 취득</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600">✓</span>
                  <span>경력에 따른 급여 상승 체계</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8">
            <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              중증장애인 모니터링 요원의 하루
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌅</span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">오전 9시</p>
                <p className="text-sm text-gray-600">집에서 PC로 근무 시작<br />빌딩 센서 상태 점검</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🚨</span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">오전 10시</p>
                <p className="text-sm text-gray-600">자동문 고장 알림 수신<br />긴급 작업지시서 발행</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">오후 2시</p>
                <p className="text-sm text-gray-600">전력 사용 패턴 분석<br />에너지 절감 제안</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="font-semibold text-gray-900 mb-1">오후 5시</p>
                <p className="text-sm text-gray-600">일일 모니터링 보고서<br />작성 및 제출</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            해결하고자 하는 문제
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <h4 className="text-xl font-bold text-red-900 mb-3">기업/기관의 어려움</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>ESG 공시 의무화에 따른 에너지 관리 압박</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>24시간 상시 모니터링의 한계</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>장애인 편의시설 고장의 사후 발견</span>
                </li>
              </ul>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
              <h4 className="text-xl font-bold text-orange-900 mb-3">중증장애인 고용의 한계</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>이동 제약으로 인한 출퇴근의 어려움</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>단순 업무에 편중된 재택 직무</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>전문성을 발휘할 커리어 경로 부족</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 text-center">
            <h4 className="text-2xl font-bold mb-4">BEMO 플랫폼의 솔루션</h4>
            <p className="text-lg max-w-3xl mx-auto">
              IoT 기술과 중증장애인의 전문성을 결합하여<br />
              데이터 기반 예방적 빌딩 관리로 전환하고<br />
              안정적이고 전문적인 일자리를 창출합니다
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">
            핵심 기능
          </h3>
          <p className="text-gray-600 text-center mb-12">
            빌딩의 디지털 주치의, ESG 데이터 분석가
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* E - Environment */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">E - 환경 모니터링</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>전력, 가스, 수도 사용량 실시간 추적</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>이상 패턴 및 누수 조기 발견</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>공조 시스템 최적화 제안</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-600">✓</span>
                  <span>CO2, 미세먼지, 온습도 분석</span>
                </li>
              </ul>
            </div>

            {/* S - Social */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">S - 사회 모니터링</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600">✓</span>
                  <span>장애인 편의시설 상태 원격 점검</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600">✓</span>
                  <span>자동문, 승강기, 충전기 작동 확인</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600">✓</span>
                  <span>고장 발생 시 즉시 긴급 출동 요청</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-600">✓</span>
                  <span>소방 센서, 비상구 안전 관리</span>
                </li>
              </ul>
            </div>

            {/* G - Governance */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">G - 거버넌스 리포팅</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2 text-purple-600">✓</span>
                  <span>월별 에너지 사용량 보고서</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-600">✓</span>
                  <span>탄소 배출량 환산 데이터</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-600">✓</span>
                  <span>편의시설 점검 이력 관리</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-600">✓</span>
                  <span>AI 기반 개선 제안</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            핵심 기술
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <Building2 className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h5 className="font-bold text-gray-900 mb-2">IoT 센서</h5>
              <p className="text-sm text-gray-600">실시간 데이터 수집</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <LineChart className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h5 className="font-bold text-gray-900 mb-2">AI 분석</h5>
              <p className="text-sm text-gray-600">이상 패턴 자동 탐지</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <ShieldCheck className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h5 className="font-bold text-gray-900 mb-2">실시간 알림</h5>
              <p className="text-sm text-gray-600">즉각적인 대응 체계</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <TrendingDown className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h5 className="font-bold text-gray-900 mb-2">데이터 분석</h5>
              <p className="text-sm text-gray-600">예방적 관리 전환</p>
            </div>
          </div>
        </div>
      </section>

      {/* Expected Impact */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            기대 효과
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">고용 확대</h4>
              <p className="text-gray-600">
                시범사업 15개 일자리 창출<br />
                3년 내 100개 이상 확산
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">환경 개선</h4>
              <p className="text-gray-600">
                에너지 사용량 5-10% 절감<br />
                탄소중립 목표 기여
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">사회적 가치</h4>
              <p className="text-gray-600">
                장애인 편의시설 안전 보장<br />
                인식 개선 및 포용성 증진
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            지금 시작하세요
          </h3>
          <p className="text-xl text-indigo-100 mb-8">
            4차 산업혁명 기술로 만드는 지속가능한 미래
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/demo"
              className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
            >
              데모 체험하기 →
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              로그인
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-xl font-bold mb-2">BEMO Platform</h4>
          <p className="text-gray-400 mb-4">Building ESG Monitoring Officer</p>
          <p className="text-sm text-gray-500">
            🏆 2025 중증장애인 고용확대 아이디어 공모전 출품작
          </p>
        </div>
      </footer>
    </div>
  )
}
