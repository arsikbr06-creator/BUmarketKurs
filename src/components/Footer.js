import { Component } from './Component.js';

/**
 * Компонент подвала сайта
 */
export class Footer extends Component {
  constructor({ router, container }) {
    super();
    this._router = router;
    this._container = container;
  }

  render() {
    const year = new Date().getFullYear();
    const el = document.createElement('footer');
    el.className = 'footer';
    el.innerHTML = `
      <div class="footer__inner">
        <div class="footer__brand">
          <div class="footer__logo">🏷️ БУ Маркет</div>
          <p class="footer__desc">
            Клиентская часть интернет-ресурса для размещения объявлений о продаже подержанных вещей.
            Курсовая работа по дисциплине «Фронтенд-разработка».
          </p>
        </div>
        <div>
          <div class="footer__title">Навигация</div>
          <div class="footer__links">
            <a class="footer__link" href="#/" data-link>Главная</a>
            <a class="footer__link" href="#/catalog" data-link>Каталог</a>
            <a class="footer__link" href="#/profile" data-link>Мой кабинет</a>
            <a class="footer__link" href="#/create" data-link>Разместить объявление</a>
          </div>
        </div>
        <div>
          <div class="footer__title">Технологии</div>
          <div class="footer__links">
            <span class="footer__link">HTML5 / CSS3</span>
            <span class="footer__link">JavaScript ES6+</span>
            <span class="footer__link">Vite</span>
            <span class="footer__link">БЭМ методология</span>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© ${year} МИРЭА — Российский технологический университет</span>
        <a class="footer__github" href="https://github.com/" target="_blank" rel="noopener">
          ⭐ Исходный код на GitHub
        </a>
      </div>
    `;
    this._element = el;
    this._container.appendChild(el);
    return el;
  }

  init() {
    this._element.querySelectorAll('[data-link]').forEach((link) => {
      this._addListener(link, 'click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href') || '';
        const path = href.startsWith('#') ? href.slice(1) : href;
        this._router.navigate(path);
      });
    });
  }
}
