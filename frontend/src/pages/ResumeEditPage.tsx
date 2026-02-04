import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useGoogleAuth } from '../contexts/GoogleAuthContext'
import { useGoogleDocs, type ResumeData, type Education, type Certification } from '../hooks/useGoogleDocs'

const emptyEducation: Education = {
  school: '',
  major: '',
  degree: '',
  startDate: '',
  endDate: ''
}

const emptyCertification: Certification = {
  name: '',
  issuer: '',
  date: ''
}

// 기본 이력서 데이터
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
  experience: [], // 경력사항은 경력기술서에서 관리
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

export default function ResumeEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { accessToken } = useGoogleAuth()
  const { resumes, getResumeData, getResumeMeta, updateResumeData, createOrUpdateResume, isLoading } = useGoogleDocs(accessToken)

  // 새 생성 모드인지 확인
  const isNewMode = !id

  // 기존 이력서가 있으면 해당 데이터 사용, 없으면 초기 데이터 사용
  const existingResume = resumes.find(r => r.type === 'resume')

  const [formData, setFormData] = useState<ResumeData | null>(null)
  const [skillInput, setSkillInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const meta = id ? getResumeMeta(id) : null

  // Load existing data or use initial data
  useEffect(() => {
    if (isNewMode) {
      // 새 생성 모드: 기존 이력서 데이터가 있으면 사용, 없으면 초기 데이터 사용
      if (existingResume) {
        const data = getResumeData(existingResume.id)
        setFormData(data || initialFormData)
      } else {
        setFormData(initialFormData)
      }
    } else if (id) {
      const data = getResumeData(id)
      if (data) {
        setFormData(data)
      }
    }
  }, [id, isNewMode, existingResume, getResumeData])

  if (!isNewMode && (!id || !meta)) {
    return (
      <div>
        <PageHeader icon="📄" title="이력서 수정" />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-gray-400 mb-4">이력서를 찾을 수 없습니다</p>
          <Link
            to="/job-document"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors inline-block"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div>
        <PageHeader icon="📄" title={isNewMode ? "이력서 작성" : "이력서 수정"} />
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-400">데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  // Personal Info handlers
  const handlePersonalInfoChange = (field: keyof typeof formData.personalInfo, value: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }) : prev)
  }

  // Education handlers
  const addEducation = () => {
    setFormData(prev => prev ? ({
      ...prev,
      education: [...prev.education, { ...emptyEducation }]
    }) : prev)
  }

  const removeEducation = (index: number) => {
    setFormData(prev => prev ? ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }) : prev)
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }) : prev)
  }

  // Certification handlers
  const addCertification = () => {
    setFormData(prev => prev ? ({
      ...prev,
      certifications: [...prev.certifications, { ...emptyCertification }]
    }) : prev)
  }

  const removeCertification = (index: number) => {
    setFormData(prev => prev ? ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }) : prev)
  }

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      )
    }) : prev)
  }

  // Skills handlers
  const addSkill = () => {
    if (skillInput.trim() && formData && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => prev ? ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }) : prev)
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }) : prev)
  }

  // Save handler - 저장만 (Google Docs 재생성 안함)
  const handleSave = () => {
    if (!formData) return
    if (existingResume) {
      updateResumeData(existingResume.id, formData)
    }
    alert('저장되었습니다')
    if (existingResume) {
      navigate(`/job-document/${existingResume.id}`)
    } else {
      navigate('/job-document')
    }
  }

  // Save and create/update Google Docs
  const handleSaveAndGenerate = async () => {
    if (!formData) return

    setIsSubmitting(true)

    const baseTitle = formData.personalInfo.name
    const resumeId = await createOrUpdateResume(formData, baseTitle)

    setIsSubmitting(false)

    if (resumeId) {
      alert(existingResume ? '이력서가 수정되었습니다' : '이력서가 생성되었습니다')
      navigate(`/job-document/${resumeId}`)
    }
  }

  return (
    <div>
      <PageHeader icon="📄" title={isNewMode ? "이력서 작성" : "이력서 수정"}>
        <div className="flex items-center gap-2">
          <Link
            to={existingResume ? `/job-document/${existingResume.id}` : '/job-document'}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            ← 돌아가기
          </Link>
        </div>
      </PageHeader>

      <div className="bg-gray-800 rounded-2xl p-4 space-y-6">
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

        {/* Self Introduction */}
        <div>
          <h4 className="text-white font-medium mb-3">자기소개</h4>
          <textarea
            value={formData.selfIntroduction}
            onChange={e => setFormData(prev => prev ? ({ ...prev, selfIntroduction: e.target.value }) : prev)}
            placeholder="자기소개를 작성해주세요"
            rows={8}
            className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          {existingResume && (
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-bold text-lg transition-colors"
            >
              저장 (로컬만)
            </button>
          )}
          <button
            onClick={handleSaveAndGenerate}
            disabled={isLoading || isSubmitting}
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors"
          >
            {isLoading || isSubmitting ? '처리 중...' : existingResume ? '📄 이력서 수정' : '📄 이력서 생성'}
          </button>
        </div>
      </div>
    </div>
  )
}
