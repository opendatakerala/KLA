export function computeStats(data) {
  const stats = { ldf: 0, udf: 0, nda: 0, others: 0, sc: 0, st: 0 };
  
  data.forEach(row => {
    if (row.LDF_Candidate) stats.ldf++;
    if (row.UDF_Candidate) stats.udf++;
    if (row.NDA_Candidate) stats.nda++;
    if (row.Others_list) stats.others += row.Others_list.length;
    if (row.Reservation === 'SC') stats.sc++;
    if (row.Reservation === 'ST') stats.st++;
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
    const tally = (gender, alliance, party) => {
      if (!gender) return;
      const g = gender.toLowerCase();
      
      if (g === 'female') totals.female++;
      else if (g === 'male') totals.male++;
      else if (g === 'transgender') totals.transgender++;
      
      if (byAlliance[alliance]) {
        byAlliance[alliance].total++;
        if (g === 'female') byAlliance[alliance].f++;
        else if (g === 'male') byAlliance[alliance].m++;
        else byAlliance[alliance].t++;
      }
      
      if (party) {
        if (!byParty[party]) {
          byParty[party] = { f: 0, m: 0, t: 0, total: 0, alliance };
        }
        byParty[party].total++;
        if (g === 'female') byParty[party].f++;
        else if (g === 'male') byParty[party].m++;
        else byParty[party].t++;
      }
      
      if (g === 'female') constHasFemale[row.Constituency_Number] = true;
    };

    if (row.LDF_Candidate) tally(row.LDF_Gender, 'LDF', row.LDF);
    if (row.UDF_Candidate) tally(row.UDF_Gender, 'UDF', row.UDF);
    if (row.NDA_Candidate) tally(row.NDA_Gender, 'NDA', row.NDA);
    
    (row.Others_list || []).forEach(o => {
      if (o.name) tally(o.gender, 'Others', o.party);
    });
    
    // District tally
    const dist = row.District;
    if (!byDistrict[dist]) byDistrict[dist] = { f: 0, m: 0, t: 0, total: 0 };
    const distTally = (gender) => {
      if (!gender) return;
      const g = gender.toLowerCase();
      byDistrict[dist].total++;
      if (g === 'female') byDistrict[dist].f++;
      else if (g === 'male') byDistrict[dist].m++;
      else byDistrict[dist].t++;
    };
    if (row.LDF_Candidate) distTally(row.LDF_Gender);
    if (row.UDF_Candidate) distTally(row.UDF_Gender);
    if (row.NDA_Candidate) distTally(row.NDA_Gender);
    (row.Others_list || []).forEach(o => { if (o.name) distTally(o.gender); });
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
    ['LDF', 'UDF', 'NDA'].forEach(alliance => {
      const party = row[alliance];
      const candidate = row[alliance + '_Candidate'];
      if (party && candidate) {
        if (!partyMap[party]) partyMap[party] = { count: 0, alliance };
        partyMap[party].count++;
      }
    });
    
    (row.Others_list || []).forEach(o => {
      if (o.party && o.name) {
        if (!partyMap[o.party]) partyMap[o.party] = { count: 0, alliance: 'OTH' };
        partyMap[o.party].count++;
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
