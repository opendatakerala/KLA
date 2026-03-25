import { readCSV, writeJSON, ensureOutputDir, cleanString } from './utils/common.js';

function getAlliance(party, allianceFromCSV) {
  if (allianceFromCSV && ['LDF', 'UDF', 'NDA', 'Others'].includes(allianceFromCSV)) {
    return allianceFromCSV;
  }
  return 'Others';
}

function generate() {
  ensureOutputDir();

  const candidates = readCSV('2026-candidates.csv');
  const alliances = readCSV('2026-alliances.csv');

  const partyToAlliance = {};
  alliances.forEach(row => {
    const alliance = cleanString(row.Alliance);
    const party = cleanString(row.Party);
    if (alliance && party) {
      partyToAlliance[party] = alliance;
    }
  });

  const grouped = {};
  candidates.forEach(cand => {
    const constNum = cleanString(cand.constituency_Number);
    if (!constNum) return;

    if (!grouped[constNum]) {
      grouped[constNum] = {
        constituency_Number: constNum,
        constituency_Name: cleanString(cand.constituency_Name),
        District: cleanString(cand.district),
        constituency_Wikidata: cleanString(cand.constituency_Wikidata),
        reservation: cleanString(cand.reservation),
        candidates: []
      };
    }

    const party = cleanString(cand.party);
    const alliance = getAlliance(party, cleanString(cand.alliance));

    const name = cleanString(cand.candidate_Name);
    if (!name) return;
    
    grouped[constNum].candidates.push({
      alliance,
      party,
      name,
      malayalam: cleanString(cand.Malayalam),
      wikidata: cleanString(cand.candidate_Wikidata),
      gender: cleanString(cand.candidate_Gender),
      age: cleanString(cand.age),
      eduTag: cleanString(cand['edu tag']),
      education: cleanString(cand.education),
      criminal: cleanString(cand['Criminal Case']),
      convictions: cleanString(cand.Convictions),
      assets: cleanString(cand.assets)
    });
  });

  const allianceOrder = { LDF: 0, UDF: 1, NDA: 2, Others: 3 };
  const sorted = Object.values(grouped).sort((a, b) => 
    parseInt(a.constituency_Number) - parseInt(b.constituency_Number)
  );

  sorted.forEach(row => {
    row.candidates.sort((a, b) => {
      const orderA = allianceOrder[a.alliance] ?? 4;
      const orderB = allianceOrder[b.alliance] ?? 4;
      if (orderA !== orderB) return orderA - orderB;
      if (a.alliance === 'Others' && b.alliance === 'Others') {
        return (a.party || '').localeCompare(b.party || '');
      }
      return 0;
    });
  });

  writeJSON('constituencies.json', sorted);
  console.log('Generated: constituencies.json');
}

export default generate;
