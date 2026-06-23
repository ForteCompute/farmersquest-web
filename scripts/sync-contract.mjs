// Refresh the committed API contract and regenerate the typed client from it. This is the single
// command a developer runs when the API contract changes:
//
//   npm run sync:contract
//
// It reads the current contract from the API repository's committed OpenAPI document (the source of
// truth in git), writes it to openapi/farmersquest-api.openapi.json, and regenerates
// src/services/api/schema.ts. Review and commit the diff. The client is never hand-edited.
//
// Authentication uses API_CONTRACT_TOKEN, or, when that is not set locally, the developer's GitHub
// CLI login (gh auth login). See scripts/contract-source.mjs.
import { writeFileSync } from 'node:fs';
import {
  committedDocPath,
  committedSchemaPath,
  contractDescription,
  fetchContract,
  generateClient,
} from './contract-source.mjs';

console.log(`Fetching API contract from ${contractDescription()}`);
const doc = await fetchContract();
writeFileSync(committedDocPath, doc);
console.log(`Wrote ${committedDocPath}`);
generateClient(committedDocPath, committedSchemaPath);
console.log(`Regenerated ${committedSchemaPath}`);
console.log('Done. Review and commit the changes.');
