export const statuses = ['Recibido','En revisión','Asignado','En atención','Atendido','Cerrado'];

export function filterReports(reports, filters = {}) {
  return reports.filter(report => {
    if (filters.district && report.district !== filters.district) return false;
    if (filters.category && report.category !== filters.category) return false;
    if (filters.status && report.status !== filters.status) return false;
    const date = Date.parse(report.created_at);
    if (filters.from && date < Date.parse(`${filters.from}T00:00:00`)) return false;
    if (filters.to && date >= Date.parse(`${filters.to}T00:00:00`) + 86400000) return false;
    return true;
  });
}

export function countsBy(reports, field) {
  const counts = new Map();
  for (const report of reports) counts.set(report[field], (counts.get(report[field]) || 0) + 1);
  return [...counts].sort((a,b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), 'es'));
}

export function criticalZones(reports) {
  const groups = new Map();
  for (const report of reports) {
    const latitude = Number(report.latitude), longitude = Number(report.longitude);
    if (report.latitude == null || report.longitude == null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    const lat = latitude.toFixed(3), lon = longitude.toFixed(3);
    const key = `${lat},${lon}`;
    const group = groups.get(key) || { key, latitude: Number(lat), longitude: Number(lon), district: report.district, count: 0 };
    group.count++;
    groups.set(key, group);
  }
  return [...groups.values()].sort((a,b) => b.count - a.count || a.key.localeCompare(b.key));
}
