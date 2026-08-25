const fs = require('fs');
const sourcePath = 'app/(tabs)/index.tsx';
const replacementPath = 'scripts/renderMoreReplacement.txt';
const source = fs.readFileSync(sourcePath, 'utf8');
const replacement = fs.readFileSync(replacementPath, 'utf8').trimEnd();
const pattern = /  const renderMore =[\s\S]*?(?=  const content =)/;
if (!pattern.test(source)) throw new Error('renderMore block not found');
fs.writeFileSync(sourcePath, source.replace(pattern, `${replacement}\n\n`));
