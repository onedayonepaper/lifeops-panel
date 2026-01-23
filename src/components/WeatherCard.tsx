import { useWeather, getWeatherInfo } from '../hooks/useWeather'

export function WeatherCard() {
  const { data, isLoading, error, refresh } = useWeather()

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-4 shadow-lg text-white">
        <div className="flex items-center justify-center h-20">
          <div className="animate-pulse">날씨 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-4 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button
            onClick={refresh}
            className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const weatherInfo = getWeatherInfo(data.weatherCode, data.isDay)

  return (
    <div className={`rounded-2xl p-4 shadow-lg text-white card-hover ${
      data.isDay
        ? 'bg-gradient-to-br from-sky-500 to-blue-600'
        : 'bg-gradient-to-br from-indigo-800 to-slate-900'
    }`}>
      <div className="flex items-center justify-between">
        {/* Left: Temperature & Weather */}
        <div className="flex items-center gap-3">
          <span className="text-5xl">{weatherInfo.emoji}</span>
          <div>
            <div className="text-4xl font-bold">{data.temperature}°</div>
            <div className="text-sm opacity-90">{weatherInfo.description}</div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="text-right">
          <div className="text-sm font-medium mb-1">{data.location}</div>
          <div className="text-xs opacity-80 space-y-0.5">
            <div>💧 {data.humidity}%</div>
            <div>💨 {data.windSpeed}km/h</div>
          </div>
        </div>
      </div>
    </div>
  )
}
