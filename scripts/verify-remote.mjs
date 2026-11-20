import { readFileSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

if (!existsSync('.env.local')) throw new Error('Falta .env.local.');
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(line => /^[A-Z_]+=[^\r\n]*$/.test(line)).map(line => {
  const i = line.indexOf('=');
  return [line.slice(0, i), line.slice(i + 1).replace(/^['"]|['"]$/g, '')];
}));
const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) throw new Error('Falta una URL o clave publicable válida.');

const endpoint = `${url}/rest/v1/critical_reports`;
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
async function call(path, options = {}) {
  const response = await fetch(endpoint + path, { ...options, headers: { ...headers, ...options.headers } });
  return { status: response.status, ok: response.ok, body: await response.text() };
}

const reference = `Parque de prueba ${randomUUID().slice(0, 8)}`;
const testReport = {
  district: 'Comas', category: 'Heces acumuladas', reference,
  description: 'Reporte ficticio para verificar persistencia y permisos públicos.'
};
const created = await call('', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(testReport) });
if (created.status !== 201) throw new Error(`Inserción remota falló: HTTP ${created.status}. Comprueba la migración y RLS.`);
const id = JSON.parse(created.body)?.[0]?.id;
if (!id) throw new Error('Supabase no devolvió el ID del reporte.');
const selected = await call(`?id=eq.${encodeURIComponent(id)}&select=id,district,category,reference,status`);
if (!selected.ok || JSON.parse(selected.body)?.[0]?.reference !== reference) throw new Error('La lectura posterior no encontró el reporte persistido.');
const updated = await call(`?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status: 'Atendido' }) });
if (updated.ok) throw new Error('Permiso inseguro: el cliente público pudo actualizar un reporte.');
const deleted = await call(`?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
if (deleted.ok) throw new Error('Permiso inseguro: el cliente público pudo borrar un reporte.');
const checked = await call(`?id=eq.${encodeURIComponent(id)}&select=id,status`);
if (!checked.ok || JSON.parse(checked.body)?.[0]?.status !== 'Pendiente') throw new Error('El estado persistido no quedó Pendiente.');
console.log(`Persistencia remota verificada con reporte ficticio ${id}.`);
console.log(`Permisos anónimos verificados: SELECT/INSERT permitidos; PATCH HTTP ${updated.status}, DELETE HTTP ${deleted.status} denegados.`);
console.log('El reporte ficticio permanece en la tabla para revisión; requiere limpieza administrativa posterior.');
