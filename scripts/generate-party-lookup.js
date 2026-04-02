import { readCSV, writeJSON, ensureOutputDir, cleanString } from './utils/common.js';

const FALLBACK_COLORS = {
  LDF: ['#cc0c0c', '#f50223', '#f58486', '#33cc00', '#0029b0', '#008200', '#2d8a2d', '#cc6600', '#b35a00', '#9932cc'],
  UDF: ['#00bfff', '#006600', '#8b4513', '#d94c4c', '#6b4423', '#8b0000', '#c04040', '#ff6347', '#4682b4'],
  NDA: ['#F97D09', '#450000', '#008b8b', '#dc143c', '#228b22', '#8b4513', '#9932cc'],
  Others: ['#1e90ff', '#ff4500', '#9932cc', '#32cd32', '#ff69b4', '#00ced1']
};

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R > 255 ? R > 0 ? R : 0 : 255) * 0x10000 + (G > 255 ? G > 0 ? G : 0 : 255) * 0x100 + (B > 255 ? B > 0 ? B : 0 : 255)).toString(16).slice(1);
}

function generate() {
  ensureOutputDir();
  
  const alliances = readCSV('2026-alliances.csv');
  
  const result = {};
  const allianceUsedColors = {
    LDF: new Set(),
    UDF: new Set(),
    NDA: new Set(),
    Others: new Set()
  };
  
  alliances.forEach(row => {
    const party = cleanString(row.Party);
    const fullName = cleanString(row['Full Name']);
    const alliance = cleanString(row.Alliance);
    let color = cleanString(row.Color).toLowerCase();
    const symbol = cleanString(row.FileName);
    
    if (!party || !fullName) return;
    if (!['LDF', 'UDF', 'NDA', 'Others'].includes(alliance)) return;
    
    const entry = {
      full: fullName,
      alliance: alliance
    };
    
      if (color) {
      let adjustedColor = color;
      let variant = 0;
      let baseColor = color;
      
      while (allianceUsedColors[alliance].has(adjustedColor)) {
        variant++;
        if (variant % 2 === 1) {
          adjustedColor = lightenColor(baseColor, variant * 10);
        } else {
          adjustedColor = darkenColor(baseColor, variant * 10);
        }
      }
      
      allianceUsedColors[alliance].add(adjustedColor);
      entry.color = adjustedColor;
    } else {
      const fallbacks = FALLBACK_COLORS[alliance] || [];
      for (const fc of fallbacks) {
        if (!allianceUsedColors[alliance].has(fc)) {
          allianceUsedColors[alliance].add(fc);
          entry.color = fc;
          break;
        }
      }
    }
    
    if (symbol) {
      entry.symbol = symbol;
    }
    
    result[party] = entry;
  });
  
  writeJSON('party-lookup.json', result);
  console.log('Generated: party-lookup.json');
}

export default generate;
