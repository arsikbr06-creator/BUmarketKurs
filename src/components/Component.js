/**
 * Базовый класс для всех UI-компонентов
 */
export class Component {
  constructor(props = {}) {
    this.props = props;
    this._element = null;
    this._listeners = [];
  }

  /** Возвращает/вставляет DOM-узел компонента — переопределить в наследнике */
  render() {
    throw new Error('render() must be implemented');
  }

  /** Навешивает обработчики событий — переопределить в наследнике */
  init() {
    throw new Error('init() must be implemented');
  }

  /** Удаляет все обработчики событий и DOM-узел */
  destroy() {
    this._listeners.forEach(({ el, event, handler }) => {
      el.removeEventListener(event, handler);
    });
    this._listeners = [];
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element = null;
  }

  /**
   * Регистрирует обработчик события и сохраняет его для последующего удаления
   * @param {EventTarget} el
   * @param {string} event
   * @param {Function} handler
   */
  _addListener(el, event, handler) {
    el.addEventListener(event, handler);
    this._listeners.push({ el, event, handler });
  }
}
