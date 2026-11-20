import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '../src/client.js';
import { validateCitizen, validatePet, validateReport } from '../src/report.js';

const config = { url: 'https://example.supabase.co', key: 'public-key' };
const memory = () => {
  const data = new Map();
  return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
};
const response = (value, status = 200) => ({ ok: status < 400, status, json: async () => value });

test('no permite operaciones privadas sin sesión', async () => {
  let calls = 0;
  const client = createClient(config, async () => { calls++; return response([]); }, memory());
  await assert.rejects(client.pets(), /Inicia sesión/);
  await assert.rejects(client.createReport({}), /Inicia sesión/);
  assert.equal(calls, 0);
});

test('envía identidad de Supabase en inserción y lectura propias', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (url.includes('grant_type=password')) return response({ access_token: 'access-test', refresh_token: 'refresh-test', expires_in: 3600, user: { id: 'u1', email: 'prueba@example.com' } });
    if (options.method === 'POST') return response([{ code: 'LN-00000001', status: 'Recibido' }], 201);
    return response([]);
  };
  const client = createClient(config, fetcher, memory());
  await client.signIn('prueba@example.com', 'no-real');
  const created = await client.createReport({ district: 'Comas', category: 'Heces acumuladas', reference: 'Parque central', description: 'Descripción ficticia suficiente.' });
  await client.myReports();
  assert.equal(created.code, 'LN-00000001');
  assert.equal(calls[1].options.headers.Authorization, 'Bearer access-test');
  assert.equal(JSON.parse(calls[1].options.body).code, null);
  assert.equal(calls[2].options.headers.Authorization, 'Bearer access-test');
  assert.match(calls[2].url, /critical_reports/);
});

test('conserva la sesión devuelta directamente por el registro de Supabase', async () => {
  const storage = memory();
  const client = createClient(config, async () => response({
    access_token: 'signup-access', refresh_token: 'signup-refresh', expires_in: 3600,
    user: { id: 'u2', email: 'nueva@example.com' }
  }), storage);
  await client.signUp({ full_name: 'Ana Pérez', phone: '999888777', district: 'Comas', email: 'nueva@example.com', password: 'password123' });
  assert.equal(client.user.id, 'u2');
  assert.equal(JSON.parse(storage.getItem('lima-norte-auth-v1')).access_token, 'signup-access');
});

test('valida cuenta, mascota y coordenadas antes de enviar', () => {
  assert.equal(validateCitizen({ full_name: 'Ana Pérez', phone: '999888777', district: 'Comas', email: 'ana@example.com', password: 'password123' }).valid, true);
  assert.equal(validateCitizen({ full_name: 'A', phone: 'x', district: 'Otro', email: 'mal', password: '1' }).valid, false);
  assert.equal(validatePet({ name: 'Luna', species: 'Gato', age_years: '2.5' }).valid, true);
  assert.equal(validatePet({ name: '', species: 'Ave', age_years: '-1' }).valid, false);
  assert.equal(validateReport({ district: 'Comas', category: 'Heces acumuladas', reference: 'Parque central', description: 'Descripción ficticia suficiente.', latitude: '-12.05', longitude: '-77.05' }).valid, true);
  assert.equal(validateReport({ district: 'Comas', category: 'Heces acumuladas', reference: 'Parque central', description: 'Descripción ficticia suficiente.', latitude: '-9', longitude: '-77.05' }).valid, false);
});
