import { Component } from './Component.js';
import { debounce } from '../utils/debounce.js';
import { storage } from '../utils/storage.js';

const DRAFT_KEY = 'marketplace_draft';
const LISTINGS_KEY = 'marketplace_listings';

/**
 * Компонент формы создания объявления
 */
export class CreateForm extends Component {
  constructor({ apiClient, router, container }) {
    super();
    this._apiClient = apiClient;
    this._router = router;
    this._container = container;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'create-form-page';
    el.innerHTML = `
      <h1 class="create-form-page__title">Разместить объявление</h1>
      <p class="create-form-page__subtitle">Заполните форму, чтобы разместить объявление о продаже</p>
      <form class="create-form" id="create-form" novalidate>

        <div class="create-form__field" id="field-title">
          <label class="create-form__label" for="f-title">Заголовок объявления *</label>
          <input class="create-form__input" id="f-title" name="title"
            type="text" placeholder="Например: iPhone 12 Pro 128GB" maxlength="100" />
          <span class="create-form__error" id="err-title">Заголовок должен содержать от 5 до 100 символов</span>
          <span class="create-form__hint">От 5 до 100 символов</span>
        </div>

        <div class="create-form__field" id="field-description">
          <label class="create-form__label" for="f-desc">Описание *</label>
          <textarea class="create-form__textarea" id="f-desc" name="description"
            placeholder="Опишите состояние товара, комплектацию, причину продажи..." maxlength="2000"></textarea>
          <span class="create-form__error" id="err-description">Заполните описание</span>
          <span class="create-form__hint">До 2000 символов</span>
        </div>

        <div class="create-form__row">
          <div class="create-form__field" id="field-price">
            <label class="create-form__label" for="f-price">Цена (₽) *</label>
            <input class="create-form__input" id="f-price" name="price"
              type="number" placeholder="0" min="0" max="10000000" />
            <span class="create-form__error" id="err-price">Введите корректную цену (от 0 до 10 000 000)</span>
          </div>

          <div class="create-form__field" id="field-category">
            <label class="create-form__label" for="f-category">Категория *</label>
            <select class="create-form__select" id="f-category" name="category">
              <option value="">Выберите категорию</option>
              <option value="Электроника">Электроника</option>
              <option value="Мебель">Мебель</option>
              <option value="Спорт">Спорт</option>
              <option value="Одежда">Одежда</option>
              <option value="Книги">Книги</option>
              <option value="Другое">Другое</option>
            </select>
            <span class="create-form__error" id="err-category">Выберите категорию</span>
          </div>
        </div>

        <div class="create-form__row">
          <div class="create-form__field" id="field-city">
            <label class="create-form__label" for="f-city">Город *</label>
            <div class="create-form__geo-wrap">
              <input class="create-form__input" id="f-city" name="city"
                type="text" placeholder="Начните вводить город..." autocomplete="off" />
              <div class="create-form__suggestions" id="geo-suggestions"></div>
            </div>
            <span class="create-form__error" id="err-city">Укажите город</span>
          </div>

          <div class="create-form__field" id="field-sellerName">
            <label class="create-form__label" for="f-seller">Ваше имя *</label>
            <input class="create-form__input" id="f-seller" name="sellerName"
              type="text" placeholder="Как к вам обращаться?" />
            <span class="create-form__error" id="err-sellerName">Укажите ваше имя</span>
          </div>
        </div>

        <div class="create-form__row">
          <div class="create-form__field" id="field-contact">
            <label class="create-form__label" for="f-contact">Способ связи *</label>
            <input class="create-form__input" id="f-contact" name="contact"
              type="text" placeholder="+7 (999) 000-00-00 или @username" />
            <span class="create-form__error" id="err-contact">Укажите способ связи</span>
          </div>

          <div class="create-form__field" id="field-imageUrl">
            <label class="create-form__label create-form__label--optional">Фото товара</label>
            <div class="create-form__upload" id="upload-area">
              <input type="file" id="f-image-file" accept="image/*" class="create-form__file-input" />
              <div class="create-form__upload-placeholder" id="upload-placeholder">
                <span class="create-form__upload-icon">📷</span>
                <span class="create-form__upload-text">Нажмите или перетащите фото</span>
                <span class="create-form__upload-hint">JPG, PNG, WEBP до 5 МБ</span>
              </div>
              <div class="create-form__upload-preview" id="upload-preview" style="display:none">
                <img class="create-form__preview-img" id="preview-img" src="" alt="Превью" />
                <button type="button" class="create-form__preview-remove" id="remove-img" title="Удалить фото">✕</button>
              </div>
            </div>
            <input type="hidden" name="imageUrl" id="f-image-url" />
          </div>
        </div>

        <button type="submit" class="create-form__submit">📢 Разместить объявление</button>
      </form>
    `;
    this._element = el;
    this._container.appendChild(el);
    return el;
  }

  init() {
    this._loadDraft();

    const form = this._element.querySelector('#create-form');
    const cityInput = this._element.querySelector('#f-city');
    const suggestionsEl = this._element.querySelector('#geo-suggestions');

    // --- Загрузка изображения ---
    const uploadArea = this._element.querySelector('#upload-area');
    const fileInput = this._element.querySelector('#f-image-file');
    const placeholder = this._element.querySelector('#upload-placeholder');
    const preview = this._element.querySelector('#upload-preview');
    const previewImg = this._element.querySelector('#preview-img');
    const removeBtn = this._element.querySelector('#remove-img');
    const hiddenUrl = this._element.querySelector('#f-image-url');

    // Клик по зоне загрузки открывает диалог выбора файла
    this._addListener(uploadArea, 'click', (e) => {
      if (e.target !== removeBtn) fileInput.click();
    });

    // Выбор файла
    this._addListener(fileInput, 'change', () => {
      const file = fileInput.files[0];
      if (file) this._handleImageFile(file, placeholder, preview, previewImg, hiddenUrl);
    });

    // Drag & Drop
    this._addListener(uploadArea, 'dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('create-form__upload--dragover');
    });
    this._addListener(uploadArea, 'dragleave', () => {
      uploadArea.classList.remove('create-form__upload--dragover');
    });
    this._addListener(uploadArea, 'drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('create-form__upload--dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this._handleImageFile(file, placeholder, preview, previewImg, hiddenUrl);
      }
    });

    // Удаление фото
    this._addListener(removeBtn, 'click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      hiddenUrl.value = '';
      placeholder.style.display = '';
      preview.style.display = 'none';
      previewImg.src = '';
    });

    // Автосохранение черновика (только текстовые поля)
    const inputs = form.querySelectorAll('input:not([type=file]), textarea, select');
    inputs.forEach((input) => {
      this._addListener(input, 'input', () => this._saveDraft());
      this._addListener(input, 'change', () => this._saveDraft());
    });

    // Geo API подсказки
    const debouncedGeo = debounce(async (query) => {
      if (query.length < 3) {
        suggestionsEl.classList.remove('create-form__suggestions--visible');
        return;
      }
      try {
        const suggestions = await this._apiClient.fetchGeoSuggestions(query);
        this._renderGeoSuggestions(suggestions, suggestionsEl, cityInput);
      } catch {
        suggestionsEl.classList.remove('create-form__suggestions--visible');
      }
    }, 300);

    this._addListener(cityInput, 'input', (e) => debouncedGeo(e.target.value));

    // Скрываем подсказки при клике вне
    this._addListener(document, 'click', (e) => {
      if (!cityInput.contains(e.target) && !suggestionsEl.contains(e.target)) {
        suggestionsEl.classList.remove('create-form__suggestions--visible');
      }
    });

    // Отправка формы
    this._addListener(form, 'submit', (e) => {
      e.preventDefault();
      this._submit();
    });
  }

  /**
   * Читает файл изображения и конвертирует в data URI
   */
  _handleImageFile(file, placeholder, preview, previewImg, hiddenUrl) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер — 5 МБ.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      previewImg.src = dataUrl;
      hiddenUrl.value = dataUrl;
      placeholder.style.display = 'none';
      preview.style.display = '';
    };
    reader.readAsDataURL(file);
  }

  _renderGeoSuggestions(items, container, input) {
    if (!items.length) {
      container.classList.remove('create-form__suggestions--visible');
      return;
    }
    container.innerHTML = items
      .map((city) => `<div class="create-form__suggestion-item">${city}</div>`)
      .join('');
    container.classList.add('create-form__suggestions--visible');

    container.querySelectorAll('.create-form__suggestion-item').forEach((item) => {
      item.addEventListener('click', () => {
        input.value = item.textContent;
        container.classList.remove('create-form__suggestions--visible');
        this._saveDraft();
      });
    });
  }

  _validate() {
    const form = this._element.querySelector('#create-form');
    const data = Object.fromEntries(new FormData(form));
    const errors = {};

    if (!data.title || data.title.trim().length < 5 || data.title.trim().length > 100) {
      errors.title = true;
    }
    if (!data.description || data.description.trim().length < 1) {
      errors.description = true;
    }
    const price = Number(data.price);
    if (data.price === '' || isNaN(price) || price < 0 || price > 10000000) {
      errors.price = true;
    }
    if (!data.category) {
      errors.category = true;
    }
    if (!data.city || data.city.trim().length < 2) {
      errors.city = true;
    }
    if (!data.sellerName || data.sellerName.trim().length < 2) {
      errors.sellerName = true;
    }
    if (!data.contact || data.contact.trim().length < 3) {
      errors.contact = true;
    }

    // Показываем/скрываем ошибки
    ['title', 'description', 'price', 'category', 'city', 'sellerName', 'contact'].forEach(
      (field) => {
        const fieldEl = this._element.querySelector(`#field-${field}`);
        if (fieldEl) {
          fieldEl.classList.toggle('create-form__field--invalid', !!errors[field]);
        }
      }
    );

    return { valid: Object.keys(errors).length === 0, data };
  }

  _submit() {
    const { valid, data } = this._validate();
    if (!valid) return;

    const listing = {
      id: `local-${Date.now()}`,
      title: data.title.trim(),
      description: data.description.trim(),
      price: Number(data.price),
      category: data.category,
      imageUrl: data.imageUrl || '',
      sellerName: data.sellerName.trim(),
      contact: data.contact.trim(),
      city: data.city.trim(),
      createdAt: new Date().toISOString(),
    };

    // Сохраняем в localStorage
    const existing = JSON.parse(localStorage.getItem(LISTINGS_KEY) || '[]');
    existing.unshift(listing);
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(existing));

    this._clearDraft();
    this._router.navigate('/catalog');
  }

  _saveDraft() {
    const form = this._element.querySelector('#create-form');
    if (!form) return;
    const data = Object.fromEntries(new FormData(form));
    storage.set(DRAFT_KEY, data);
  }

  _loadDraft() {
    const draft = storage.get(DRAFT_KEY);
    if (!draft) return;
    const form = this._element.querySelector('#create-form');
    if (!form) return;
    Object.entries(draft).forEach(([name, value]) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (el) el.value = value;
    });
  }

  _clearDraft() {
    storage.remove(DRAFT_KEY);
  }
}
