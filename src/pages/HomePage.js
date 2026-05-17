import { Component } from '../components/Component.js';
import { ListingCard } from '../components/ListingCard.js';

const CATEGORIES = [
  { name: 'Электроника', icon: '📱', count: '120+' },
  { name: 'Мебель', icon: '🛋️', count: '85+' },
  { name: 'Спорт', icon: '⚽', count: '64+' },
  { name: 'Одежда', icon: '👗', count: '200+' },
  { name: 'Книги', icon: '📚', count: '150+' },
  { name: 'Другое', icon: '📦', count: '300+' },
];

/**
 * Главная страница
 */
export class HomePage extends Component {
  constructor({ router, apiClient, container }) {
    super();
    this._router = router;
    this._apiClient = apiClient;
    this._container = container;
    this._cardComponents = [];
  }

  render() {
    const el = document.createElement('div');
    el.className = 'home';
    el.innerHTML = `
      <!-- Hero -->
      <section class="hero">
        <div class="hero__inner">
          <div class="hero__badge">🎉 Более 1000 объявлений каждый день</div>
          <h1 class="hero__title">
            Покупай и продавай<br><span>подержанные вещи</span><br>легко и быстро
          </h1>
          <p class="hero__text">
            Найди выгодные предложения рядом с тобой или разместить своё объявление бесплатно
          </p>
          <div class="hero__actions">
            <button class="hero__btn hero__btn--primary" id="hero-catalog-btn">
              🔍 Смотреть объявления
            </button>
            <button class="hero__btn hero__btn--secondary" id="hero-create-btn">
              + Разместить объявление
            </button>
          </div>
        </div>
      </section>

      <!-- Статистика -->
      <section class="stats">
        <div class="stats__inner">
          <div class="stats__item">
            <div class="stats__number">25+</div>
            <div class="stats__label">Объявлений</div>
          </div>
          <div class="stats__item">
            <div class="stats__number">6</div>
            <div class="stats__label">Категорий</div>
          </div>
          <div class="stats__item">
            <div class="stats__number">15+</div>
            <div class="stats__label">Городов</div>
          </div>
          <div class="stats__item">
            <div class="stats__number">100%</div>
            <div class="stats__label">Бесплатно</div>
          </div>
        </div>
      </section>

      <!-- Категории -->
      <section class="categories">
        <h2 class="categories__title">Популярные категории</h2>
        <div class="categories__grid">
          ${CATEGORIES.map(
            (c) => `
            <div class="category-card" data-category="${c.name}">
              <div class="category-card__icon">${c.icon}</div>
              <div class="category-card__name">${c.name}</div>
              <div class="category-card__count">${c.count} объявлений</div>
            </div>
          `
          ).join('')}
        </div>
      </section>

      <!-- Свежие объявления -->
      <section class="recent">
        <div class="recent__inner">
          <div class="recent__header">
            <h2 class="recent__title">Свежие объявления</h2>
            <button class="recent__link" id="all-listings-btn">Смотреть все →</button>
          </div>
          <div class="recent__grid" id="recent-grid">
            <div class="loader">
              <div class="loader__spinner"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta">
        <div class="cta__inner">
          <h2 class="cta__title">Есть что продать?</h2>
          <p class="cta__text">Разместите объявление бесплатно и найдите покупателя уже сегодня</p>
          <button class="cta__btn" id="cta-create-btn">Разместить объявление</button>
        </div>
      </section>
    `;
    this._element = el;
    this._container.appendChild(el);
    return el;
  }

  init() {
    // Вспомогательная функция: сброс фильтров и переход в каталог
    const goToCatalog = () => {
      localStorage.removeItem('marketplace_filter_state');
      this._router.navigate('/catalog');
    };

    this._addListener(
      this._element.querySelector('#hero-catalog-btn'),
      'click',
      goToCatalog
    );
    this._addListener(
      this._element.querySelector('#hero-create-btn'),
      'click',
      () => this._router.navigate('/create')
    );
    this._addListener(
      this._element.querySelector('#all-listings-btn'),
      'click',
      goToCatalog
    );
    this._addListener(
      this._element.querySelector('#cta-create-btn'),
      'click',
      () => this._router.navigate('/create')
    );

    // Клик по категории → каталог с фильтром по категории
    this._element.querySelectorAll('.category-card').forEach((card) => {
      this._addListener(card, 'click', () => {
        const cat = card.dataset.category;
        localStorage.setItem(
          'marketplace_filter_state',
          JSON.stringify({ query: '', category: cat, priceMin: 0, priceMax: 10000000, page: 1 })
        );
        this._router.navigate('/catalog');
      });
    });

    this._loadRecentListings();
  }

  async _loadRecentListings() {
    const grid = this._element.querySelector('#recent-grid');
    try {
      const listings = await this._apiClient.fetchListings();
      const recent = listings.slice(0, 4);
      grid.innerHTML = '';
      recent.forEach((listing) => {
        const card = new ListingCard({ listing, router: this._router });
        const cardEl = card.render();
        card.init();
        grid.appendChild(cardEl);
        this._cardComponents.push(card);
      });
    } catch {
      grid.innerHTML = '<p style="color:var(--color-text-muted);padding:1rem">Не удалось загрузить объявления</p>';
    }
  }

  destroy() {
    this._cardComponents.forEach((c) => c.destroy());
    this._cardComponents = [];
    super.destroy();
  }
}
