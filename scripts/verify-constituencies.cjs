const fs = require('fs');

// Path to your JSON file
const filePath = '../src/data/constituencies.json';

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading the file:", err);
        return;
    }

    try {
        const constituencies = JSON.parse(data);

        constituencies.forEach((constituency) => {
            const { name, candidates } = constituency;

            console.log(`--- Constituency: ${name} ---`);
            console.log(`Candidate Count: ${candidates.length}`);
            console.log(`Names: ${JSON.stringify(candidates.map(c => c.name), null, 2)}`);
            console.log('\n');
        });
    } catch (parseErr) {
        console.error("Error parsing JSON:", parseErr);
    }
});
