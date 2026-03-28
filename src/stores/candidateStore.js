import { computed } from 'nanostores';
import { selectedConstituency } from './constituencyStore.js';

export function sortCandidatesByOthersWithParty(candidates) {
  return [...candidates].sort((a, b) => {
    const orderA = ['LDF', 'UDF', 'NDA', 'Others'].indexOf(a.alliance);
    const orderB = ['LDF', 'UDF', 'NDA', 'Others'].indexOf(b.alliance);
    if (orderA !== orderB) return orderA - orderB;
    if (a.alliance === 'Others' || !['LDF', 'UDF', 'NDA'].includes(a.alliance)) {
      const aHasParty = a.party && a.party.length > 0;
      const bHasParty = b.party && b.party.length > 0;
      if (aHasParty && !bHasParty) return -1;
      if (!aHasParty && bHasParty) return 1;
      return (a.party || '').localeCompare(b.party || '');
    }
    return 0;
  });
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

export const ldfCandidates = computed(
  [selectedConstituency],
  ($selectedConstituency) => $selectedConstituency?.candidates?.filter(c => c.alliance === 'LDF') || []
);

export const udfCandidates = computed(
  [selectedConstituency],
  ($selectedConstituency) => $selectedConstituency?.candidates?.filter(c => c.alliance === 'UDF') || []
);

export const ndaCandidates = computed(
  [selectedConstituency],
  ($selectedConstituency) => $selectedConstituency?.candidates?.filter(c => c.alliance === 'NDA') || []
);

export const othersCandidates = computed(
  [selectedConstituency],
  ($selectedConstituency) => sortCandidatesByOthersWithParty(
    $selectedConstituency?.candidates?.filter(c => c.alliance === 'Others' || !['LDF', 'UDF', 'NDA'].includes(c.alliance)) || []
  )
);

export const currentModal = selectedConstituency;
