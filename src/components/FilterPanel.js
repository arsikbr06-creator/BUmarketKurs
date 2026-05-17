import { Component } from './Component.js';

const CATEGORIES = ['all', 'Электроника', 'Мебель', 'Спорт', 'Одежда', 'Книги', 'Другое'];

/**
 * Компонент панели фильтрации
 */
export class FilterPanel extends Component {
  constructor({ onFilter }) {
    super();
    this._onFilter = onFilter;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'filter-panel';
    el.innerHTML = `
      <select class="filter-panel__select" title="Категория">
        ${CATEGORIES.map(
          (c) => `<option value="${c}">${c === 'all' ? 'Все категории' : c}</option>`
        ).join('')}
      </select>
      <input
        type="number"
        class="filter-panel__input filter-panel__input--min"
        placeholder="Цена от"
        min="0"
        max="10000000"
        title="Минимальная цена"
      />
      <span class="filter-panel__sep">—</span>
      <input
        type="number"
        class="filter-panel__input filter-panel__input--max"
        placeholder="Цена до"
        min="0"
        max="10000000"
        title="Максимальная цена"
      />
      <button class="filter-panel__reset" title="Сбросить фильтры">✕ Сбросить</button>
    `;
    this._element = el;
    this.props.container?.appendChild(el);
    return el;
  }

  init() {
    const select = this._element.querySelector('.filter-panel__select');
    const minInput = this._element.querySelector('.filter-panel__input--min');
    const maxInput = this._element.querySelector('.filter-panel__input--max');
    const resetBtn = this._element.querySelector('.filter-panel__reset');

    const notify = () => this._onFilter(this.getFilters());

    this._addListener(select, 'change', notify);
    this._addListener(minInput, 'input', notify);
    this._addListener(maxInput, 'input', notify);
    this._addListener(resetBtn, 'click', () => this.reset());
  }

  getFilters() {
    const select = this._element.querySelector('.filter-panel__select');
    const minInput = this._element.querySelector('.filter-panel__input--min');
    const maxInput = this._element.querySelector('.filter-panel__input--max');
    return {
      category: select?.value || 'all',
      priceMin: Number(minInput?.value) || 0,
      priceMax: Number(maxInput?.value) || 10000000,
    };
  }

  reset() {
    const select = this._element.querySelector('.filter-panel__select');
    const minInput = this._element.querySelector('.filter-panel__input--min');
    const maxInput = this._element.querySelector('.filter-panel__input--max');
    if (select) select.value = 'all';
    if (minInput) minInput.value = '';
    if (maxInput) maxInput.value = '';
    this._onFilter(this.getFilters());
  }
}
