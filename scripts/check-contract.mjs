// Contract drift guard. Regenerates the typed client from the API repository's committed OpenAPI
// document and fails if the committed web client is out of date, so the web can never silently build
// against a stale contract.
//
//   npm run check:contract
//
// The contract is read from git (the API repo's committed document), not a running API, so a dev-API
// outage can never break this check. It only fails when the committed web client is actually behind
// the committed contract. Authentication uses API_CONTRACT_TOKEN; see scripts/contract-source.mjs.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  committedSchemaPath,
  contractDescription,
  fetchContract,
  generateClient,
} from './contract-source.mjs';

console.log(`Checking the committed API client against the contract at ${contractDescription()}`);

let doc;
try {
  doc = await fetchContract();
} catch (error) {
  console.error(`\nContract check could not run: ${error.message}`);
  process.exit(1);
}

const tmp = mkdtempSync(path.join(tmpdir(), 'fq-contract-'));
const tmpDoc = path.join(tmp, 'contract.json');
const tmpSchema = path.join(tmp, 'schema.ts');
writeFileSync(tmpDoc, doc);
generateClient(tmpDoc, tmpSchema);

const fresh = readFileSync(tmpSchema, 'utf8');
const committed = readFileSync(committedSchemaPath, 'utf8');

if (fresh !== committed) {
  console.error('\nThe committed API client is out of date with the API contract.');
  console.error('Run `npm run sync:contract` and commit the regenerated client.');
  process.exit(1);
}

console.log('The committed API client is up to date with the API contract.');
