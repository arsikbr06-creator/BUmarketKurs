/**
 * Обёртки над localStorage и sessionStorage с обработкой ошибок JSON
 */

export const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('localStorage write error');
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

export const session = {
  get(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('sessionStorage write error');
    }
  },
};
