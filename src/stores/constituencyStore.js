import { atom, computed } from 'nanostores';
import constituencyData from '../data/constituencies.json';
import districtBoundsData from '../data/district-bounds.json';
import { KERALA_DISTRICTS } from '../lib/constants.js';

export const districtBounds = districtBoundsData;

const processedData = constituencyData.map(c => ({
  ...c,
  candidates: c.candidates.map(cand => ({
    ...cand,
    party: cand.party || 'Independent'
  }))
}));

export const constituencies = atom(processedData);

export const filters = atom({
  search: '',
  district: 'all',
  party: 'all',
  reservation: 'all',
  women: false
});

export const selectedConstituency = atom(null);

export function setSearch(query) {
  filters.set({ ...filters.get(), search: query });
}

export function setDistrict(district) {
  filters.set({ ...filters.get(), district });
}

export function setParty(party) {
  filters.set({ ...filters.get(), party });
}

export function setReservation(reservation) {
  filters.set({ ...filters.get(), reservation });
}

export function toggleWomen() {
  filters.set({ ...filters.get(), women: !filters.get().women });
}

export function clearFilters() {
  filters.set({
    search: '',
    district: 'all',
    party: 'all',
    reservation: 'all',
    women: false
  });
}

export function openModal(constituency) {
  selectedConstituency.set(constituency);
}

export function setSelectedConstituencyById(id) {
  const allConstituencies = constituencies.get();
  const constituency = allConstituencies.find(c => c.number === id);
  if (constituency) {
    selectedConstituency.set(constituency);
  }
}

export function closeModal() {
  selectedConstituency.set(null);
}

export function getSuggestions(query) {
  if (!query || !query.trim()) return [];
  
  const lowerQ = query.toLowerCase().trim();
  const suggestions = [];
  
  constituencies.get().forEach(row => {
    if (row.name?.toLowerCase().includes(lowerQ)) {
      suggestions.push({
        text: row.name,
        type: 'constituency',
        score: getTermScore(row.name, lowerQ) + 10
      });
    }
    if (row.malayalam?.toLowerCase().includes(lowerQ)) {
      suggestions.push({
        text: row.malayalam,
        type: 'constituency-ml',
        score: getTermScore(row.malayalam, lowerQ) + 10
      });
    }
    if (row.district?.toLowerCase().includes(lowerQ)) {
      suggestions.push({
        text: row.district,
        type: 'district',
        score: getTermScore(row.district, lowerQ) + 5
      });
    }
    
    (row.candidates || []).forEach(cand => {
      if (cand.name?.toLowerCase().includes(lowerQ)) {
        suggestions.push({
          text: cand.name,
          type: 'candidate',
          score: getTermScore(cand.name, lowerQ) + 2
        });
      }
      if (cand.malayalam?.toLowerCase().includes(lowerQ)) {
        suggestions.push({
          text: cand.malayalam,
          type: 'candidate-ml',
          score: getTermScore(cand.malayalam, lowerQ) + 2
        });
      }
      if (cand.party?.toLowerCase().includes(lowerQ)) {
        suggestions.push({
          text: cand.party,
          type: 'party',
          score: getTermScore(cand.party, lowerQ) + 1
        });
      }
    });
  });
  
  const unique = new Map();
  suggestions.forEach(s => {
    const existing = unique.get(s.text);
    if (!existing || s.score > existing.score) {
      unique.set(s.text, s);
    }
  });
  
  return Array.from(unique.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function getTermScore(term, q) {
  const lowerTerm = term.toLowerCase();
  let score = 0;
  if (lowerTerm.startsWith(q)) score += 15;
  if (lowerTerm.includes(q)) score += 10;
  return score;
}

function scoreRelevance(row, q) {
  let score = 0;
  const lowerQ = q.toLowerCase();
  const candidates = row.candidates || [];

  const nameScore = row.name?.toLowerCase().includes(lowerQ) ? 10 : 0;
  const malayalamScore = row.malayalam?.toLowerCase().includes(lowerQ) ? 10 : 0;
  const districtScore = row.district?.toLowerCase().includes(lowerQ) ? 1 : 0;
  const candidateMatch = candidates.some(
    c => (c.name || '').toLowerCase().includes(lowerQ) || 
         (c.party || '').toLowerCase().includes(lowerQ) ||
         (c.malayalam || '').toLowerCase().includes(lowerQ)
  );

  if (row.name?.toLowerCase().startsWith(lowerQ)) score += 15;
  if (row.malayalam?.toLowerCase().startsWith(lowerQ)) score += 15;
  if (row.district?.toLowerCase().startsWith(lowerQ)) score += 3;

  score += nameScore;
  score += malayalamScore;
  score += districtScore;
  if (candidateMatch) score += 4;

  return score;
}

export const filteredConstituencies = computed(
  [constituencies, filters],
  ($constituencies, $filters) => {
    const filtered = $constituencies.filter(row => {
      if ($filters.district !== 'all' && row.district !== $filters.district) {
        return false;
      }

      const candidates = row.candidates || [];

      if ($filters.reservation === 'SC') {
        if (row.reservation !== 'SC') return false;
      } else if ($filters.reservation === 'ST') {
        if (row.reservation !== 'ST') return false;
      }

      if ($filters.party !== 'all' || $filters.women) {
        const hasMatch = candidates.some(c => {
          if (!c.name) return false;
          const matchesParty = $filters.party === 'all' || c.party === $filters.party;
          const matchesWomen = !$filters.women || c.gender === 'female';
          return matchesParty && matchesWomen;
        });
        if (!hasMatch) return false;
      }

      if ($filters.search) {
        const q = $filters.search.toLowerCase().trim();
        const matchesName = row.name?.toLowerCase().includes(q);
        const matchesMalayalamName = row.malayalam?.toLowerCase().includes(q);
        const matchesDistrict = row.district?.toLowerCase().includes(q);
        const matchesCandidate = candidates.some(
          c => (c.name || '').toLowerCase().includes(q) || 
               (c.party || '').toLowerCase().includes(q) ||
               (c.malayalam || '').toLowerCase().includes(q)
        );
        if (!matchesName && !matchesMalayalamName && !matchesDistrict && !matchesCandidate) return false;
      }

      return true;
    });

    if ($filters.search) {
      const q = $filters.search.toLowerCase().trim();
      filtered.sort((a, b) => scoreRelevance(b, q) - scoreRelevance(a, q));
    }

    return filtered;
  }
);

export const partyList = computed([constituencies], ($constituencies) => {
  const parties = new Map();
  $constituencies.forEach(row => {
    (row.candidates || []).forEach(c => {
      if (c.name) {
        const current = parties.get(c.party) || { party: c.party, alliance: c.alliance, count: 0 };
        current.count++;
        parties.set(c.party, current);
      }
    });
  });
  return Array.from(parties.values())
    .sort((a, b) => b.count - a.count)
    .map(p => ({ ...p, label: `${p.party} (${p.count})` }));
});

export const districtList = computed([constituencies], ($constituencies) => {
  const districts = [...new Set($constituencies.map(c => c.district).filter(Boolean))];
  return districts.sort((a, b) => {
    const idxA = KERALA_DISTRICTS.indexOf(a);
    const idxB = KERALA_DISTRICTS.indexOf(b);
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
});
