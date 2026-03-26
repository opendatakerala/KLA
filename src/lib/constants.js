import partyData from '../data/candidates-by-party.json';

const partyToAlliance = {};
Object.entries(partyData).forEach(([alliance, parties]) => {
  Object.keys(parties).forEach(party => {
    partyToAlliance[party] = alliance;
  });
});

export const ALLIANCE_COLORS = {
  LDF: '#EE0000',
  UDF: '#0078FF',
  NDA: '#FF9933',
  OTH: '#33AA00'
};

export function getPartyColor(partyOrAlliance) {
  const key = partyOrAlliance?.toString().trim();
  if (!key) return ALLIANCE_COLORS.OTH;

  if (key === 'Others') {
    return ALLIANCE_COLORS.OTH;
  }

  if (ALLIANCE_COLORS[key]) {
    return ALLIANCE_COLORS[key];
  }

  const alliance = partyToAlliance[key];
  if (alliance && ALLIANCE_COLORS[alliance]) {
    return ALLIANCE_COLORS[alliance];
  }

  return ALLIANCE_COLORS.OTH;
}

export const ALLIANCE_BG = {
  LDF: '#FFDDDD',
  UDF: '#D6EEFF',
  NDA: '#FFF0D6',
  OTH: '#EEFFEE'
};

export const CSS_VARS = {
  gold: '#A0700A',
  goldLight: '#FDF3DC',
  goldMid: '#C8860E',
  ldf: '#EE0000',
  ldfBg: '#FFDDDD',
  udf: '#0078FF',
  udfBg: '#D6EEFF',
  nda: '#FF9933',
  ndaBg: '#FFF0D6',
  others: '#33CC00',
  othersBg: '#EEFFEE',
  muted: '#6B7280',
  faint: '#9CA3AF',
  border: '#E5E7EB',
  bg: '#F7F6F3',
  bg2: '#EFEDE8',
  card: '#FFFFFF',
  card2: '#FAFAF8',
  text: '#111827',
  textSoft: '#374151',
  scColor: '#7C3AED',
  scBg: '#F3F0FF',
  scBorder: '#DDD6FE',
  stColor: '#0B7A56',
  stBg: '#EDFAF5',
  stBorder: '#A7F3D0'
};
