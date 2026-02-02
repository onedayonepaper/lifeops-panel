import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useLifeOpsSheets, SHEET_CONFIGS } from '../hooks/useLifeOpsSheets'

type ApplicationStatus =
  | 'target'      // 타겟 회사
  | 'preparing'   // 준비 중
  | 'applied'     // 지원 완료
  | 'document'    // 서류 통과
  | 'interview1'  // 1차 면접
  | 'interview2'  // 2차/최종 면접
  | 'offer'       // 합격
  | 'rejected'    // 불합격

type Country = 'kr' | 'jp' | 'gj'  // gj = 광주/전남

interface Company {
  id: string
  name: string
  logo: string
  tier: 'tier1' | 'tier2' | 'tier3'
  country: Country
  field: string  // 분야
  position: string
  status: ApplicationStatus
  deadline?: string
  appliedDate?: string
  notes: string
  salary?: string
  techStack: string[]
  url?: string
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  target: { label: '타겟', color: 'text-gray-400', bgColor: 'bg-gray-600' },
  preparing: { label: '준비 중', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  applied: { label: '지원 완료', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  document: { label: '서류 통과', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  interview1: { label: '1차 면접', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  interview2: { label: '최종 면접', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  offer: { label: '합격', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  rejected: { label: '불합격', color: 'text-red-400', bgColor: 'bg-red-500/20' },
}

const INITIAL_COMPANIES: Company[] = [
  // ===== 한국 회사 =====
  // Tier 1 - 최상위 IT 대기업
  { id: '1', name: 'Naver', logo: '🟢', tier: 'tier1', country: 'kr', field: '플랫폼/검색', position: '프론트엔드 개발자', status: 'target', notes: '네이버 신입 공채', salary: '5,000만+', techStack: ['React', 'TypeScript'], url: 'https://recruit.navercorp.com' },
  { id: '2', name: 'Kakao', logo: '💬', tier: 'tier1', country: 'kr', field: '플랫폼/메신저', position: '소프트웨어 엔지니어', status: 'target', notes: '카카오 상시 채용', salary: '5,000만+', techStack: ['Kotlin', 'Spring'], url: 'https://careers.kakao.com' },
  { id: '3', name: 'Coupang', logo: '🚀', tier: 'tier1', country: 'kr', field: '이커머스', position: 'Software Engineer', status: 'target', notes: '영어 면접', salary: '6,000만+', techStack: ['Java', 'AWS'], url: 'https://www.coupang.jobs' },
  { id: '4', name: 'Toss', logo: '💙', tier: 'tier1', country: 'kr', field: '핀테크', position: '프론트엔드 개발자', status: 'target', notes: '토스 NEXT', salary: '5,500만+', techStack: ['React', 'TypeScript'], url: 'https://toss.im/career' },
  // Tier 2 - 대기업/유니콘
  { id: '5', name: '배달의민족', logo: '🍔', tier: 'tier2', country: 'kr', field: '배달/O2O', position: '백엔드 개발자', status: 'target', notes: '우아한형제들', salary: '5,000만+', techStack: ['Java', 'Kotlin'], url: 'https://career.woowahan.com' },
  { id: '6', name: '당근', logo: '🥕', tier: 'tier2', country: 'kr', field: 'C2C/로컬', position: '소프트웨어 엔지니어', status: 'target', notes: '당근마켓', salary: '5,000만+', techStack: ['Go', 'Kotlin'], url: 'https://about.daangn.com/jobs' },
  { id: '7', name: '토스페이먼츠', logo: '💳', tier: 'tier2', country: 'kr', field: 'PG/결제', position: '결제 시스템 개발자', status: 'target', notes: 'PG사 최고 연봉', salary: '5,500만+', techStack: ['Java', 'Spring Boot'], url: 'https://tosspayments-career.oopy.io' },
  { id: '8', name: '카카오뱅크', logo: '🏦', tier: 'tier2', country: 'kr', field: '인터넷은행', position: '풀스택 개발자', status: 'target', notes: '금융권 IT', salary: '5,000만+', techStack: ['Java', 'React'], url: 'https://kakaobank.recruiter.co.kr' },
  { id: '9', name: '크래프톤', logo: '🎮', tier: 'tier2', country: 'kr', field: '게임', position: '게임 클라이언트', status: 'target', notes: '배틀그라운드', salary: '5,500만+', techStack: ['C++', 'Unreal'], url: 'https://careers.krafton.com' },
  // Tier 3 - 성장 스타트업
  { id: '10', name: '야놀자', logo: '🏨', tier: 'tier3', country: 'kr', field: '여행/숙박', position: '백엔드 개발자', status: 'target', notes: '여행 플랫폼', salary: '4,500만+', techStack: ['Java', 'AWS'], url: 'https://careers.yanolja.co' },
  { id: '11', name: '무신사', logo: '👕', tier: 'tier3', country: 'kr', field: '패션커머스', position: '프론트엔드 개발자', status: 'target', notes: '패션 1위', salary: '4,500만+', techStack: ['React', 'Next.js'], url: 'https://career.musinsa.com' },
  { id: '12', name: '직방', logo: '🏠', tier: 'tier3', country: 'kr', field: '프롭테크', position: '소프트웨어 엔지니어', status: 'target', notes: '부동산', salary: '4,500만+', techStack: ['TypeScript', 'React'], url: 'https://zigbang.recruiter.co.kr' },
  { id: '13', name: '리디', logo: '📖', tier: 'tier3', country: 'kr', field: '콘텐츠', position: '웹 개발자', status: 'target', notes: '전자책', salary: '4,500만+', techStack: ['React', 'Python'], url: 'https://ridi.career.greetinghr.com' },
  { id: '14', name: '버킷플레이스', logo: '🏡', tier: 'tier3', country: 'kr', field: '인테리어', position: '프론트엔드 개발자', status: 'target', notes: '오늘의집', salary: '4,500만+', techStack: ['React', 'GraphQL'], url: 'https://careers.bucketplace.net' },

  // ===== 일본 회사 =====
  // Tier 1 - 대형 IT/플랫폼
  { id: 'jp1', name: 'LY Corporation', logo: '💚', tier: 'tier1', country: 'jp', field: '플랫폼/인터넷', position: 'Software Engineer', status: 'target', notes: 'LINE Yahoo 합병', salary: '', techStack: ['Java', 'Kotlin'], url: 'https://www.lycorp.co.jp/en/recruit/' },
  { id: 'jp2', name: 'Rakuten', logo: '🔴', tier: 'tier1', country: 'jp', field: '이커머스/핀테크', position: 'Software Engineer', status: 'target', notes: '라쿠텐, 영어 공용어', salary: '', techStack: ['Java', 'Spring'], url: 'https://global.rakuten.com/corp/careers/' },
  { id: 'jp3', name: 'Mercari', logo: '📦', tier: 'tier1', country: 'jp', field: 'C2C/핀테크', position: 'Software Engineer', status: 'target', notes: '메루카리', salary: '', techStack: ['Go', 'Kubernetes'], url: 'https://careers.mercari.com/en/' },
  { id: 'jp4', name: 'Sony', logo: '🎵', tier: 'tier1', country: 'jp', field: '전자/콘텐츠/AI', position: 'Software Engineer', status: 'target', notes: '소니', salary: '', techStack: ['Python', 'C++'], url: 'https://www.sony.com/en/SonyInfo/Careers/japan/' },
  { id: 'jp5', name: 'Nintendo', logo: '🎮', tier: 'tier1', country: 'jp', field: '게임', position: 'Game Developer', status: 'target', notes: '닌텐도', salary: '', techStack: ['C++', 'C#'], url: 'https://www.nintendo.co.jp/jobs/index.html' },
  { id: 'jp6', name: 'SoftBank', logo: '📱', tier: 'tier1', country: 'jp', field: '통신/AI/투자', position: 'Engineer', status: 'target', notes: '소프트뱅크', salary: '', techStack: ['Python', 'Cloud'], url: 'https://www.softbank.jp/recruit/' },
  { id: 'jp7', name: 'NTT DATA', logo: '🌐', tier: 'tier1', country: 'jp', field: 'SI/컨설팅/클라우드', position: 'IT Consultant', status: 'target', notes: 'NTT 그룹', salary: '', techStack: ['Java', 'Cloud'], url: 'https://careers.services.global.ntt/global/en' },
  // Tier 2 - 메이저 IT/게임
  { id: 'jp8', name: 'CyberAgent', logo: '🎨', tier: 'tier2', country: 'jp', field: '인터넷/광고/게임', position: 'Web Engineer', status: 'target', notes: '사이버에이전트', salary: '', techStack: ['TypeScript', 'Go'], url: 'https://www.cyberagent.co.jp/careers/' },
  { id: 'jp9', name: 'DeNA', logo: '🎯', tier: 'tier2', country: 'jp', field: '인터넷/게임/헬스', position: 'Software Engineer', status: 'target', notes: '디엔에이', salary: '', techStack: ['Go', 'Ruby'], url: 'https://dena.com/jp/recruit/' },
  { id: 'jp10', name: 'KDDI', logo: '📡', tier: 'tier2', country: 'jp', field: '통신/플랫폼', position: 'Engineer', status: 'target', notes: 'au', salary: '', techStack: ['Java', 'Cloud'], url: 'https://www.kddi.com/english/corporate/recruit/' },
  { id: 'jp11', name: 'Square Enix', logo: '⚔️', tier: 'tier2', country: 'jp', field: '게임', position: 'Game Engineer', status: 'target', notes: 'FF, 드퀘', salary: '', techStack: ['C++', 'Unreal'], url: 'https://www.jp.square-enix.com/recruit/' },
  { id: 'jp12', name: 'Panasonic', logo: '🔋', tier: 'tier2', country: 'jp', field: '전자/제조/소프트', position: 'Software Engineer', status: 'target', notes: '파나소닉', salary: '', techStack: ['C', 'Python'], url: 'https://recruit.jpn.panasonic.com/' },
  { id: 'jp13', name: 'Fujitsu', logo: '💻', tier: 'tier2', country: 'jp', field: 'IT/클라우드/SI', position: 'IT Engineer', status: 'target', notes: '후지쯔', salary: '', techStack: ['Java', 'Cloud'], url: 'https://fujitsu.recruiting.jp.fujitsu.com/career/' },
  { id: 'jp14', name: 'NEC', logo: '🖥️', tier: 'tier2', country: 'jp', field: 'IT/네트워크/보안', position: 'System Engineer', status: 'target', notes: 'NEC', salary: '', techStack: ['Python', 'Security'], url: 'https://jpn.nec.com/recruit/index.html' },
  { id: 'jp15', name: 'Hitachi', logo: '⚡', tier: 'tier2', country: 'jp', field: 'IT/인프라/제조', position: 'IT Engineer', status: 'target', notes: '히타치', salary: '', techStack: ['Java', 'IoT'], url: 'https://www.hitachi.co.jp/recruit/' },
  { id: 'jp16', name: 'Canon', logo: '📷', tier: 'tier2', country: 'jp', field: '전자/이미징', position: 'Software Engineer', status: 'target', notes: '캐논', salary: '', techStack: ['C++', 'Embedded'], url: 'https://global.canon/ja/employ/career/' },
  { id: 'jp17', name: 'Toyota', logo: '🚗', tier: 'tier2', country: 'jp', field: '모빌리티/소프트', position: 'Software Engineer', status: 'target', notes: '토요타, 자율주행', salary: '', techStack: ['C++', 'Python'], url: 'https://www.toyota-recruit.com/career/' },
  { id: 'jp18', name: 'DENSO', logo: '🔧', tier: 'tier2', country: 'jp', field: '자동차SW/임베디드', position: 'Embedded Engineer', status: 'target', notes: '덴소', salary: '', techStack: ['C', 'Embedded'], url: 'https://www.denso.com/jp/ja/careers/' },
  { id: 'jp19', name: 'Recruit Holdings', logo: '👔', tier: 'tier2', country: 'jp', field: 'HR테크/플랫폼', position: 'Product Engineer', status: 'target', notes: '리쿠르트', salary: '', techStack: ['Ruby', 'Go'], url: 'https://recruit-holdings.com/en/about/careers/' },
  // Tier 3 - 성장 스타트업/SaaS
  { id: 'jp20', name: 'ZOZO', logo: '👗', tier: 'tier3', country: 'jp', field: '이커머스/패션테크', position: 'Web Engineer', status: 'target', notes: 'ZOZOTOWN', salary: '', techStack: ['Java', 'TypeScript'], url: 'https://corp.zozo.com/recruit/' },
  { id: 'jp21', name: 'SmartNews', logo: '📰', tier: 'tier3', country: 'jp', field: '뉴스/미디어', position: 'Software Engineer', status: 'target', notes: '스마트뉴스', salary: '', techStack: ['Go', 'Python'], url: 'https://careers.smartnews.com/en/' },
  { id: 'jp22', name: 'Preferred Networks', logo: '🤖', tier: 'tier1', country: 'jp', field: 'AI/딥러닝', position: 'ML Engineer', status: 'target', notes: 'AI 스타트업 최고', salary: '', techStack: ['Python', 'C++'], url: 'https://www.preferred.jp/en/careers' },
  { id: 'jp23', name: 'Sansan', logo: '📇', tier: 'tier3', country: 'jp', field: 'B2B SaaS', position: 'Software Engineer', status: 'target', notes: '명함관리', salary: '', techStack: ['Kotlin', 'AWS'], url: 'https://jp.corp-sansan.com/recruit/' },
  { id: 'jp24', name: 'freee', logo: '📊', tier: 'tier3', country: 'jp', field: '핀테크/SaaS', position: 'Software Engineer', status: 'target', notes: '회계SaaS', salary: '', techStack: ['Ruby', 'Go'], url: 'https://jobs.freee.co.jp/entry/career/' },
  { id: 'jp25', name: 'Money Forward', logo: '💰', tier: 'tier3', country: 'jp', field: '핀테크/SaaS', position: 'Software Engineer', status: 'target', notes: '자산관리', salary: '', techStack: ['Ruby', 'Go'], url: 'https://recruit.moneyforward.com/' },
  { id: 'jp26', name: 'Cookpad', logo: '🍳', tier: 'tier3', country: 'jp', field: '푸드테크', position: 'Software Engineer', status: 'target', notes: '요리 레시피', salary: '', techStack: ['Ruby', 'Go'], url: 'https://cookpad.careers/' },
  { id: 'jp27', name: 'GMO Internet', logo: '🌍', tier: 'tier2', country: 'jp', field: '인터넷/핀테크', position: 'Engineer', status: 'target', notes: 'GMO', salary: '', techStack: ['PHP', 'Go'], url: 'https://internet.gmo/recruit/' },
  { id: 'jp28', name: 'GREE Holdings', logo: '🎲', tier: 'tier3', country: 'jp', field: '게임/엔터/테크', position: 'Game Engineer', status: 'target', notes: '그리', salary: '', techStack: ['Unity', 'PHP'], url: 'https://hd.gree.net/jp/ja/recruit/' },
  { id: 'jp29', name: 'MIXI Group', logo: '🎪', tier: 'tier3', country: 'jp', field: '엔터/플랫폼', position: 'Software Engineer', status: 'target', notes: '믹시, 몬스트', salary: '', techStack: ['Go', 'Kotlin'], url: 'https://mixigroup-recruit.mixi.co.jp/' },
  { id: 'jp30', name: 'PKSHA Technology', logo: '🧠', tier: 'tier3', country: 'jp', field: 'AI/엔터프라이즈', position: 'ML Engineer', status: 'target', notes: 'AI 솔루션', salary: '', techStack: ['Python', 'TensorFlow'], url: 'https://www.pkshatech.com/recruitment/' },

  // ===== 광주/전남 지역 =====
  // Tier 1 - 대기업/공기업
  { id: 'gj1', name: '한국전력공사', logo: '⚡', tier: 'tier1', country: 'gj', field: '에너지/공기업', position: '전력망 ICT 운영', status: 'target', notes: '전남 나주, 정보처리기사', salary: '', techStack: ['전산학', '정보처리기사'], url: 'https://recruit.kepco.co.kr' },
  { id: 'gj2', name: '삼성전자 광주사업장', logo: '📱', tier: 'tier1', country: 'gj', field: '가전/IoT', position: '제조 라인 전산 제어', status: 'target', notes: '광주 광산', salary: '', techStack: ['Embedded SW', '생산 전산'], url: 'https://www.samsung.com/sec/careers' },
  { id: 'gj3', name: 'POSCO DX', logo: '🏭', tier: 'tier1', country: 'gj', field: '스마트팩토리/AI', position: '스마트 팩토리 개발', status: 'target', notes: '전남 광양', salary: '', techStack: ['DCS 제어', '클라우드'], url: 'https://www.poscodx.co.kr/recruit' },
  { id: 'gj4', name: 'LG화학', logo: '🧪', tier: 'tier1', country: 'gj', field: '화학/디지털트윈', position: '제조 공정 데이터 분석', status: 'target', notes: '전남 여수', salary: '', techStack: ['Python', '스마트 팩토리'], url: 'https://careers.lg.com/main/index.do' },
  // Tier 2 - 공공기관/중견기업
  { id: 'gj5', name: '한전KDN', logo: '💡', tier: 'tier2', country: 'gj', field: '전력IT/SI', position: '전력 계통 SW 개발', status: 'target', notes: '전남 나주', salary: '', techStack: ['JAVA', 'JSP', 'eGovFrame', 'SQL'], url: 'https://www.kdn.com/content/recruit' },
  { id: 'gj6', name: '한국인터넷진흥원', logo: '🛡️', tier: 'tier2', country: 'gj', field: '보안/공공', position: '사이버 보안 분석', status: 'target', notes: 'KISA, 전남 나주', salary: '', techStack: ['정보보안기사', 'CISA', 'CISSP'], url: 'https://www.kisa.or.kr/401' },
  { id: 'gj7', name: '전력거래소', logo: '📊', tier: 'tier2', country: 'gj', field: '전력시장/공공', position: '전력 시장 시스템 개발', status: 'target', notes: '전남 나주', salary: '', techStack: ['실시간 데이터', '대용량 DB'], url: 'https://www.kpx.or.kr/www/main.do' },
  { id: 'gj8', name: '한국농수산식품유통공사', logo: '🌾', tier: 'tier2', country: 'gj', field: '농수산/빅데이터', position: '빅데이터 분석', status: 'target', notes: 'aT, 전남 나주', salary: '', techStack: ['데이터 마이닝', '통계 분석'], url: 'https://at.or.kr/home/recruit' },
  { id: 'gj9', name: '한국방송통신전파진흥원', logo: '📡', tier: 'tier2', country: 'gj', field: '전파/통신', position: '전파 관리 시스템 운영', status: 'target', notes: 'KCA, 전남 나주', salary: '', techStack: ['네트워크', '통신망 설계'], url: 'https://www.kca.kr/open_content/ko/recruit' },
  { id: 'gj10', name: '사립학교교직원연금공단', logo: '🏫', tier: 'tier2', country: 'gj', field: '금융/공공', position: '연금 관리 시스템 운영', status: 'target', notes: '전남 나주', salary: '', techStack: ['금융 전산', 'DB 최적화'], url: 'https://www.tp.or.kr/main.do' },
  { id: 'gj11', name: '한국콘텐츠진흥원', logo: '🎬', tier: 'tier2', country: 'gj', field: '콘텐츠/CT', position: 'CT 연구 지원 및 DB 운영', status: 'target', notes: 'KOCCA, 전남 나주', salary: '', techStack: ['문화기술', '시스템 기획'], url: 'https://www.kocca.kr/kocca/recruit' },
  { id: 'gj12', name: '농림식품기술기획평가원', logo: '🌱', tier: 'tier2', country: 'gj', field: 'R&D관리/공공', position: 'R&D 관리 시스템 운영', status: 'target', notes: '전남 나주', salary: '', techStack: ['국책과제 관리', '인프라 운영'], url: 'https://www.ipet.re.kr/recruit' },
  { id: 'gj13', name: '농림수산식품교육문화정보원', logo: '🚜', tier: 'tier2', country: 'gj', field: '스마트팜/빅데이터', position: '스마트팜 서비스 개발', status: 'target', notes: '전남 나주', salary: '', techStack: ['클라우드', '빅데이터'], url: 'https://www.epis.or.kr' },
  { id: 'gj14', name: 'HD현대삼호', logo: '🚢', tier: 'tier2', country: 'gj', field: '조선/ICT', position: '스마트 조선소 ICT', status: 'target', notes: '전남 영암, 영어 OPIc IM2', salary: '', techStack: ['ICT 인프라', '학사 이상'], url: 'https://hd-hhi.co.kr/career' },
  { id: 'gj15', name: '광주은행', logo: '🏦', tier: 'tier2', country: 'gj', field: '금융/지방은행', position: '디지털 뱅킹 개발', status: 'target', notes: '광주 동구', salary: '', techStack: ['JAVA', '모바일', '보안'], url: 'https://www.kjbank.com/recruit' },
  { id: 'gj16', name: 'GS칼텍스', logo: '⛽', tier: 'tier2', country: 'gj', field: '에너지/ERP', position: '플랜트 자동화 및 ERP', status: 'target', notes: '전남 여수', salary: '', techStack: ['SAP', '공정 제어(OT)'], url: 'https://www.gscaltex.com/ko/careers' },
  { id: 'gj17', name: '기아 광주공장', logo: '🚗', tier: 'tier2', country: 'gj', field: '자동차/MES', position: '생산 관리 시스템(MES)', status: 'target', notes: '광주 서구', salary: '', techStack: ['스마트 공정', '네트워크 보안'], url: 'https://career.kia.com' },
  { id: 'gj18', name: '금호타이어', logo: '🛞', tier: 'tier2', country: 'gj', field: '제조/SCM', position: '글로벌 SCM 전산', status: 'target', notes: '광주 광산', salary: '', techStack: ['ERP', '물류 시스템'], url: 'https://www.kumhotire.com/ko/recruit' },
  { id: 'gj19', name: '한화솔루션', logo: '☀️', tier: 'tier2', country: 'gj', field: '화학/자동화', position: '화학 공정 자동화', status: 'target', notes: '전남 여수', salary: '', techStack: ['스마트 생산', '전산 인프라'], url: 'https://www.hanwhasolutions.com/recruit' },
  { id: 'gj20', name: '롯데케미칼', logo: '🔬', tier: 'tier2', country: 'gj', field: '화학/보안', position: '산단 제조 ICT 및 보안', status: 'target', notes: '전남 여수', salary: '', techStack: ['보안 관제', '공정 데이터'], url: 'https://www.lottechem.com/recruit' },
  { id: 'gj21', name: '인공지능산업융합사업단', logo: '🤖', tier: 'tier2', country: 'gj', field: 'AI/공공', position: 'AI 프로젝트 관리', status: 'target', notes: '광주 북구', salary: '', techStack: ['AI 모델', '사업 기획'], url: 'https://www.ai-hub.or.kr' },
  { id: 'gj22', name: '광주과학기술원', logo: '🔬', tier: 'tier2', country: 'gj', field: 'AI/연구', position: 'AI/로보틱스 연구', status: 'target', notes: 'GIST, 광주 북구', salary: '', techStack: ['Python', 'C++', '석박사 우대'], url: 'https://www.gist.ac.kr/kr/html/recruit' },
  // Tier 3 - 지역 IT기업/스타트업
  { id: 'gj23', name: '라인정보통신', logo: '💻', tier: 'tier3', country: 'gj', field: 'SI/유지보수', position: '한전KDN 시스템 유지보수', status: 'target', notes: '전남 나주 파견', salary: '', techStack: ['JAVA', 'WebSquare', 'SQL'], url: 'https://www.lineinfo.co.kr' },
  { id: 'gj24', name: '카라멜라', logo: '🍬', tier: 'tier3', country: 'gj', field: '공공SI/SW', position: '공공기관 응용 SW 개발', status: 'target', notes: '전남 나주', salary: '', techStack: ['JAVA', 'JSP', '웹 개발'], url: 'https://www.caramela.co.kr' },
  { id: 'gj25', name: '누리씨앤아이', logo: '🔒', tier: 'tier3', country: 'gj', field: '보안/네트워크', position: '정보 보안 설비 유지보수', status: 'target', notes: '전남 광양', salary: '', techStack: ['CCTV', '보안', '네트워크'], url: 'https://www.nuri.co.kr' },
  { id: 'gj26', name: '서번텍', logo: '🖥️', tier: 'tier3', country: 'gj', field: 'HW/유지보수', position: '제철소 퍼스컴 점검', status: 'target', notes: '전남 광양', salary: '', techStack: ['HW 유지보수', 'PC 인프라'], url: 'https://www.subuntech.co.kr' },
  { id: 'gj27', name: '호그린에어', logo: '🚁', tier: 'tier3', country: 'gj', field: '드론/ICT', position: '드론 제어 시스템 개발', status: 'target', notes: '광주 광산', salary: '', techStack: ['무인 항공 제어', 'SW 개발'], url: 'https://www.hogreenair.com' },
  { id: 'gj28', name: '오딧세이글로벌', logo: '🔌', tier: 'tier3', country: 'gj', field: '스마트가전/융합', position: '스마트 가전 융합 개발', status: 'target', notes: '광주 서구', salary: '', techStack: ['IT/전자 융합', '시스템 설계'], url: 'https://www.odysseyglobal.co.kr' },
  { id: 'gj29', name: '유니컴퍼니', logo: '📲', tier: 'tier3', country: 'gj', field: 'IT플랫폼/앱', position: '웹/앱 응용 SW 개발', status: 'target', notes: '광주 서구', salary: '', techStack: ['웹/앱 개발', '서비스 운영'], url: 'https://www.uni-company.kr' },
  { id: 'gj30', name: '엘탑', logo: '📋', tier: 'tier3', country: 'gj', field: '공공SI/ISP', position: '공공 정보화 전략 개발', status: 'target', notes: '광주 북구', salary: '', techStack: ['ISP', 'SW 아키텍처'], url: 'https://www.ltop.co.kr' },
]

function companyRowToRecord(row: string[], headers: string[]): Company {
  const record: Record<string, string> = {}
  headers.forEach((header, index) => {
    record[header] = row[index] || ''
  })
  return {
    id: record.id || Date.now().toString(),
    name: record.name || '',
    logo: record.logo || '📋',
    tier: (record.tier as Company['tier']) || 'tier3',
    country: (record.country as Country) || 'kr',
    field: record.field || '',
    position: record.position || '',
    status: (record.status as ApplicationStatus) || 'target',
    deadline: record.deadline || undefined,
    appliedDate: record.appliedDate || undefined,
    notes: record.notes || '',
    salary: record.salary || undefined,
    techStack: record.techStack ? JSON.parse(record.techStack) : [],
    url: record.url || undefined
  }
}

function companyRecordToRow(record: Company): string[] {
  return [
    record.id,
    record.name,
    record.logo,
    record.tier,
    record.country,
    record.field,
    record.position,
    record.status,
    record.deadline || '',
    record.appliedDate || '',
    record.notes,
    record.salary || '',
    JSON.stringify(record.techStack),
    record.url || ''
  ]
}

export function CompanyPage() {
  const [selectedTier, setSelectedTier] = useState<'all' | 'tier1' | 'tier2' | 'tier3'>('all')
  const [selectedCountry, setSelectedCountry] = useState<'all' | 'kr' | 'jp' | 'gj'>('all')
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all')

  // Google Sheets 연동 - 지원 현황
  const {
    data: companiesFromSheet,
    isLoading: compLoading,
    isSaving: compSaving,
    isSignedIn,
    signIn,
    addItem: addCompany,
    updateItem: updateCompany,
    spreadsheetUrl
  } = useLifeOpsSheets<Company>(
    SHEET_CONFIGS.application,
    companyRowToRecord,
    companyRecordToRow
  )

  // 회사 목록 (Sheets에서 불러온 것 + 초기값)
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES)
  const [isInitialized, setIsInitialized] = useState(false)

  // Sheets에서 불러온 데이터로 companies 초기화 (INITIAL_COMPANIES와 병합)
  useEffect(() => {
    if (!compLoading && isSignedIn && !isInitialized) {
      // 기존 Sheet 데이터의 ID 목록
      const existingIds = new Set(companiesFromSheet.map(c => c.id))

      // Sheet에 없는 INITIAL_COMPANIES 찾기
      const missingCompanies = INITIAL_COMPANIES.filter(c => !existingIds.has(c.id))

      if (missingCompanies.length > 0) {
        // 누락된 회사들 Sheet에 추가
        const saveMissingCompanies = async () => {
          for (const company of missingCompanies) {
            await addCompany(company)
          }
        }
        saveMissingCompanies()
      }

      // 병합된 데이터로 상태 업데이트 (Sheet 데이터 + 누락된 회사들)
      const mergedCompanies = [...companiesFromSheet, ...missingCompanies]
      setCompanies(mergedCompanies)
      setIsInitialized(true)
    }
  }, [compLoading, companiesFromSheet, isSignedIn, isInitialized, addCompany])

  // Filter companies
  const filteredCompanies = companies.filter(c => {
    if (selectedTier !== 'all' && c.tier !== selectedTier) return false
    if (selectedCountry !== 'all' && c.country !== selectedCountry) return false
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false
    return true
  })

  // Stats
  const stats = {
    total: companies.length,
    applied: companies.filter(c => !['target', 'preparing'].includes(c.status)).length,
    inProgress: companies.filter(c => ['document', 'interview1', 'interview2'].includes(c.status)).length,
    offers: companies.filter(c => c.status === 'offer').length,
  }

  // Update company status
  const updateStatus = async (id: string, status: ApplicationStatus) => {
    const company = companies.find(c => c.id === id)
    if (!company) return

    const updatedCompany = {
      ...company,
      status,
      appliedDate: status === 'applied' ? new Date().toISOString().split('T')[0] : company.appliedDate
    }

    setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c))
    await updateCompany(id, updatedCompany)
  }

  // Get tier label
  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'tier1': return { label: 'Tier 1', color: 'text-yellow-400', desc: '최상위 IT 대기업' }
      case 'tier2': return { label: 'Tier 2', color: 'text-blue-400', desc: '대기업/유니콘' }
      case 'tier3': return { label: 'Tier 3', color: 'text-green-400', desc: '성장 스타트업' }
      default: return { label: '', color: '', desc: '' }
    }
  }

  // 로그인 필요 화면
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="text-6xl">🏢</div>
          <h1 className="text-2xl font-bold text-white">회사 관리</h1>
          <p className="text-gray-400">
            타겟 회사 목록과 지원 현황을 Google Sheets에 저장하여 관리합니다.
          </p>
          <button
            onClick={signIn}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 계정으로 시작하기
          </button>
          <Link
            to="/"
            className="block text-gray-500 hover:text-gray-400 text-sm"
          >
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 로딩 화면
  if (compLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader icon="🏢" title="회사 관리">
        {spreadsheetUrl && (
          <a
            href={spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-green-400 transition-colors"
            title="Google Sheets에서 보기"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H6v-2h3v2zm0-4H6v-2h3v2zm0-4H6V7h3v2zm9 8h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V7h7v2z"/>
            </svg>
          </a>
        )}
        <button
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="회사 추가 (준비 중)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </PageHeader>

      {/* Stats - Compact */}
      <div className="flex items-center gap-4 mb-3 bg-gray-800 rounded-xl px-4 py-2">
        <span className="text-lg">🏆</span>
        <div className="flex gap-4 text-sm">
          <span className="text-white"><span className="font-bold">{stats.total}</span> 타겟</span>
          <span className="text-blue-400"><span className="font-bold">{stats.applied}</span> 지원</span>
          <span className="text-purple-400"><span className="font-bold">{stats.inProgress}</span> 진행</span>
          <span className="text-green-400"><span className="font-bold">{stats.offers}</span> 합격</span>
        </div>
        <div className="flex-1"></div>
        <span className="text-xs text-gray-500">🇰🇷 {companies.filter(c => c.country === 'kr').length} | 🇯🇵 {companies.filter(c => c.country === 'jp').length} | 🏔️ {companies.filter(c => c.country === 'gj').length}</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value as typeof selectedCountry)}
          className="px-3 py-1.5 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">🌏 전체</option>
          <option value="kr">🇰🇷 한국</option>
          <option value="jp">🇯🇵 일본</option>
          <option value="gj">🏔️ 광주/전남</option>
        </select>
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value as typeof selectedTier)}
          className="px-3 py-1.5 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 티어</option>
          <option value="tier1">Tier 1</option>
          <option value="tier2">Tier 2</option>
          <option value="tier3">Tier 3</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
          className="px-3 py-1.5 bg-gray-800 rounded-lg text-white text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 상태</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <span className="px-3 py-1.5 text-gray-400 text-sm">
          {filteredCompanies.length}개
        </span>
      </div>

      {/* Saving indicator */}
      {compSaving && (
        <div className="mb-4 p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm text-center">
          저장 중...
        </div>
      )}

      {/* Company List - Compact View */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-700">
          {filteredCompanies.map(company => {
            const tierInfo = getTierLabel(company.tier)
            const statusConfig = STATUS_CONFIG[company.status]

            return (
              <div key={company.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 transition-colors">
                {/* Logo & Name */}
                <span className="text-lg flex-shrink-0 w-7">{company.logo}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm truncate">{company.name}</span>
                    <span className="text-xs text-gray-500">{company.country === 'jp' ? '🇯🇵' : company.country === 'gj' ? '🏔️' : '🇰🇷'}</span>
                    <span className={`text-xs ${tierInfo.color} hidden sm:inline`}>{tierInfo.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{company.field}</div>
                </div>

                {/* Status */}
                <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${statusConfig.bgColor} ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {company.status === 'target' && (
                    <button onClick={() => updateStatus(company.id, 'preparing')} className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded" title="준비 시작">▶</button>
                  )}
                  {company.status === 'preparing' && (
                    <button onClick={() => updateStatus(company.id, 'applied')} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded" title="지원 완료">📤</button>
                  )}
                  {company.status === 'applied' && (
                    <>
                      <button onClick={() => updateStatus(company.id, 'document')} className="p-1 text-cyan-400 hover:bg-cyan-500/20 rounded" title="서류 통과">✓</button>
                      <button onClick={() => updateStatus(company.id, 'rejected')} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="불합격">✗</button>
                    </>
                  )}
                  {company.status === 'document' && (
                    <>
                      <button onClick={() => updateStatus(company.id, 'interview1')} className="p-1 text-purple-400 hover:bg-purple-500/20 rounded" title="1차 면접">1</button>
                      <button onClick={() => updateStatus(company.id, 'rejected')} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="불합격">✗</button>
                    </>
                  )}
                  {company.status === 'interview1' && (
                    <>
                      <button onClick={() => updateStatus(company.id, 'interview2')} className="p-1 text-pink-400 hover:bg-pink-500/20 rounded" title="최종 면접">2</button>
                      <button onClick={() => updateStatus(company.id, 'rejected')} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="불합격">✗</button>
                    </>
                  )}
                  {company.status === 'interview2' && (
                    <>
                      <button onClick={() => updateStatus(company.id, 'offer')} className="p-1 text-green-400 hover:bg-green-500/20 rounded" title="합격">🎉</button>
                      <button onClick={() => updateStatus(company.id, 'rejected')} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="불합격">✗</button>
                    </>
                  )}
                  {(company.status === 'offer' || company.status === 'rejected') && (
                    <button onClick={() => updateStatus(company.id, 'target')} className="p-1 text-gray-400 hover:bg-gray-600 rounded" title="리셋">↺</button>
                  )}
                </div>

                {/* Link */}
                {company.url && (
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-500 hover:text-white flex-shrink-0"
                    title="채용 페이지"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Pipeline - Compact */}
      <div className="mt-4 bg-gray-800 rounded-xl p-3">
        <div className="flex gap-1 overflow-x-auto">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = companies.filter(c => c.status === status).length
            return (
              <div key={status} className={`flex-shrink-0 px-3 py-1.5 rounded-lg ${config.bgColor} text-center min-w-16`}>
                <div className={`text-lg font-bold ${config.color}`}>{count}</div>
                <div className="text-xs text-gray-400">{config.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
