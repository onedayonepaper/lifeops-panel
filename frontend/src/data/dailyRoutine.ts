// 일일 루틴 템플릿 데이터
export interface RoutineEvent {
  startTime: string // HH:mm
  endTime: string   // HH:mm
  title: string
}

// 2024.01.26 (일) - 무리 없이 성공하는 버전
export const DAILY_ROUTINE: RoutineEvent[] = [
  { startTime: '11:30', endTime: '12:10', title: '몸 깨우기 + 정리 (물 한 컵, 세면/양치, 스트레칭 5분, 방 환기, 할 일 메모)' },
  { startTime: '12:10', endTime: '12:40', title: '첫 끼(브런치) - 밥/빵 + 단백질, 커피/차 한 번' },
  { startTime: '12:40', endTime: '13:20', title: '유산소 (워밍업 5분 → 천국의 계단 20분 → 쿨다운 5분 + 스트레칭)' },
  { startTime: '13:20', endTime: '14:00', title: '샤워 + 작업 세팅 (샤워/로션/옷, 책상 정리, 타이머 준비)' },
  { startTime: '14:00', endTime: '15:30', title: '취업 준비 [핵심1] - 최근 1개 프로젝트 정리, STAR 3줄, 포트폴리오 링크 모으기' },
  { startTime: '15:30', endTime: '15:50', title: '쉬는 시간 (10분 걷기/정리/설거지, 눈/목 스트레칭)' },
  { startTime: '15:50', endTime: '16:50', title: '일본어 1시간 [핵심2] - 히라가나 10개 + 단어 5개 + 소리내어 읽기' },
  { startTime: '16:50', endTime: '18:10', title: '개발/포트폴리오 [핵심3] - 프로젝트 1개, 기능 1개, README + 스크린샷, 커밋 1번' },
  { startTime: '18:10', endTime: '18:50', title: '근력운동 30분 + 마무리 (스쿼트/푸쉬업/로우/플랭크 + 스트레칭 5분)' },
  { startTime: '18:50', endTime: '20:00', title: '저녁 + 리셋 (저녁 식사, 식후 10분 걷기)' },
  { startTime: '20:00', endTime: '21:00', title: '지원/정리 1시간 - 회사/공고 3개 저장, 이력서 수정 메모 3줄' },
  { startTime: '21:00', endTime: '23:00', title: '자유시간 (가벼운 취미/휴식)' },
  { startTime: '23:00', endTime: '23:30', title: '마감 루틴 - 내일 할 일 3개 적고 종료' },
]
