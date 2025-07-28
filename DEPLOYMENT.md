# Инструкции по развертыванию

## Локальная разработка

1. Запустите полную среду разработки (сервер + клиент):

```bash
npm run dev:full
```

2. Или запустите отдельно:

```bash
# Терминал 1: API сервер
npm run server

# Терминал 2: Клиент
npm run dev
```

## Развертывание в продакшене

### Вариант 1: Vercel (Рекомендуется)

1. Установите Vercel CLI:

```bash
npm i -g vercel
```

2. Разверните приложение:

```bash
vercel
```

3. Приложение будет доступно по адресу: `https://your-app.vercel.app`

### Вариант 2: Netlify

1. Создайте файл `netlify.toml`:

```toml
[build]
  publish = "dist"
  functions = "api"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

2. Разверните через Netlify Dashboard или CLI

### Вариант 3: Другие платформы

Любая платформа, поддерживающая serverless functions (Vercel, Netlify, AWS Lambda, Google Cloud Functions, Azure Functions).

## Структура проекта

- `api/nbkr.js` - Serverless функция для проксирования API киргизского банка
- `server.js` - Локальный сервер для разработки
- `vercel.json` - Конфигурация Vercel
- `src/App.tsx` - Основное приложение

## API Endpoints

- `/api/nbkr` - Прокси к API киргизского банка (https://www.nbkr.kg/XML/daily.xml)

## Преимущества этого решения

1. **Надежность**: Собственный серверный прокси работает стабильно
2. **Безопасность**: Нет зависимости от внешних прокси
3. **Производительность**: Быстрые ответы от собственного API
4. **Контроль**: Полный контроль над логикой обработки запросов
5. **Бесплатность**: Vercel и Netlify предоставляют бесплатные планы
