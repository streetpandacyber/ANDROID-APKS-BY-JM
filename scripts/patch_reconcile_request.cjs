const fs = require('node:fs');
const path = 'app/(tabs)/index.tsx';
let source = fs.readFileSync(path, 'utf8');
const pattern = /^  function reconcileMpesaSaleLocally\(saleId: string\) \{.*$/m;
const replacement = '  function reconcileMpesaSaleLocally(saleId: string) { requestMpesaReconciliation([saleId]); }';
if (!pattern.test(source)) throw new Error('Individual reconciliation helper not found');
source = source.replace(pattern, replacement);
fs.writeFileSync(path, source);
