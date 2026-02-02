import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'

interface JobCategory {
  id: string
  title: string
  icon: string
  description: string
  requirements: string[]
  examSubjects?: string[]
  benefits: string[]
  links: { label: string; url: string }[]
  notes?: string[]
}

const jobCategories: JobCategory[] = [
  {
    id: 'police-cyber',
    title: '경찰청 사이버수사대',
    icon: '👮',
    description: '사이버범죄 수사, 디지털 포렌식, 사이버 보안 업무를 담당하는 경찰 특채',
    requirements: [
      '연령: 20세 이상 40세 이하',
      '학력: 관련 학과 학사 이상 + 관련 경력',
      '또는: 관련 자격증 + 3년 이상 경력',
      '신체조건: 경찰공무원 신체조건 충족',
      '의무복무: 5년 6개월',
    ],
    benefits: [
      '경장 계급으로 임용',
      '경찰 복지 혜택 (의료, 주거 등)',
      '안정적인 공무원 신분',
      '사이버수사 전문가 경력 인정',
    ],
    links: [
      { label: '경찰청 채용', url: 'https://www.police.go.kr' },
      { label: '사이버수사국', url: 'https://cyberbureau.police.go.kr' },
    ],
    notes: [
      '경력경쟁채용으로 진행',
      '필기시험 + 체력검사 + 면접',
      '사이버범죄 수사, 디지털 증거분석 업무',
    ],
  },
  {
    id: 'fire-it',
    title: '소방청 정보통신(전산) 경력경쟁채용',
    icon: '🚒',
    description: '119 시스템, 소방정보망 구축/운영, 소방청 IT 인프라 관리 업무',
    requirements: [
      '연령: 18세 이상 40세 이하',
      '운전면허: 1종 대형 또는 보통 필수',
      '자격증: 정보처리기사/산업기사',
      '또는: 정보보안기사/산업기사',
      '또는: 방송통신/무선설비/정보통신 기사/산업기사',
      '또는: 빅데이터분석기사, 전자계산기조직응용기사 등',
    ],
    examSubjects: [
      '필기: 소방학개론, 소방관계법규, 행정법총론',
      '한국사: 한국사능력검정시험 성적 대체',
      '영어: 토익/토플/텝스 등 성적 대체',
      '체력시험 + 면접시험',
    ],
    benefits: [
      '소방공무원 복지 혜택',
      '안정적인 공무원 신분',
      '119 시스템 등 핵심 인프라 관리 경험',
      'IT 자격증만으로 지원 가능 (경력 불필요)',
    ],
    links: [
      { label: '소방청 119고시', url: 'https://119gosi.kr' },
      { label: '소방관이 되는 길', url: 'https://www.rokff.com/ccre-15/' },
      { label: '국가공무원 채용시스템', url: 'https://gongmuwon.gosi.kr' },
    ],
    notes: [
      '2026년 정보통신 분야 13명 채용 예정',
      '경력경쟁채용 방식 (자격증 기반)',
      '시도 소방본부별 채용',
      '원서접수: 2월 초, 필기: 3월, 최종발표: 5월',
    ],
  },
  {
    id: 'fire-investigator',
    title: '소방 화재조사관',
    icon: '🔥',
    description: '화재 원인 규명, CCTV/블랙박스 등 디지털 증거 분석, 디지털포렌식 업무',
    requirements: [
      '국립과학수사연구원 등에서 8주 이상 화재조사 전문교육 이수',
      '또는: 화재/소방 관련학과 2년제 이상 졸업',
      '또는: 화재조사 관련 업무 1년 이상 경력',
      '연령: 18세 이상 40세 이하 (소방공무원 기준)',
    ],
    examSubjects: [
      '1차(선택형): 화재조사론, 화재학, 화재원인판정',
      '2차(논문형): 화재감식학, 화재조사실무',
      '합격기준: 매 과목 40점 이상, 평균 60점 이상',
    ],
    benefits: [
      '소방공무원 복지 혜택',
      '디지털포렌식 전문가 경력',
      '과학수사 분야 전문성',
      '화재감식 및 증거분석 경험',
    ],
    links: [
      { label: '국가화재정보시스템', url: 'https://www.nfds.go.kr' },
      { label: '소방청 채용', url: 'https://www.nfa.go.kr/nfa/news/job/nfajob/' },
      { label: '한국화재조사학회', url: 'http://www.kififire.kr' },
    ],
    notes: [
      '화재현장 CCTV, 블랙박스, 스마트폰 등 디지털 증거 분석',
      '디지털포렌식 자격증 보유 시 유리',
      '특별채용(경력경쟁) 방식으로도 채용',
      '서울시 등 각 시도 소방본부에서 별도 채용',
    ],
  },
  {
    id: 'civil-servant-9',
    title: '전산직 9급 공무원',
    icon: '🏛️',
    description: '국가/지방 공공기관의 전산 시스템 구축, 운영, 유지보수 담당',
    requirements: [
      '연령: 18세 이상',
      '학력: 제한 없음',
      '결격사유 없을 것',
    ],
    examSubjects: [
      '공통: 국어, 영어, 한국사',
      '전공: 컴퓨터일반, 정보보호론',
    ],
    benefits: [
      '정년 보장 (60세)',
      '연금, 의료, 주거 복지',
      '워라밸 보장',
      '7급, 5급 승진 기회',
    ],
    links: [
      { label: '사이버국가고시센터', url: 'https://www.gosi.kr' },
      { label: '인사혁신처', url: 'https://www.mpm.go.kr' },
    ],
    notes: [
      '매년 국가직/지방직 채용',
      '경쟁률 높음 (30:1 ~ 100:1)',
      '전공 시험 난이도 상승 추세',
    ],
  },
  {
    id: 'military-civil',
    title: '군무원 전산직',
    icon: '🎖️',
    description: '국방부/각 군 본부의 정보체계 구축, 운영, 보안 업무 담당',
    requirements: [
      '연령: 18세 이상',
      '학력: 제한 없음 (7급 이상은 학력 요건 있음)',
      '신원조회 통과',
      '비밀취급 인가 가능자',
    ],
    examSubjects: [
      '9급: 정보보호론, 컴퓨터일반, 네트워크, 자료구조',
      '7급: 정보보호론, 데이터베이스, 소프트웨어공학, 네트워크',
    ],
    benefits: [
      '군무원 복지 혜택',
      '안정적인 신분',
      '국방 IT 분야 전문성',
      '군 관련 기관 취업 유리',
    ],
    links: [
      { label: '군무원 채용', url: 'https://recruit.mnd.go.kr' },
      { label: '국방부', url: 'https://www.mnd.go.kr' },
    ],
    notes: [
      '육군/해군/공군/국직 별도 채용',
      '보안 관련 업무로 신원조회 철저',
      '전산특기로 군 복무 경력 인정',
    ],
  },
  {
    id: 'nis',
    title: '국가정보원 IT직',
    icon: '🕵️',
    description: '국가 사이버안보, 정보보안 연구개발, 암호 기술 개발 등 첨단 보안 업무',
    requirements: [
      '연령: 채용 공고별 상이',
      '학력: 관련 학과 학사 이상 권장',
      '신원조회 및 보안심사 통과',
      '해외여행 결격사유 없을 것',
    ],
    benefits: [
      '특정직 7급 상당 임용',
      '국가 최고 수준 보안 기술 경험',
      '전문 교육 및 연구 기회',
      '높은 연봉 및 복지',
    ],
    links: [
      { label: '국가정보원 채용', url: 'https://www.nis.go.kr' },
    ],
    notes: [
      '채용 분야: 보안S/W개발, 보안관제, 사이버추적분석, 암호연구 등',
      '비공개 채용 진행',
      '보안심사 기간 수개월 소요',
      '합격 후에도 신원조사 진행',
    ],
  },
  {
    id: 'kisa',
    title: 'KISA (한국인터넷진흥원)',
    icon: '🌐',
    description: '인터넷 보안, 개인정보보호, 사이버 침해대응 등 국가 인터넷 정책 수행',
    requirements: [
      '학력: 관련 학과 학사 이상',
      '경력: 신입/경력 별도 채용',
      '관련 자격증 우대',
    ],
    benefits: [
      '준정부기관 복지',
      '정보보안 분야 최고 전문기관',
      '연구개발 및 정책 수립 경험',
      'CERT 등 실무 경험',
    ],
    links: [
      { label: 'KISA 채용', url: 'https://www.kisa.or.kr' },
      { label: 'KISA 아카데미', url: 'https://academy.kisa.or.kr' },
    ],
    notes: [
      '블라인드 채용 진행',
      '서류 → 필기 → 면접 절차',
      '정보보호, 개인정보보호, 디지털전환 분야',
      '나주 본원/서울 사무소 근무',
    ],
  },
]

const certifications = [
  {
    category: '정보보안',
    items: [
      { name: '정보보안기사', level: '기사', note: '가장 인정받는 보안 자격증' },
      { name: '정보보안산업기사', level: '산업기사', note: '정보보안기사 응시 전 취득 추천' },
      { name: 'CISSP', level: '국제', note: '경력 5년 이상 필요' },
      { name: 'CISA', level: '국제', note: '감사 분야 특화' },
    ],
  },
  {
    category: '디지털포렌식/화재조사',
    items: [
      { name: '디지털포렌식 2급', level: '민간', note: '현장 증거수집, 합격률 21%' },
      { name: '디지털포렌식 1급', level: '민간', note: '분석 전문가, 2급 취득 후 응시' },
      { name: '화재조사관', level: '국가', note: '8주 전문교육 이수 필요' },
      { name: '화재감식평가기사', level: '기사', note: '화재 원인 분석 전문' },
    ],
  },
  {
    category: '네트워크/시스템',
    items: [
      { name: '정보처리기사', level: '기사', note: '가장 기본적인 IT 자격증' },
      { name: '네트워크관리사', level: '민간', note: '네트워크 실무 능력' },
      { name: 'CCNA/CCNP', level: '국제', note: 'Cisco 네트워크 전문' },
      { name: 'LPIC/리눅스마스터', level: '국제/국가', note: '리눅스 서버 관리' },
    ],
  },
  {
    category: '클라우드/개발',
    items: [
      { name: 'AWS SAA/SAP', level: '국제', note: 'AWS 클라우드 아키텍트' },
      { name: 'SQLP/SQLD', level: '국가', note: '데이터베이스 전문가' },
      { name: '빅데이터분석기사', level: '기사', note: '데이터 분석 분야' },
    ],
  },
]

export default function PublicSectorITPage() {
  const [copied, setCopied] = useState(false)

  const copyTitles = () => {
    const titles = jobCategories.map(job => job.title).join('\n')
    navigator.clipboard.writeText(titles)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <PageHeader icon="🏛️" title="공공기관 IT 채용">
        <button
          onClick={copyTitles}
          className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {copied ? (
            <>✅ 복사됨</>
          ) : (
            <>📋 제목 복사</>
          )}
        </button>
      </PageHeader>

      {/* 소개 섹션 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
        <h2 className="text-xl font-bold mb-2">공공분야 IT 전문가 되기</h2>
        <p className="text-blue-100">
          경찰 사이버수사대, 소방청 전산직, 군무원, 국가정보원 등 공공기관에서
          IT/보안 전문가로 일할 수 있는 다양한 경로가 있습니다.
        </p>
      </div>

      {/* 채용 분야 카드 */}
      <div className="space-y-4 mb-8">
        {jobCategories.map((job) => (
          <div
            key={job.id}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{job.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{job.title}</h3>
                <p className="text-gray-400 text-sm">{job.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 자격요건 */}
              <div className="bg-gray-900/50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-blue-400 mb-2">📋 자격요건</h4>
                <ul className="space-y-1">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 시험과목 (있는 경우) */}
              {job.examSubjects && (
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-yellow-400 mb-2">📝 시험과목</h4>
                  <ul className="space-y-1">
                    {job.examSubjects.map((subj, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>{subj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 혜택 */}
              <div className="bg-gray-900/50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-green-400 mb-2">✨ 혜택</h4>
                <ul className="space-y-1">
                  {job.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 참고사항 */}
              {job.notes && (
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-purple-400 mb-2">💡 참고사항</h4>
                  <ul className="space-y-1">
                    {job.notes.map((note, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 링크 */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
              {job.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-sm rounded-lg transition-colors"
                >
                  🔗 {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 관련 자격증 섹션 */}
      <div className="bg-gray-800 rounded-2xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">📜 관련 자격증</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {certifications.map((cert) => (
            <div key={cert.category} className="bg-gray-900/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-400 mb-3">{cert.category}</h4>
              <div className="space-y-2">
                {cert.items.map((item, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">{item.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                        {item.level}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 준비 팁 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">💡 준비 팁</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <h4 className="text-purple-400 font-medium mb-2">기본 준비</h4>
            <ul className="space-y-1 text-sm">
              <li>• 정보처리기사 취득 (기본 자격)</li>
              <li>• 정보보안기사 준비 (보안 분야)</li>
              <li>• 컴퓨터일반, 네트워크 기초 학습</li>
              <li>• 관련 분야 경력 쌓기 (인턴, 프로젝트)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-pink-400 font-medium mb-2">차별화 전략</h4>
            <ul className="space-y-1 text-sm">
              <li>• CTF 대회 참가 (사이버보안)</li>
              <li>• 오픈소스 프로젝트 기여</li>
              <li>• 개인 보안 연구/블로그 운영</li>
              <li>• 관련 동아리/스터디 활동</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
