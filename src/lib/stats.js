export function computeStats(data) {
  const stats = { ldf: 0, udf: 0, nda: 0, others: 0, sc: 0, st: 0 };
  
  data.forEach(row => {
    const candidates = row.candidates || [];
    const allianceCounts = { LDF: 0, UDF: 0, NDA: 0, Others: 0 };
    
    candidates.forEach(c => {
      if (c.name && c.alliance) {
        allianceCounts[c.alliance]++;
      }
    });
    
    stats.ldf += allianceCounts.LDF;
    stats.udf += allianceCounts.UDF;
    stats.nda += allianceCounts.NDA;
    stats.others += allianceCounts.Others;
    
    if (row.reservation === 'SC') stats.sc++;
    if (row.reservation === 'ST') stats.st++;
  });
  
  return stats;
}

export function computeGenderStats(data) {
  const totals = { female: 0, male: 0, transgender: 0 };
  const byAlliance = {
    LDF: { f: 0, m: 0, t: 0, total: 0 },
    UDF: { f: 0, m: 0, t: 0, total: 0 },
    NDA: { f: 0, m: 0, t: 0, total: 0 },
    Others: { f: 0, m: 0, t: 0, total: 0 }
  };
  const byParty = {};
  const byDistrict = {};
  const constHasFemale = {};

  data.forEach(row => {
    const candidates = row.candidates || [];
    const dist = row.District;
    
    if (!byDistrict[dist]) byDistrict[dist] = { f: 0, m: 0, t: 0, total: 0 };

    candidates.forEach(c => {
      if (!c.name) return;
      const g = (c.gender || '').toLowerCase();
      
      if (g === 'female') totals.female++;
      else if (g === 'male') totals.male++;
      else if (g === 'transgender') totals.transgender++;
      
      if (byAlliance[c.alliance]) {
        byAlliance[c.alliance].total++;
        if (g === 'female') byAlliance[c.alliance].f++;
        else if (g === 'male') byAlliance[c.alliance].m++;
        else byAlliance[c.alliance].t++;
      }
      
      if (c.party) {
        if (!byParty[c.party]) {
          byParty[c.party] = { f: 0, m: 0, t: 0, total: 0, alliance: c.alliance };
        }
        byParty[c.party].total++;
        if (g === 'female') byParty[c.party].f++;
        else if (g === 'male') byParty[c.party].m++;
        else byParty[c.party].t++;
      }
      
      byDistrict[dist].total++;
      if (g === 'female') {
        byDistrict[dist].f++;
        constHasFemale[row.constituency_Number] = true;
      }
      else if (g === 'male') byDistrict[dist].m++;
      else if (g === 'transgender') byDistrict[dist].t++;
    });
  });

  return {
    totals,
    byAlliance,
    byParty,
    byDistrict,
    seatsWithWomen: Object.keys(constHasFemale).length
  };
}

export function getPartyStats(data) {
  const partyMap = {};
  
  data.forEach(row => {
    const candidates = row.candidates || [];
    candidates.forEach(c => {
      if (c.party && c.name) {
        if (!partyMap[c.party]) {
          partyMap[c.party] = { count: 0, alliance: c.alliance };
        }
        partyMap[c.party].count++;
      }
    });
  });
  
  return Object.entries(partyMap)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([party, info]) => ({ party, ...info }));
}

export function getDistricts(data) {
  return [...new Set(data.map(d => d.District))].sort();
}
