export function getAllianceData(d, alliance) {
  const allianceVotes = d.allianceVotes[alliance] || 0;
  const pct = d.totalVotes > 0 ? (allianceVotes / d.totalVotes) * 100 : 0;
  let candidateName = '';
  let candidateParty = '';
  let candidateVotes = allianceVotes;
  
  if (d.winner?.alliance === alliance) {
    candidateName = d.winner.name || '';
    candidateParty = d.winner.party || '';
    candidateVotes = d.winner.votes || 0;
  } else if (d.runnerUp?.alliance === alliance) {
    candidateName = d.runnerUp.name || '';
    candidateParty = d.runnerUp.party || '';
    candidateVotes = d.runnerUp.votes || 0;
  } else if (d.candidates) {
    const cand = d.candidates.find(c => c.alliance === alliance);
    if (cand) {
      candidateName = cand.candidate || '';
      candidateParty = cand.party || '';
      candidateVotes = cand.votes || 0;
    }
  }
  
  return {
    value: parseFloat(pct.toFixed(1)),
    candidate: candidateName,
    party: candidateParty,
    votes: candidateVotes,
    type: d.type,
    year: d.year
  };
}