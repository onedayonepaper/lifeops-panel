import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDateKorean } from '../utils/date'

export function ClockPage() {
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')
  const date = formatDateKorean()

  // 시간대에 따른 배경색
  const hour = time.getHours()
  const isNight = hour >= 22 || hour < 6
  const isMorning = hour >= 6 && hour < 12
  const isAfternoon = hour >= 12 && hour < 18
  const isEvening = hour >= 18 && hour < 22

  const getBgGradient = () => {
    if (isNight) return 'from-gray-900 via-slate-900 to-gray-950'
    if (isMorning) return 'from-orange-900/30 via-yellow-900/20 to-gray-900'
    if (isAfternoon) return 'from-blue-900/30 via-sky-900/20 to-gray-900'
    if (isEvening) return 'from-purple-900/30 via-pink-900/20 to-gray-900'
    return 'from-gray-900 to-gray-950'
  }

  const getGreeting = () => {
    if (isNight) return '좋은 밤 되세요 🌙'
    if (isMorning) return '좋은 아침이에요 ☀️'
    if (isAfternoon) return '좋은 오후예요 🌤️'
    if (isEvening) return '좋은 저녁이에요 🌅'
    return ''
  }

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br ${getBgGradient()} flex flex-col items-center justify-center cursor-pointer z-50`}
      onClick={() => navigate(-1)}
    >
      {/* 뒤로가기 힌트 */}
      <div className="absolute top-4 left-4 text-gray-500 text-sm flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>아무 곳이나 클릭하면 돌아가요</span>
      </div>

      {/* 인사말 */}
      <div className="text-2xl sm:text-3xl text-gray-400 mb-4 sm:mb-8">
        {getGreeting()}
      </div>

      {/* 시계 */}
      <div className="text-center">
        <div className="font-mono font-extralight tracking-wider">
          <span className="text-7xl sm:text-9xl md:text-[12rem] text-white">
            {hours}
          </span>
          <span className="text-7xl sm:text-9xl md:text-[12rem] text-gray-500 animate-pulse">
            :
          </span>
          <span className="text-7xl sm:text-9xl md:text-[12rem] text-white">
            {minutes}
          </span>
        </div>
        <div className="text-3xl sm:text-5xl md:text-6xl font-mono font-extralight text-gray-500 mt-2 sm:mt-4">
          {seconds}
        </div>
      </div>

      {/* 날짜 */}
      <div className="text-xl sm:text-2xl md:text-3xl text-gray-400 mt-8 sm:mt-12">
        {date}
      </div>

      {/* 프로그레스 바 - 하루 진행률 */}
      <div className="absolute bottom-8 left-8 right-8">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>00:00</span>
          <span className="text-gray-400">
            하루의 {Math.round((hour * 60 + time.getMinutes()) / 14.4)}% 지남
          </span>
          <span>24:00</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: `${((hour * 60 + time.getMinutes()) / 1440) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
