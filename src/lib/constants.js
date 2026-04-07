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
  Others: '#33AA00'
};

export function getPartyColor(partyOrAlliance) {
  const key = partyOrAlliance?.toString().trim();
  if (!key) return ALLIANCE_COLORS.Others;

  if (key === 'Others' || key === 'OTH') {
    return ALLIANCE_COLORS.Others;
  }

  if (ALLIANCE_COLORS[key]) {
    return ALLIANCE_COLORS[key];
  }

  const alliance = partyToAlliance[key];
  if (alliance && ALLIANCE_COLORS[alliance]) {
    return ALLIANCE_COLORS[alliance];
  }

  return ALLIANCE_COLORS.Others;
}

export const ALLIANCE_BG = {
  LDF: '#FFDDDD',
  UDF: '#D6EEFF',
  NDA: '#FFF0D6',
  Others: '#EEFFEE'
};

export const KERALA_DISTRICTS = [
  'Kasaragod',
  'Kannur',
  'Wayanad',
  'Kozhikode',
  'Malappuram',
  'Palakkad',
  'Thrissur',
  'Ernakulam',
  'Idukki',
  'Kottayam',
  'Alappuzha',
  'Pathanamthitta',
  'Kollam',
  'Thiruvananthapuram'
];

export const MANIFESTO_URLS = {
  LDF: 'https://archive.org/details/ldf-manifesto-2026-malayalam_202604',
  UDF: 'https://archive.org/details/udf-manifesto-2026-malayalam_202604',
  NDA: 'https://archive.org/details/nda-manifesto-2026-malayalam_202604'
};
