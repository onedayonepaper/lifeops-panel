// 일일 루틴 템플릿 데이터
export interface RoutineEvent {
  startTime: string // HH:mm
  endTime: string   // HH:mm
  title: string
}

export const DAILY_ROUTINE: RoutineEvent[] = [
  { startTime: '06:30', endTime: '06:40', title: '기상 + 물 한 컵' },
  { startTime: '06:40', endTime: '06:55', title: '모빌리티/자세교정 15분 (목·어깨·흉추·고관절 + 플랭크 30초×2)' },
  { startTime: '06:55', endTime: '07:05', title: '세안 + 스킨케어(선크림)' },
  { startTime: '07:05', endTime: '07:45', title: '아침(푸짐하게)' },
  { startTime: '07:45', endTime: '07:55', title: '식후 10분 걷기' },

  { startTime: '08:05', endTime: '09:20', title: '유산소(걷기+러닝)' },
  { startTime: '09:20', endTime: '09:35', title: '쿨다운 스트레칭(종아리/햄스트링/둔근)' },
  { startTime: '09:35', endTime: '10:00', title: '샤워 + 보습/헤어' },
  { startTime: '10:00', endTime: '10:15', title: '폼롤러/근막이완 15분' },

  { startTime: '10:30', endTime: '12:30', title: '집중 작업: 키오스크/개발 1세션 (MVP 한 조각)' },
  { startTime: '12:30', endTime: '13:10', title: '점심' },
  { startTime: '13:10', endTime: '13:20', title: '식후 10분 걷기' },
  { startTime: '13:30', endTime: '14:30', title: '휴식/카페/볼일(버퍼)' },

  { startTime: '14:30', endTime: '15:30', title: '공부 1시간(일본어/토스스피킹/개발)' },
  { startTime: '15:30', endTime: '16:00', title: '전신 근력(홈트) 30분 - 스쿼트/푸시업/로우(밴드)/힙힌지/코어' },

  { startTime: '16:00', endTime: '16:15', title: '정리: 러닝 기록 + 오늘 산출물 정리(커밋/메모)' },
  { startTime: '16:15', endTime: '18:00', title: '자유시간/데이트/취미' },

  { startTime: '18:00', endTime: '19:00', title: '저녁' },
  { startTime: '19:00', endTime: '19:10', title: '식후 10분 걷기' },
  { startTime: '19:30', endTime: '20:00', title: '저녁 바디케어(자세/스트레칭 + 호흡 2분)' },

  { startTime: '20:00', endTime: '20:30', title: '미래를 위한 1일 액션(재무/주식/리서치)' },
  { startTime: '20:30', endTime: '21:00', title: '내일 준비(캘린더/할일/가방)' },
  { startTime: '21:00', endTime: '22:30', title: '자유시간(가벼운 취미/정리)' },
  { startTime: '22:30', endTime: '23:00', title: '디지털 디톡스/독서' },
  { startTime: '23:00', endTime: '23:15', title: '야간 스킨케어(세안+보습) + 발/손 케어' },
  { startTime: '23:30', endTime: '00:00', title: '취침 준비' },
]
