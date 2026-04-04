import { atom } from 'nanostores';
import { selectedConstituency, constituencies, setSelectedConstituencyById } from './constituencyStore.js';

export const currentHash = atom('');

let hashChangeHandler = null;

export function initRouter() {
  if (typeof window === 'undefined') return;
  
  if (hashChangeHandler) {
    window.removeEventListener('hashchange', hashChangeHandler);
    window.removeEventListener('popstate', hashChangeHandler);
  }
  
  hashChangeHandler = () => {
    currentHash.set(window.location.hash);
    parseAndOpenFromHash();
  };
  
  window.addEventListener('hashchange', hashChangeHandler);
  window.addEventListener('popstate', hashChangeHandler);
  
  currentHash.set(window.location.hash);
  parseAndOpenFromHash();
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
