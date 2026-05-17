import './styles/main.css';

import { Router } from './router/Router.js';
import { API_Client } from './api/API_Client.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { Catalog } from './components/Catalog.js';
import { ListingDetail } from './components/ListingDetail.js';
import { CreateForm } from './components/CreateForm.js';
import { ProfilePage } from './pages/ProfilePage.js';

// Корневой элемент
const app = document.getElementById('app');

// Создаём контейнер для основного контента
const mainContent = document.createElement('main');
mainContent.className = 'main-content';
app.appendChild(mainContent);

// Инициализируем сервисы
const apiClient = new API_Client();
const router = new Router(mainContent);

// Шапка
const header = new Header({ router, container: app });
app.insertBefore(header.render(), mainContent);
header.init();

// Подвал
const footer = new Footer({ router, container: app });
footer.render();
footer.init();

// Регистрируем маршруты
router.registerRoute('/', (params) => {
  return new HomePage({ router, apiClient, container: mainContent });
});

router.registerRoute('/catalog', (params) => {
  return new Catalog({ apiClient, router, container: mainContent });
});

router.registerRoute('/listing/:id', (params) => {
  return new ListingDetail({ id: params.id, apiClient, router, container: mainContent });
});

router.registerRoute('/create', (params) => {
  return new CreateForm({ apiClient, router, container: mainContent });
});

router.registerRoute('/profile', () => {
  return new ProfilePage({ router, container: mainContent });
});

// 404
router.setNotFound(() => {
  const el = document.createElement('div');
  el.className = 'not-found';
  el.innerHTML = `
    <div class="not-found__code">404</div>
    <h1 class="not-found__title">Страница не найдена</h1>
    <p class="not-found__text">Запрошенная страница не существует или была удалена.</p>
    <button class="not-found__btn" id="to-home">На главную</button>
  `;
  mainContent.appendChild(el);
  el.querySelector('#to-home')?.addEventListener('click', () => router.navigate('/'));
  return { render: () => {}, init: () => {}, destroy: () => mainContent.innerHTML = '' };
});

// Запускаем роутер
router.start();
