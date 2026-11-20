import { readFileSync, readdirSync } from 'node:fs';
const files = ['index.html', ...readdirSync('src').map(file => `src/${file}`)];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  if (/service_role|SUPABASE_SERVICE_ROLE|eval\s*\(|document\.write\s*\(/i.test(content)) throw new Error(`Patrón prohibido en ${file}`);
}
console.log('Escaneo estático de patrones peligrosos: sin hallazgos.');
