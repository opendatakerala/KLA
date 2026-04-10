import { computed } from 'nanostores';
import { selectedConstituency } from './constituencyStore.js';

export const ALLIANCE_COLORS = {
  LDF: '#D94040',
  UDF: '#1565C0',
  NDA: '#E07828',
  Others: '#33AA55'
};

export function sortByBallotOrder(candidates) {
  return [...candidates].sort((a, b) => parseInt(a.ballotOrder || 999) - parseInt(b.ballotOrder || 999));
}

export function getCandidateName(candidate, lang = 'en', isLoading = false, t = (key) => key) {
  if (!candidate?.name) return isLoading ? t('modal.toBeAnnounced') : 'TBD';
  if (lang === 'ml' && candidate.malayalam) {
    return candidate.malayalam;
  }
  return candidate.name;
}

export function getConstituencyName(constituency, lang = 'en') {
  if (!constituency?.name) return '';
  if (lang === 'ml' && constituency.nameMalayalam) {
    return constituency.nameMalayalam;
  }
  return constituency.name;
}

export function getDistrictName(constituency, lang = 'en') {
  if (!constituency?.district) return '';
  if (lang === 'ml' && constituency.districtMalayalam) {
    return constituency.districtMalayalam;
  }
  return constituency.district;
}

export const sortedCandidates = computed(
  [selectedConstituency],
  ($selectedConstituency) => sortByBallotOrder($selectedConstituency?.candidates || [])
);

export const currentModal = selectedConstituency;
