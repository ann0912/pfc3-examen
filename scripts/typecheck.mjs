import { execFileSync } from 'node:child_process';
for (const file of ['src/app.js', 'src/api.js', 'src/report.js', 'scripts/build.mjs']) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
console.log('Sintaxis JavaScript verificada. No hay TypeScript en este stack.');
