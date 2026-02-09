import { useState } from 'react'

// 경력 기간 계산 함수
function calculateCareerPeriod() {
  const careers = [
    { start: new Date('2024-12-19'), end: new Date('2026-01-01') }, // 다온플레이스
    { start: new Date('2024-04-15'), end: new Date('2024-12-18') }, // 앤솔루션
    { start: new Date('2022-11-07'), end: new Date('2024-03-08') }, // 브레인드넷
  ]

  let totalDays = 0
  careers.forEach(({ start, end }) => {
    totalDays += Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  })

  const years = Math.floor(totalDays / 365)
  const months = Math.floor((totalDays % 365) / 30)

  return { years, months, totalDays }
}

// 복사 아이콘 컴포넌트
function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${
        copied ? 'text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
      title="복사"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {copied ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        )}
      </svg>
    </button>
  )
}

// 섹션별 텍스트 데이터
const SECTION_TEXTS = {
  summary: `[경력 요약]
• 공공/대기업 내부 업무시스템의 운영·유지보수 및 신규 기능 개발 중심의 풀스택 개발 경험
• MSA 기반 플랫폼(Spring Boot + React)부터 레거시 시스템(PHP/JSP)까지, 다양한 아키텍처 환경에서의 개발·운영 경험 보유
• 현업 요구사항 분석부터 화면/로직/DB 설계, 배치 처리, 운영 반영, 장애 대응까지 서비스 생애주기 전반을 수행
• 주요 기술: Java/Spring Boot(MSA·배치), React(SPA), PHP/JSP(레거시 운영), Oracle/PostgreSQL(SQL 작성/튜닝), Linux 기반 서버 환경`,

  daon: `[다온플레이스(주)] 2024.12.19 ~ 2026.01.01
Web/Backend Developer | 한전KDN 파견 – 그룹웨어/업무지원 시스템 신규 개발 및 운영

[주요 수행업무]
• 한전 내부 직원(현업)이 작성한 화면설계서를 기반으로 업무 시스템을 PHP/JSP로 신규 구현하여 서비스에 반영
• 현업의 업무 요건을 분석하고, 화면 구조·입력 규칙·처리 흐름을 설계하여 실제 사용 가능한 시스템으로 구현
• Oracle DB 기반 데이터 조회/저장 로직 개발 및 SQL 작성, 오류·성능 이슈의 원인 분석과 개선
• 운영 장애 발생 시 로그 확인 → 재현 → 원인 분석 → 수정 반영의 체계적 대응 프로세스 수행
• 배포 전후 영향도 점검, 운영 환경 모니터링, 사용자 피드백을 반영한 지속적 품질 개선

[대표 작업]
• 화면설계서 기반 업무 시스템 신규 구축: 현업이 정의한 화면 명세를 PHP/JSP로 구현하고, DB 설계부터 화면 연동까지 일괄 수행
• 조회/리포트 화면의 응답 지연 원인 분석 → SQL 구조·조건 개선 및 인덱스 전략을 반영한 쿼리 최적화
• 사용자 권한에 따른 메뉴/데이터 접근 제어 로직 정비(세션·권한 조건 누락 케이스 보완)
• 데이터 정합성 이슈(누락/중복/조건 불일치) 발생 시, 데이터 흐름 추적 → 입력 검증 및 처리 로직 보완
• 운영 중 발생하는 500/예외 오류에 대해 재현 조건을 분해(권한/파라미터/시간대)하여 근본 원인 제거

[기술/환경] PHP, JSP, JavaScript, Oracle DB, SQL, Linux, WAS/웹서버`,

  ansolution: `[앤솔루션] 2024.04.15 ~ 2024.12
Web/Backend Developer | 한전KDN 파견 – 영업 시스템 운영 및 검침 데이터 배치 처리(Java/Spring)

[주요 수행업무]
• 외부 데이터 서버에서 일 단위로 수신되는 검침 데이터를 Spring Batch로 수집·가공하여, 본사 Oracle DB에 적재하는 배치 파이프라인 구축 및 운영
• 적재된 검침 데이터의 사용량 산출 로직을 설계하고, 화면에서 정확한 사용량을 조회할 수 있도록 계산 로직 및 조회 API 개발
• 영업 시스템 전반의 운영·유지보수: 장애 대응, 기능 개선, 데이터 정합성 이슈 처리, 운영 반영 지원
• 현업 요청 기반 변경 사항의 영향 범위 분석 → 개발/수정 → 테스트 → 운영 적용까지 전 과정 수행
• 운영 배포 시 변경점(코드/DB/설정/권한) 점검 및 스모크 테스트를 통한 안정적 릴리즈

[대표 작업]
• 검침 데이터 배치 처리 체계 구축: 데이터 서버 → Spring Batch 수집/변환 → 본사 DB 적재 → 사용량 산출까지의 End-to-End 파이프라인 설계·구현
• 사용량 계산 로직 정합성 확보: 검침 데이터의 기간별·구간별 사용량을 정확히 산출하도록 계산식을 설계하고, 화면 조회 결과와의 일치 검증
• 간헐적 장애/오류를 로그 기반으로 분류하여 재현 조건을 특정하고, 원인 코드·쿼리 수정으로 재발 방지
• 기능 변경 시 영향 범위를 화면/로직/DB 단위로 정리하고, 점검 항목을 표준화하여 운영 안정성 확보

[기술/환경] Java, Spring Boot, Spring Batch, JSP/Servlet, Oracle DB, SQL, Linux`,

  braindnet: `[브레인드넷(주)] 2022.11.07 ~ 2024.03.08
Full-Stack Developer | 광주인공지능사업단 ATOPS 플랫폼 – MSA 기반 신규 개발 및 운영

[주요 수행업무]
• MSA(Microservice Architecture) 기반 ATOPS 플랫폼 개발: Spring Boot + MyBatis 백엔드, React 프론트엔드로 구성된 서비스 설계·구현
• 도메인별 기술 스택 분리 운영 – 사업신청포털(React SPA), 교육지원포털/LMS(JSP 기반)
• Jenkins를 활용한 CI/CD 배포 파이프라인 운영, PostgreSQL 기반 데이터 관리
• 플랫폼 운영 지원: 서비스 안정화, 운영 모니터링, 장애·이슈 대응 및 사용자 문의 처리
• 플랫폼 내 기능 개선 및 운영 편의성 향상을 위한 수정 개발(관리자 기능, 데이터 조회/처리 등)
• 데이터/계정/권한 관련 이슈 처리 및 운영 정책 반영(접근 제어, 화면 노출, 처리 흐름 관리)

[대표 작업]
• 사업신청포털 프론트엔드 개발: React 기반 SPA로 사업 신청·조회·승인 화면을 구현하고, REST API와 연동하여 사용자 경험 최적화
• 교육지원포털(LMS) 기능 개발·운영: JSP 기반 강의 관리, 수강 신청, 학습 이력 조회 등 교육 도메인 기능 구현 및 유지보수
• Jenkins 배포 파이프라인 운영: 빌드·테스트·배포 자동화를 통한 안정적 릴리즈 관리
• 운영 중 발견되는 데이터 누락/중복/불일치 문제를 원인 단위로 분해하여 로직·검증 보강
• 반복되는 문의·처리 절차를 기능화하여 운영 부담을 줄이고, 사용자 안내 및 처리 흐름을 체계화

[기술/환경] Spring Boot, MyBatis, React, JSP, JavaScript, PostgreSQL, SQL, Jenkins, Linux, MSA`,

  skills: `[보유 역량 키워드]
• MSA/Spring Boot 개발: Spring Boot + MyBatis 기반 마이크로서비스 설계·구현, React SPA 프론트엔드 개발 경험
• 배치 처리/데이터 파이프라인: Spring Batch를 활용한 외부 데이터 수집 → 가공 → 적재 → 산출의 End-to-End 배치 체계 구축
• CI/CD: Jenkins 기반 빌드·배포 자동화 파이프라인 운영 경험
• 업무시스템 운영/유지보수: 장애 대응, 원인 분석, 안정화, 운영 반영 – 화면설계서 기반 신규 시스템 구축 포함
• DB/SQL: Oracle·PostgreSQL 쿼리 작성, 조건/조인 구조 개선, 배치 데이터 적재, 데이터 정합성 관점의 로직 보완
• 레거시 환경 대응: PHP/JSP 기반 시스템에서의 점진적 개선과 안정성 강화에 강점`,
}

export function CareerDescriptionContent() {
  const { years, months } = calculateCareerPeriod()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const copyText = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyAll = async () => {
    const fullText = `경력기술서 - 최대열
010-5711-7309 | eoduf1292@naver.com
총 경력 ${years}년 ${months}개월

${Object.values(SECTION_TEXTS).join('\n\n---\n\n')}`
    await navigator.clipboard.writeText(fullText)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 인적사항 + 전체복사 */}
      <div className="text-center py-4 border-b border-gray-700">
        <div className="flex items-center justify-center gap-3 mb-2">
          <button
            onClick={copyAll}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              copiedAll
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {copiedAll ? '복사됨!' : '전체 복사'}
          </button>
        </div>
        <div className="text-gray-400 space-y-1">
          <p className="text-lg font-medium text-white">최대열</p>
          <p>
            <span className="text-blue-400">010-5711-7309</span>
            {' | '}
            <a href="mailto:eoduf1292@naver.com" className="text-blue-400 hover:underline">
              eoduf1292@naver.com
            </a>
          </p>
          <p className="mt-2">
            <span className="inline-block bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
              총 경력 {years}년 {months}개월
            </span>
          </p>
        </div>
      </div>

      {/* 경력 요약 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          경력 요약
          <CopyButton copied={copiedId === 'summary'} onClick={() => copyText('summary', SECTION_TEXTS.summary)} />
        </h2>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>공공/대기업 내부 업무시스템의 운영·유지보수 및 신규 기능 개발 중심의 풀스택 개발 경험</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>MSA 기반 플랫폼(Spring Boot + React)부터 레거시 시스템(PHP/JSP)까지, 다양한 아키텍처 환경에서의 개발·운영 경험 보유</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>현업 요구사항 분석부터 화면/로직/DB 설계, 배치 처리, 운영 반영, 장애 대응까지 서비스 생애주기 전반을 수행</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">주요 기술:</strong> Java/Spring Boot(MSA·배치), React(SPA), PHP/JSP(레거시 운영), Oracle/PostgreSQL(SQL 작성/튜닝), Linux 기반 서버 환경
            </span>
          </li>
        </ul>
      </section>

      {/* 경력 1: 다온플레이스 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏢</span>
            다온플레이스(주)
            <CopyButton copied={copiedId === 'daon'} onClick={() => copyText('daon', SECTION_TEXTS.daon)} />
          </h2>
          <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
            2024.12.19 ~ 2026.01.01
          </span>
        </div>

        <div className="mb-4 text-gray-400">
          <span className="inline-block bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-sm mr-2">
            Web/Backend Developer
          </span>
          <span className="text-sm">한전KDN 파견 – 그룹웨어/업무지원 시스템 신규 개발 및 운영</span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">주요 수행업무</h3>
            <ul className="space-y-1.5 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>한전 내부 직원(현업)이 작성한 <strong className="text-white">화면설계서를 기반으로 업무 시스템을 PHP/JSP로 신규 구현</strong>하여 서비스에 반영</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>현업의 업무 요건을 분석하고, 화면 구조·입력 규칙·처리 흐름을 설계하여 실제 사용 가능한 시스템으로 구현</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Oracle DB 기반 데이터 조회/저장 로직 개발 및 SQL 작성, 오류·성능 이슈의 원인 분석과 개선</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>운영 장애 발생 시 로그 확인 → 재현 → 원인 분석 → 수정 반영의 체계적 대응 프로세스 수행</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>배포 전후 영향도 점검, 운영 환경 모니터링, 사용자 피드백을 반영한 지속적 품질 개선</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">대표 작업</h3>
            <ul className="space-y-1.5 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span><strong className="text-white">화면설계서 기반 업무 시스템 신규 구축:</strong> 현업이 정의한 화면 명세를 PHP/JSP로 구현하고, DB 설계부터 화면 연동까지 일괄 수행</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>조회/리포트 화면의 응답 지연 원인 분석 → SQL 구조·조건 개선 및 인덱스 전략을 반영한 쿼리 최적화</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>사용자 권한에 따른 메뉴/데이터 접근 제어 로직 정비(세션·권한 조건 누락 케이스 보완)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>데이터 정합성 이슈(누락/중복/조건 불일치) 발생 시, 데이터 흐름 추적 → 입력 검증 및 처리 로직 보완</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>운영 중 발생하는 500/예외 오류에 대해 재현 조건을 분해(권한/파라미터/시간대)하여 근본 원인 제거</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">기술/환경</h3>
            <div className="flex flex-wrap gap-2">
              {['PHP', 'JSP', 'JavaScript', 'Oracle DB', 'SQL', 'Linux', 'WAS/웹서버'].map(tech => (
                <span key={tech} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 경력 2: 앤솔루션 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏢</span>
            앤솔루션
            <CopyButton copied={copiedId === 'ansolution'} onClick={() => copyText('ansolution', SECTION_TEXTS.ansolution)} />
          </h2>
          <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
            2024.04.15 ~ 2024.12
          </span>
        </div>

        <div className="mb-4 text-gray-400">
          <span className="inline-block bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-sm mr-2">
            Web/Backend Developer
          </span>
          <span className="text-sm">한전KDN 파견 – 영업 시스템 운영 및 검침 데이터 배치 처리(Java/Spring)</span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">주요 수행업무</h3>
            <ul className="space-y-1.5 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>외부 데이터 서버에서 일 단위로 수신되는 <strong className="text-white">검침 데이터를 Spring Batch로 수집·가공</strong>하여, 본사 Oracle DB에 적재하는 배치 파이프라인 구축 및 운영</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>적재된 검침 데이터의 <strong className="text-white">사용량 산출 로직을 설계</strong>하고, 화면에서 정확한 사용량을 조회할 수 있도록 계산 로직 및 조회 API 개발</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>영업 시스템 전반의 운영·유지보수: 장애 대응, 기능 개선, 데이터 정합성 이슈 처리, 운영 반영 지원</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>현업 요청 기반 변경 사항의 영향 범위 분석 → 개발/수정 → 테스트 → 운영 적용까지 전 과정 수행</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>운영 배포 시 변경점(코드/DB/설정/권한) 점검 및 스모크 테스트를 통한 안정적 릴리즈</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">대표 작업</h3>
            <ul className="space-y-1.5 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span><strong className="text-white">검침 데이터 배치 처리 체계 구축:</strong> 데이터 서버 → Spring Batch 수집/변환 → 본사 DB 적재 → 사용량 산출까지의 End-to-End 파이프라인 설계·구현</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span><strong className="text-white">사용량 계산 로직 정합성 확보:</strong> 검침 데이터의 기간별·구간별 사용량을 정확히 산출하도록 계산식을 설계하고, 화면 조회 결과와의 일치 검증</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>간헐적 장애/오류를 로그 기반으로 분류하여 재현 조건을 특정하고, 원인 코드·쿼리 수정으로 재발 방지</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>기능 변경 시 영향 범위를 화면/로직/DB 단위로 정리하고, 점검 항목을 표준화하여 운영 안정성 확보</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">기술/환경</h3>
            <div className="flex flex-wrap gap-2">
              {['Java', 'Spring Boot', 'Spring Batch', 'JSP/Servlet', 'Oracle DB', 'SQL', 'Linux'].map(tech => (
                <span key={tech} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 경력 3: 브레인드넷 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏢</span>
            브레인드넷(주)
            <CopyButton copied={copiedId === 'braindnet'} onClick={() => copyText('braindnet', SECTION_TEXTS.braindnet)} />
          </h2>
          <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
            2022.11.07 ~ 2024.03.08
          </span>
        </div>

        <div className="mb-4 text-gray-400">
          <span className="inline-block bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-sm mr-2">
            Full-Stack Developer
          </span>
          <span className="text-sm">광주인공지능사업단 ATOPS 플랫폼 – MSA 기반 신규 개발 및 운영</span>
        </div>

        {/* 아키텍처 개요 */}
        <div className="mb-4 bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
          <div className="text-xs text-gray-500 mb-2 font-medium">아키텍처 개요</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-gray-400">Backend:</span>
              <span className="text-blue-300 font-medium">Spring Boot + MyBatis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-gray-400">Frontend:</span>
              <span className="text-cyan-300 font-medium">React (SPA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-gray-400">DB:</span>
              <span className="text-green-300 font-medium">PostgreSQL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-gray-400">CI/CD:</span>
              <span className="text-orange-300 font-medium">Jenkins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-gray-400">Architecture:</span>
              <span className="text-purple-300 font-medium">MSA</span>
            </div>
          </div>
        </div>

        {/* 도메인 구분 */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="text-blue-400 text-xs font-semibold mb-1">사업신청포털</div>
            <div className="text-gray-300 text-sm">React 기반 SPA</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <div className="text-amber-400 text-xs font-semibold mb-1">교육지원포털 (강의/LMS)</div>
            <div className="text-gray-300 text-sm">JSP 기반 웹 애플리케이션</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">주요 수행업무</h3>
            <ul className="space-y-1.5 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span><strong className="text-white">MSA 기반 ATOPS 플랫폼 개발:</strong> Spring Boot + MyBatis 백엔드, React 프론트엔드로 구성된 마이크로서비스 설계·구현</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>도메인별 기술 스택 분리 운영 – <strong className="text-white">사업신청포털(React SPA)</strong>, <strong className="text-white">교육지원포털/LMS(JSP)</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span><strong className="text-white">Jenkins</strong>를 활용한 CI/CD 배포 파이프라인 운영, <strong className="text-white">PostgreSQL</strong> 기반 데이터 관리</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>플랫폼 운영 지원: 서비스 안정화, 운영 모니터링, 장애·이슈 대응 및 사용자 문의 처리</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>플랫폼 내 기능 개선 및 운영 편의성 향상을 위한 수정 개발(관리자 기능, 데이터 조회/처리 등)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>데이터/계정/권한 관련 이슈 처리 및 운영 정책 반영(접근 제어, 화면 노출, 처리 흐름 관리)</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">대표 작업</h3>
            <ul className="space-y-1.5 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span><strong className="text-white">사업신청포털 프론트엔드 개발:</strong> React 기반 SPA로 사업 신청·조회·승인 화면을 구현하고, REST API와 연동하여 사용자 경험 최적화</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span><strong className="text-white">교육지원포털(LMS) 기능 개발·운영:</strong> JSP 기반 강의 관리, 수강 신청, 학습 이력 조회 등 교육 도메인 기능 구현 및 유지보수</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>운영 중 발견되는 데이터 누락/중복/불일치 문제를 원인 단위로 분해하여 로직·검증 보강</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>반복되는 문의·처리 절차를 기능화하여 운영 부담을 줄이고, 사용자 안내 및 처리 흐름을 체계화</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span><strong className="text-white">Jenkins 배포 파이프라인 운영:</strong> 빌드·테스트·배포 자동화를 통한 안정적 릴리즈 관리</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">기술/환경</h3>
            <div className="flex flex-wrap gap-2">
              {['Spring Boot', 'MyBatis', 'React', 'JSP', 'JavaScript', 'PostgreSQL', 'SQL', 'Jenkins', 'Linux', 'MSA'].map(tech => (
                <span key={tech} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 보유 역량 키워드 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          보유 역량 키워드
          <CopyButton copied={copiedId === 'skills'} onClick={() => copyText('skills', SECTION_TEXTS.skills)} />
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 font-semibold whitespace-nowrap">MSA/Spring Boot 개발:</span>
            <span className="text-gray-300">Spring Boot + MyBatis 기반 마이크로서비스 설계·구현, React SPA 프론트엔드 개발</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-cyan-400 font-semibold whitespace-nowrap">배치 처리/데이터 파이프라인:</span>
            <span className="text-gray-300">Spring Batch를 활용한 외부 데이터 수집 → 가공 → 적재 → 산출의 End-to-End 배치 체계 구축</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-orange-400 font-semibold whitespace-nowrap">CI/CD:</span>
            <span className="text-gray-300">Jenkins 기반 빌드·배포 자동화 파이프라인 운영 경험</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-emerald-400 font-semibold whitespace-nowrap">업무시스템 운영/유지보수:</span>
            <span className="text-gray-300">장애 대응, 원인 분석, 안정화, 운영 반영 – 화면설계서 기반 신규 시스템 구축 포함</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-yellow-400 font-semibold whitespace-nowrap">DB/SQL:</span>
            <span className="text-gray-300">Oracle·PostgreSQL 쿼리 작성, 조건/조인 구조 개선, 배치 데이터 적재, 데이터 정합성 관점의 로직 보완</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-purple-400 font-semibold whitespace-nowrap">레거시 환경 대응:</span>
            <span className="text-gray-300">PHP/JSP 기반 시스템에서의 점진적 개선과 안정성 강화에 강점</span>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <div className="text-center py-4 text-gray-500 text-sm">
        최종 수정일: {new Date().toLocaleDateString('ko-KR')}
      </div>
    </div>
  )
}

export default function CareerDescriptionPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center py-8 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-white">경력기술서</h1>
      </div>
      <CareerDescriptionContent />
    </div>
  )
}
