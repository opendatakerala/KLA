export function filterData(data, { district = 'all', filter = 'all', search = '', party = null }) {
  return data.filter(row => {
    if (district !== 'all' && row.District !== district) return false;
    
    const candidates = row.candidates || [];
    const allianceCandidates = {
      LDF: candidates.find(c => c.alliance === 'LDF'),
      UDF: candidates.find(c => c.alliance === 'UDF'),
      NDA: candidates.find(c => c.alliance === 'NDA')
    };

    if (filter === 'SC') return row.reservation === 'SC';
    if (filter === 'ST') return row.reservation === 'ST';
    if (filter === 'LDF') return !!allianceCandidates.LDF?.name;
    if (filter === 'UDF') return !!allianceCandidates.UDF?.name;
    if (filter === 'NDA') return !!allianceCandidates.NDA?.name;
    if (filter === 'female') {
      return candidates.some(c => c.gender === 'female');
    }
    if (filter && filter.startsWith('party:')) {
      const p = filter.slice(6);
      return candidates.some(c => c.party === p);
    }
    
    if (party) {
      return candidates.some(c => c.party === party);
    }
    
    return true;
  });
}

export function searchData(data, query) {
  if (!query) return data;
  const q = query.toLowerCase().trim();
  return data.filter(row =>
    row.constituency_Name.toLowerCase().includes(q) ||
    row.District.toLowerCase().includes(q) ||
    (row.candidates || []).some(c => 
      (c.name || '').toLowerCase().includes(q) ||
      (c.party || '').toLowerCase().includes(q)
    )
  );
}

export function filterMapData(data, { party = null, district = 'all', showWomen = false }) {
  return data.filter(row => {
    const candidates = row.candidates || [];
    if (party) {
      const hasParty = candidates.some(c => c.party === party);
      if (!hasParty) return false;
    }
    if (district !== 'all' && row.District !== district) return false;
    if (showWomen) {
      const hasWoman = candidates.some(c => c.gender === 'female');
      if (!hasWoman) return false;
    }
    return true;
  });
}
