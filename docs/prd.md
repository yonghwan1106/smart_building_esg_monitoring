

## **제품 요구사항 명세서 (PRD): BEMO 플랫폼 (Building ESG Monitoring Officer Platform)**

| **문서 버전** | 1.0 | **작성일** | 2025-10-15 |
| :--- | :--- | :--- | :--- |
| **제품명** | BEMO (Building ESG Monitoring Officer) 플랫폼 | **작성자** | (본인 이름/팀명) |

### **1. 개요 (Overview)**

**1.1. 목표 (Objective)**
BEMO 플랫폼은 IoT, AI, 데이터 분석 기술을 융합하여 중증장애인이 재택에서 전문적인 '스마트 빌딩 ESG 모니터링 요원'으로 활동할 수 있도록 지원하는 원격 관제 솔루션이다. 본 프로토타입의 목표는 해당 직무의 원격근무 현실성을 입증하고, 데이터 기반의 건물 관리가 어떻게 ESG 가치(환경 보호, 사회적 책임)를 실현하는지 구체적으로 시연하는 것이다.

**1.2. 핵심 문제 및 해결 방안**

  * **문제:** 기업들은 ESG 경영 압박으로 건물 관리 효율화가 절실하지만 24시간 전문적인 모니터링은 비용 부담이 크다. 동시에, 이동에 제약이 있는 중증장애인은 전문성을 발휘할 수 있는 안정적인 재택 일자리가 부족하다.
  * **해결:** 빌딩 내 IoT 센서 데이터를 클라우드로 통합하고, 중증장애인 모니터링 요원이 원격 대시보드를 통해 이를 분석 및 관리하는 시스템을 구축한다. AI와 Python 기반 데이터 분석을 통해 단순 모니터링을 넘어 예측 및 분석 기반의 고부가가치 직무를 창출한다.

**1.3. 대상 사용자 (User Personas)**

1.  **모니터링 요원 (핵심 사용자):** 이동에 제약이 있는 중증장애인. 데이터 분석과 문제 해결에 강점이 있으며, 안정적이고 전문적인 재택근무를 원한다.
2.  **빌딩 현장 관리자:** 모니터링 요원으로부터 생성된 작업 지시(티켓)를 받아 현장 조치를 수행하는 인력. 신속하고 정확한 문제 상황 전달을 중요하게 생각한다.
3.  **시스템 관리자:** 플랫폼에 신규 빌딩을 등록하고, 센서 정보를 연동하며, 사용자 계정을 관리하는 역할.

### **2. 기능 요구사항 (Features & Functionalities)**

#### **2.1. 공통 기능**

  * **사용자 인증 (Supabase Auth):**
      * 역할 기반 접근 제어(RBAC): '모니터링 요원', '현장 관리자', '관리자' 역할에 따라 접근 가능한 메뉴와 데이터 범위를 분리.
      * 이메일/비밀번호 기반의 안전한 로그인 시스템.

#### **2.2. 모니터링 요원 대시보드 (PC 웹 - 접근성 최우선)**

  * **메인 대시보드:**
      * 담당 빌딩의 위치를 보여주는 지도 (Naver Maps API).
      * 핵심 ESG 지표 실시간 현황:
          * **E (환경):** 총 전력 사용량(kWh), 실시간 전력 부하(kW), 구역별 온/습도, CO2 농도.
          * **S (사회):** 장애인 화장실 자동문/비상벨 상태, 승강기 운행 상태, 휠체어 충전기 사용 현황.
      * **실시간 알림 피드 (Supabase Realtime):** 임계치 초과, 센서 오류, 시설 고장 등 새로운 이벤트가 발생하면 즉시 피드에 표시.
  * **상세 분석 페이지:**
      * **에너지 분석:** 특정 기간의 전력 사용량 추이를 시각화한 차트 제공. Python 분석 모듈과 연동하여 비정상적인 에너지 패턴을 감지하고 표시.
      * **시설 관리:** 각 편의시설의 상태 이력 및 점검 내역 조회.
  * **이슈 티켓팅 시스템:**
      * 알림 확인 후, 문제 상황, 심각도, 조치 요청 사항을 기재하여 '이슈 티켓' 생성.
      * 생성된 티켓을 현장 관리자에게 할당하고 처리 상태(신규/처리중/완료) 추적.
  * **AI 리포트 어시스턴트 (Claude Sonnet 4 API):**
      * 특정 이슈 티켓에 대해 'AI 분석 요청' 버튼 클릭 시, 관련 센서 데이터와 이슈 내용을 Claude API에 전송.
      * Claude는 **문제 원인 추정, 예상 영향, 조치 권고안**이 포함된 분석 보고서 초안을 생성하여 티켓에 자동으로 추가. 이는 요원의 판단을 돕는 보조 도구 역할을 함.

#### **2.3. Python 기반 핵심 분석 기능 (Vercel Serverless Function)**

  * **이상 패턴 탐지 (Anomaly Detection):**
      * **트리거:** 매시간 정각 또는 모니터링 요원의 요청 시 실행.
      * **프로세스:** Next.js 백엔드가 Supabase DB에서 최근 24시간의 특정 센서(예: 전력량계) 데이터를 조회하여 Vercel에 배포된 Python 서버리스 함수로 전송.
      * **Python 로직:** `Pandas` 라이브러리로 데이터를 처리하고, 통계적 기법(예: Z-score, 이동 평균)이나 간단한 머신러닝 모델(`scikit-learn`)을 사용하여 평소와 다른 이상 패턴을 탐지.
      * **결과:** 탐지된 이상 패턴 정보(시간, 값, 심각도)를 JSON 형태로 반환. Next.js는 이 결과를 받아 Supabase `alerts` 테이블에 저장하고, 실시간 알림을 통해 요원에게 통보.

#### **2.4. 현장 관리자용 기능 (모바일 웹)**

  * 자신에게 할당된 이슈 티켓 목록 확인.
  * 티켓 상세 내용(문제, 위치, AI 분석 보고서) 확인.
  * 현장 조치 후, 사진과 함께 처리 결과 보고 및 티켓 상태 변경.

### **3. 기술 명세 (Technical Specifications)**

| 구분 | 기술 스택 | 설명 |
| :--- | :--- | :--- |
| **프론트엔드** | **Next.js 14+ (App Router), TypeScript, Tailwind CSS** | - 서버 컴포넌트를 활용하여 초기 로딩 성능 최적화. [1]<br>- `shadcn/ui`를 사용하여 접근성이 뛰어난 전문적인 UI 컴포넌트 구축. [2, 3]<br>- 모든 인터페이스는 WCAG 2.1 AA 레벨 준수를 목표로 개발. |
| **백엔드/DB** | **Supabase (PostgreSQL, Auth, Realtime, Storage)** | - PostgreSQL DB에 빌딩, 센서, 사용자, 알림 등 모든 데이터 저장. [4, 5]<br>- Supabase Auth를 통한 역할 기반 인증 시스템 구현. [6, 7]<br>- Supabase Realtime을 사용하여 알림 피드 등 실시간 데이터 업데이트 기능 구현. [8, 9] |
| **배포/인프라** | **Vercel, GitHub** | - GitHub 레포지토리와 Vercel 프로젝트를 연동하여 CI/CD 파이프라인 자동화. [10] |
| **핵심 로직 (서버리스)** | **Python 3.9+ on Vercel Serverless Functions** | - `pandas`, `scikit-learn` 등 데이터 분석 라이브러리를 활용한 이상 패턴 탐지 로직 개발.<br>- Next.js API Route에서 이 Python 함수를 호출하여 결과를 받아오는 방식으로 통합. |
| **AI 어시스턴트** | **Claude Sonnet 4 API** | - 이슈 발생 시 상황 분석 및 보고서 초안 생성을 위한 LLM. [11, 12]<br>- Next.js 서버 액션(Server Action) 내에서 Anthropic SDK를 사용하여 안전하게 API 호출. [13] |
| **지도** | **Naver Maps API** | - `react-naver-maps` 라이브러리를 사용하여 담당 빌딩의 위치를 시각적으로 표시. [14, 15, 16] |
| **(제안) 차트 API** | **Recharts / Chart.js** | - 센서 데이터의 시계열 변화를 직관적으로 보여주기 위한 데이터 시각화 라이브러리. |
| **(제안) 알림 API** | **NCP SENS (Naver Cloud Platform)** | - 심각도 높은 긴급 알림 발생 시, 현장 관리자에게 SMS/알림톡을 발송하기 위한 외부 서비스. |

### **4. 데이터베이스 스키마 (Supabase PostgreSQL)**

*(주요 테이블 예시)*

  * **`buildings`**: id, name, address, location (geography 타입)
  * **`sensors`**: id, building\_id, type (ENERGY, TEMP, CO2, DOOR\_STATUS), name, location\_detail
  * **`sensor_readings`**: id, sensor\_id, value, read\_at (timestamp with time zone)
  * **`alerts`**: id, sensor\_id, alert\_type (THRESHOLD, ANOMALY), severity (CRITICAL, WARNING), description, status (NEW, ACKNOWLEDGED), triggered\_at
  * **`users` (profiles)**: id (auth.users.id FK), full\_name, role (AGENT, MANAGER, ADMIN)
  * **`issue_tickets`**: id, alert\_id, created\_by (user\_id), assigned\_to (user\_id), title, details, status (OPEN, IN\_PROGRESS, CLOSED)

### **5. MVP(최소 기능 제품) 범위**

공모전 제출용 프로토타입은 핵심 직무의 현실성을 증명하는 데 집중한다.

1.  **사용자 범위:** 모니터링 요원 역할에 집중.
2.  **핵심 기능:**
      * 로그인 후 나타나는 **모니터링 요원 대시보드**.
      * **1개 가상 빌딩**에 대한 **시뮬레이션 데이터** 실시간 표시 (전력량, CO2, 장애인 화장실 문 상태).
      * 미리 정의된 시나리오에 따라 **실시간 알림 피드**에 새로운 알림이 발생하는 기능.
      * 알림 클릭 시, **'AI 분석 요청'** 버튼을 누르면 Claude API가 생성한 분석 결과가 화면에 표시되는 기능.
      * 에너지 사용량 차트에서 **'Python 이상 패턴 분석 실행'** 버튼을 누르면, Vercel의 Python 함수가 실행되고 차트 상의 특정 데이터 포인트를 '이상치'로 하이라이트하는 기능.

-----