import test from 'node:test';
import assert from 'node:assert/strict';
import { filterReports, countsBy, criticalZones } from '../src/analytics.js';

const reports = [
  { district: 'Comas', category: 'Heces', status: 'Recibido', created_at: '2026-11-18T12:00:00Z', latitude: -12.0124, longitude: -77.0214 },
  { district: 'Comas', category: 'Heces', status: 'Atendido', created_at: '2026-11-19T12:00:00Z', latitude: -12.0123, longitude: -77.0213 },
  { district: 'Los Olivos', category: 'Orina', status: 'Recibido', created_at: '2026-11-20T12:00:00Z', latitude: null, longitude: null }
];
test('combina filtros de distrito, categoría, estado y período', () => {
  assert.equal(filterReports(reports, { district: 'Comas', category: 'Heces', status: 'Atendido', from: '2026-11-19', to: '2026-11-19' }).length, 1);
  assert.equal(filterReports(reports, { district: 'Comas', to: '2026-11-18' }).length, 1);
});
test('cuenta incidencias y agrupa zonas en celdas aproximadas', () => {
  assert.deepEqual(countsBy(reports, 'district'), [['Comas', 2], ['Los Olivos', 1]]);
  const zones = criticalZones(reports);
  assert.equal(zones.length, 1);
  assert.equal(zones[0].count, 2);
  assert.equal(zones[0].key, '-12.012,-77.021');
});
