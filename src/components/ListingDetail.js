import { Component } from './Component.js';
import { formatPrice, formatForeignPrice } from '../utils/formatPrice.js';
import { formatDate } from '../utils/formatDate.js';
import { resolveImage } from '../utils/resolveImage.js';

/**
 * Компонент детальной страницы объявления
 */
export class ListingDetail extends Component {
  constructor({ id, apiClient, router, container }) {
    super();
    this._id = id;
    this._apiClient = apiClient;
    this._router = router;
    this._container = container;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'listing-detail';
    el.innerHTML = `
      <button class="listing-detail__back" id="back-btn">← Назад к каталогу</button>
      <div id="detail-content">
        <div class="loader">
          <div class="loader__spinner"></div>
          <span class="loader__text">Загружаем объявление...</span>
        </div>
      </div>
    `;
    this._element = el;
    this._container.appendChild(el);
    return el;
  }

  init() {
    const backBtn = this._element.querySelector('#back-btn');
    this._addListener(backBtn, 'click', () => {
      this._router.navigate('/catalog');
    });
    this._loadData();
  }

  async _loadData() {
    const content = this._element.querySelector('#detail-content');
    try {
      const [listing, rates] = await Promise.allSettled([
        this._apiClient.fetchListingById(this._id),
        this._apiClient.fetchCurrencyRates(),
      ]);

      if (listing.status === 'rejected') {
        const err = listing.reason;
        if (err.status === 404) {
          this._showError('not_found', content);
        } else {
          this._showError('network', content);
        }
        return;
      }

      const item = listing.value;
      const ratesData = rates.status === 'fulfilled' ? rates.value : null;
      this._renderListing(item, ratesData, content);
    } catch {
      this._showError('network', content);
    }
  }

  _renderListing(item, rates, content) {
    const pricesHtml = this._buildPricesHtml(item.price, rates);

    const imageHtml = item.imageUrl
      ? `<img class="listing-detail__image" src="${resolveImage(item.imageUrl)}" alt="${item.title}" id="detail-img" />`
      : `<div class="listing-detail__no-image">
           <span class="listing-detail__no-image-icon">📷</span>
           <span class="listing-detail__no-image-text">Фото не добавлено</span>
         </div>`;

    content.innerHTML = `
      <div class="listing-detail__layout">
        <div class="listing-detail__image-wrap">
          ${imageHtml}
        </div>
        <div class="listing-detail__info">
          <span class="listing-detail__category">${item.category}</span>
          <h1 class="listing-detail__title">${item.title}</h1>
          <div class="listing-detail__prices">
            <div class="listing-detail__price-main">${formatPrice(item.price)}</div>
            ${pricesHtml}
          </div>
          <p class="listing-detail__description">${item.description}</p>
          <div class="listing-detail__meta">
            <div class="listing-detail__meta-title">Информация о продавце</div>
            <div class="listing-detail__meta-row">👤 <strong>${item.sellerName}</strong></div>
            <div class="listing-detail__meta-row">📞 <strong>${item.contact}</strong></div>
            <div class="listing-detail__meta-row">📍 ${item.city || 'Не указан'}</div>
            <div class="listing-detail__meta-row">📅 Опубликовано: ${formatDate(item.createdAt)}</div>
          </div>
          <a href="tel:${item.contact}" class="listing-detail__contact-btn">
            📞 Связаться с продавцом
          </a>
        </div>
      </div>
    `;
  }

  _buildPricesHtml(price, rates) {
    if (!rates || !rates.USD || !rates.EUR) return '';
    const usd = (price / rates.USD).toFixed(2);
    const eur = (price / rates.EUR).toFixed(2);
    return `
      <div class="listing-detail__price-converted">
        <span class="listing-detail__price-tag">≈ ${formatForeignPrice(usd, 'USD')}</span>
        <span class="listing-detail__price-tag">≈ ${formatForeignPrice(eur, 'EUR')}</span>
      </div>
    `;
  }

  _showError(type, content) {
    if (type === 'not_found') {
      content.innerHTML = `
        <div class="error-state">
          <div class="error-state__icon">🔍</div>
          <h3 class="error-state__title">Объявление не найдено</h3>
          <p class="error-state__text">Возможно, оно было удалено или перемещено</p>
          <button class="error-state__btn" id="to-catalog">Вернуться в каталог</button>
        </div>
      `;
    } else {
      content.innerHTML = `
        <div class="error-state">
          <div class="error-state__icon">⚠️</div>
          <h3 class="error-state__title">Не удалось загрузить объявление</h3>
          <p class="error-state__text">Проверьте подключение к интернету</p>
          <button class="error-state__btn" id="retry-btn">Попробовать снова</button>
        </div>
      `;
      content.querySelector('#retry-btn')?.addEventListener('click', () => this._loadData());
    }
    content.querySelector('#to-catalog')?.addEventListener('click', () => {
      this._router.navigate('/catalog');
    });
  }
}
