# Технический дизайн: Клиентская часть маркетплейса подержанных вещей

## Обзор

Проект представляет собой одностраничное приложение (SPA) на чистом JavaScript (ES6+) без фреймворков, реализующее клиентскую часть маркетплейса объявлений о продаже подержанных вещей. Приложение собирается с помощью Vite, публикуется на GitHub Pages и следует методологии БЭМ для CSS-классов.

Ключевые характеристики:
- **Архитектура**: SPA с клиентским роутингом через History API
- **Стек**: HTML5, CSS3, JavaScript ES6+, Vite
- **Методология CSS**: БЭМ (блок, блок__элемент, блок--модификатор)
- **Паттерн JS**: ООП — каждый UI-компонент является классом с методами `render()`, `init()`, `destroy()`
- **Модульность**: ES6-модули, один класс — один файл
- **Хранилище**: localStorage (объявления, черновики), sessionStorage (кэш валют)
- **Внешние API**: Currency API (курсы валют), Geo API (подсказки адресов)

---

## Архитектура

### Общая схема

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                    (точка входа Vite)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                    main.js (bootstrap)
                          │
          ┌───────────────┼───────────────┐
          │               │               │
       Router          App           API_Client
          │               │               │
    registerRoute()   init()        fetchListings()
    navigate()        render()      fetchListingById()
    handlePopState()               fetchCurrencyRates()
                                   fetchGeoSuggestions()
                          │
          ┌───────────────┼───────────────────────────┐
          │               │               │            │
       Catalog    Listing_Detail    Create_Form    HomePage
          │
    ┌─────┴──────┐
 Search_Bar  Filter_Panel
```

### Слои приложения

```
┌──────────────────────────────────────────────────────────────┐
│  Presentation Layer (UI Components)                          │
│  Catalog, Listing_Card, Listing_Detail, Create_Form,         │
│  Search_Bar, Filter_Panel, HomePage                          │
├──────────────────────────────────────────────────────────────┤
│  Routing Layer                                               │
│  Router — History API, registerRoute, navigate, popstate     │
├──────────────────────────────────────────────────────────────┤
│  Data / Service Layer                                        │
│  API_Client — fetch, кэширование, обработка ошибок           │
├──────────────────────────────────────────────────────────────┤
│  Storage Layer                                               │
│  localStorage (объявления, черновики)                        │
│  sessionStorage (кэш Currency API)                           │
└──────────────────────────────────────────────────────────────┘
```

### Поток данных

```
User Action
    │
    ▼
UI Component (render/init)
    │
    ├──► Router.navigate(path)  ──► обновление URL + рендер страницы
    │
    └──► API_Client.fetch*()
              │
              ├──► sessionStorage (кэш валют)
              ├──► localStorage (объявления/черновики)
              └──► External API (Currency API / Geo API)
                        │
                        ▼
                  Component.render() ──► DOM update
```

---

## Компоненты и интерфейсы

### Базовый класс Component

Все UI-компоненты наследуют общий контракт:

```js
// src/components/Component.js
export class Component {
  constructor(props = {}) {
    this.props = props;
    this._element = null;
    this._listeners = [];
  }

  // Возвращает/вставляет DOM-узел компонента
  render() { throw new Error('render() must be implemented'); }

  // Навешивает обработчики событий
  init() { throw new Error('init() must be implemented'); }

  // Удаляет обработчики и DOM-узел
  destroy() {
    this._listeners.forEach(({ el, event, handler }) =>
      el.removeEventListener(event, handler)
    );
    this._listeners = [];
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element = null;
  }

  // Вспомогательный метод регистрации слушателей
  _addListener(el, event, handler) {
    el.addEventListener(event, handler);
    this._listeners.push({ el, event, handler });
  }
}
```

### Router

```js
// src/router/Router.js
export class Router {
  constructor(rootElement)
  registerRoute(path, handler)   // path — строка или RegExp
  navigate(path)                 // pushState + вызов handler
  handlePopState()               // обработчик события popstate
  _matchRoute(path)              // возвращает { handler, params }
  _render404()                   // отображает страницу 404
}
```

Маршруты приложения:

| Путь | Компонент | Описание |
|------|-----------|----------|
| `/` | HomePage | Главная страница |
| `/catalog` | Catalog | Каталог объявлений |
| `/listing/:id` | Listing_Detail | Детальная страница |
| `/create` | Create_Form | Форма создания |
| `*` | 404 Page | Страница не найдена |

### API_Client

```js
// src/api/API_Client.js
export class API_Client {
  constructor(config)
  async fetchListings()                    // GET /api/listings
  async fetchListingById(id)               // GET /api/listings/:id
  async fetchCurrencyRates()               // Currency API + sessionStorage кэш
  async fetchGeoSuggestions(query)         // Geo API (min 3 символа)
  _getCachedRates()                        // sessionStorage → объект или null
  _setCachedRates(data)                    // сохранить в sessionStorage
}
```

Конфигурация `API_Client`:

```js
const config = {
  listingsUrl: '/data/listings.json',      // или REST endpoint
  currencyApiUrl: 'https://api.exchangerate.host/latest',
  geoApiUrl: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
  currencyCacheKey: 'currency_rates_cache',
  currencyTimeout: 5000,                   // мс
};
```

### Catalog

```js
// src/components/Catalog.js
export class Catalog extends Component {
  constructor({ apiClient, router })
  render()          // вставляет сетку карточек в DOM
  init()            // подписывается на Search_Bar и Filter_Panel
  destroy()         // очищает дочерние компоненты и слушатели
  _loadListings()   // вызывает apiClient.fetchListings()
  _applyFilters()   // применяет поиск + фильтры, обновляет сетку
  _renderPage(page) // рендерит страницу пагинации
  _renderPagination()
  _showLoader()
  _hideLoader()
  _showError(message)
}
```

### Listing_Card

```js
// src/components/Listing_Card.js
export class Listing_Card extends Component {
  constructor({ listing, router })
  render()   // возвращает article.listing-card с данными
  init()     // клик → router.navigate('/listing/:id')
  destroy()
}
```

### Listing_Detail

```js
// src/components/Listing_Detail.js
export class Listing_Detail extends Component {
  constructor({ id, apiClient, router })
  render()
  init()
  destroy()
  _loadData()          // fetchListingById + fetchCurrencyRates
  _renderPrices(rates) // RUB / USD / EUR
  _showLoader()
  _hideLoader()
  _showError(type)     // 'not_found' | 'network'
}
```

### Create_Form

```js
// src/components/Create_Form.js
export class Create_Form extends Component {
  constructor({ apiClient, router })
  render()
  init()
  destroy()
  _validate()                    // возвращает { valid, errors }
  _saveDraft()                   // localStorage при каждом input
  _loadDraft()                   // восстановить черновик при init
  _clearDraft()
  _handleGeoInput(query)         // debounce → fetchGeoSuggestions
  _renderGeoSuggestions(items)
  _submit()                      // валидация → localStorage → navigate
}
```

### Search_Bar

```js
// src/components/Search_Bar.js
export class Search_Bar extends Component {
  constructor({ onSearch })      // onSearch(query: string) callback
  render()
  init()                         // input с debounce 300мс
  destroy()
  getValue()                     // возвращает текущее значение
  clear()
}
```

### Filter_Panel

```js
// src/components/Filter_Panel.js
export class Filter_Panel extends Component {
  constructor({ categories, onFilter })  // onFilter(filters) callback
  render()
  init()
  destroy()
  getFilters()    // { category, priceMin, priceMax }
  reset()
}
```

---

## Модели данных

### Listing (объявление)

```js
/**
 * @typedef {Object} Listing
 * @property {string}  id          - UUID v4
 * @property {string}  title       - Заголовок (5–100 символов)
 * @property {string}  description - Описание (до 2000 символов)
 * @property {number}  price       - Цена в рублях (0–10 000 000)
 * @property {string}  category    - Категория из предопределённого списка
 * @property {string}  imageUrl    - URL изображения (может быть пустым)
 * @property {string}  sellerName  - Имя продавца
 * @property {string}  contact     - Способ связи
 * @property {string}  city        - Город (из Geo API или ручной ввод)
 * @property {string}  createdAt   - ISO 8601 дата создания
 */
```

### CurrencyRates (курсы валют)

```js
/**
 * @typedef {Object} CurrencyRates
 * @property {number} USD - Курс USD к RUB
 * @property {number} EUR - Курс EUR к RUB
 * @property {string} timestamp - ISO 8601 время получения
 */
```

### FilterState (состояние фильтров)

```js
/**
 * @typedef {Object} FilterState
 * @property {string} query      - Строка поиска
 * @property {string} category   - Выбранная категория ('all' = все)
 * @property {number} priceMin   - Минимальная цена
 * @property {number} priceMax   - Максимальная цена
 * @property {number} page       - Текущая страница (1-based)
 */
```

### Draft (черновик формы)

```js
/**
 * @typedef {Object} Draft
 * @property {string} title
 * @property {string} description
 * @property {string} price
 * @property {string} category
 * @property {string} imageUrl
 * @property {string} city
 * @property {string} sellerName
 * @property {string} contact
 */
```

### localStorage — схема ключей

| Ключ | Тип | Описание |
|------|-----|----------|
| `marketplace_listings` | `Listing[]` | Все объявления (включая созданные пользователем) |
| `marketplace_draft` | `Draft` | Черновик формы создания |
| `marketplace_filter_state` | `FilterState` | Состояние фильтров для восстановления при возврате |

### sessionStorage — схема ключей

| Ключ | Тип | Описание |
|------|-----|----------|
| `currency_rates_cache` | `CurrencyRates` | Кэш курсов валют на время сессии |

---

## Структура файлов проекта

```
used-items-marketplace/
├── index.html
├── vite.config.js
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── README.md
├── package.json
├── public/
│   ├── data/
│   │   └── listings.json          # Начальные данные объявлений
│   └── images/
│       └── placeholder.svg        # Заглушка изображения
└── src/
    ├── main.js                    # Точка входа, bootstrap
    ├── api/
    │   └── API_Client.js
    ├── router/
    │   └── Router.js
    ├── components/
    │   ├── Component.js           # Базовый класс
    │   ├── Catalog.js
    │   ├── Listing_Card.js
    │   ├── Listing_Detail.js
    │   ├── Create_Form.js
    │   ├── Search_Bar.js
    │   └── Filter_Panel.js
    ├── pages/
    │   └── HomePage.js
    ├── utils/
    │   ├── debounce.js            # debounce(fn, delay)
    │   ├── formatDate.js          # DD.MM.YYYY
    │   ├── formatPrice.js         # форматирование цены
    │   └── storage.js             # обёртки над localStorage/sessionStorage
    └── styles/
        ├── main.css               # импорт всех блоков
        ├── base/
        │   ├── reset.css
        │   └── variables.css      # CSS custom properties
        └── blocks/
            ├── header.css
            ├── footer.css
            ├── nav.css
            ├── catalog.css
            ├── listing-card.css
            ├── listing-detail.css
            ├── create-form.css
            ├── search-bar.css
            ├── filter-panel.css
            ├── pagination.css
            └── loader.css
```

---

## Адаптивная вёрстка

### Брейкпоинты

```css
/* Мобильный: < 768px — 1 колонка */
/* Планшетный: 768px–1199px — 2 колонки */
/* Десктопный: ≥ 1200px — 3–4 колонки */

.catalog__grid {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .catalog__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .catalog__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1440px) {
  .catalog__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Гамбургер-меню

```css
/* Скрыто на десктопе */
.nav__toggle { display: none; }

@media (max-width: 767px) {
  .nav__toggle { display: block; }
  .nav__list { display: none; }
  .nav__list--open { display: flex; flex-direction: column; }
}
```

### БЭМ-именование (примеры)

| Блок | Элемент | Модификатор |
|------|---------|-------------|
| `listing-card` | `listing-card__image` | `listing-card--featured` |
| `nav` | `nav__item` | `nav__item--active` |
| `catalog` | `catalog__grid` | — |
| `filter-panel` | `filter-panel__input` | `filter-panel__input--error` |
| `create-form` | `create-form__field` | `create-form__field--invalid` |
| `pagination` | `pagination__btn` | `pagination__btn--active` |

---

## Конфигурация Vite и инструментов

### vite.config.js

```js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/{repository-name}/',   // для GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

### package.json (scripts)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .js",
    "format": "prettier --write src",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### .eslintrc.js

```js
module.exports = {
  env: { browser: true, es2021: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
};
```

### .prettierrc

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## Свойства корректности

*Свойство — это характеристика или поведение, которое должно выполняться при всех допустимых выполнениях системы. Свойства служат мостом между читаемыми человеком спецификациями и машинно-проверяемыми гарантиями корректности.*

### Свойство 1: Поиск не возвращает нерелевантные объявления

*Для любого* набора объявлений и любой непустой строки поиска, все объявления в результирующем списке должны содержать строку поиска в заголовке или описании (без учёта регистра), и ни одно объявление, не содержащее строку поиска, не должно присутствовать в результатах.

**Validates: Requirements 3.1**

---

### Свойство 2: Фильтрация по нескольким критериям — логика AND

*Для любого* набора объявлений и любой комбинации фильтров (категория, минимальная цена, максимальная цена), каждое объявление в результирующем списке должно одновременно удовлетворять всем активным фильтрам.

**Validates: Requirements 3.4, 3.7**

---

### Свойство 3: Пагинация не дублирует и не теряет объявления

*Для любого* набора объявлений, объединение всех страниц пагинации должно содержать ровно те же объявления, что и исходный список (без дублирования и без потерь), а каждая страница, кроме последней, должна содержать ровно 20 объявлений.

**Validates: Requirements 2.6, 2.7**

---

### Свойство 4: Валидация формы отклоняет некорректные данные

*Для любого* ввода в форму создания объявления, где хотя бы одно обязательное поле не заполнено, или заголовок содержит менее 5 или более 100 символов, или цена является нечисловой, отрицательной или превышает 10 000 000 — форма не должна сохранять объявление и должна отображать сообщение об ошибке рядом с соответствующим полем.

**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

---

### Свойство 5: Черновик формы сохраняется и восстанавливается

*Для любого* частично заполненного состояния формы создания объявления, после перехода на другую страницу и возврата обратно, все ранее введённые данные должны быть восстановлены из localStorage в точности.

**Validates: Requirements 5.7**

---

### Свойство 6: Конвертация валют корректна для любой цены

*Для любой* цены объявления в рублях и любых курсов валют, полученных от Currency API, отображаемые цены в USD и EUR должны быть равны `price / rate` с точностью до двух знаков после запятой.

**Validates: Requirements 7.2**

---

### Свойство 7: Кэш валют не вызывает повторных запросов в рамках сессии

*Для любой* последовательности открытий страниц Listing_Detail в рамках одной сессии браузера, Currency API должен быть вызван не более одного раза — все последующие обращения должны возвращать данные из sessionStorage.

**Validates: Requirements 7.6**

---

### Свойство 8: destroy() полностью изолирует компонент

*Для любого* UI-компонента, после вызова метода `destroy()`, компонент не должен реагировать ни на какие пользовательские события (клики, ввод, изменения), и его DOM-узел не должен присутствовать в документе.

**Validates: Requirements 8.2**

---

## Обработка ошибок

### Стратегия обработки ошибок

| Сценарий | Поведение |
|----------|-----------|
| Ошибка загрузки каталога | Скрыть лоадер, показать «Не удалось загрузить объявления» + кнопка «Попробовать снова» |
| Объявление не найдено (404) | Показать «Объявление не найдено» + ссылка на каталог |
| Сетевая ошибка Listing_Detail | Показать «Не удалось загрузить объявление» + кнопка «Попробовать снова» |
| Ошибка Currency API | Показать только цену в RUB, записать ошибку в `console.error` |
| Ошибка Geo API | Скрыть выпадающий список, сохранить введённый текст, разрешить ручной ввод |
| Таймаут Currency API (>5с) | Аналогично ошибке Currency API |
| Таймаут загрузки страницы (>10с) | Скрыть лоадер, показать «Не удалось загрузить страницу. Попробуйте обновить.» + кнопка |
| Неизвестный маршрут | Отобразить страницу 404 с сохранением URL, ссылка на главную |

### Паттерн обработки в API_Client

```js
async fetchCurrencyRates() {
  const cached = this._getCachedRates();
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), this._config.currencyTimeout);

  try {
    const response = await fetch(this._config.currencyApiUrl, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Currency API error: ${response.status}`);
    const data = await response.json();
    this._setCachedRates(data);
    return data;
  } catch (err) {
    console.error('[API_Client] fetchCurrencyRates failed:', err.message);
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### Паттерн обработки в компонентах

```js
async _loadData() {
  this._showLoader();
  try {
    const listing = await this._apiClient.fetchListingById(this._id);
    // ... рендер данных
  } catch (err) {
    if (err.status === 404) {
      this._showError('not_found');
    } else {
      this._showError('network');
    }
  } finally {
    this._hideLoader();
  }
}
```

---

## Стратегия тестирования

### Подход

Проект использует двойной подход к тестированию:
- **Unit-тесты** — конкретные примеры, граничные случаи, обработка ошибок
- **Property-based тесты** — универсальные свойства, проверяемые на большом количестве сгенерированных входных данных

Для property-based тестирования используется библиотека **[fast-check](https://github.com/dubzzz/fast-check)** (JavaScript/TypeScript).

### Конфигурация property-based тестов

- Минимум **100 итераций** на каждый тест
- Каждый тест помечается комментарием в формате:
  `// Feature: used-items-marketplace, Property N: <текст свойства>`
- Тест-раннер: **Vitest** (совместим с Vite)

### Unit-тесты (примеры)

```
src/__tests__/
├── utils/
│   ├── debounce.test.js
│   ├── formatDate.test.js
│   └── formatPrice.test.js
├── api/
│   └── API_Client.test.js
├── router/
│   └── Router.test.js
└── components/
    ├── Catalog.test.js
    ├── Create_Form.test.js
    └── Listing_Detail.test.js
```

Примеры unit-тестов:
- `Router` — переход на незарегистрированный маршрут вызывает 404-обработчик
- `API_Client.fetchCurrencyRates()` — при наличии кэша в sessionStorage не выполняет fetch
- `Create_Form._validate()` — пустой заголовок возвращает ошибку
- `formatDate('2024-01-15T10:00:00Z')` → `'15.01.2024'`

### Property-based тесты

```
src/__tests__/properties/
├── search.property.test.js       // Свойство 1
├── filter.property.test.js       // Свойство 2
├── pagination.property.test.js   // Свойство 3
├── validation.property.test.js   // Свойство 4
├── draft.property.test.js        // Свойство 5
├── currency.property.test.js     // Свойство 6
├── cache.property.test.js        // Свойство 7
└── destroy.property.test.js      // Свойство 8
```

Пример property-теста (Свойство 1):

```js
// Feature: used-items-marketplace, Property 1: поиск не возвращает нерелевантные объявления
import fc from 'fast-check';
import { filterByQuery } from '../../utils/filterByQuery.js';

test('Property 1: search relevance', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        title: fc.string(),
        description: fc.string(),
        price: fc.nat(10_000_000),
        category: fc.string(),
      })),
      fc.string({ minLength: 1 }),
      (listings, query) => {
        const results = filterByQuery(listings, query);
        const q = query.toLowerCase();
        return results.every(
          l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
        );
      }
    ),
    { numRuns: 100 }
  );
});
```

### Интеграционные тесты

- Проверка корректной загрузки приложения по GitHub Pages URL
- Проверка работы роутинга при прямом переходе по URL
- Проверка сохранения/восстановления данных из localStorage между сессиями

### Команды запуска тестов

```bash
npm run test          # vitest --run (однократный запуск)
npm run test:watch    # vitest (режим наблюдения, для разработки)
```
