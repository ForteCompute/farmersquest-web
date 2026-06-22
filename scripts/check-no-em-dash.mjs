// Fail if an em dash appears anywhere in the authored source under src. The house style uses a
// period, comma, colon, or parentheses instead, in code, comments, and UI copy. This guard keeps em
// dashes from creeping back in.
//
//   npm run check:no-em-dash
//
// The generated API client (src/services/api/schema.ts) is excluded: it is produced from the API
// contract, never hand-edited, and is already excluded from lint and formatting for the same reason.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const EM_DASH = '—';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(repoRoot, 'src');

// Only text we author. Binary assets (fonts, images) are skipped, and the generated client too.
const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.json',
  '.md',
  '.html',
  '.svg',
  '.txt',
]);
const EXCLUDED = new Set([path.join(srcRoot, 'services/api/schema.ts')]);

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (TEXT_EXTENSIONS.has(path.extname(full)) && !EXCLUDED.has(full)) {
      files.push(full);
    }
  }
  return files;
}

const offenders = [];
for (const file of walk(srcRoot)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (line.includes(EM_DASH)) {
      offenders.push(`${path.relative(repoRoot, file)}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (offenders.length > 0) {
  console.error(
    'Em dashes found under src. Replace each with a period, comma, colon, or parentheses:',
  );
  for (const offender of offenders) {
    console.error(`  ${offender}`);
  }
  process.exit(1);
}

console.log('No em dashes under src.');
