import { session } from '../utils/storage.js';

const CURRENCY_CACHE_KEY = 'currency_rates_cache';
const CURRENCY_TIMEOUT = 5000;

/**
 * Клиент для работы с внешними API и локальными данными
 */
export class API_Client {
  constructor(config = {}) {
    // Базовый путь приложения (для GitHub Pages = '/имя-репо/')
    const baseUrl = import.meta.env?.BASE_URL || '/';
    this._config = {
      listingsUrl: config.listingsUrl || `${baseUrl}data/listings.json`,
      currencyApiUrl:
        config.currencyApiUrl ||
        'https://api.exchangerate-api.com/v4/latest/RUB',
      ...config,
    };
  }

  /**
   * Загружает список объявлений (localStorage + JSON-файл)
   * @returns {Promise<Array>}
   */
  async fetchListings() {
    try {
      const response = await fetch(this._config.listingsUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Добавляем объявления из localStorage
      const local = this._getLocalListings();
      return [...local, ...data];
    } catch (err) {
      console.error('[API_Client] fetchListings failed:', err.message);
      throw new Error('Не удалось загрузить объявления: ' + err.message);
    }
  }

  /**
   * Загружает объявление по id
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async fetchListingById(id) {
    const all = await this.fetchListings();
    const item = all.find((l) => String(l.id) === String(id));
    if (!item) {
      const err = new Error('Объявление не найдено');
      err.status = 404;
      throw err;
    }
    return item;
  }

  /**
   * Получает курсы валют (с кэшем в sessionStorage)
   * @returns {Promise<{USD: number, EUR: number}>}
   */
  async fetchCurrencyRates() {
    const cached = session.get(CURRENCY_CACHE_KEY);
    if (cached) return cached;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CURRENCY_TIMEOUT);

    try {
      const response = await fetch(this._config.currencyApiUrl, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Currency API HTTP ${response.status}`);
      const data = await response.json();

      // exchangerate-api возвращает rates относительно базовой валюты RUB
      // rates.USD = сколько USD за 1 RUB, нам нужно обратное
      const usdRate = data.rates?.USD ? 1 / data.rates.USD : null;
      const eurRate = data.rates?.EUR ? 1 / data.rates.EUR : null;

      const rates = { USD: usdRate, EUR: eurRate, timestamp: new Date().toISOString() };
      session.set(CURRENCY_CACHE_KEY, rates);
      return rates;
    } catch (err) {
      console.error('[API_Client] fetchCurrencyRates failed:', err.message);
      throw new Error('Не удалось получить курсы валют: ' + err.message);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Получает подсказки адресов (используем публичный API)
   * @param {string} query
   * @returns {Promise<string[]>}
   */
  async fetchGeoSuggestions(query) {
    if (!query || query.length < 3) return [];

    try {
      // Используем публичный API городов России
      const url = `https://countriesnow.space/api/v0.1/countries/cities`;
      // Fallback: возвращаем статический список городов
      return this._getStaticCitySuggestions(query);
    } catch (err) {
      console.error('[API_Client] fetchGeoSuggestions failed:', err.message);
      throw new Error('Не удалось получить подсказки: ' + err.message);
    }
  }

  /** Статические подсказки городов (fallback) */
  _getStaticCitySuggestions(query) {
    const cities = [
      'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
      'Нижний Новгород', 'Челябинск', 'Самара', 'Уфа', 'Ростов-на-Дону',
      'Краснодар', 'Пермь', 'Воронеж', 'Волгоград', 'Красноярск',
      'Саратов', 'Тюмень', 'Тольятти', 'Ижевск', 'Барнаул',
      'Иркутск', 'Хабаровск', 'Ярославль', 'Владивосток', 'Махачкала',
    ];
    const q = query.toLowerCase();
    return cities.filter((c) => c.toLowerCase().startsWith(q)).slice(0, 6);
  }

  /** Получает объявления из localStorage */
  _getLocalListings() {
    try {
      const data = localStorage.getItem('marketplace_listings');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
