import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReport, safeText } from '../src/report.js';
import { createRepository } from '../src/api.js';

const valid = { district: 'Comas', category: 'Heces acumuladas', reference: 'Parque central', description: 'Se observan desechos junto a la vereda.' };

test('acepta un reporte válido y normaliza espacios', () => {
  const result = validateReport({ ...valid, reference: '  Parque central  ' });
  assert.equal(result.valid, true);
  assert.equal(result.value.reference, 'Parque central');
});

test('rechaza distrito ajeno, categoría desconocida y descripciones insuficientes', () => {
  const result = validateReport({ ...valid, district: 'Miraflores', category: 'X', description: 'corto' });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['category', 'description', 'district']);
});

test('escapa contenido ciudadano antes de mostrarlo', () => {
  assert.equal(safeText('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
});

test('el reporte persiste tras crear otra instancia del repositorio local', async () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  await createRepository({}, storage).create(valid);
  const items = await createRepository({}, storage).list();
  assert.equal(items.length, 1);
  assert.equal(items[0].district, 'Comas');
  assert.equal(items[0].status, 'Pendiente');
});

test('Supabase usa solo la clave pública y operaciones de lectura e inserción', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    return { ok: true, json: async () => options.method === 'POST' ? [{ ...valid, id: '1' }] : [] };
  };
  const repo = createRepository({ url: 'https://demo.supabase.co', key: 'public-key' }, null, fetcher);
  await repo.create(valid);
  await repo.list();
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.apikey, 'public-key');
  assert.match(calls[1].url, /select=id,district/);
});
