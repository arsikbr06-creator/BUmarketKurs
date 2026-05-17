import { Component } from './Component.js';
import { debounce } from '../utils/debounce.js';

/**
 * Компонент строки поиска
 */
export class SearchBar extends Component {
  constructor({ onSearch, placeholder = 'Поиск объявлений...' }) {
    super();
    this._onSearch = onSearch;
    this._placeholder = placeholder;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'search-bar';
    el.innerHTML = `
      <span class="search-bar__icon">🔍</span>
      <input
        type="text"
        class="search-bar__input"
        placeholder="${this._placeholder}"
        autocomplete="off"
      />
    `;
    this._element = el;
    this.props.container?.appendChild(el);
    return el;
  }

  init() {
    const input = this._element.querySelector('.search-bar__input');
    const debouncedSearch = debounce((value) => {
      this._onSearch(value);
    }, 300);

    this._addListener(input, 'input', (e) => {
      debouncedSearch(e.target.value);
    });
  }

  getValue() {
    return this._element?.querySelector('.search-bar__input')?.value || '';
  }

  clear() {
    const input = this._element?.querySelector('.search-bar__input');
    if (input) input.value = '';
  }
}
