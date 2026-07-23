const CATALOG_ORIGIN_KEY = 'bite.catalog-origin.v1';

export function markCatalogOrigin() {
  try {
    window.sessionStorage.setItem(CATALOG_ORIGIN_KEY, 'true');
  } catch {
    // Product navigation still works when session storage is unavailable.
  }
}

export function consumeCatalogOrigin() {
  try {
    const cameFromCatalog =
      window.sessionStorage.getItem(CATALOG_ORIGIN_KEY) === 'true';

    window.sessionStorage.removeItem(CATALOG_ORIGIN_KEY);
    return cameFromCatalog;
  } catch {
    return false;
  }
}

export function clearCatalogOrigin() {
  try {
    window.sessionStorage.removeItem(CATALOG_ORIGIN_KEY);
  } catch {
    // The catalog remains usable when session storage is unavailable.
  }
}
