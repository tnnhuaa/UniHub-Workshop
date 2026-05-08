const { spawnSync } = require('node:child_process');
const path = require('node:path');

const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

const prismaArgs = process.argv.slice(2);
if (prismaArgs.length === 0) {
  console.error('Missing Prisma command arguments.');
  process.exit(1);
}

const schemaPath = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'prisma',
  'schema.prisma',
);
const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['prisma', ...prismaArgs, '--schema', schemaPath],
  { stdio: 'inherit' },
);

if (result.error) {
  console.error('Prisma command failed to start:', result.error.message);
}

process.exit(result.status ?? 1);
