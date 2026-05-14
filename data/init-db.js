const { spawnSync } = require('node:child_process');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', cwd: rootDir });
  if (result.error) {
    console.error('Command failed to start:', result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(pnpmCmd, ['api:prisma:generate']);
run(pnpmCmd, ['api:prisma:migrate']);
