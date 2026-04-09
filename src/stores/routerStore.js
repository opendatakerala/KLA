import { atom } from 'nanostores';
import { selectedConstituency, constituencies, setSelectedConstituencyById, filters, setFiltersFromQuery, getFiltersQuery } from './constituencyStore.js';

export const currentHash = atom('');

let hashChangeHandler = null;
let filtersUnsubscribe = null;
let syncingFilters = false;
let lastQuery = '';

export function initRouter() {
  if (typeof window === 'undefined') return;
  
  if (hashChangeHandler) {
    window.removeEventListener('hashchange', hashChangeHandler);
    window.removeEventListener('popstate', hashChangeHandler);
  }
  if (filtersUnsubscribe) {
    filtersUnsubscribe();
    filtersUnsubscribe = null;
  }
  
  hashChangeHandler = () => {
    currentHash.set(window.location.hash);
    parseAndOpenFromHash();
    applyFiltersFromLocation();
  };
  
  window.addEventListener('hashchange', hashChangeHandler);
  window.addEventListener('popstate', hashChangeHandler);
  
  currentHash.set(window.location.hash);
  parseAndOpenFromHash();
  applyFiltersFromLocation();
  startFiltersSync();
}

function parseAndOpenFromHash() {
  const hash = window.location.hash.slice(1);
  const match = hash.match(/^\/constituency\/(\d+)$/);
  
  if (match) {
    const number = match[1];
    setSelectedConstituencyById(number);
  } else if (!hash || hash === '/') {
    selectedConstituency.set(null);
  }
}

export function setConstituencyHash(number) {
  history.pushState(null, '', `#/constituency/${number}`);
  currentHash.set(window.location.hash);
}

export function clearHash() {
  history.pushState('', document.title, window.location.pathname + window.location.search);
  currentHash.set('');
}

function applyFiltersFromLocation() {
  if (typeof window === 'undefined') return;
  syncingFilters = true;
  setFiltersFromQuery(window.location.search);
  syncingFilters = false;
}

function startFiltersSync() {
  if (typeof window === 'undefined') return;
  lastQuery = window.location.search.replace(/^\?/, '');
  filtersUnsubscribe = filters.subscribe((next) => {
    if (syncingFilters) return;
    const query = getFiltersQuery(next);
    if (query === lastQuery) return;
    lastQuery = query;
    const url = window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
    history.replaceState(null, '', url);
  });
}
