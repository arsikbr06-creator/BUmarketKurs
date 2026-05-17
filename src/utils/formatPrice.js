/**
 * Форматирует число в строку с разделителями тысяч и символом ₽
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Форматирует число в строку с символом валюты
 * @param {number} amount
 * @param {string} currency - 'USD' | 'EUR'
 * @returns {string}
 */
export function formatForeignPrice(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
