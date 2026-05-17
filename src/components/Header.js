import { Component } from './Component.js';

const NAV_ITEMS = [
  { label: 'Главная', path: '/' },
  { label: 'Каталог', path: '/catalog' },
  { label: 'Мой кабинет', path: '/profile' },
];

/**
 * Компонент шапки сайта
 */
export class Header extends Component {
  constructor({ router, container }) {
    super();
    this._router = router;
    this._container = container;
  }

  render() {
    const el = document.createElement('header');
    el.className = 'header';
    el.innerHTML = `
      <div class="header__inner">
        <a class="header__logo" href="#/" data-link>
          <span class="header__logo-icon">🏷️</span>
          <span>БУ Маркет</span>
        </a>
        <nav class="nav">
          <button class="nav__toggle" id="nav-toggle" aria-label="Меню">
            <span class="nav__toggle-line"></span>
            <span class="nav__toggle-line"></span>
            <span class="nav__toggle-line"></span>
          </button>
          <ul class="nav__list" id="nav-list">
            ${NAV_ITEMS.map(
              (item) => `
              <li>
                <a class="nav__link" href="#${item.path}" data-link data-path="${item.path}">
                  ${item.label}
                </a>
              </li>
            `
            ).join('')}
          </ul>
        </nav>
        <button class="header__btn" id="header-create-btn">+ Разместить</button>
      </div>
    `;
    this._element = el;
    this._container.prepend(el);
    this._updateActiveLink();
    return el;
  }

  init() {
    this._element.querySelectorAll('[data-link]').forEach((link) => {
      this._addListener(link, 'click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href') || '';
        // Убираем '#' если есть, переходим на путь
        const path = href.startsWith('#') ? href.slice(1) : (link.dataset.path || '/');
        this._router.navigate(path);
        this._closeMenu();
        this._updateActiveLink();
      });
    });

    // Кнопка «Разместить»
    this._addListener(
      this._element.querySelector('#header-create-btn'),
      'click',
      () => {
        this._router.navigate('/create');
        this._updateActiveLink();
      }
    );

    // Гамбургер-меню
    const toggle = this._element.querySelector('#nav-toggle');
    const list = this._element.querySelector('#nav-list');
    this._addListener(toggle, 'click', () => {
      list.classList.toggle('nav__list--open');
    });

    // Обновляем активную ссылку при навигации (hash-роутер)
    this._addListener(window, 'hashchange', () => this._updateActiveLink());
    this._addListener(window, 'popstate', () => this._updateActiveLink());
  }

  _updateActiveLink() {
    // С hash-роутером путь хранится в location.hash вида '#/catalog'
    const currentPath = (window.location.hash || '#/').slice(1) || '/';
    this._element.querySelectorAll('[data-path]').forEach((link) => {
      const path = link.dataset.path;
      const isActive = path === '/' ? currentPath === '/' : currentPath.startsWith(path);
      link.classList.toggle('nav__link--active', isActive);
    });
  }

  _closeMenu() {
    this._element.querySelector('#nav-list')?.classList.remove('nav__list--open');
  }
}
