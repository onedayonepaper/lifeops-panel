import { useState, useEffect } from 'react'

export interface WeatherData {
  temperature: number
  weatherCode: number
  humidity: number
  windSpeed: number
  isDay: boolean
  location: string
}

interface WeatherState {
  data: WeatherData | null
  isLoading: boolean
  error: string | null
}

// Weather code to description/emoji mapping
export function getWeatherInfo(code: number, isDay: boolean): { description: string; emoji: string } {
  const weatherMap: Record<number, { description: string; dayEmoji: string; nightEmoji: string }> = {
    0: { description: '맑음', dayEmoji: '☀️', nightEmoji: '🌙' },
    1: { description: '대체로 맑음', dayEmoji: '🌤️', nightEmoji: '🌙' },
    2: { description: '구름 조금', dayEmoji: '⛅', nightEmoji: '☁️' },
    3: { description: '흐림', dayEmoji: '☁️', nightEmoji: '☁️' },
    45: { description: '안개', dayEmoji: '🌫️', nightEmoji: '🌫️' },
    48: { description: '짙은 안개', dayEmoji: '🌫️', nightEmoji: '🌫️' },
    51: { description: '이슬비', dayEmoji: '🌧️', nightEmoji: '🌧️' },
    53: { description: '이슬비', dayEmoji: '🌧️', nightEmoji: '🌧️' },
    55: { description: '이슬비', dayEmoji: '🌧️', nightEmoji: '🌧️' },
    61: { description: '비', dayEmoji: '🌧️', nightEmoji: '🌧️' },
    63: { description: '비', dayEmoji: '🌧️', nightEmoji: '🌧️' },
    65: { description: '강한 비', dayEmoji: '🌧️', nightEmoji: '🌧️' },
    71: { description: '눈', dayEmoji: '🌨️', nightEmoji: '🌨️' },
    73: { description: '눈', dayEmoji: '🌨️', nightEmoji: '🌨️' },
    75: { description: '강한 눈', dayEmoji: '❄️', nightEmoji: '❄️' },
    77: { description: '싸락눈', dayEmoji: '🌨️', nightEmoji: '🌨️' },
    80: { description: '소나기', dayEmoji: '🌦️', nightEmoji: '🌧️' },
    81: { description: '소나기', dayEmoji: '🌦️', nightEmoji: '🌧️' },
    82: { description: '강한 소나기', dayEmoji: '⛈️', nightEmoji: '⛈️' },
    85: { description: '눈보라', dayEmoji: '🌨️', nightEmoji: '🌨️' },
    86: { description: '강한 눈보라', dayEmoji: '❄️', nightEmoji: '❄️' },
    95: { description: '뇌우', dayEmoji: '⛈️', nightEmoji: '⛈️' },
    96: { description: '우박 뇌우', dayEmoji: '⛈️', nightEmoji: '⛈️' },
    99: { description: '강한 우박 뇌우', dayEmoji: '⛈️', nightEmoji: '⛈️' },
  }

  const weather = weatherMap[code] || { description: '알 수 없음', dayEmoji: '❓', nightEmoji: '❓' }
  return {
    description: weather.description,
    emoji: isDay ? weather.dayEmoji : weather.nightEmoji
  }
}

// Reverse geocoding to get city name
async function getCityName(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko`
    )
    const data = await response.json()
    return data.address?.city || data.address?.town || data.address?.village || data.address?.county || '현재 위치'
  } catch {
    return '현재 위치'
  }
}

export function useWeather(): WeatherState & { refresh: () => void } {
  const [state, setState] = useState<WeatherState>({
    data: null,
    isLoading: true,
    error: null
  })

  const fetchWeather = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        })
      })

      const { latitude, longitude } = position.coords

      // Fetch weather from Open-Meteo
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto`
      )

      if (!weatherResponse.ok) {
        throw new Error('날씨 정보를 가져올 수 없습니다')
      }

      const weatherData = await weatherResponse.json()
      const current = weatherData.current

      // Get city name
      const location = await getCityName(latitude, longitude)

      setState({
        data: {
          temperature: Math.round(current.temperature_2m),
          weatherCode: current.weather_code,
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          isDay: current.is_day === 1,
          location
        },
        isLoading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof GeolocationPositionError
        ? '위치 권한을 허용해주세요'
        : '날씨 정보를 가져올 수 없습니다'

      setState({
        data: null,
        isLoading: false,
        error: errorMessage
      })
    }
  }

  useEffect(() => {
    fetchWeather()

    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { ...state, refresh: fetchWeather }
}
