import { readCSV, writeJSON, ensureOutputDir, cleanString } from './utils/common.js';

function getAlliance(allianceFromCSV) {
  if (allianceFromCSV && ['LDF', 'UDF', 'NDA'].includes(allianceFromCSV)) {
    return allianceFromCSV;
  }
  return 'Others';
}

function generate() {
  ensureOutputDir();
  
  const candidates = readCSV('2026-candidates.csv');
  const constituencies = readCSV('2026-constituencies.csv');
  
  const constituencyToDistrict = {};
  constituencies.forEach(row => {
    const qid = cleanString(row.constituency_Wikidata);
    if (qid) {
      constituencyToDistrict[qid] = cleanString(row.district);
    }
  });
  
  const validEduTags = [
    'UP',
    'High School',
    'Higher Secondary',
    'Diploma',
    'Degree',
    'Professional Degree',
    'Master Degree',
    'Doctorate Degree',
    'Post Doctorate'
  ];
  
  const result = {
    overall: {},
    byAlliance: {
      LDF: {},
      UDF: {},
      NDA: {},
      Others: {}
    },
    byParty: {},
    byDistrict: {}
  };
  
  validEduTags.forEach(edu => {
    result.overall[edu] = 0;
    Object.keys(result.byAlliance).forEach(alliance => {
      result.byAlliance[alliance][edu] = 0;
    });
  });
  
  candidates.forEach(cand => {
    const eduTag = cleanString(cand['edu tag']);
    const alliance = getAlliance(cleanString(cand.alliance));
    let party = cleanString(cand.party_y);
    if (!party) party = 'Independent';
    const qid = cleanString(cand.constituency_Wikidata);
    const district = qid ? constituencyToDistrict[qid] : null;
    
    if (!eduTag || !validEduTags.includes(eduTag)) return;
    
    result.overall[eduTag]++;
    
    result.byAlliance[alliance][eduTag]++;
    
    if (!result.byParty[party] || typeof result.byParty[party] !== 'object') {
      result.byParty[party] = {};
      validEduTags.forEach(edu => {
        result.byParty[party][edu] = 0;
      });
    }
    result.byParty[party][eduTag]++;
    
    if (district) {
      if (!result.byDistrict[district] || typeof result.byDistrict[district] !== 'object') {
        result.byDistrict[district] = {};
        validEduTags.forEach(edu => {
          result.byDistrict[district][edu] = 0;
        });
      }
      result.byDistrict[district][eduTag]++;
    }
  });
  
  const sortedByParty = {};
  Object.keys(result.byParty).sort((a, b) => {
    const countA = Object.values(result.byParty[a]).reduce((sum, v) => sum + v, 0);
    const countB = Object.values(result.byParty[b]).reduce((sum, v) => sum + v, 0);
    return countB - countA;
  }).forEach(party => {
    sortedByParty[party] = result.byParty[party];
  });
  result.byParty = sortedByParty;
  
  const sortedByDistrict = {};
  Object.keys(result.byDistrict).sort((a, b) => {
    const countA = Object.values(result.byDistrict[a]).reduce((sum, v) => sum + v, 0);
    const countB = Object.values(result.byDistrict[b]).reduce((sum, v) => sum + v, 0);
    return countB - countA;
  }).forEach(district => {
    sortedByDistrict[district] = result.byDistrict[district];
  });
  result.byDistrict = sortedByDistrict;
  
  writeJSON('education-distribution.json', result);
  console.log('Generated: education-distribution.json');
}

export default generate;
