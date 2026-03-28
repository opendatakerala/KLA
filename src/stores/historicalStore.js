import { createFetcherStore } from './fetcher.js';
import { selectedConstituency } from './constituencyStore.js';

export const historicalDataStore = createFetcherStore([selectedConstituency]);
