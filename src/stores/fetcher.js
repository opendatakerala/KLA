import { nanoquery } from "@nanostores/query";

export const API_BASE = import.meta.env.PUBLIC_KLA_API_URL || "";

async function fetcher(constituency) {
  const qid = constituency?.qid;
  if (!qid) return { niyamasabha: [], loksabha: [] };

  const res = await fetch(`${API_BASE}/api/kla2026/${qid}.json`);
  return res.json();
}

const fetcherStore = nanoquery({ fetcher });
export const createFetcherStore = fetcherStore[0];
export const createMutatorStore = fetcherStore[1];

export const [createHitsFetcherStore] = nanoquery({
  fetcher: async () => {
    const res = await fetch(`${API_BASE}/api/kla2026/hitcounter`);
    return res.json();
  },
});

const turnoutFetcher = async (constituency) => {
  const ac = constituency?.number;
  if (!ac) return { success: false, data: {} };
  const res = await fetch(`${API_BASE}/api/kla2026/turnout/${ac}.json`);
  return res.json();
};

const turnoutStore = nanoquery({ fetcher: turnoutFetcher });
export const createTurnoutFetcherStore = turnoutStore[0];
export const createOverallTurnoutFetcherStore = nanoquery({
  fetcher: () => turnoutFetcher({ number: "all" }),
})[0];
