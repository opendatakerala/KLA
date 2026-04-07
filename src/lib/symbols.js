const candidateSymbols = import.meta.glob('../images/*.svg');

export async function getCandidateSymbol(symbolName) {
  const key = `../images/${symbolName}.svg`;
  const loader = candidateSymbols[key];
  if (!loader) return null;
  return loader().then(m => m.default?.src);
}
