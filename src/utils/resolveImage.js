/**
 * Преобразует путь к изображению с учётом base URL приложения
 * (нужно для корректной работы на GitHub Pages, где приложение живёт в подпапке)
 *
 * @param {string} src - путь, например '/images/iphone.jpg' или 'data:...'
 * @returns {string}
 */
export function resolveImage(src) {
  if (!src) return '';

  // data: URI и абсолютные URL не трогаем
  if (src.startsWith('data:') || /^https?:\/\//.test(src)) {
    return src;
  }

  const base = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '');

  // Если путь уже начинается с base — оставляем как есть
  if (base && src.startsWith(base + '/')) return src;

  // Убираем ведущий слэш у относительного пути
  const normalized = src.startsWith('/') ? src : '/' + src;
  return base + normalized;
}
