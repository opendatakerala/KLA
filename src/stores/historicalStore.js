import { atom, computed } from 'nanostores';
import historicalComparison from '../data/historical-comparison.json';

export const historicalYears = historicalComparison?.years || {};
export const historicalData = historicalComparison?.byConstituency || {};

export function getHistoricalData(qid) {
  if (!qid || !historicalData) return [];
  
  const years = Object.keys(historicalYears).slice().reverse();
  const result = [];
  
  years.forEach(year => {
    const yearLabel = historicalYears[year];
    const yearConstituencyData = historicalData[yearLabel]?.[qid];
    
    if (yearConstituencyData?.candidates) {
      const allianceVotes = { LDF: 0, UDF: 0, NDA: 0, Others: 0 };
      let totalVotes = 0;
      
      yearConstituencyData.candidates.forEach(c => {
        const votes = c.votes || 0;
        totalVotes += votes;
        if (c.alliance && allianceVotes.hasOwnProperty(c.alliance)) {
          allianceVotes[c.alliance] += votes;
        } else {
          allianceVotes["Others"] += votes;
        }
      });
      
      result.push({
        year: yearLabel,
        allianceVotes,
        totalVotes,
      });
    }
  });
  
  return result;
}