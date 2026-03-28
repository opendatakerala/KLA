import { nanoquery } from '@nanostores/query';

const API_BASE = import.meta.env.PUBLIC_KLA_API_URL || '';

async function fetcher(constituency) {
  const qid = constituency?.qid;
  if (!qid) return { niyamasabha: [], loksabha: [] };
  
  const res = await fetch(`${API_BASE}/api/kla2026/${qid}.json`);
  return res.json();
}

export const [createFetcherStore, createMutatorStore] = nanoquery({
  fetcher
});
