import { defineConfig } from 'vite';

// Имя репозитория на GitHub. Меняется на '/имя-репо/' для деплоя на GitHub Pages.
// Можно переопределить через переменную окружения VITE_BASE.
const base = process.env.VITE_BASE || '/BUmarketKurs/';

export default defineConfig(({ command }) => ({
  // В режиме dev используем '/', в production — base для GitHub Pages
  base: command === 'serve' ? '/' : base,
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}));
