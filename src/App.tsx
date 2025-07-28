import { useState, useEffect } from 'react'
import './index.css'

interface ExchangeRates {
  USD: number
  KGS: number
  RUB: number
}

function App() {
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [kgsAmount, setKgsAmount] = useState<string>('')
  const [rubAmount, setRubAmount] = useState<string>('')
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const fetchExchangeRates = async () => {
    setLoading(true)
    setError('')

    try {
      const cbrResponse = await fetch('https://www.cbr-xml-daily.ru/daily_json.js')
      const cbrData = await cbrResponse.json()

      let usdKgsRate = 0

      try {
        // В продакшене используем CORS прокси для обхода ограничений
        const nbkrUrl = import.meta.env.DEV ? '/api/nbkr' : 'https://corsproxy.io/?https://www.nbkr.kg/XML/daily.xml'

        console.log('Пытаемся получить курс KGS через URL:', nbkrUrl)
        const nbkrResponse = await fetch(nbkrUrl)
        const nbkrText = await nbkrResponse.text()

        const parser = new DOMParser()
        const nbkrXml = parser.parseFromString(nbkrText, 'text/xml')
        const usdElement = nbkrXml.querySelector('Currency[ISOCode="USD"]')
        usdKgsRate = usdElement ? parseFloat(usdElement.querySelector('Value')?.textContent || '0') : 0
      } catch (err) {
        console.log('KGS установлен в 0 (ошибка API)')

        // Fallback: попробуем альтернативный прокси
        if (!import.meta.env.DEV) {
          try {
            const fallbackUrl = 'https://api.allorigins.win/raw?url=https://www.nbkr.kg/XML/daily.xml'
            console.log('Пробуем fallback прокси:', fallbackUrl)
            const fallbackResponse = await fetch(fallbackUrl)
            const fallbackText = await fallbackResponse.text()

            const parser = new DOMParser()
            const nbkrXml = parser.parseFromString(fallbackText, 'text/xml')
            const usdElement = nbkrXml.querySelector('Currency[ISOCode="USD"]')
            usdKgsRate = usdElement ? parseFloat(usdElement.querySelector('Value')?.textContent || '0') : 0
          } catch (fallbackErr) {
            console.log('Fallback прокси также не сработал')

            // Третий fallback: попробуем другой CORS прокси
            try {
              const thirdFallbackUrl = 'https://cors-anywhere.herokuapp.com/https://www.nbkr.kg/XML/daily.xml'
              console.log('Пробуем третий fallback прокси:', thirdFallbackUrl)
              const thirdFallbackResponse = await fetch(thirdFallbackUrl)
              const thirdFallbackText = await thirdFallbackResponse.text()

              const parser = new DOMParser()
              const nbkrXml = parser.parseFromString(thirdFallbackText, 'text/xml')
              const usdElement = nbkrXml.querySelector('Currency[ISOCode="USD"]')
              usdKgsRate = usdElement ? parseFloat(usdElement.querySelector('Value')?.textContent || '0') : 0
            } catch (thirdFallbackErr) {
              console.log('Все прокси не сработали, пробуем альтернативный источник')

              // Попробуем получить курс KGS через другой API
              try {
                const alternativeUrl = 'https://api.exchangerate-api.com/v4/latest/USD'
                console.log('Пробуем альтернативный API:', alternativeUrl)
                const alternativeResponse = await fetch(alternativeUrl)
                const alternativeData = await alternativeResponse.json()
                usdKgsRate = alternativeData.rates?.KGS || 0
                console.log('Получен курс KGS из альтернативного API:', usdKgsRate)
              } catch (alternativeErr) {
                console.log('Альтернативный API не сработал')
                // Не устанавливаем статический курс, оставляем 0
              }
            }
          }
        }
      }

      const usdRubRate = cbrData.Valute?.USD?.Value || 0

      if (usdRubRate === 0 || usdKgsRate === 0) {
        setRates({
          USD: 1,
          KGS: 0,
          RUB: 0,
        })
        setError('Не удалось получить курсы валют. Значения установлены в 0.')
      } else {
        setRates({
          USD: 1,
          KGS: usdKgsRate,
          RUB: usdRubRate,
        })
      }
    } catch (err) {
      console.error('Ошибка при получении курсов валют:', err)
      setError('Не удалось получить курсы валют. Значения установлены в 0.')
      setRates({
        USD: 1,
        KGS: 0,
        RUB: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUsdChange = (value: string) => {
    setUsdAmount(value)

    if (rates && value && !isNaN(Number(value))) {
      const usd = parseFloat(value)
      const kgs = (usd * rates.KGS).toFixed(2)
      const rub = (usd * rates.RUB).toFixed(2)

      setKgsAmount(kgs)
      setRubAmount(rub)
    } else {
      setKgsAmount('')
      setRubAmount('')
    }
  }

  const handleKgsChange = (value: string) => {
    setKgsAmount(value)

    if (rates && value && !isNaN(Number(value))) {
      const kgs = parseFloat(value)
      const usd = (kgs / rates.KGS).toFixed(2)
      const rub = ((kgs * rates.RUB) / rates.KGS).toFixed(2)

      setUsdAmount(usd)
      setRubAmount(rub)
    } else {
      setUsdAmount('')
      setRubAmount('')
    }
  }

  const handleRubChange = (value: string) => {
    setRubAmount(value)

    if (rates && value && !isNaN(Number(value))) {
      const rub = parseFloat(value)
      const usd = (rub / rates.RUB).toFixed(2)
      const kgs = ((rub * rates.KGS) / rates.RUB).toFixed(2)

      setUsdAmount(usd)
      setKgsAmount(kgs)
    } else {
      setUsdAmount('')
      setKgsAmount('')
    }
  }

  useEffect(() => {
    fetchExchangeRates()
  }, [])

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
      <div className='bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-gray-600/50 backdrop-blur-sm'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3'>
            Конвертер валют
          </h1>
          <div className='w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg'></div>
        </div>

        {error && (
          <div className='text-red-400 text-center mb-6 text-base bg-red-900/30 border border-red-500/40 rounded-xl p-4 backdrop-blur-sm'>
            {error}
          </div>
        )}

        {rates && (
          <div className='text-gray-300 text-center mb-8 text-base bg-gradient-to-r from-gray-700/80 to-gray-600/80 border border-gray-500/50 rounded-2xl p-5 backdrop-blur-sm shadow-lg'>
            <div className='font-semibold text-gray-200 mb-3 text-lg'>Текущие курсы</div>
            <div className='space-y-2'>
              <div className='text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
                1 USD = {rates.KGS.toFixed(2)} KGS
              </div>
              <div className='text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
                1 USD = {rates.RUB.toFixed(2)} RUB
              </div>
            </div>
          </div>
        )}

        <div className='space-y-6'>
          <div className='group'>
            <label className='block text-gray-300 text-base font-semibold mb-3 flex items-center gap-3'>
              <div className='w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg'>
                $
              </div>
              <span className='text-lg'>USD (Доллар США)</span>
            </label>
            <input
              type='number'
              value={usdAmount}
              onChange={(e) => handleUsdChange(e.target.value)}
              placeholder='0.00'
              className='w-full px-5 py-4 bg-gray-700/80 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover:border-gray-500/70 backdrop-blur-sm text-lg shadow-inner'
            />
          </div>

          <div className='group'>
            <label className='block text-gray-300 text-base font-semibold mb-3 flex items-center gap-3'>
              <div className='w-7 h-7 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg'>
                ₸
              </div>
              <span className='text-lg'>KGS (Кыргызский сом)</span>
            </label>
            <input
              type='number'
              value={kgsAmount}
              onChange={(e) => handleKgsChange(e.target.value)}
              placeholder='0.00'
              className='w-full px-5 py-4 bg-gray-700/80 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 group-hover:border-gray-500/70 backdrop-blur-sm text-lg shadow-inner'
            />
          </div>

          <div className='group'>
            <label className='block text-gray-300 text-base font-semibold mb-3 flex items-center gap-3'>
              <div className='w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg'>
                ₽
              </div>
              <span className='text-lg'>RUB (Российский рубль)</span>
            </label>
            <input
              type='number'
              value={rubAmount}
              onChange={(e) => handleRubChange(e.target.value)}
              placeholder='0.00'
              className='w-full px-5 py-4 bg-gray-700/80 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 group-hover:border-gray-500/70 backdrop-blur-sm text-lg shadow-inner'
            />
          </div>
        </div>

        <button
          onClick={fetchExchangeRates}
          disabled={loading}
          className='w-full mt-8 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-lg rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transform hover:scale-105 disabled:transform-none shadow-xl hover:shadow-2xl'
        >
          {loading ? (
            <div className='flex items-center justify-center gap-3'>
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              <span>Обновление...</span>
            </div>
          ) : (
            'Обновить курсы валют'
          )}
        </button>
      </div>
    </div>
  )
}

export default App
