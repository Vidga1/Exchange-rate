import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
const PORT = 3001

// Включаем CORS
app.use(cors())

// API endpoint для проксирования запросов к киргизскому банку
app.get('/api/nbkr', async (req, res) => {
  try {
    const response = await fetch('https://www.nbkr.kg/XML/daily.xml', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.text()

    res.setHeader('Content-Type', 'application/xml')
    res.send(data)
  } catch (error) {
    console.error('Ошибка при получении данных от NBKR:', error)
    res.status(500).json({ error: 'Не удалось получить данные от API киргизского банка' })
  }
})

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`)
  console.log(`API доступен по адресу: http://localhost:${PORT}/api/nbkr`)
})
