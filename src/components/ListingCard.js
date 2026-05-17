import { Component } from './Component.js';
import { formatPrice } from '../utils/formatPrice.js';
import { formatDate } from '../utils/formatDate.js';
import { resolveImage } from '../utils/resolveImage.js';

/**
 * Компонент карточки объявления
 */
export class ListingCard extends Component {
  constructor({ listing, router, onDelete = null }) {
    super();
    this._listing = listing;
    this._router = router;
    this._onDelete = onDelete; // колбэк для удаления (используется в личном кабинете)
  }

  render() {
    const { id, title, price, category, imageUrl, city, createdAt } = this._listing;

    const el = document.createElement('article');
    el.className = 'listing-card';
    el.dataset.id = id;

    el.innerHTML = `
      <div class="listing-card__image-wrap">
        ${imageUrl
          ? `<img class="listing-card__image" src="${resolveImage(imageUrl)}" alt="${title}" loading="lazy" />`
          : `<div class="listing-card__no-image">
               <span class="listing-card__no-image-icon">📷</span>
               <span class="listing-card__no-image-text">Нет фото</span>
             </div>`
        }
        <span class="listing-card__category-badge">${category}</span>
        ${this._onDelete ? `<button class="listing-card__delete" data-delete title="Удалить объявление">✕</button>` : ''}
      </div>
      <div class="listing-card__body">
        <h3 class="listing-card__title">${title}</h3>
        <div class="listing-card__price">${formatPrice(price)}</div>
        <div class="listing-card__footer">
          <span class="listing-card__city">📍 ${city || ''}</span>
          <span class="listing-card__date">${formatDate(createdAt)}</span>
        </div>
      </div>
    `;

    this._element = el;
    return el;
  }

  init() {
    // Клик по карточке — переход на детальную страницу
    this._addListener(this._element, 'click', (e) => {
      // Не переходим если нажали кнопку удаления
      if (e.target.closest('[data-delete]')) return;
      this._router.navigate(`/listing/${this._listing.id}`);
    });

    // Кнопка удаления (только в личном кабинете)
    const deleteBtn = this._element.querySelector('[data-delete]');
    if (deleteBtn && this._onDelete) {
      this._addListener(deleteBtn, 'click', (e) => {
        e.stopPropagation();
        this._onDelete(this._listing.id);
      });
    }
  }
}
