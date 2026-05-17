(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();class M{constructor(e){this._root=e,this._routes=[],this._notFoundHandler=null,this._currentComponent=null,this._popstateHandler=()=>this.handlePopState(),this._hashHandler=()=>this.handlePopState(),window.addEventListener("popstate",this._popstateHandler),window.addEventListener("hashchange",this._hashHandler)}registerRoute(e,t){this._routes.push({path:e,handler:t})}setNotFound(e){this._notFoundHandler=e}navigate(e){const t="#"+(e.startsWith("/")?e:"/"+e);window.location.hash!==t?window.location.hash=t:this._resolve(this._getCurrentPath())}handlePopState(){this._resolve(this._getCurrentPath())}start(){window.location.hash||history.replaceState(null,"",window.location.pathname+window.location.search+"#/"),this._resolve(this._getCurrentPath())}_getCurrentPath(){return(window.location.hash||"#/").slice(1)||"/"}_resolve(e){const t=this._matchRoute(e);if(this._currentComponent&&typeof this._currentComponent.destroy=="function"&&this._currentComponent.destroy(),this._root.innerHTML="",t){const s=t.handler(t.params);this._currentComponent=s,s&&(s.render(),s.init())}else this._render404();window.scrollTo({top:0,behavior:"instant"})}_matchRoute(e){for(const t of this._routes)if(typeof t.path=="string"){const s=[],i=t.path.replace(/:([^/]+)/g,(l,o)=>(s.push(o),"([^/]+)")),r=new RegExp(`^${i}$`),n=e.match(r);if(n){const l={};return s.forEach((o,u)=>{l[o]=n[u+1]}),{handler:t.handler,params:l}}}else if(t.path instanceof RegExp){const s=e.match(t.path);if(s)return{handler:t.handler,params:{match:s}}}return null}_render404(){var e;if(this._notFoundHandler){const t=this._notFoundHandler();this._currentComponent=t,t&&(t.render(),t.init())}else this._root.innerHTML=`
        <div class="not-found">
          <div class="not-found__code">404</div>
          <h1 class="not-found__title">Страница не найдена</h1>
          <p class="not-found__text">Запрошенная страница не существует или была удалена.</p>
          <a href="#/" class="not-found__btn" data-link>На главную</a>
        </div>
      `,(e=this._root.querySelector("[data-link]"))==null||e.addEventListener("click",t=>{t.preventDefault(),this.navigate("/")})}}const g={get(a){try{const e=localStorage.getItem(a);return e?JSON.parse(e):null}catch{return null}},set(a,e){try{localStorage.setItem(a,JSON.stringify(e))}catch{console.error("localStorage write error")}},remove(a){localStorage.removeItem(a)}},S={get(a){try{const e=sessionStorage.getItem(a);return e?JSON.parse(e):null}catch{return null}},set(a,e){try{sessionStorage.setItem(a,JSON.stringify(e))}catch{console.error("sessionStorage write error")}}},w="currency_rates_cache",D=5e3;class A{constructor(e={}){const t="/BUmarketKurs/";this._config={listingsUrl:e.listingsUrl||`${t}data/listings.json`,currencyApiUrl:e.currencyApiUrl||"https://api.exchangerate-api.com/v4/latest/RUB",...e}}async fetchListings(){try{const e=await fetch(this._config.listingsUrl);if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();return[...this._getLocalListings(),...t]}catch(e){throw console.error("[API_Client] fetchListings failed:",e.message),new Error("Не удалось загрузить объявления: "+e.message)}}async fetchListingById(e){const s=(await this.fetchListings()).find(i=>String(i.id)===String(e));if(!s){const i=new Error("Объявление не найдено");throw i.status=404,i}return s}async fetchCurrencyRates(){var i,r;const e=S.get(w);if(e)return e;const t=new AbortController,s=setTimeout(()=>t.abort(),D);try{const n=await fetch(this._config.currencyApiUrl,{signal:t.signal});if(!n.ok)throw new Error(`Currency API HTTP ${n.status}`);const l=await n.json(),o=(i=l.rates)!=null&&i.USD?1/l.rates.USD:null,u=(r=l.rates)!=null&&r.EUR?1/l.rates.EUR:null,p={USD:o,EUR:u,timestamp:new Date().toISOString()};return S.set(w,p),p}catch(n){throw console.error("[API_Client] fetchCurrencyRates failed:",n.message),new Error("Не удалось получить курсы валют: "+n.message)}finally{clearTimeout(s)}}async fetchGeoSuggestions(e){if(!e||e.length<3)return[];try{const t="https://countriesnow.space/api/v0.1/countries/cities";return this._getStaticCitySuggestions(e)}catch(t){throw console.error("[API_Client] fetchGeoSuggestions failed:",t.message),new Error("Не удалось получить подсказки: "+t.message)}}_getStaticCitySuggestions(e){const t=["Москва","Санкт-Петербург","Новосибирск","Екатеринбург","Казань","Нижний Новгород","Челябинск","Самара","Уфа","Ростов-на-Дону","Краснодар","Пермь","Воронеж","Волгоград","Красноярск","Саратов","Тюмень","Тольятти","Ижевск","Барнаул","Иркутск","Хабаровск","Ярославль","Владивосток","Махачкала"],s=e.toLowerCase();return t.filter(i=>i.toLowerCase().startsWith(s)).slice(0,6)}_getLocalListings(){try{const e=localStorage.getItem("marketplace_listings");return e?JSON.parse(e):[]}catch{return[]}}}class h{constructor(e={}){this.props=e,this._element=null,this._listeners=[]}render(){throw new Error("render() must be implemented")}init(){throw new Error("init() must be implemented")}destroy(){this._listeners.forEach(({el:e,event:t,handler:s})=>{e.removeEventListener(t,s)}),this._listeners=[],this._element&&this._element.parentNode&&this._element.parentNode.removeChild(this._element),this._element=null}_addListener(e,t,s){e.addEventListener(t,s),this._listeners.push({el:e,event:t,handler:s})}}const F=[{label:"Главная",path:"/"},{label:"Каталог",path:"/catalog"},{label:"Мой кабинет",path:"/profile"}];class U extends h{constructor({router:e,container:t}){super(),this._router=e,this._container=t}render(){const e=document.createElement("header");return e.className="header",e.innerHTML=`
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
            ${F.map(t=>`
              <li>
                <a class="nav__link" href="#${t.path}" data-link data-path="${t.path}">
                  ${t.label}
                </a>
              </li>
            `).join("")}
          </ul>
        </nav>
        <button class="header__btn" id="header-create-btn">+ Разместить</button>
      </div>
    `,this._element=e,this._container.prepend(e),this._updateActiveLink(),e}init(){this._element.querySelectorAll("[data-link]").forEach(s=>{this._addListener(s,"click",i=>{i.preventDefault();const r=s.getAttribute("href")||"",n=r.startsWith("#")?r.slice(1):s.dataset.path||"/";this._router.navigate(n),this._closeMenu(),this._updateActiveLink()})}),this._addListener(this._element.querySelector("#header-create-btn"),"click",()=>{this._router.navigate("/create"),this._updateActiveLink()});const e=this._element.querySelector("#nav-toggle"),t=this._element.querySelector("#nav-list");this._addListener(e,"click",()=>{t.classList.toggle("nav__list--open")}),this._addListener(window,"hashchange",()=>this._updateActiveLink()),this._addListener(window,"popstate",()=>this._updateActiveLink())}_updateActiveLink(){const e=(window.location.hash||"#/").slice(1)||"/";this._element.querySelectorAll("[data-path]").forEach(t=>{const s=t.dataset.path,i=s==="/"?e==="/":e.startsWith(s);t.classList.toggle("nav__link--active",i)})}_closeMenu(){var e;(e=this._element.querySelector("#nav-list"))==null||e.classList.remove("nav__list--open")}}class R extends h{constructor({router:e,container:t}){super(),this._router=e,this._container=t}render(){const e=new Date().getFullYear(),t=document.createElement("footer");return t.className="footer",t.innerHTML=`
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
        <span>© ${e} МИРЭА — Российский технологический университет</span>
        <a class="footer__github" href="https://github.com/" target="_blank" rel="noopener">
          ⭐ Исходный код на GitHub
        </a>
      </div>
    `,this._element=t,this._container.appendChild(t),t}init(){this._element.querySelectorAll("[data-link]").forEach(e=>{this._addListener(e,"click",t=>{t.preventDefault();const s=e.getAttribute("href")||"",i=s.startsWith("#")?s.slice(1):s;this._router.navigate(i)})})}}function $(a){return new Intl.NumberFormat("ru-RU",{style:"currency",currency:"RUB",maximumFractionDigits:0}).format(a)}function E(a,e){return new Intl.NumberFormat("en-US",{style:"currency",currency:e,maximumFractionDigits:2}).format(a)}function x(a){const e=new Date(a),t=String(e.getDate()).padStart(2,"0"),s=String(e.getMonth()+1).padStart(2,"0"),i=e.getFullYear();return`${t}.${s}.${i}`}function N(a){if(!a)return"";if(a.startsWith("data:")||/^https?:\/\//.test(a))return a;const e="/BUmarketKurs/".replace(/\/$/,"");if(e&&a.startsWith(e+"/"))return a;const t=a.startsWith("/")?a:"/"+a;return e+t}class L extends h{constructor({listing:e,router:t,onDelete:s=null}){super(),this._listing=e,this._router=t,this._onDelete=s}render(){const{id:e,title:t,price:s,category:i,imageUrl:r,city:n,createdAt:l}=this._listing,o=document.createElement("article");return o.className="listing-card",o.dataset.id=e,o.innerHTML=`
      <div class="listing-card__image-wrap">
        ${r?`<img class="listing-card__image" src="${N(r)}" alt="${t}" loading="lazy" />`:`<div class="listing-card__no-image">
               <span class="listing-card__no-image-icon">📷</span>
               <span class="listing-card__no-image-text">Нет фото</span>
             </div>`}
        <span class="listing-card__category-badge">${i}</span>
        ${this._onDelete?'<button class="listing-card__delete" data-delete title="Удалить объявление">✕</button>':""}
      </div>
      <div class="listing-card__body">
        <h3 class="listing-card__title">${t}</h3>
        <div class="listing-card__price">${$(s)}</div>
        <div class="listing-card__footer">
          <span class="listing-card__city">📍 ${n||""}</span>
          <span class="listing-card__date">${x(l)}</span>
        </div>
      </div>
    `,this._element=o,o}init(){this._addListener(this._element,"click",t=>{t.target.closest("[data-delete]")||this._router.navigate(`/listing/${this._listing.id}`)});const e=this._element.querySelector("[data-delete]");e&&this._onDelete&&this._addListener(e,"click",t=>{t.stopPropagation(),this._onDelete(this._listing.id)})}}const O=[{name:"Электроника",icon:"📱",count:"120+"},{name:"Мебель",icon:"🛋️",count:"85+"},{name:"Спорт",icon:"⚽",count:"64+"},{name:"Одежда",icon:"👗",count:"200+"},{name:"Книги",icon:"📚",count:"150+"},{name:"Другое",icon:"📦",count:"300+"}];class B extends h{constructor({router:e,apiClient:t,container:s}){super(),this._router=e,this._apiClient=t,this._container=s,this._cardComponents=[]}render(){const e=document.createElement("div");return e.className="home",e.innerHTML=`
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
          ${O.map(t=>`
            <div class="category-card" data-category="${t.name}">
              <div class="category-card__icon">${t.icon}</div>
              <div class="category-card__name">${t.name}</div>
              <div class="category-card__count">${t.count} объявлений</div>
            </div>
          `).join("")}
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
    `,this._element=e,this._container.appendChild(e),e}init(){const e=()=>{localStorage.removeItem("marketplace_filter_state"),this._router.navigate("/catalog")};this._addListener(this._element.querySelector("#hero-catalog-btn"),"click",e),this._addListener(this._element.querySelector("#hero-create-btn"),"click",()=>this._router.navigate("/create")),this._addListener(this._element.querySelector("#all-listings-btn"),"click",e),this._addListener(this._element.querySelector("#cta-create-btn"),"click",()=>this._router.navigate("/create")),this._element.querySelectorAll(".category-card").forEach(t=>{this._addListener(t,"click",()=>{const s=t.dataset.category;localStorage.setItem("marketplace_filter_state",JSON.stringify({query:"",category:s,priceMin:0,priceMax:1e7,page:1})),this._router.navigate("/catalog")})}),this._loadRecentListings()}async _loadRecentListings(){const e=this._element.querySelector("#recent-grid");try{const s=(await this._apiClient.fetchListings()).slice(0,4);e.innerHTML="",s.forEach(i=>{const r=new L({listing:i,router:this._router}),n=r.render();r.init(),e.appendChild(n),this._cardComponents.push(r)})}catch{e.innerHTML='<p style="color:var(--color-text-muted);padding:1rem">Не удалось загрузить объявления</p>'}}destroy(){this._cardComponents.forEach(e=>e.destroy()),this._cardComponents=[],super.destroy()}}function P(a,e){let t=null;return function(...s){clearTimeout(t),t=setTimeout(()=>a.apply(this,s),e)}}class G extends h{constructor({onSearch:e,placeholder:t="Поиск объявлений..."}){super(),this._onSearch=e,this._placeholder=t}render(){var t;const e=document.createElement("div");return e.className="search-bar",e.innerHTML=`
      <span class="search-bar__icon">🔍</span>
      <input
        type="text"
        class="search-bar__input"
        placeholder="${this._placeholder}"
        autocomplete="off"
      />
    `,this._element=e,(t=this.props.container)==null||t.appendChild(e),e}init(){const e=this._element.querySelector(".search-bar__input"),t=P(s=>{this._onSearch(s)},300);this._addListener(e,"input",s=>{t(s.target.value)})}getValue(){var e,t;return((t=(e=this._element)==null?void 0:e.querySelector(".search-bar__input"))==null?void 0:t.value)||""}clear(){var t;const e=(t=this._element)==null?void 0:t.querySelector(".search-bar__input");e&&(e.value="")}}const j=["all","Электроника","Мебель","Спорт","Одежда","Книги","Другое"];class J extends h{constructor({onFilter:e}){super(),this._onFilter=e}render(){var t;const e=document.createElement("div");return e.className="filter-panel",e.innerHTML=`
      <select class="filter-panel__select" title="Категория">
        ${j.map(s=>`<option value="${s}">${s==="all"?"Все категории":s}</option>`).join("")}
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
    `,this._element=e,(t=this.props.container)==null||t.appendChild(e),e}init(){const e=this._element.querySelector(".filter-panel__select"),t=this._element.querySelector(".filter-panel__input--min"),s=this._element.querySelector(".filter-panel__input--max"),i=this._element.querySelector(".filter-panel__reset"),r=()=>this._onFilter(this.getFilters());this._addListener(e,"change",r),this._addListener(t,"input",r),this._addListener(s,"input",r),this._addListener(i,"click",()=>this.reset())}getFilters(){const e=this._element.querySelector(".filter-panel__select"),t=this._element.querySelector(".filter-panel__input--min"),s=this._element.querySelector(".filter-panel__input--max");return{category:(e==null?void 0:e.value)||"all",priceMin:Number(t==null?void 0:t.value)||0,priceMax:Number(s==null?void 0:s.value)||1e7}}reset(){const e=this._element.querySelector(".filter-panel__select"),t=this._element.querySelector(".filter-panel__input--min"),s=this._element.querySelector(".filter-panel__input--max");e&&(e.value="all"),t&&(t.value=""),s&&(s.value=""),this._onFilter(this.getFilters())}}function W(a,e){const{query:t="",category:s="all",priceMin:i=0,priceMax:r=1e7}=e,n=t.toLowerCase().trim();return a.filter(l=>{const o=!n||l.title.toLowerCase().includes(n)||l.description.toLowerCase().includes(n),u=s==="all"||l.category===s,p=l.price>=i&&l.price<=r;return o&&u&&p})}const y=20,C="marketplace_filter_state";class Y extends h{constructor({apiClient:e,router:t,container:s}){super(),this._apiClient=e,this._router=t,this._container=s,this._allListings=[],this._filtered=[],this._currentPage=1,this._filters={query:"",category:"all",priceMin:0,priceMax:1e7},this._childComponents=[]}render(){const e=document.createElement("div");return e.className="catalog",e.innerHTML=`
      <div class="catalog__header">
        <h1 class="catalog__title">Объявления</h1>
        <p class="catalog__subtitle">Найдите то, что ищете, среди тысяч объявлений</p>
      </div>
      <div class="catalog__toolbar" id="catalog-toolbar"></div>
      <div class="catalog__count" id="catalog-count"></div>
      <div id="catalog-content"></div>
      <div class="pagination" id="catalog-pagination"></div>
    `,this._element=e,this._container.appendChild(e),e}init(){const e=g.get(C);e&&(this._filters={...this._filters,...e},this._currentPage=e.page||1);const t=this._element.querySelector("#catalog-toolbar"),s=new G({onSearch:r=>{this._filters.query=r,this._currentPage=1,this._applyFilters()},container:t});s.render(),s.init(),this._childComponents.push(s);const i=new J({onFilter:r=>{this._filters={...this._filters,...r},this._currentPage=1,this._applyFilters()},container:t});i.render(),i.init(),this._childComponents.push(i),this._loadListings()}destroy(){this._childComponents.forEach(e=>e.destroy()),this._childComponents=[],super.destroy()}async _loadListings(){this._showLoader();try{this._allListings=await this._apiClient.fetchListings(),this._applyFilters()}catch{this._showError()}}_applyFilters(){this._filtered=W(this._allListings,this._filters),this._saveFilterState(),this._renderPage(this._currentPage),this._renderPagination(),this._updateCount()}_renderPage(e){const t=this._element.querySelector("#catalog-content");if(!t)return;if(this._filtered.length===0){t.innerHTML=`
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <h3 class="empty-state__title">Объявления не найдены</h3>
          <p class="empty-state__text">Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      `;return}const s=(e-1)*y,i=this._filtered.slice(s,s+y),r=document.createElement("div");r.className="catalog__grid",i.forEach(n=>{const l=new L({listing:n,router:this._router}),o=l.render();l.init(),r.appendChild(o),this._childComponents.push(l)}),t.innerHTML="",t.appendChild(r)}_renderPagination(){const e=this._element.querySelector("#catalog-pagination");if(!e)return;const t=Math.ceil(this._filtered.length/y);if(t<=1){e.innerHTML="";return}let s=`
      <button class="pagination__btn" data-page="${this._currentPage-1}"
        ${this._currentPage===1?"disabled":""}>← Назад</button>
    `;for(let i=1;i<=t;i++)s+=`<button class="pagination__btn ${i===this._currentPage?"pagination__btn--active":""}"
        data-page="${i}">${i}</button>`;s+=`
      <button class="pagination__btn" data-page="${this._currentPage+1}"
        ${this._currentPage===t?"disabled":""}>Вперёд →</button>
    `,e.innerHTML=s,e.querySelectorAll(".pagination__btn:not([disabled])").forEach(i=>{i.addEventListener("click",()=>{this._currentPage=Number(i.dataset.page),this._renderPage(this._currentPage),this._renderPagination(),this._element.scrollIntoView({behavior:"smooth"})})})}_updateCount(){const e=this._element.querySelector("#catalog-count");e&&(e.textContent=`Найдено объявлений: ${this._filtered.length}`)}_showLoader(){const e=this._element.querySelector("#catalog-content");e&&(e.innerHTML=`
        <div class="loader">
          <div class="loader__spinner"></div>
          <span class="loader__text">Загружаем объявления...</span>
        </div>
      `)}_showError(){var t;const e=this._element.querySelector("#catalog-content");e&&(e.innerHTML=`
        <div class="error-state">
          <div class="error-state__icon">⚠️</div>
          <h3 class="error-state__title">Не удалось загрузить объявления</h3>
          <p class="error-state__text">Проверьте подключение к интернету и попробуйте снова</p>
          <button class="error-state__btn" id="retry-btn">Попробовать снова</button>
        </div>
      `,(t=e.querySelector("#retry-btn"))==null||t.addEventListener("click",()=>this._loadListings()))}_saveFilterState(){g.set(C,{...this._filters,page:this._currentPage})}}class K extends h{constructor({id:e,apiClient:t,router:s,container:i}){super(),this._id=e,this._apiClient=t,this._router=s,this._container=i}render(){const e=document.createElement("div");return e.className="listing-detail",e.innerHTML=`
      <button class="listing-detail__back" id="back-btn">← Назад к каталогу</button>
      <div id="detail-content">
        <div class="loader">
          <div class="loader__spinner"></div>
          <span class="loader__text">Загружаем объявление...</span>
        </div>
      </div>
    `,this._element=e,this._container.appendChild(e),e}init(){const e=this._element.querySelector("#back-btn");this._addListener(e,"click",()=>{this._router.navigate("/catalog")}),this._loadData()}async _loadData(){const e=this._element.querySelector("#detail-content");try{const[t,s]=await Promise.allSettled([this._apiClient.fetchListingById(this._id),this._apiClient.fetchCurrencyRates()]);if(t.status==="rejected"){t.reason.status===404?this._showError("not_found",e):this._showError("network",e);return}const i=t.value,r=s.status==="fulfilled"?s.value:null;this._renderListing(i,r,e)}catch{this._showError("network",e)}}_renderListing(e,t,s){const i=this._buildPricesHtml(e.price,t),r=e.imageUrl?`<img class="listing-detail__image" src="${N(e.imageUrl)}" alt="${e.title}" id="detail-img" />`:`<div class="listing-detail__no-image">
           <span class="listing-detail__no-image-icon">📷</span>
           <span class="listing-detail__no-image-text">Фото не добавлено</span>
         </div>`;s.innerHTML=`
      <div class="listing-detail__layout">
        <div class="listing-detail__image-wrap">
          ${r}
        </div>
        <div class="listing-detail__info">
          <span class="listing-detail__category">${e.category}</span>
          <h1 class="listing-detail__title">${e.title}</h1>
          <div class="listing-detail__prices">
            <div class="listing-detail__price-main">${$(e.price)}</div>
            ${i}
          </div>
          <p class="listing-detail__description">${e.description}</p>
          <div class="listing-detail__meta">
            <div class="listing-detail__meta-title">Информация о продавце</div>
            <div class="listing-detail__meta-row">👤 <strong>${e.sellerName}</strong></div>
            <div class="listing-detail__meta-row">📞 <strong>${e.contact}</strong></div>
            <div class="listing-detail__meta-row">📍 ${e.city||"Не указан"}</div>
            <div class="listing-detail__meta-row">📅 Опубликовано: ${x(e.createdAt)}</div>
          </div>
          <a href="tel:${e.contact}" class="listing-detail__contact-btn">
            📞 Связаться с продавцом
          </a>
        </div>
      </div>
    `}_buildPricesHtml(e,t){if(!t||!t.USD||!t.EUR)return"";const s=(e/t.USD).toFixed(2),i=(e/t.EUR).toFixed(2);return`
      <div class="listing-detail__price-converted">
        <span class="listing-detail__price-tag">≈ ${E(s,"USD")}</span>
        <span class="listing-detail__price-tag">≈ ${E(i,"EUR")}</span>
      </div>
    `}_showError(e,t){var s,i;e==="not_found"?t.innerHTML=`
        <div class="error-state">
          <div class="error-state__icon">🔍</div>
          <h3 class="error-state__title">Объявление не найдено</h3>
          <p class="error-state__text">Возможно, оно было удалено или перемещено</p>
          <button class="error-state__btn" id="to-catalog">Вернуться в каталог</button>
        </div>
      `:(t.innerHTML=`
        <div class="error-state">
          <div class="error-state__icon">⚠️</div>
          <h3 class="error-state__title">Не удалось загрузить объявление</h3>
          <p class="error-state__text">Проверьте подключение к интернету</p>
          <button class="error-state__btn" id="retry-btn">Попробовать снова</button>
        </div>
      `,(s=t.querySelector("#retry-btn"))==null||s.addEventListener("click",()=>this._loadData())),(i=t.querySelector("#to-catalog"))==null||i.addEventListener("click",()=>{this._router.navigate("/catalog")})}}const b="marketplace_draft",q="marketplace_listings";class V extends h{constructor({apiClient:e,router:t,container:s}){super(),this._apiClient=e,this._router=t,this._container=s}render(){const e=document.createElement("div");return e.className="create-form-page",e.innerHTML=`
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
    `,this._element=e,this._container.appendChild(e),e}init(){this._loadDraft();const e=this._element.querySelector("#create-form"),t=this._element.querySelector("#f-city"),s=this._element.querySelector("#geo-suggestions"),i=this._element.querySelector("#upload-area"),r=this._element.querySelector("#f-image-file"),n=this._element.querySelector("#upload-placeholder"),l=this._element.querySelector("#upload-preview"),o=this._element.querySelector("#preview-img"),u=this._element.querySelector("#remove-img"),p=this._element.querySelector("#f-image-url");this._addListener(i,"click",c=>{c.target!==u&&r.click()}),this._addListener(r,"change",()=>{const c=r.files[0];c&&this._handleImageFile(c,n,l,o,p)}),this._addListener(i,"dragover",c=>{c.preventDefault(),i.classList.add("create-form__upload--dragover")}),this._addListener(i,"dragleave",()=>{i.classList.remove("create-form__upload--dragover")}),this._addListener(i,"drop",c=>{c.preventDefault(),i.classList.remove("create-form__upload--dragover");const m=c.dataTransfer.files[0];m&&m.type.startsWith("image/")&&this._handleImageFile(m,n,l,o,p)}),this._addListener(u,"click",c=>{c.stopPropagation(),r.value="",p.value="",n.style.display="",l.style.display="none",o.src=""}),e.querySelectorAll("input:not([type=file]), textarea, select").forEach(c=>{this._addListener(c,"input",()=>this._saveDraft()),this._addListener(c,"change",()=>this._saveDraft())});const I=P(async c=>{if(c.length<3){s.classList.remove("create-form__suggestions--visible");return}try{const m=await this._apiClient.fetchGeoSuggestions(c);this._renderGeoSuggestions(m,s,t)}catch{s.classList.remove("create-form__suggestions--visible")}},300);this._addListener(t,"input",c=>I(c.target.value)),this._addListener(document,"click",c=>{!t.contains(c.target)&&!s.contains(c.target)&&s.classList.remove("create-form__suggestions--visible")}),this._addListener(e,"submit",c=>{c.preventDefault(),this._submit()})}_handleImageFile(e,t,s,i,r){if(e.size>5*1024*1024){alert("Файл слишком большой. Максимальный размер — 5 МБ.");return}const n=new FileReader;n.onload=l=>{const o=l.target.result;i.src=o,r.value=o,t.style.display="none",s.style.display=""},n.readAsDataURL(e)}_renderGeoSuggestions(e,t,s){if(!e.length){t.classList.remove("create-form__suggestions--visible");return}t.innerHTML=e.map(i=>`<div class="create-form__suggestion-item">${i}</div>`).join(""),t.classList.add("create-form__suggestions--visible"),t.querySelectorAll(".create-form__suggestion-item").forEach(i=>{i.addEventListener("click",()=>{s.value=i.textContent,t.classList.remove("create-form__suggestions--visible"),this._saveDraft()})})}_validate(){const e=this._element.querySelector("#create-form"),t=Object.fromEntries(new FormData(e)),s={};(!t.title||t.title.trim().length<5||t.title.trim().length>100)&&(s.title=!0),(!t.description||t.description.trim().length<1)&&(s.description=!0);const i=Number(t.price);return(t.price===""||isNaN(i)||i<0||i>1e7)&&(s.price=!0),t.category||(s.category=!0),(!t.city||t.city.trim().length<2)&&(s.city=!0),(!t.sellerName||t.sellerName.trim().length<2)&&(s.sellerName=!0),(!t.contact||t.contact.trim().length<3)&&(s.contact=!0),["title","description","price","category","city","sellerName","contact"].forEach(r=>{const n=this._element.querySelector(`#field-${r}`);n&&n.classList.toggle("create-form__field--invalid",!!s[r])}),{valid:Object.keys(s).length===0,data:t}}_submit(){const{valid:e,data:t}=this._validate();if(!e)return;const s={id:`local-${Date.now()}`,title:t.title.trim(),description:t.description.trim(),price:Number(t.price),category:t.category,imageUrl:t.imageUrl||"",sellerName:t.sellerName.trim(),contact:t.contact.trim(),city:t.city.trim(),createdAt:new Date().toISOString()},i=JSON.parse(localStorage.getItem(q)||"[]");i.unshift(s),localStorage.setItem(q,JSON.stringify(i)),this._clearDraft(),this._router.navigate("/catalog")}_saveDraft(){const e=this._element.querySelector("#create-form");if(!e)return;const t=Object.fromEntries(new FormData(e));g.set(b,t)}_loadDraft(){const e=g.get(b);if(!e)return;const t=this._element.querySelector("#create-form");t&&Object.entries(e).forEach(([s,i])=>{const r=t.querySelector(`[name="${s}"]`);r&&(r.value=i)})}_clearDraft(){g.remove(b)}}const k="marketplace_listings";class z extends h{constructor({router:e,container:t}){super(),this._router=e,this._container=t,this._cardComponents=[]}render(){const e=document.createElement("div");return e.className="profile",e.innerHTML=`
      <div class="profile__header">
        <div class="profile__header-inner">
          <div class="profile__avatar">👤</div>
          <div class="profile__info">
            <h1 class="profile__name">Мой кабинет</h1>
            <p class="profile__subtitle">Управляйте своими объявлениями</p>
          </div>
        </div>
      </div>

      <div class="profile__body">
        <div class="profile__sidebar">
          <div class="profile__stats" id="profile-stats">
            <div class="profile__stat">
              <span class="profile__stat-value" id="stat-count">0</span>
              <span class="profile__stat-label">Объявлений</span>
            </div>
            <div class="profile__stat">
              <span class="profile__stat-value" id="stat-total">0 ₽</span>
              <span class="profile__stat-label">Общая стоимость</span>
            </div>
          </div>
          <button class="profile__create-btn" id="profile-create-btn">
            + Разместить объявление
          </button>
        </div>

        <div class="profile__content">
          <div class="profile__section-header">
            <h2 class="profile__section-title">Мои объявления</h2>
            <button class="profile__clear-btn" id="clear-all-btn">🗑 Удалить все</button>
          </div>
          <div id="profile-listings"></div>
        </div>
      </div>
    `,this._element=e,this._container.appendChild(e),e}init(){this._addListener(this._element.querySelector("#profile-create-btn"),"click",()=>this._router.navigate("/create")),this._addListener(this._element.querySelector("#clear-all-btn"),"click",()=>this._confirmClearAll()),this._renderListings()}destroy(){this._cardComponents.forEach(e=>e.destroy()),this._cardComponents=[],super.destroy()}_getMyListings(){try{return JSON.parse(localStorage.getItem(k)||"[]")}catch{return[]}}_saveListings(e){localStorage.setItem(k,JSON.stringify(e))}_renderListings(){var i;this._cardComponents.forEach(r=>r.destroy()),this._cardComponents=[];const e=this._getMyListings(),t=this._element.querySelector("#profile-listings");if(this._updateStats(e),e.length===0){t.innerHTML=`
        <div class="empty-state">
          <div class="empty-state__icon">📋</div>
          <h3 class="empty-state__title">У вас пока нет объявлений</h3>
          <p class="empty-state__text">Разместите первое объявление, чтобы найти покупателя</p>
          <button class="error-state__btn" id="empty-create-btn">Разместить объявление</button>
        </div>
      `,(i=t.querySelector("#empty-create-btn"))==null||i.addEventListener("click",()=>{this._router.navigate("/create")});return}const s=document.createElement("div");s.className="catalog__grid",e.forEach(r=>{const n=new L({listing:r,router:this._router,onDelete:o=>this._deleteListing(o)}),l=n.render();n.init(),s.appendChild(l),this._cardComponents.push(n)}),t.innerHTML="",t.appendChild(s)}_updateStats(e){const t=this._element.querySelector("#stat-count"),s=this._element.querySelector("#stat-total");if(t&&(t.textContent=e.length),s){const i=e.reduce((r,n)=>r+(n.price||0),0);s.textContent=new Intl.NumberFormat("ru-RU").format(i)+" ₽"}}_deleteListing(e){if(!confirm("Удалить это объявление?"))return;const t=this._getMyListings().filter(s=>String(s.id)!==String(e));this._saveListings(t),this._renderListings()}_confirmClearAll(){const e=this._getMyListings();e.length!==0&&confirm(`Удалить все ${e.length} объявлений? Это действие нельзя отменить.`)&&(this._saveListings([]),this._renderListings())}}const f=document.getElementById("app"),_=document.createElement("main");_.className="main-content";f.appendChild(_);const v=new A,d=new M(_),T=new U({router:d,container:f});f.insertBefore(T.render(),_);T.init();const H=new R({router:d,container:f});H.render();H.init();d.registerRoute("/",a=>new B({router:d,apiClient:v,container:_}));d.registerRoute("/catalog",a=>new Y({apiClient:v,router:d,container:_}));d.registerRoute("/listing/:id",a=>new K({id:a.id,apiClient:v,router:d,container:_}));d.registerRoute("/create",a=>new V({apiClient:v,router:d,container:_}));d.registerRoute("/profile",()=>new z({router:d,container:_}));d.setNotFound(()=>{var e;const a=document.createElement("div");return a.className="not-found",a.innerHTML=`
    <div class="not-found__code">404</div>
    <h1 class="not-found__title">Страница не найдена</h1>
    <p class="not-found__text">Запрошенная страница не существует или была удалена.</p>
    <button class="not-found__btn" id="to-home">На главную</button>
  `,_.appendChild(a),(e=a.querySelector("#to-home"))==null||e.addEventListener("click",()=>d.navigate("/")),{render:()=>{},init:()=>{},destroy:()=>_.innerHTML=""}});d.start();
