import { readCSV, writeJSON, ensureOutputDir, cleanString } from './utils/common.js';

function getAlliance(allianceFromCSV) {
  if (allianceFromCSV && ['LDF', 'UDF', 'NDA'].includes(allianceFromCSV)) {
    return allianceFromCSV;
  }
  return 'Others';
}

function getAgeBin(age) {
  const a = parseInt(age, 10);
  if (isNaN(a)) return 'unknown';
  if (a < 40) return '25-39';
  if (a < 50) return '40-49';
  if (a < 60) return '50-59';
  if (a < 70) return '60-69';
  if (a < 80) return '70-79';
  return '80+';
}

function filterZeros(obj) {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== 0) {
      result[key] = obj[key];
    }
  }
  return result;
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
  
  const rawResult = {
    overall: {
      bins: {
        '25-39': 0,
        '40-49': 0,
        '50-59': 0,
        '60-69': 0,
        '70-79': 0,
        '80+': 0,
        unknown: 0
      },
      ageSum: 0,
      count: 0
    },
    byAlliance: {
      LDF: {
        bins: { '25-39': 0, '40-49': 0, '50-59': 0, '60-69': 0, '70-79': 0, '80+': 0, unknown: 0 },
        ageSum: 0,
        count: 0
      },
      UDF: {
        bins: { '25-39': 0, '40-49': 0, '50-59': 0, '60-69': 0, '70-79': 0, '80+': 0, unknown: 0 },
        ageSum: 0,
        count: 0
      },
      NDA: {
        bins: { '25-39': 0, '40-49': 0, '50-59': 0, '60-69': 0, '70-79': 0, '80+': 0, unknown: 0 },
        ageSum: 0,
        count: 0
      },
      Others: {
        bins: { '25-39': 0, '40-49': 0, '50-59': 0, '60-69': 0, '70-79': 0, '80+': 0, unknown: 0 },
        ageSum: 0,
        count: 0
      }
    },
    byParty: {},
    byDistrict: {}
  };
  
  candidates.forEach(cand => {
    const ageStr = cleanString(cand['age_x affidavit']);
    const age = parseInt(ageStr, 10);
    const alliance = getAlliance(cleanString(cand.alliance));
    let party = cleanString(cand.party_y);
    if (!party) party = 'Independent';
    const qid = cleanString(cand.constituency_Wikidata);
    const district = qid ? constituencyToDistrict[qid] : null;
    
    const ageBin = getAgeBin(ageStr);
    
    rawResult.overall.bins[ageBin]++;
    if (!isNaN(age)) {
      rawResult.overall.ageSum += age;
      rawResult.overall.count++;
    }
    
    rawResult.byAlliance[alliance].bins[ageBin]++;
    if (!isNaN(age)) {
      rawResult.byAlliance[alliance].ageSum += age;
      rawResult.byAlliance[alliance].count++;
    }
    
    if (!rawResult.byParty[party]) {
      rawResult.byParty[party] = {
        bins: { '25-39': 0, '40-49': 0, '50-59': 0, '60-69': 0, '70-79': 0, '80+': 0, unknown: 0 },
        ageSum: 0,
        count: 0
      };
    }
    rawResult.byParty[party].bins[ageBin]++;
    if (!isNaN(age)) {
      rawResult.byParty[party].ageSum += age;
      rawResult.byParty[party].count++;
    }
    
    if (district) {
      if (!rawResult.byDistrict[district]) {
        rawResult.byDistrict[district] = {
          bins: { '25-39': 0, '40-49': 0, '50-59': 0, '60-69': 0, '70-79': 0, '80+': 0, unknown: 0 },
          ageSum: 0,
          count: 0
        };
      }
      rawResult.byDistrict[district].bins[ageBin]++;
      if (!isNaN(age)) {
        rawResult.byDistrict[district].ageSum += age;
        rawResult.byDistrict[district].count++;
      }
    }
  });
  
  const calcAvg = (obj) => obj.count > 0 ? parseFloat((obj.ageSum / obj.count).toFixed(1)) : 0;
  
  const result = {
    overall: {
      ...filterZeros(rawResult.overall.bins),
      average: calcAvg(rawResult.overall)
    },
    byAlliance: {},
    byParty: {},
    byDistrict: {}
  };
  
  for (const alliance in rawResult.byAlliance) {
    result.byAlliance[alliance] = {
      ...filterZeros(rawResult.byAlliance[alliance].bins),
      average: calcAvg(rawResult.byAlliance[alliance])
    };
  }
  
  for (const party in rawResult.byParty) {
    result.byParty[party] = {
      ...filterZeros(rawResult.byParty[party].bins),
      average: calcAvg(rawResult.byParty[party])
    };
  }
  
  for (const district in rawResult.byDistrict) {
    result.byDistrict[district] = {
      ...filterZeros(rawResult.byDistrict[district].bins),
      average: calcAvg(rawResult.byDistrict[district])
    };
  }
  
  writeJSON('age-distribution.json', result);
  console.log('Generated: age-distribution.json');
}

export default generate;
