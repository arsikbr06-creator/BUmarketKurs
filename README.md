# БУ Маркет — клиентская часть маркетплейса подержанных вещей

Курсовая работа по дисциплине **«Фронтенд-разработка»**.
МИРЭА — Российский технологический университет.

> Нормативный документ: Инструкция по организации и проведению курсового проектирования
> СМКО МИРЭА 7.5.1/04.11.05-18.

## Технологии

- **HTML5, CSS3, JavaScript ES6+** — без фреймворков
- **Vite** — сборщик и dev-сервер
- **БЭМ** — методология именования CSS-классов
- **ООП** — каждый UI-компонент это класс с методами `render()`, `init()`, `destroy()`
- **ES6 модули** — один класс на файл
- **History API + hash-роутинг** — клиентская SPA-навигация
- **localStorage / sessionStorage** — хранение объявлений, черновиков, кэша валют
- **ExchangeRate API** — конвертация цен в RUB / USD / EUR
- **Geo API** — подсказки городов в форме создания

## Возможности

- Главная страница с hero-блоком, статистикой, категориями и свежими объявлениями
- Каталог с поиском (debounce 300мс), фильтрами по категории и цене (AND-логика), пагинацией по 20 объявлений
- Детальная страница объявления с конвертацией цены в три валюты
- Форма создания объявления с валидацией, автосохранением черновика и загрузкой фото
- Личный кабинет с моими объявлениями, статистикой и удалением
- Адаптивная вёрстка от 320px до 1920px (1/2/3/4 колонки), гамбургер-меню на мобильных
- Страница 404 для несуществующих маршрутов

## Запуск локально

```bash
npm install
npm run dev
```

Откроется по адресу `http://localhost:5173/`.

## Сборка production

```bash
npm run build
npm run preview
```

## Публикация на GitHub Pages

1. Создать репозиторий на GitHub (например `KursachFRONT`).

2. Если имя репозитория отличается от `KursachFRONT`, поменять параметр `base` в `vite.config.js`:

```js
const base = process.env.VITE_BASE || '/имя-репо/';
```

3. Инициализировать git и запушить код:

```bash
git init
git add .
git commit -m "init: client-side marketplace for used items"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

4. Опубликовать на GitHub Pages:

```bash
npm run deploy
```

Команда соберёт проект в `dist/` и запушит содержимое в ветку `gh-pages`.

5. В настройках репозитория на GitHub: **Settings → Pages → Source → ветка `gh-pages`**.

Через минуту приложение будет доступно по адресу:
```
https://<username>.github.io/<repo>/
```

## Структура проекта

```
KursachFRONT/
├── index.html              ← точка входа Vite
├── vite.config.js
├── package.json
├── .eslintrc.js / .prettierrc / .gitignore
├── public/
│   ├── data/listings.json  ← начальные объявления
│   └── images/             ← фотографии товаров
└── src/
    ├── main.js             ← bootstrap
    ├── api/
    │   └── API_Client.js   ← внешние API + кэш
    ├── router/
    │   └── Router.js       ← hash-роутер для GitHub Pages
    ├── components/
    │   ├── Component.js    ← базовый класс
    │   ├── Header.js
    │   ├── Footer.js
    │   ├── Catalog.js
    │   ├── ListingCard.js
    │   ├── ListingDetail.js
    │   ├── CreateForm.js
    │   ├── SearchBar.js
    │   └── FilterPanel.js
    ├── pages/
    │   ├── HomePage.js
    │   └── ProfilePage.js
    ├── utils/              ← debounce, format, storage, resolveImage, filter
    └── styles/             ← БЭМ-блоки, переменные, reset
```

## Скрипты npm

| Команда | Назначение |
|---------|-----------|
| `npm run dev` | Запуск dev-сервера на `http://localhost:5173/` |
| `npm run build` | Сборка production в папку `dist/` |
| `npm run preview` | Предпросмотр собранного проекта |
| `npm run lint` | Проверка кода ESLint |
| `npm run format` | Форматирование Prettier |
| `npm run deploy` | Сборка и публикация на GitHub Pages |
