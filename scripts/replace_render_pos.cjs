const fs = require('fs');
const sourcePath = 'app/(tabs)/index.tsx';
const replacementPath = 'scripts/renderPosReplacement.txt';
const source = fs.readFileSync(sourcePath, 'utf8');
const replacement = fs.readFileSync(replacementPath, 'utf8').trimEnd();
const pattern = /  const renderPos =[\s\S]*?(?=  const notebookEntries =)/;
if (!pattern.test(source)) throw new Error('renderPos block not found');
const updated = source.replace(pattern, `${replacement}\n\n`);
fs.writeFileSync(sourcePath, updated);
