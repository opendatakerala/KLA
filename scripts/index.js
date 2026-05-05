import generateCandidatesByParty from './generate-candidates-by-party.js';
import generateGenderDistribution from './generate-gender-distribution.js';
import generateEducationDistribution from './generate-education-distribution.js';
import generateAgeDistribution from './generate-age-distribution.js';
import generateSymbolDistribution from './generate-symbol-distribution.js';
import generateKlaMapSvg from './generate-kla-map-svg-from-topojson.js';
import generateConstituencies from './generate-constituencies.js';
import generateDistrictBounds from './generate-district-bounds.js';
import generatePartyLookup from './generate-party-lookup.js';

const scripts = {
  'candidates-by-party': generateCandidatesByParty,
  'gender-distribution': generateGenderDistribution,
  'education-distribution': generateEducationDistribution,
  'age-distribution': generateAgeDistribution,
  'symbol-distribution': generateSymbolDistribution,
  'kla-map-svg': generateKlaMapSvg,
  'constituencies': generateConstituencies,
  'district-bounds': generateDistrictBounds,
  'party-lookup': generatePartyLookup
};

const args = process.argv.slice(2);
const scriptNames = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--script' && args[i + 1]) {
    scriptNames.push(args[i + 1]);
    i++;
  } else if (args[i] === '--all') {
    scriptNames.push(...Object.keys(scripts));
  } else if (!args[i].startsWith('--')) {
    scriptNames.push(args[i]);
  }
}

if (scriptNames.length === 0) {
  console.log('Usage: node scripts/index.js [--script <name>] [--all]');
  console.log('Available scripts:');
  Object.keys(scripts).forEach(name => {
    console.log(`  - ${name}`);
  });
  process.exit(1);
}

console.log(`Running ${scriptNames.length} script(s)...\n`);

scriptNames.forEach(name => {
  if (scripts[name]) {
    console.log(`\n=== Running: ${name} ===`);
    try {
      scripts[name]();
      console.log(`=== Completed: ${name} ===`);
    } catch (err) {
      console.error(`Error running ${name}:`, err);
      process.exit(1);
    }
  } else {
    console.error(`Unknown script: ${name}`);
    process.exit(1);
  }
});

console.log('\n✓ All scripts completed successfully');
