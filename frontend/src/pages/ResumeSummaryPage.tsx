export default function ResumeSummaryPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="text-center py-8 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-4">이력서</h1>
      </div>

      {/* 인적사항 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">👤</span>
          인적사항
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 w-20">이름</span>
            <span className="text-white font-medium">최대열</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 w-20">연락처</span>
            <span className="text-blue-400">010-5711-7309</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 w-20">이메일</span>
            <a href="mailto:eoduf1292@naver.com" className="text-blue-400 hover:underline">
              eoduf1292@naver.com
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 w-20">블로그</span>
            <a
              href="https://github.com/onedayonepaper/til"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline text-sm"
            >
              github.com/onedayonepaper/til
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 w-20">GitHub</span>
            <a
              href="https://github.com/onedayonepaper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline text-sm"
            >
              github.com/onedayonepaper
            </a>
          </div>
        </div>
      </section>

      {/* 학력 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          학력
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-300">
          <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full w-fit">
            2014.03 ~ 2020.02
          </span>
          <div>
            <span className="text-white font-medium">조선대학교</span>
            <span className="text-gray-400 mx-2">|</span>
            <span>용접접합과학공학과</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-emerald-400">학사 (GPA 3.4/4.5)</span>
          </div>
        </div>
      </section>

      {/* 경력사항 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💼</span>
          경력사항
        </h2>
        <div className="space-y-4">
          {/* 주요 경력 */}
          <div className="space-y-3">
            {[
              { company: '다온플레이스(주)', role: 'Web/Backend Developer', period: '2024.12.19 ~ 2026.01.01', isMain: true },
              { company: '앤솔루션', role: 'Web/Backend Developer', period: '2024.04.15 ~ 2024.12', isMain: true },
              { company: '브레인드넷 주식회사', role: 'Web/Backend Developer', period: '2022.11.07 ~ 2024.03.08', isMain: true },
            ].map((career, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-400 bg-gray-600 px-2 py-0.5 rounded w-fit">
                  {career.period}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{career.company}</span>
                  <span className="text-blue-400 text-sm">{career.role}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 기타 경력 */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <h3 className="text-sm text-gray-400 mb-3">기타 경력</h3>
            <div className="space-y-2 text-sm">
              {[
                { company: '주식회사 다온', role: 'Developer (Maintenance/Support)', period: '2022.01.13 ~ 2022.04.26', desc: '운영 시스템 기능 수정 및 유지보수 지원' },
                { company: '한국생산기술연구원', role: 'Technical Support', period: '', desc: '연구/업무 지원 및 데이터/문서 정리' },
                { company: '주식회사 아이엘알', role: 'Developer Support', period: '2020.12.31 ~ 2021.07.01', desc: '웹 시스템 운영 지원 및 기능 개선 보조' },
                { company: '주식회사 미디어온', role: 'Developer Support', period: '', desc: '단기 개발 지원 - 운영 보조 및 요청사항 처리' },
                { company: '(주)아성은', role: 'IT/Operations Support', period: '2019.07.21 ~ 2020.02.11', desc: 'IT/운영 지원 및 업무 프로세스 보조' },
              ].map((career, idx) => (
                <div key={idx} className="flex flex-col gap-1 p-2 hover:bg-gray-700/30 rounded transition-colors">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-300">{career.company}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-400">{career.role}</span>
                    {career.period && (
                      <>
                        <span className="text-gray-500">|</span>
                        <span className="text-gray-500 text-xs">{career.period}</span>
                      </>
                    )}
                  </div>
                  <span className="text-gray-500 text-xs pl-2">└ {career.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 자격증 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📜</span>
          자격증
        </h2>
        <div className="space-y-2">
          {[
            { name: '컴퓨터활용능력 2급', issuer: '대한상공회의소' },
            { name: 'PC정비사 2급', issuer: '한국정보통신자격협회' },
            { name: '네트워크관리사 2급', issuer: '한국정보통신자격협회' },
          ].map((cert, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded transition-colors">
              <span className="text-yellow-400">•</span>
              <span className="text-white">{cert.name}</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400 text-sm">{cert.issuer}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 기술 스택 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🛠️</span>
          기술 스택
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'PHP(레거시)', color: 'purple' },
            { name: 'JSP/Servlet', color: 'blue' },
            { name: 'Oracle SQL', color: 'red' },
            { name: 'JavaScript', color: 'yellow' },
            { name: 'HTML/CSS', color: 'orange' },
            { name: '운영장애 대응', color: 'emerald' },
            { name: '권한/접근제어', color: 'cyan' },
            { name: '데이터 정합성', color: 'pink' },
            { name: '리포트/통계', color: 'indigo' },
            { name: 'Linux', color: 'gray' },
          ].map((tech, idx) => {
            const colorMap: Record<string, string> = {
              purple: 'bg-purple-500/20 text-purple-300',
              blue: 'bg-blue-500/20 text-blue-300',
              red: 'bg-red-500/20 text-red-300',
              yellow: 'bg-yellow-500/20 text-yellow-300',
              orange: 'bg-orange-500/20 text-orange-300',
              emerald: 'bg-emerald-500/20 text-emerald-300',
              cyan: 'bg-cyan-500/20 text-cyan-300',
              pink: 'bg-pink-500/20 text-pink-300',
              indigo: 'bg-indigo-500/20 text-indigo-300',
              gray: 'bg-gray-500/20 text-gray-300',
            }
            return (
              <span key={idx} className={`px-3 py-1.5 rounded-lg text-sm ${colorMap[tech.color]}`}>
                {tech.name}
              </span>
            )
          })}
        </div>
      </section>

      {/* 자기소개 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          자기소개
        </h2>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            레거시 웹 시스템(PHP/JSP) 기반의 업무 시스템 유지보수·고도화, Oracle 중심의 데이터 처리/조회 성능 개선,
            운영 환경에서의 장애 대응과 안정화 경험을 보유한 개발자입니다.
          </p>
          <p>
            요구사항 정리부터 개발·배포·운영 대응까지 전 과정을 책임지고, 현업 사용자 관점에서
            <span className="text-emerald-400 font-medium">"실제로 쓰이는 기능"</span>을 빠르게 개선하는 데 강점이 있습니다.
          </p>
        </div>
      </section>

      {/* 핵심역량 */}
      <section className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          핵심역량
        </h2>
        <div className="space-y-3">
          {[
            {
              title: '레거시 시스템 유지보수/고도화',
              desc: '기능 개선, 버그 수정, 프로세스 개선, 운영 안정화',
              color: 'blue'
            },
            {
              title: 'Oracle SQL 기반 데이터 처리',
              desc: '복잡 조회/리포트, 성능 개선(조인 구조 개선, 인덱스 고려, 쿼리 리팩터링)',
              color: 'red'
            },
            {
              title: '운영 장애 대응',
              desc: '로그 기반 원인 분석, 핫픽스/배포, 재발 방지(예외처리/검증 강화)',
              color: 'emerald'
            },
            {
              title: '권한/접근제어',
              desc: '시스템 접근 제한, 권한 기반 메뉴/기능 제어, 데이터 노출 통제',
              color: 'yellow'
            },
            {
              title: '협업/커뮤니케이션',
              desc: '현업 요구사항 정의 → 개발 반영 → 운영 피드백 반영의 반복 개선 사이클',
              color: 'purple'
            },
          ].map((item, idx) => {
            const colorMap: Record<string, string> = {
              blue: 'text-blue-400',
              red: 'text-red-400',
              emerald: 'text-emerald-400',
              yellow: 'text-yellow-400',
              purple: 'text-purple-400',
            }
            return (
              <div key={idx} className="flex items-start gap-3">
                <span className={`font-semibold whitespace-nowrap ${colorMap[item.color]}`}>
                  {item.title}:
                </span>
                <span className="text-gray-300">{item.desc}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 푸터 */}
      <div className="text-center py-4 text-gray-500 text-sm">
        최종 수정일: {new Date().toLocaleDateString('ko-KR')}
      </div>
    </div>
  )
}
