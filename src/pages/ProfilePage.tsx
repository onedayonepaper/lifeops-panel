import { PageHeader } from '../components/PageHeader'

export default function ProfilePage() {
  return (
    <div>
      <PageHeader icon="🧠" title="프로필" />

      <div className="space-y-6">
        {/* 강점 섹션 */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-green-400">💪</span> 나의 강점
          </h2>

          <div className="space-y-6">
            {/* 강점 1 */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-400 font-bold text-lg mb-2">
                1) "운영/실사용" 관점이 강함
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 그냥 만드는 게 아니라 <strong className="text-white">집에서 관제</strong>, <strong className="text-white">실제로 돌아가게</strong>, <strong className="text-white">유지보수까지</strong>를 계속 생각함.</li>
                <li>• 이건 취업/포폴에서 큰 장점("끝까지 운영해 본 사람"이 드묾).</li>
              </ul>
            </div>

            {/* 강점 2 */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-400 font-bold text-lg mb-2">
                2) 구조화/설계형 사고
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• PRD, API, DB 스키마, 폴더 구조처럼 <strong className="text-white">틀을 잡고 시작</strong>하려는 성향.</li>
                <li>• "AI 바이브코딩"처럼 <strong className="text-white">명확한 개발지시서 형태로 뽑아내는 능력</strong>이 강함.</li>
              </ul>
            </div>

            {/* 강점 3 */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-400 font-bold text-lg mb-2">
                3) 현실적인 의사결정(효율 감각)
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• "이미 있는 완제품+앱이면 굳이?" 같은 판단을 잘 함.</li>
                <li>• 이건 <strong className="text-white">시간/돈/리스크 최적화</strong>에 강하다는 뜻.</li>
              </ul>
            </div>

            {/* 강점 4 */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-400 font-bold text-lg mb-2">
                4) 꾸준히 개선/반복하는 스타일
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 한 번 만든 걸 "다시 정리", "더 구체화"로 계속 다듬는 편.</li>
                <li>• 단, 아래 '성향' 때문에 <strong className="text-white">너무 많은 선택지가 생기면 흔들림</strong>도 같이 옴.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 성향 섹션 */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-yellow-400">⚡</span> 나의 성향 (장점 + 주의점)
          </h2>

          <div className="space-y-6">
            {/* 성향 1 */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">
                1) 단순한 흐름을 좋아함
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 일정/할 일은 <strong className="text-white">심플해야</strong> 하고, 복잡해지면 포기하고 싶은 경향(너도 인정한 부분).</li>
                <li>• 그래서 "프로젝트도 단순한 MVP 1개"가 제일 잘 맞음.</li>
              </ul>
            </div>

            {/* 성향 2 */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">
                2) 몰아서 끝내고 쉬는 타입
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 쪼개서 꾸준히보단, <strong className="text-white">한 번에 집중해서 성과 내는</strong> 방식이 잘 맞음.</li>
                <li>• 반대로 매일 조금씩 하려면 스트레스가 커질 수 있음.</li>
              </ul>
            </div>

            {/* 성향 3 */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">
                3) 변덕/충동이 있음 (하지만 활용 가능)
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• "갑자기 이거 하고 싶다"가 자주 옴.</li>
                <li>• 단점처럼 보이지만, 이건 <strong className="text-white">탐색 능력</strong>이기도 해서</li>
                <li className="ml-4">→ 규칙만 잡으면(예: "메인 1개 + 서브 1개만") 장점으로 바뀜.</li>
              </ul>
            </div>

            {/* 성향 4 */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">
                4) 물리/하드웨어 시행착오에는 에너지 소모가 큼
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 부품/배선/전기처럼 "손으로 해결해야 하는 디버깅"은 스트레스가 커지는 편.</li>
                <li>• 그래서 <strong className="text-white">하드웨어는 사서 쓰고</strong>, 너는 <strong className="text-white">소프트웨어/운영</strong>에 집중하는 게 효율 최상.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 잘 맞는 프로젝트/일 스타일 */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-blue-400">🎯</span> 잘 맞는 프로젝트/일 스타일
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 잘 맞는 것 */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-blue-400 font-bold text-lg mb-3">✅ 잘 맞는 것</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• <strong className="text-white">모니터링/관제/알림/로그/자동화</strong> (HomePulse 같은)</li>
                <li>• API 연동, 데이터 수집, 대시보드, 운영툴</li>
                <li>• "작지만 매일 돌아가는 서비스"</li>
              </ul>
            </div>

            {/* 덜 맞는 것 */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h3 className="text-red-400 font-bold text-lg mb-3">❌ 덜 맞는 것</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 부품 수급/납땜/전기규격 등 하드웨어 중심 제품화</li>
                <li>• 선택지가 너무 많은 오픈엔디드 프로젝트(끝이 안 보이는 것)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 최적의 실행 규칙 */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-purple-400">📋</span> 최적의 실행 규칙 (실패 방지)
          </h2>

          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <p className="text-gray-300">
                  <strong className="text-white">프로젝트는 항상 1개만 메인</strong> (서브는 "메모장"에만)
                </p>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <p className="text-gray-300">
                  목표는 "기능 10개"가 아니라 <strong className="text-white">운영 1주일</strong> 같은 결과로 잡기
                </p>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <p className="text-gray-300">
                  "만들까 말까" 고민이 들면: <strong className="text-white">완제품으로 먼저 운영 → 불편함이 확실할 때만 제작</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
