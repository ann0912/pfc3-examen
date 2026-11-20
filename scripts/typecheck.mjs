import { execFileSync } from 'node:child_process';
for (const file of ['src/app.js', 'src/api.js', 'src/client.js', 'src/report.js', 'src/analytics.js', 'src/municipal.js', 'scripts/build.mjs', 'scripts/verify-remote.mjs']) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
console.log('Sintaxis JavaScript verificada. No hay TypeScript en este stack.');
