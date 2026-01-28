import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleDocs, type ResumeData, type Education, type Experience, type Certification, type Project } from '../hooks/useGoogleDocs'

const emptyEducation: Education = {
  school: '',
  major: '',
  degree: '',
  startDate: '',
  endDate: ''
}

const emptyProject: Project = {
  name: '',
  summary: '',
  role: '',
  tasks: [],
  techStack: '',
  result: ''
}

const emptyExperience: Experience = {
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
  projects: []
}

const emptyCertification: Certification = {
  name: '',
  issuer: '',
  date: ''
}

const initialFormData: ResumeData = {
  personalInfo: {
    name: '최대열',
    birthDate: '',
    phone: '010-5711-7309',
    email: 'eoduf1292@naver.com',
    address: '',
    blog: 'https://github.com/onedayonepaper/til',
    github: 'https://github.com/onedayonepaper',
    portfolio: ''
  },
  education: [
    {
      school: '조선대학교',
      major: '용접접합과학공학과',
      degree: '학사 (GPA 3.4/4.5)',
      startDate: '2014.03',
      endDate: '2020.02'
    }
  ],
  experience: [
    {
      company: '다온플레이스(주)',
      position: 'Web/Backend Developer',
      startDate: '2024.12.19',
      endDate: '현재',
      description: '',
      projects: [
        {
          name: '사내 업무시스템 기능 개선 및 고도화',
          summary: '현업 사용자의 업무 흐름(등록/조회/처리)을 더 빠르고 오류 없이 수행할 수 있도록 기능 개선과 화면/로직 고도화 수행',
          role: '요구사항 정리 → 개발 → 운영 반영 → 피드백 기반 개선의 전체 사이클 담당',
          tasks: [
            '업무 화면의 입력 검증/예외처리 강화로 오류 케이스 감소',
            '데이터 처리 로직을 업무 규칙에 맞게 정리하고 케이스 분기 정교화',
            '운영 중 빈번하게 발생하는 문의/이슈를 기능 개선으로 연결해 반복 발생 원인 제거'
          ],
          techStack: 'PHP, JSP/Servlet, Oracle, JavaScript, Linux 운영 환경',
          result: '현업 사용 흐름의 안정성과 일관성 향상, 운영 대응 부담 감소'
        },
        {
          name: '권한/접근제어 체계 정비',
          summary: '사용자/조직/권한에 따라 메뉴·기능·데이터 접근이 안전하게 제한되도록 권한 체계 강화',
          role: '권한 구조 설계 및 적용, 운영 이슈 대응',
          tasks: [
            '권한 기반 메뉴/기능 노출 제어 로직 정리 및 예외 케이스 처리',
            '데이터 조회 시 권한 조건 누락/오적용 방지 로직 보강',
            '운영 중 접근 오류/권한 불일치 이슈 분석 및 안정화'
          ],
          techStack: 'PHP/JSP, Oracle SQL, 세션/권한 로직, 로그 분석',
          result: '접근 통제의 일관성 확보, 데이터 노출 리스크 저감'
        },
        {
          name: '조회/리포트 성능 및 정합성 개선',
          summary: '리포트/통계/조회 화면에서 발생하는 응답 지연과 데이터 불일치 이슈를 개선',
          role: 'SQL 분석 및 쿼리 개선, 화면 로직 보완',
          tasks: [
            '복잡 조인/서브쿼리 구조 개선을 통한 조회 안정화',
            '조건 누락/중복 집계 등 정합성 이슈 원인 분석 및 보완',
            '운영 환경에서 재현/로그 기반으로 병목 구간 식별 후 개선 반영'
          ],
          techStack: 'Oracle SQL(조인/인덱스 고려), PHP/JSP, 로그 기반 트러블슈팅',
          result: '조회 기능의 안정성 향상, 운영 이슈 재발 감소'
        }
      ]
    },
    {
      company: '엔솔루션',
      position: 'Web/Backend Developer',
      startDate: '2024.04.15',
      endDate: '2024.12',
      description: '',
      projects: [
        {
          name: '레거시 웹 시스템 운영 유지보수 및 개선 개발',
          summary: '운영 중인 레거시 시스템의 기능 추가/수정, 오류 수정, 사용자 불편 개선 수행',
          role: '이슈 접수/분석 → 수정 개발 → 배포 → 운영 안정화',
          tasks: [
            '현업 요청 기반 UI/업무 로직 개선(처리 흐름 단순화, 예외 케이스 보강)',
            '오류 재현 및 원인 분석 후 수정 반영',
            '배포 이후 운영 모니터링과 후속 개선 반복'
          ],
          techStack: 'PHP/JSP, Oracle, JavaScript, 운영 배포/로그 분석',
          result: '기능 안정성과 사용자 만족도 개선, 운영 대응 효율 향상'
        },
        {
          name: '데이터 정합성 이슈 분석 및 보완',
          summary: '누락/중복/조건 불일치로 인한 데이터 오류 발생을 줄이기 위한 로직 보강',
          role: '데이터 흐름 파악, SQL/로직 수정, 검증 강화',
          tasks: [
            '데이터 생성/변경 시점과 조회 조건의 불일치를 원인으로 분해',
            '검증 로직/예외처리 추가로 오류 케이스를 사전에 차단',
            '운영에서 발생한 케이스를 기준으로 재발 방지성 수정 적용'
          ],
          techStack: 'Oracle SQL, 트랜잭션/정합성 고려, PHP/JSP',
          result: '데이터 오류 관련 문의/수정 요청 감소, 운영 안정화 기여'
        }
      ]
    },
    {
      company: '브레인드넷 주식회사',
      position: 'Web/Backend Developer',
      startDate: '2022.11.07',
      endDate: '2024.03.08',
      description: '',
      projects: [
        {
          name: '사내 정보시스템 고도화(프로세스/화면 개선)',
          summary: '업무 처리 흐름을 개선하고 기능을 안정화하기 위한 고도화 작업 수행',
          role: '요구사항 분석, 개발, 운영 반영, 사용자 피드백 기반 개선',
          tasks: [
            '기존 기능 리팩터링 및 신규 기능 개발',
            '업무 규칙 변경에 따른 로직/화면 수정 및 예외 케이스 정리',
            '반복되는 수기 작업을 시스템 처리로 전환(입력/조회/처리 단계 개선)'
          ],
          techStack: 'PHP/JSP, Oracle, JavaScript',
          result: '업무 처리 흐름 단순화, 오류 케이스 감소, 운영 품질 향상'
        },
        {
          name: 'Oracle 기반 조회 성능 개선 및 안정화',
          summary: '조회 성능 저하/응답 지연이 발생하는 화면에 대해 SQL 구조를 개선해 안정화',
          role: '병목 SQL 분석, 개선안 적용, 운영 검증',
          tasks: [
            '불필요한 조인/서브쿼리 구조 개선 및 조건 정리',
            '데이터량 증가에 따른 조회 전략 보완(필터링/집계 구조 재정비)',
            '운영 환경에서 재현 가능한 방식으로 테스트 후 반영'
          ],
          techStack: 'Oracle SQL(조인/조건/인덱스 고려), PHP/JSP',
          result: '조회 안정성 강화, 운영 중 성능 관련 이슈 감소'
        },
        {
          name: '운영 장애 대응 및 재발 방지 체계 강화',
          summary: '운영 중 발생하는 오류를 신속히 해결하고 같은 문제가 반복되지 않도록 개선',
          role: '로그 분석, 원인 파악, 수정 반영, 예외처리 강화',
          tasks: [
            '오류 발생 흐름을 재현하고 원인 구간을 특정',
            '입력 검증/예외처리/데이터 정합성 로직 보완',
            '운영 반영 후 동일 유형 이슈의 재발을 줄이는 방향으로 개선 지속'
          ],
          techStack: '로그 기반 분석, PHP/JSP, Oracle',
          result: '운영 안정성 향상 및 대응 효율 개선'
        }
      ]
    },
    {
      company: '주식회사 다온',
      position: 'Developer (Maintenance/Support)',
      startDate: '2022.01.13',
      endDate: '2022.04.26',
      description: '운영 시스템 기능 수정 및 유지보수 지원 - 화면/로직 변경, 간단한 데이터 조회/정리, 운영 요청 대응',
      projects: []
    },
    {
      company: '한국생산기술연구원',
      position: 'Technical Support',
      startDate: '2021.10.01',
      endDate: '2021.11.01',
      description: '연구/업무 지원 및 데이터/문서 정리 - 자료 정리, 문서화, 협업 지원',
      projects: []
    },
    {
      company: '주식회사 아이엘알',
      position: 'Developer Support',
      startDate: '2020.12.31',
      endDate: '2021.07.01',
      description: '웹 시스템 운영 지원 및 기능 개선 보조 - 화면 수정, 데이터 조회 보완, 운영 대응 지원',
      projects: []
    },
    {
      company: '주식회사 미디어온',
      position: 'Developer Support',
      startDate: '2020.09.21',
      endDate: '2020.10.06',
      description: '단기 개발 지원 - 운영 보조 및 요청사항 처리 지원',
      projects: []
    },
    {
      company: '(주)아성은',
      position: 'IT/Operations Support',
      startDate: '2019.07.21',
      endDate: '2020.02.11',
      description: 'IT/운영 지원 및 업무 프로세스 보조 - 내부 요청 처리, 문서화/지원 업무',
      projects: []
    }
  ],
  certifications: [
    { name: '컴퓨터활용능력 2급', issuer: '대한상공회의소', date: '' },
    { name: 'PC정비사 2급', issuer: '한국정보통신자격협회', date: '' },
    { name: '네트워크관리사 2급', issuer: '한국정보통신자격협회', date: '' },
    { name: 'G-TELP 65', issuer: 'G-TELP Korea', date: '' }
  ],
  skills: [
    'PHP(레거시)', 'JSP/Servlet', 'Oracle SQL', 'JavaScript', 'HTML/CSS',
    '운영장애 대응', '권한/접근제어', '데이터 정합성', '리포트/통계', 'Linux'
  ],
  selfIntroduction: `레거시 웹 시스템(PHP/JSP) 기반의 업무 시스템 유지보수·고도화, Oracle 중심의 데이터 처리/조회 성능 개선, 운영 환경에서의 장애 대응과 안정화 경험을 보유한 개발자입니다.

요구사항 정리부터 개발·배포·운영 대응까지 전 과정을 책임지고, 현업 사용자 관점에서 "실제로 쓰이는 기능"을 빠르게 개선하는 데 강점이 있습니다.

[핵심역량]
• 레거시 시스템 유지보수/고도화: 기능 개선, 버그 수정, 프로세스 개선, 운영 안정화
• Oracle SQL 기반 데이터 처리: 복잡 조회/리포트, 성능 개선(조인 구조 개선, 인덱스 고려, 쿼리 리팩터링)
• 운영 장애 대응: 로그 기반 원인 분석, 핫픽스/배포, 재발 방지(예외처리/검증 강화)
• 권한/접근제어: 시스템 접근 제한, 권한 기반 메뉴/기능 제어, 데이터 노출 통제
• 협업/커뮤니케이션: 현업 요구사항 정의 → 개발 반영 → 운영 피드백 반영의 반복 개선 사이클`
}

export default function ResumePage() {
  const { isSignedIn, signIn, accessToken } = useGoogleAuth()
  const { resumes, isLoading, error, createResume, deleteResume, getDocumentUrl, getFolderUrl } = useGoogleDocs(accessToken)

  const [formData, setFormData] = useState<ResumeData>(initialFormData)
  const [title, setTitle] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [taskInput, setTaskInput] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedExp, setExpandedExp] = useState<number | null>(0)
  // 저장된 이력서가 없으면 폼을 바로 보여줌
  const [showForm, setShowForm] = useState(() => {
    const meta = localStorage.getItem('lifeops_resume_meta')
    const savedResumes = meta ? JSON.parse(meta) : []
    return savedResumes.length === 0
  })

  // Personal Info handlers
  const handlePersonalInfoChange = (field: keyof typeof formData.personalInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }))
  }

  // Education handlers
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { ...emptyEducation }]
    }))
  }

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  // Experience handlers
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { ...emptyExperience, projects: [] }]
    }))
  }

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  // Project handlers
  const addProject = (expIndex: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex ? { ...exp, projects: [...exp.projects, { ...emptyProject, tasks: [] }] } : exp
      )
    }))
  }

  const removeProject = (expIndex: number, projIndex: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex ? { ...exp, projects: exp.projects.filter((_, j) => j !== projIndex) } : exp
      )
    }))
  }

  const updateProject = (expIndex: number, projIndex: number, field: keyof Project, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex ? {
          ...exp,
          projects: exp.projects.map((proj, j) =>
            j === projIndex ? { ...proj, [field]: value } : proj
          )
        } : exp
      )
    }))
  }

  const addTask = (expIndex: number, projIndex: number) => {
    const key = `${expIndex}-${projIndex}`
    const task = taskInput[key]?.trim()
    if (!task) return

    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex ? {
          ...exp,
          projects: exp.projects.map((proj, j) =>
            j === projIndex ? { ...proj, tasks: [...proj.tasks, task] } : proj
          )
        } : exp
      )
    }))
    setTaskInput(prev => ({ ...prev, [key]: '' }))
  }

  const removeTask = (expIndex: number, projIndex: number, taskIndex: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex ? {
          ...exp,
          projects: exp.projects.map((proj, j) =>
            j === projIndex ? { ...proj, tasks: proj.tasks.filter((_, k) => k !== taskIndex) } : proj
          )
        } : exp
      )
    }))
  }

  // Certification handlers
  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { ...emptyCertification }]
    }))
  }

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      )
    }))
  }

  // Skills handlers
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!formData.personalInfo.name) {
      alert('이름을 입력해주세요')
      return
    }

    setIsSubmitting(true)
    const documentId = await createResume(formData, title)
    setIsSubmitting(false)

    if (documentId) {
      setShowForm(false)
      window.open(getDocumentUrl(documentId), '_blank')
    }
  }

  if (!isSignedIn) {
    return (
      <div>
        <PageHeader icon="📄" title="이력서" />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <p className="text-gray-400 mb-4">Google 계정으로 로그인하면 이력서를 생성할 수 있습니다</p>
          <button
            onClick={signIn}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            Google 로그인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="📄" title="이력서">
        <div className="flex items-center gap-2">
          {/* 이력서 폴더 바로가기 */}
          <a
            href={getFolderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="이력서 폴더"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
          </a>
          {/* 마지막 이력서 열기 */}
          {resumes.length > 0 && !showForm && (
            <a
              href={getDocumentUrl(resumes[resumes.length - 1].id)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-1"
              title="마지막으로 생성한 이력서 열기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              최근 이력서
            </a>
          )}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium transition-colors"
            >
              + 새 이력서 작성
            </button>
          )}
        </div>
      </PageHeader>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* List View */}
      {!showForm && (
        <>
          {resumes.length === 0 ? (
            <div className="bg-gray-800 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-gray-400 mb-4">생성된 이력서가 없습니다</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
              >
                첫 이력서 작성하기
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-2xl p-4">
              <h3 className="text-lg font-bold text-white mb-3">저장된 이력서 ({resumes.length})</h3>
              <div className="space-y-2">
                {resumes.map(resume => (
                  <div key={resume.id} className="flex items-center justify-between bg-gray-700 rounded-xl p-4 hover:bg-gray-600/50 transition-colors">
                    <Link to={`/resume/${resume.id}`} className="flex-1">
                      <div className="text-white font-medium text-lg hover:text-blue-400 transition-colors">
                        {resume.title}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(resume.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </Link>
                    <div className="flex gap-2">
                      <Link
                        to={`/resume/${resume.id}`}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                      >
                        상세보기
                      </Link>
                      <a
                        href={getDocumentUrl(resume.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Docs
                      </a>
                      <button
                        onClick={() => deleteResume(resume.id)}
                        className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Resume Form */}
      {showForm && (
      <div className="bg-gray-800 rounded-2xl p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">새 이력서 작성</h3>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕ 닫기
          </button>
        </div>

        {/* Document Title */}
        <div>
          <label className="block text-gray-400 text-sm mb-2">문서 제목</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="이력서_최대열"
            className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Personal Info */}
        <div>
          <h4 className="text-white font-medium mb-3">인적사항</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.personalInfo.name}
              onChange={e => handlePersonalInfoChange('name', e.target.value)}
              placeholder="이름 *"
              className="bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={formData.personalInfo.birthDate}
              onChange={e => handlePersonalInfoChange('birthDate', e.target.value)}
              placeholder="생년월일 (예: 1990.01.01)"
              className="bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={formData.personalInfo.phone}
              onChange={e => handlePersonalInfoChange('phone', e.target.value)}
              placeholder="연락처"
              className="bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              value={formData.personalInfo.email}
              onChange={e => handlePersonalInfoChange('email', e.target.value)}
              placeholder="이메일"
              className="bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={formData.personalInfo.address}
              onChange={e => handlePersonalInfoChange('address', e.target.value)}
              placeholder="주소"
              className="sm:col-span-2 bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={formData.personalInfo.blog || ''}
              onChange={e => handlePersonalInfoChange('blog', e.target.value)}
              placeholder="블로그 (예: https://blog.example.com)"
              className="sm:col-span-2 bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={formData.personalInfo.github || ''}
              onChange={e => handlePersonalInfoChange('github', e.target.value)}
              placeholder="GitHub (예: https://github.com/username)"
              className="bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={formData.personalInfo.portfolio || ''}
              onChange={e => handlePersonalInfoChange('portfolio', e.target.value)}
              placeholder="포트폴리오 URL"
              className="bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Education */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">학력</h4>
            <button onClick={addEducation} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">
              + 추가
            </button>
          </div>
          <div className="space-y-3">
            {formData.education.map((edu, index) => (
              <div key={index} className="bg-gray-700/50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">학력 {index + 1}</span>
                  {formData.education.length > 1 && (
                    <button onClick={() => removeEducation(index)} className="text-red-400 hover:text-red-300 text-sm">삭제</button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="text" value={edu.school} onChange={e => updateEducation(index, 'school', e.target.value)} placeholder="학교명" className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={edu.major} onChange={e => updateEducation(index, 'major', e.target.value)} placeholder="전공" className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={edu.degree} onChange={e => updateEducation(index, 'degree', e.target.value)} placeholder="학위" className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex gap-2">
                    <input type="text" value={edu.startDate} onChange={e => updateEducation(index, 'startDate', e.target.value)} placeholder="입학" className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="text" value={edu.endDate} onChange={e => updateEducation(index, 'endDate', e.target.value)} placeholder="졸업" className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience with Projects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">경력 ({formData.experience.length}개)</h4>
            <button onClick={addExperience} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">
              + 추가
            </button>
          </div>
          <div className="space-y-3">
            {formData.experience.map((exp, expIndex) => (
              <div key={expIndex} className="bg-gray-700/50 rounded-xl overflow-hidden">
                {/* Experience Header */}
                <div
                  className="p-3 cursor-pointer hover:bg-gray-700/70 flex items-center justify-between"
                  onClick={() => setExpandedExp(expandedExp === expIndex ? null : expIndex)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{expandedExp === expIndex ? '▼' : '▶'}</span>
                    <div>
                      <div className="text-white font-medium">{exp.company || '회사명'}</div>
                      <div className="text-gray-400 text-sm">{exp.position} | {exp.startDate} ~ {exp.endDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exp.projects.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                        {exp.projects.length}개 프로젝트
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeExperience(expIndex); }}
                      className="text-red-400 hover:text-red-300 text-sm px-2"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedExp === expIndex && (
                  <div className="p-3 pt-0 space-y-4 border-t border-gray-600">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                      <input type="text" value={exp.company} onChange={e => updateExperience(expIndex, 'company', e.target.value)} placeholder="회사명" className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" value={exp.position} onChange={e => updateExperience(expIndex, 'position', e.target.value)} placeholder="직책" className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" value={exp.startDate} onChange={e => updateExperience(expIndex, 'startDate', e.target.value)} placeholder="입사일" className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" value={exp.endDate} onChange={e => updateExperience(expIndex, 'endDate', e.target.value)} placeholder="퇴사일" className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <textarea
                        value={exp.description}
                        onChange={e => updateExperience(expIndex, 'description', e.target.value)}
                        placeholder="간단한 설명 (프로젝트가 없는 경우)"
                        className="sm:col-span-2 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                      />
                    </div>

                    {/* Projects */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm font-medium">프로젝트</span>
                        <button
                          onClick={() => addProject(expIndex)}
                          className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs rounded"
                        >
                          + 프로젝트 추가
                        </button>
                      </div>
                      <div className="space-y-3">
                        {exp.projects.map((proj, projIndex) => (
                          <div key={projIndex} className="bg-gray-800 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-400 text-sm font-medium">프로젝트 {projIndex + 1}</span>
                              <button onClick={() => removeProject(expIndex, projIndex)} className="text-red-400 hover:text-red-300 text-xs">삭제</button>
                            </div>
                            <input
                              type="text"
                              value={proj.name}
                              onChange={e => updateProject(expIndex, projIndex, 'name', e.target.value)}
                              placeholder="프로젝트명"
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <textarea
                              value={proj.summary}
                              onChange={e => updateProject(expIndex, projIndex, 'summary', e.target.value)}
                              placeholder="개요"
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={2}
                            />
                            <input
                              type="text"
                              value={proj.role}
                              onChange={e => updateProject(expIndex, projIndex, 'role', e.target.value)}
                              placeholder="역할"
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {/* Tasks */}
                            <div>
                              <div className="text-gray-500 text-xs mb-1">주요 작업</div>
                              <div className="space-y-1 mb-2">
                                {proj.tasks.map((task, taskIndex) => (
                                  <div key={taskIndex} className="flex items-center gap-2 bg-gray-700/50 rounded px-2 py-1">
                                    <span className="text-gray-300 text-xs flex-1">• {task}</span>
                                    <button onClick={() => removeTask(expIndex, projIndex, taskIndex)} className="text-red-400 text-xs">×</button>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={taskInput[`${expIndex}-${projIndex}`] || ''}
                                  onChange={e => setTaskInput(prev => ({ ...prev, [`${expIndex}-${projIndex}`]: e.target.value }))}
                                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTask(expIndex, projIndex))}
                                  placeholder="작업 추가"
                                  className="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button onClick={() => addTask(expIndex, projIndex)} className="px-2 py-1 bg-gray-600 text-white text-xs rounded">추가</button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={proj.techStack}
                              onChange={e => updateProject(expIndex, projIndex, 'techStack', e.target.value)}
                              placeholder="기술/환경"
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={proj.result}
                              onChange={e => updateProject(expIndex, projIndex, 'result', e.target.value)}
                              placeholder="결과"
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">자격증</h4>
            <button onClick={addCertification} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">
              + 추가
            </button>
          </div>
          {formData.certifications.length === 0 ? (
            <p className="text-gray-500 text-sm">자격증이 없으면 비워두세요</p>
          ) : (
            <div className="space-y-2">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" value={cert.name} onChange={e => updateCertification(index, 'name', e.target.value)} placeholder="자격증명" className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={cert.issuer} onChange={e => updateCertification(index, 'issuer', e.target.value)} placeholder="발급기관" className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={cert.date} onChange={e => updateCertification(index, 'date', e.target.value)} placeholder="취득일" className="w-24 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={() => removeCertification(index)} className="text-red-400 hover:text-red-300 px-2">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-white font-medium mb-3">기술 스택</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="기술을 입력하고 Enter"
              className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={addSkill} className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl">추가</button>
          </div>
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-2">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-blue-300 hover:text-white">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Self Introduction */}
        <div>
          <h4 className="text-white font-medium mb-3">자기소개</h4>
          <textarea
            value={formData.selfIntroduction}
            onChange={e => setFormData(prev => ({ ...prev, selfIntroduction: e.target.value }))}
            placeholder="자기소개를 작성해주세요"
            rows={8}
            className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors"
        >
          {isLoading || isSubmitting ? '생성 중...' : '이력서 생성'}
        </button>
      </div>
      )}
    </div>
  )
}
