/**
 * Клиентский SPA-роутер на основе hash-маршрутизации.
 * Hash-режим выбран для надёжной работы на GitHub Pages
 * (статический хостинг не умеет отдавать index.html на произвольные пути).
 *
 * Маршруты вида: '#/', '#/catalog', '#/listing/:id'
 */
export class Router {
  constructor(rootElement) {
    this._root = rootElement;
    this._routes = [];
    this._notFoundHandler = null;
    this._currentComponent = null;
    this._popstateHandler = () => this.handlePopState();
    this._hashHandler = () => this.handlePopState();

    window.addEventListener('popstate', this._popstateHandler);
    window.addEventListener('hashchange', this._hashHandler);
  }

  /**
   * Регистрирует маршрут
   * @param {string|RegExp} path - например '/catalog' или '/listing/:id'
   * @param {Function} handler - функция, возвращающая компонент
   */
  registerRoute(path, handler) {
    this._routes.push({ path, handler });
  }

  /** Регистрирует обработчик 404 */
  setNotFound(handler) {
    this._notFoundHandler = handler;
  }

  /**
   * Переходит по маршруту (изменяет hash в URL)
   * @param {string} path - например '/catalog'
   */
  navigate(path) {
    const target = '#' + (path.startsWith('/') ? path : '/' + path);
    if (window.location.hash !== target) {
      window.location.hash = target;
    } else {
      // Если hash тот же — принудительно перерендерим
      this._resolve(this._getCurrentPath());
    }
  }

  /** Обрабатывает события popstate / hashchange */
  handlePopState() {
    this._resolve(this._getCurrentPath());
  }

  /** Инициализирует роутер по текущему URL */
  start() {
    // Если hash пустой — устанавливаем '#/' без перезагрузки
    if (!window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search + '#/');
    }
    this._resolve(this._getCurrentPath());
  }

  /** Возвращает текущий путь из hash (или '/' по умолчанию) */
  _getCurrentPath() {
    const hash = window.location.hash || '#/';
    return hash.slice(1) || '/';
  }

  /**
   * Находит совпадающий маршрут и рендерит компонент
   * @param {string} path
   */
  _resolve(path) {
    const match = this._matchRoute(path);

    if (this._currentComponent && typeof this._currentComponent.destroy === 'function') {
      this._currentComponent.destroy();
    }
    this._root.innerHTML = '';

    if (match) {
      const component = match.handler(match.params);
      this._currentComponent = component;
      if (component) {
        component.render();
        component.init();
      }
    } else {
      this._render404();
    }

    // Скроллим страницу наверх при навигации
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /**
   * Ищет совпадающий маршрут
   * @param {string} path
   * @returns {{ handler, params }|null}
   */
  _matchRoute(path) {
    for (const route of this._routes) {
      if (typeof route.path === 'string') {
        // Поддержка параметров вида /listing/:id
        const paramNames = [];
        const regexStr = route.path.replace(/:([^/]+)/g, (_, name) => {
          paramNames.push(name);
          return '([^/]+)';
        });
        const regex = new RegExp(`^${regexStr}$`);
        const match = path.match(regex);
        if (match) {
          const params = {};
          paramNames.forEach((name, i) => {
            params[name] = match[i + 1];
          });
          return { handler: route.handler, params };
        }
      } else if (route.path instanceof RegExp) {
        const match = path.match(route.path);
        if (match) {
          return { handler: route.handler, params: { match } };
        }
      }
    }
    return null;
  }

  /** Отображает страницу 404 */
  _render404() {
    if (this._notFoundHandler) {
      const component = this._notFoundHandler();
      this._currentComponent = component;
      if (component) {
        component.render();
        component.init();
      }
    } else {
      this._root.innerHTML = `
        <div class="not-found">
          <div class="not-found__code">404</div>
          <h1 class="not-found__title">Страница не найдена</h1>
          <p class="not-found__text">Запрошенная страница не существует или была удалена.</p>
          <a href="#/" class="not-found__btn" data-link>На главную</a>
        </div>
      `;
      this._root.querySelector('[data-link]')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate('/');
      });
    }
  }
}
