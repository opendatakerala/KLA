const ALLIANCE_CLASS = {
  LDF: 'LDF',
  UDF: 'UDF',
  NDA: 'NDA',
  OTH: 'OTH'
};

function candidateRow(alliance, party, name) {
  const nameHtml = name 
    ? `<span class="candidate-name">${name}</span>` 
    : `<span class="candidate-name unknown">TBD</span>`;
  
  return `<div class="candidate-row">
    <span class="alliance-tag ${ALLIANCE_CLASS[alliance] || 'OTH'}">${alliance === 'OTH' ? 'Others' : alliance}</span>
    <div>
      <div class="candidate-party">${party || '—'}</div>
      ${nameHtml}
    </div>
  </div>`;
}

export function createCardHTML(row) {
  const res = row.Reservation;
  const resBadge = res 
    ? `<span class="reservation-badge ${res.toLowerCase()}">${res}</span>` 
    : '';
  
  const cardClass = res === 'SC' ? 'card reserved-sc' : 
                    res === 'ST' ? 'card reserved-st' : 'card';
  
  return `<div class="${cardClass}" data-const-number="${row.Constituency_Number}">
    <div class="card-header">
      <div>
        <div class="card-num">CONSTITUENCY #${row.Constituency_Number}</div>
        <div class="card-name">${row.Constituency_Name}</div>
        <div class="card-district">${row.District}</div>
      </div>
      ${resBadge}
    </div>
    <div class="card-candidates">
      ${candidateRow('LDF', row.LDF, row.LDF_Candidate)}
      ${candidateRow('UDF', row.UDF, row.UDF_Candidate)}
      ${row.NDA ? candidateRow('NDA', row.NDA, row.NDA_Candidate) : ''}
      ${(row.Others_list || []).map(o => candidateRow('OTH', o.party, o.name)).join('')}
    </div>
  </div>`;
}

export function createModalHTML(row, partyLookup) {
  const badges = row.Reservation 
    ? `<span class="reservation-badge ${row.Reservation.toLowerCase()}">${row.Reservation} Reserved</span>` 
    : '';
  
  function modalCandidate(alliance, color, party, name) {
    const tbd = !name;
    return `<div class="modal-candidate">
      <div class="modal-alliance-bar" style="background:${color}"></div>
      <div class="modal-candidate-inner">
        <div class="modal-alliance-label">${alliance}</div>
        <div class="modal-party" style="color:#000">${party || '—'}</div>
        <div class="modal-candidate-name${tbd ? ' tbd' : ''}">${name || 'To Be Announced'}</div>
      </div>
    </div>`;
  }
  
  return {
    eyebrow: `${row.District} · Constituency #${row.Constituency_Number}`,
    title: row.Constituency_Name,
    badges,
    candidates: 
      modalCandidate('LDF', '#D94040', row.LDF, row.LDF_Candidate) +
      modalCandidate('UDF', '#1565C0', row.UDF, row.UDF_Candidate) +
      (row.NDA ? modalCandidate('NDA', '#E07828', row.NDA, row.NDA_Candidate) : '') +
      (row.Others_list || []).map(o => 
        modalCandidate(o.party || 'Others', '#33AA55', o.party, o.name)
      ).join('')
  };
}

export function createGenderOverviewHTML(genderStats) {
  const { totals, seatsWithWomen } = genderStats;
  const total = totals.female + totals.male + totals.transgender;
  const femalePct = total ? (totals.female / total * 100).toFixed(1) : 0;
  const malePct = total ? (totals.male / total * 100).toFixed(1) : 0;
  
  return {
    femaleCount: totals.female,
    maleCount: totals.male,
    femalePct: `${femalePct}% of all candidates`,
    malePct: `${malePct}% of all candidates`,
    seatsWithWomen,
    femaleBarWidth: femalePct,
    total
  };
}

export function createAllianceGenderHTML(genderStats) {
  const { byAlliance } = genderStats;
  const colors = { LDF: '#EE0000', UDF: '#0078FF', NDA: '#FF9933', Others: '#33AA00' };
  const bgColors = { LDF: '#FFDDDD', UDF: '#D6EEFF', NDA: '#FFF0D6', Others: '#EEFFEE' };
  
  return ['LDF', 'UDF', 'NDA', 'Others'].map(alliance => {
    const d = byAlliance[alliance] || { f: 0, m: 0, t: 0, total: 0 };
    const pct = d.total ? (d.f / d.total * 100).toFixed(1) : 0;
    const fWidth = d.total ? (d.f / d.total * 100).toFixed(1) : 0;
    const tWidth = d.total ? (d.t / d.total * 100).toFixed(1) : 0;
    
    return {
      alliance,
      color: colors[alliance],
      bg: bgColors[alliance],
      femaleCount: d.f,
      maleCount: d.m,
      transCount: d.t,
      total: d.total,
      pct,
      fWidth,
      tWidth
    };
  });
}
