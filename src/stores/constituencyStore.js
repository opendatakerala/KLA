import { atom, computed } from 'nanostores';

export const constituencies = atom([]);

export const filters = atom({
  search: '',
  district: 'all',
  alliance: 'all',
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

export function setAlliance(alliance) {
  filters.set({ ...filters.get(), alliance });
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
    alliance: 'all',
    party: 'all',
    reservation: 'all',
    women: false
  });
}

export function openModal(constituency) {
  selectedConstituency.set(constituency);
}

export function closeModal() {
  selectedConstituency.set(null);
}

export const filteredConstituencies = computed(
  [constituencies, filters],
  ($constituencies, $filters) => {
    return $constituencies.filter(row => {
      if ($filters.district !== 'all' && row.District !== $filters.district) {
        return false;
      }

      const candidates = row.candidates || [];

      if ($filters.reservation === 'SC') {
        if (row.reservation !== 'SC') return false;
      } else if ($filters.reservation === 'ST') {
        if (row.reservation !== 'ST') return false;
      }

      if ($filters.alliance !== 'all') {
        const hasAlliance = candidates.some(c => c.alliance === $filters.alliance && c.name);
        if (!hasAlliance) return false;
      }

      if ($filters.party !== 'all') {
        const hasParty = candidates.some(c => c.party === $filters.party && c.name);
        if (!hasParty) return false;
      }

      if ($filters.women) {
        const hasWomen = candidates.some(c => c.gender === 'female');
        if (!hasWomen) return false;
      }

      if ($filters.search) {
        const q = $filters.search.toLowerCase().trim();
        const matchesName = row.constituency_Name?.toLowerCase().includes(q);
        const matchesDistrict = row.District?.toLowerCase().includes(q);
        const matchesCandidate = candidates.some(
          c => (c.name || '').toLowerCase().includes(q) || (c.party || '').toLowerCase().includes(q)
        );
        if (!matchesName && !matchesDistrict && !matchesCandidate) return false;
      }

      return true;
    });
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
  const districts = [...new Set($constituencies.map(c => c.District).filter(Boolean))];
  return districts.sort();
});

export const searchSuggestions = computed(
  [constituencies, filters],
  ($constituencies, $filters) => {
    const q = ($filters.search || '').toLowerCase().trim();
    if (q.length < 2) return [];
    
    const results = [];
    const seen = new Set();
    
    // Search constituencies
    $constituencies.forEach(row => {
      if (row.constituency_Name?.toLowerCase().includes(q) && !seen.has(row.constituency_Name)) {
        results.push({
          type: 'constituency',
          label: row.constituency_Name,
          sublabel: row.District,
          value: row.constituency_Name
        });
        seen.add(row.constituency_Name);
      }
    });
    
    // Search candidates
    $constituencies.forEach(row => {
      (row.candidates || []).forEach(c => {
        const name = c.name?.toLowerCase();
        if (name && name.includes(q) && !seen.has(c.name)) {
          results.push({
            type: 'candidate',
            label: c.name,
            sublabel: `${c.party} (${row.constituency_Name})`,
            value: c.name
          });
          seen.add(c.name);
        }
        // Also match by party name
        if (c.party?.toLowerCase().includes(q) && !seen.has(c.party)) {
          results.push({
            type: 'party',
            label: c.party,
            sublabel: `${row.constituency_Name}`,
            value: c.party
          });
          seen.add(c.party);
        }
      });
    });
    
    return results.slice(0, 10);
  }
);
