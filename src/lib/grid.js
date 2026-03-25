const ALLIANCE_CLASS = {
  LDF: 'LDF',
  UDF: 'UDF',
  NDA: 'NDA',
  OTH: 'OTH'
};

function candidateRow(alliance, party, name, t = (k) => k) {
  const nameHtml = name 
    ? `<span class="candidate-name">${name}</span>` 
    : `<span class="candidate-name unknown">${t('modal.tbd')}</span>`;
  
  return `<div class="candidate-row">
    <span class="alliance-tag ${ALLIANCE_CLASS[alliance] || 'OTH'}">${alliance === 'OTH' ? 'Others' : alliance}</span>
    <div>
      <div class="candidate-party">${party || '—'}</div>
      ${nameHtml}
    </div>
  </div>`;
}

export function createCardHTML(row, t = (k) => k) {
  const res = row.reservation;
  const resBadge = res 
    ? `<span class="reservation-badge ${res.toLowerCase()}">${res} ${t('modal.reserved')}</span>` 
    : '';
  
  const cardClass = res === 'SC' ? 'card reserved-sc' : 
                    res === 'ST' ? 'card reserved-st' : 'card';
  
  const candidates = row.candidates || [];
  const ldfCand = candidates.find(c => c.alliance === 'LDF');
  const udfCand = candidates.find(c => c.alliance === 'UDF');
  const ndaCand = candidates.find(c => c.alliance === 'NDA');
  const othersCand = candidates.filter(c => c.alliance === 'Others');
  
  return `<div class="${cardClass}" data-const-number="${row.constituency_Number}">
    <div class="card-header">
      <div>
        <div class="card-num">CONSTITUENCY #${row.constituency_Number}</div>
        <div class="card-name">${row.constituency_Name}</div>
        <div class="card-district">${row.District}</div>
      </div>
      ${resBadge}
    </div>
    <div class="card-candidates">
      ${ldfCand ? candidateRow('LDF', ldfCand.party, ldfCand.name) : ''}
      ${udfCand ? candidateRow('UDF', udfCand.party, udfCand.name) : ''}
      ${ndaCand ? candidateRow('NDA', ndaCand.party, ndaCand.name) : ''}
      ${othersCand.map(o => candidateRow('OTH', o.party, o.name)).join('')}
    </div>
  </div>`;
}

export function createModalHTML(row, partyLookup, t = (k) => k, historicalData = null) {
  const badges = row.reservation 
    ? `<span class="reservation-badge ${row.reservation.toLowerCase()}">${row.reservation} ${t('modal.reserved')}</span>` 
    : '';
  
  function modalCandidate(alliance, color, party, name) {
    const tbd = !name;
    return `<div class="modal-candidate">
      <div class="modal-alliance-bar" style="background:${color}"></div>
      <div class="modal-candidate-inner">
        <div class="modal-alliance-label">${alliance}</div>
        <div class="modal-party" style="color:#000">${party || '—'}</div>
        <div class="modal-candidate-name${tbd ? ' tbd' : ''}">${name || t('modal.toBeAnnounced')}</div>
      </div>
    </div>`;
  }
  
  const candidates = row.candidates || [];
  const ldfCand = candidates.find(c => c.alliance === 'LDF');
  const udfCand = candidates.find(c => c.alliance === 'UDF');
  const ndaCand = candidates.find(c => c.alliance === 'NDA');
  const othersCand = candidates.filter(c => c.alliance === 'Others');
  
  let candidatesHtml = '';
  if (ldfCand) candidatesHtml += modalCandidate('LDF', '#D94040', ldfCand.party, ldfCand.name);
  if (udfCand) candidatesHtml += modalCandidate('UDF', '#1565C0', udfCand.party, udfCand.name);
  if (ndaCand) candidatesHtml += modalCandidate('NDA', '#E07828', ndaCand.party, ndaCand.name);
  othersCand.forEach(o => {
    candidatesHtml += modalCandidate(o.party || 'Others', '#33AA55', o.party, o.name);
  });

  let historicalHtml = '';
  if (historicalData && row.constituency_Wikidata) {
    const years = Object.keys(historicalData.years || {});
    if (years.length > 0) {
      const constData = historicalData.byConstituency;
      
      historicalHtml = '<div class="modal-section-label">Historical Results (Lok Sabha)</div><div class="modal-historical">';
      
      years.forEach(year => {
        const yearLabel = historicalData.years[year];
        const yearData = constData[yearLabel]?.[row.constituency_Wikidata];
        
        if (yearData && yearData.candidates) {
          historicalHtml += `<div class="historical-year"><div class="historical-year-label">${yearLabel}</div>`;
          
          const allianceVotes = { LDF: 0, UDF: 0, NDA: 0, Others: 0 };
          let totalVotes = 0;
          
          yearData.candidates.forEach(c => {
            const votes = c.votes || 0;
            totalVotes += votes;
            if (c.alliance && allianceVotes.hasOwnProperty(c.alliance)) {
              allianceVotes[c.alliance] += votes;
            } else {
              allianceVotes['Others'] += votes;
            }
          });
          
          ['LDF', 'UDF', 'NDA', 'Others'].forEach(al => {
            if (allianceVotes[al] > 0) {
              const pct = totalVotes > 0 ? ((allianceVotes[al] / totalVotes) * 100).toFixed(1) : 0;
              const colors = { LDF: '#D94040', UDF: '#1565C0', NDA: '#E07828', Others: '#33AA55' };
              historicalHtml += `<div class="historical-bar"><span class="historical-alliance ${al}">${al}</span><div class="historical-bar-track"><div class="historical-bar-fill" style="width:${pct}%;background:${colors[al]}"></div></div><span class="historical-pct">${pct}%</span></div>`;
            }
          });
          
          historicalHtml += '</div>';
        }
      });
      
      historicalHtml += '</div>';
    }
  }
  
  return {
    eyebrow: `${row.District} · Constituency #${row.constituency_Number}`,
    title: row.constituency_Name,
    badges,
    candidates: candidatesHtml,
    historical: historicalHtml
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
