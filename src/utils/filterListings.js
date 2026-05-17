/**
 * Фильтрует массив объявлений по строке поиска и фильтрам
 * @param {Array} listings
 * @param {Object} filters - { query, category, priceMin, priceMax }
 * @returns {Array}
 */
export function filterListings(listings, filters) {
  const { query = '', category = 'all', priceMin = 0, priceMax = 10000000 } = filters;
  const q = query.toLowerCase().trim();

  return listings.filter((item) => {
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    const matchesCategory = category === 'all' || item.category === category;

    const matchesPrice = item.price >= priceMin && item.price <= priceMax;

    return matchesQuery && matchesCategory && matchesPrice;
  });
}
