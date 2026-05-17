import { Component } from '../components/Component.js';
import { ListingCard } from '../components/ListingCard.js';
import { formatPrice } from '../utils/formatPrice.js';
import { formatDate } from '../utils/formatDate.js';

const LISTINGS_KEY = 'marketplace_listings';

/**
 * Страница личного кабинета — мои объявления
 */
export class ProfilePage extends Component {
  constructor({ router, container }) {
    super();
    this._router = router;
    this._container = container;
    this._cardComponents = [];
  }

  render() {
    const el = document.createElement('div');
    el.className = 'profile';
    el.innerHTML = `
      <div class="profile__header">
        <div class="profile__header-inner">
          <div class="profile__avatar">👤</div>
          <div class="profile__info">
            <h1 class="profile__name">Мой кабинет</h1>
            <p class="profile__subtitle">Управляйте своими объявлениями</p>
          </div>
        </div>
      </div>

      <div class="profile__body">
        <div class="profile__sidebar">
          <div class="profile__stats" id="profile-stats">
            <div class="profile__stat">
              <span class="profile__stat-value" id="stat-count">0</span>
              <span class="profile__stat-label">Объявлений</span>
            </div>
            <div class="profile__stat">
              <span class="profile__stat-value" id="stat-total">0 ₽</span>
              <span class="profile__stat-label">Общая стоимость</span>
            </div>
          </div>
          <button class="profile__create-btn" id="profile-create-btn">
            + Разместить объявление
          </button>
        </div>

        <div class="profile__content">
          <div class="profile__section-header">
            <h2 class="profile__section-title">Мои объявления</h2>
            <button class="profile__clear-btn" id="clear-all-btn">🗑 Удалить все</button>
          </div>
          <div id="profile-listings"></div>
        </div>
      </div>
    `;
    this._element = el;
    this._container.appendChild(el);
    return el;
  }

  init() {
    this._addListener(
      this._element.querySelector('#profile-create-btn'),
      'click',
      () => this._router.navigate('/create')
    );

    this._addListener(
      this._element.querySelector('#clear-all-btn'),
      'click',
      () => this._confirmClearAll()
    );

    this._renderListings();
  }

  destroy() {
    this._cardComponents.forEach((c) => c.destroy());
    this._cardComponents = [];
    super.destroy();
  }

  _getMyListings() {
    try {
      return JSON.parse(localStorage.getItem(LISTINGS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  _saveListings(listings) {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
  }

  _renderListings() {
    // Очищаем старые карточки
    this._cardComponents.forEach((c) => c.destroy());
    this._cardComponents = [];

    const listings = this._getMyListings();
    const container = this._element.querySelector('#profile-listings');

    // Обновляем статистику
    this._updateStats(listings);

    if (listings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📋</div>
          <h3 class="empty-state__title">У вас пока нет объявлений</h3>
          <p class="empty-state__text">Разместите первое объявление, чтобы найти покупателя</p>
          <button class="error-state__btn" id="empty-create-btn">Разместить объявление</button>
        </div>
      `;
      container.querySelector('#empty-create-btn')?.addEventListener('click', () => {
        this._router.navigate('/create');
      });
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'catalog__grid';

    listings.forEach((listing) => {
      const card = new ListingCard({
        listing,
        router: this._router,
        onDelete: (id) => this._deleteListing(id),
      });
      const cardEl = card.render();
      card.init();
      grid.appendChild(cardEl);
      this._cardComponents.push(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);
  }

  _updateStats(listings) {
    const countEl = this._element.querySelector('#stat-count');
    const totalEl = this._element.querySelector('#stat-total');
    if (countEl) countEl.textContent = listings.length;
    if (totalEl) {
      const total = listings.reduce((sum, l) => sum + (l.price || 0), 0);
      totalEl.textContent = new Intl.NumberFormat('ru-RU').format(total) + ' ₽';
    }
  }

  _deleteListing(id) {
    if (!confirm('Удалить это объявление?')) return;
    const listings = this._getMyListings().filter((l) => String(l.id) !== String(id));
    this._saveListings(listings);
    this._renderListings();
  }

  _confirmClearAll() {
    const listings = this._getMyListings();
    if (listings.length === 0) return;
    if (!confirm(`Удалить все ${listings.length} объявлений? Это действие нельзя отменить.`)) return;
    this._saveListings([]);
    this._renderListings();
  }
}
