export default async function handler(req, res) {
  // Устанавливаем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Обрабатываем preflight запросы
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    // Делаем запрос к API киргизского банка
    const response = await fetch('https://www.nbkr.kg/XML/daily.xml', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.text()

    // Возвращаем данные с правильными заголовками
    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(data)
  } catch (error) {
    console.error('Ошибка при получении данных от NBKR:', error)
    res.status(500).json({ error: 'Не удалось получить данные от API киргизского банка' })
  }
}
