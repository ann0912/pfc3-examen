import { cpSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

function localEnv() {
  if (!existsSync('.env.local')) return {};
  return Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(line => /^[A-Z_]+=[^\r\n]*$/.test(line)).map(line => {
    const index = line.indexOf('=');
    return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, '')];
  }));
}
const env = { ...localEnv(), ...process.env };
const url = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
if (url && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) throw new Error('La URL pública de Supabase no es válida.');
if (Boolean(url) !== Boolean(key)) throw new Error('La URL y la clave publicable deben configurarse juntas.');
mkdirSync('dist/src', { recursive: true });
cpSync('index.html', 'dist/index.html');
cpSync('src', 'dist/src', { recursive: true });
writeFileSync('dist/config.js', `window.APP_CONFIG = ${JSON.stringify({ url, key })};\n`);
console.log(url ? 'Build: Supabase configurado.' : 'Build: demo local sin Supabase.');
