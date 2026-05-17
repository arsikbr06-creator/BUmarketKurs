import { Component } from './Component.js';
import { SearchBar } from './SearchBar.js';
import { FilterPanel } from './FilterPanel.js';
import { ListingCard } from './ListingCard.js';
import { filterListings } from '../utils/filterListings.js';
import { storage } from '../utils/storage.js';

const PAGE_SIZE = 20;
const FILTER_STATE_KEY = 'marketplace_filter_state';

/**
 * Компонент каталога объявлений
 */
export class Catalog extends Component {
  constructor({ apiClient, router, container }) {
    super();
    this._apiClient = apiClient;
    this._router = router;
    this._container = container;
    this._allListings = [];
    this._filtered = [];
    this._currentPage = 1;
    this._filters = { query: '', category: 'all', priceMin: 0, priceMax: 10000000 };
    this._childComponents = [];
  }

  render() {
    const el = document.createElement('div');
    el.className = 'catalog';
    el.innerHTML = `
      <div class="catalog__header">
        <h1 class="catalog__title">Объявления</h1>
        <p class="catalog__subtitle">Найдите то, что ищете, среди тысяч объявлений</p>
      </div>
      <div class="catalog__toolbar" id="catalog-toolbar"></div>
      <div class="catalog__count" id="catalog-count"></div>
      <div id="catalog-content"></div>
      <div class="pagination" id="catalog-pagination"></div>
    `;
    this._element = el;
    this._container.appendChild(el);
    return el;
  }

  init() {
    // Восстанавливаем состояние фильтров
    const saved = storage.get(FILTER_STATE_KEY);
    if (saved) {
      this._filters = { ...this._filters, ...saved };
      this._currentPage = saved.page || 1;
    }

    // Рендерим Search_Bar и Filter_Panel
    const toolbar = this._element.querySelector('#catalog-toolbar');

    const searchBar = new SearchBar({
      onSearch: (query) => {
        this._filters.query = query;
        this._currentPage = 1;
        this._applyFilters();
      },
      container: toolbar,
    });
    searchBar.render();
    searchBar.init();
    this._childComponents.push(searchBar);

    const filterPanel = new FilterPanel({
      onFilter: (filters) => {
        this._filters = { ...this._filters, ...filters };
        this._currentPage = 1;
        this._applyFilters();
      },
      container: toolbar,
    });
    filterPanel.render();
    filterPanel.init();
    this._childComponents.push(filterPanel);

    this._loadListings();
  }

  destroy() {
    this._childComponents.forEach((c) => c.destroy());
    this._childComponents = [];
    super.destroy();
  }

  async _loadListings() {
    this._showLoader();
    try {
      this._allListings = await this._apiClient.fetchListings();
      this._applyFilters();
    } catch {
      this._showError();
    }
  }

  _applyFilters() {
    this._filtered = filterListings(this._allListings, this._filters);
    this._saveFilterState();
    this._renderPage(this._currentPage);
    this._renderPagination();
    this._updateCount();
  }

  _renderPage(page) {
    const content = this._element.querySelector('#catalog-content');
    if (!content) return;

    if (this._filtered.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <h3 class="empty-state__title">Объявления не найдены</h3>
          <p class="empty-state__text">Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      `;
      return;
    }

    const start = (page - 1) * PAGE_SIZE;
    const pageItems = this._filtered.slice(start, start + PAGE_SIZE);

    const grid = document.createElement('div');
    grid.className = 'catalog__grid';

    pageItems.forEach((listing) => {
      const card = new ListingCard({ listing, router: this._router });
      const cardEl = card.render();
      card.init();
      grid.appendChild(cardEl);
      this._childComponents.push(card);
    });

    content.innerHTML = '';
    content.appendChild(grid);
  }

  _renderPagination() {
    const pag = this._element.querySelector('#catalog-pagination');
    if (!pag) return;

    const totalPages = Math.ceil(this._filtered.length / PAGE_SIZE);
    if (totalPages <= 1) {
      pag.innerHTML = '';
      return;
    }

    let html = `
      <button class="pagination__btn" data-page="${this._currentPage - 1}"
        ${this._currentPage === 1 ? 'disabled' : ''}>← Назад</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="pagination__btn ${i === this._currentPage ? 'pagination__btn--active' : ''}"
        data-page="${i}">${i}</button>`;
    }

    html += `
      <button class="pagination__btn" data-page="${this._currentPage + 1}"
        ${this._currentPage === totalPages ? 'disabled' : ''}>Вперёд →</button>
    `;

    pag.innerHTML = html;

    pag.querySelectorAll('.pagination__btn:not([disabled])').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._currentPage = Number(btn.dataset.page);
        this._renderPage(this._currentPage);
        this._renderPagination();
        this._element.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  _updateCount() {
    const countEl = this._element.querySelector('#catalog-count');
    if (countEl) {
      countEl.textContent = `Найдено объявлений: ${this._filtered.length}`;
    }
  }

  _showLoader() {
    const content = this._element.querySelector('#catalog-content');
    if (content) {
      content.innerHTML = `
        <div class="loader">
          <div class="loader__spinner"></div>
          <span class="loader__text">Загружаем объявления...</span>
        </div>
      `;
    }
  }

  _showError() {
    const content = this._element.querySelector('#catalog-content');
    if (content) {
      content.innerHTML = `
        <div class="error-state">
          <div class="error-state__icon">⚠️</div>
          <h3 class="error-state__title">Не удалось загрузить объявления</h3>
          <p class="error-state__text">Проверьте подключение к интернету и попробуйте снова</p>
          <button class="error-state__btn" id="retry-btn">Попробовать снова</button>
        </div>
      `;
      content.querySelector('#retry-btn')?.addEventListener('click', () => this._loadListings());
    }
  }

  _saveFilterState() {
    storage.set(FILTER_STATE_KEY, { ...this._filters, page: this._currentPage });
  }
}
