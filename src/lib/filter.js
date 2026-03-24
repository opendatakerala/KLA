export function filterData(data, { district = 'all', filter = 'all', search = '', party = null }) {
  return data.filter(row => {
    // District filter
    if (district !== 'all' && row.District !== district) return false;
    
    // Alliance/reservation filter
    if (filter === 'SC') return row.Reservation === 'SC';
    if (filter === 'ST') return row.Reservation === 'ST';
    if (filter === 'LDF') return !!row.LDF_Candidate;
    if (filter === 'UDF') return !!row.UDF_Candidate;
    if (filter === 'NDA') return !!row.NDA_Candidate;
    if (filter === 'female') {
      return row.LDF_Gender === 'female' || 
             row.UDF_Gender === 'female' || 
             row.NDA_Gender === 'female' ||
             (row.Others_list || []).some(o => o.gender === 'female');
    }
    if (filter && filter.startsWith('party:')) {
      const p = filter.slice(6);
      return row.LDF === p || row.UDF === p || row.NDA === p || 
             (row.Others_list || []).some(o => o.party === p);
    }
    
    // Party filter
    if (party) {
      return row.LDF === party || row.UDF === party || row.NDA === party ||
             (row.Others_list || []).some(o => o.party === party);
    }
    
    return true;
  });
}

export function searchData(data, query) {
  if (!query) return data;
  const q = query.toLowerCase().trim();
  return data.filter(row =>
    row.Constituency_Name.toLowerCase().includes(q) ||
    (row.LDF_Candidate || '').toLowerCase().includes(q) ||
    (row.UDF_Candidate || '').toLowerCase().includes(q) ||
    (row.NDA_Candidate || '').toLowerCase().includes(q) ||
    (row.LDF || '').toLowerCase().includes(q) ||
    (row.UDF || '').toLowerCase().includes(q) ||
    (row.NDA || '').toLowerCase().includes(q) ||
    row.District.toLowerCase().includes(q)
  );
}

export function filterMapData(data, { party = null, district = 'all', showWomen = false }) {
  return data.filter(row => {
    if (party) {
      const hasParty = row.LDF === party || row.UDF === party || row.NDA === party ||
                       (row.Others_list || []).some(o => o.party === party);
      if (!hasParty) return false;
    }
    if (district !== 'all' && row.District !== district) return false;
    if (showWomen) {
      const hasWoman = row.LDF_Gender === 'female' || 
                       row.UDF_Gender === 'female' || 
                       row.NDA_Gender === 'female' ||
                       (row.Others_list || []).some(o => o.gender === 'female');
      if (!hasWoman) return false;
    }
    return true;
  });
}
