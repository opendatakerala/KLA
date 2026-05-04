import { nanoquery } from "@nanostores/query";

import { API_BASE } from "./fetcher";

const resultsNanoquery = nanoquery({
  fetcher: async () => {
    const res = await fetch(`${API_BASE}/api/kla2026/results/all.json`);
    return res.json();
  },
});

export const createResultsFetcherStore = resultsNanoquery[0];
export const revalidateResults = resultsNanoquery[2].revalidateKeys;
export const invalidateResults = resultsNanoquery[2].invalidateKeys;

export const resultStore = createResultsFetcherStore([], {
  revalidateInterval: 60000,
});
