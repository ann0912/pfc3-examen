import { districts, categories, safeText } from './report.js';
import { statuses, filterReports, countsBy, criticalZones } from './analytics.js';

const nextStatus = {
  'Pendiente': ['En revisión','Asignado'], 'Recibido': ['En revisión','Asignado'],
  'En revisión': ['Asignado'], 'Asignado': ['En atención'],
  'En atención': ['Atendido'], 'Atendido': ['Cerrado']
};

export function initializeMunicipal(client) {
  const $ = selector => document.querySelector(selector);
  const option = (value, label = value) => `<option value="${safeText(value)}">${safeText(label)}</option>`;
  for (const [selector, values] of [['#municipal-district',districts],['#municipal-category',categories],['#municipal-status',statuses]])
    $(selector).insertAdjacentHTML('beforeend', values.map(value => option(value)).join(''));
  let role = 'ciudadano';
  let reports = [], assignments = [], roles = [], users = [], notifications = [];

  const notice = (selector, message, ok = false) => {
    const node = $(selector); node.textContent = message; node.className = `notice ${ok ? 'success' : 'error'}`;
  };
  const filters = () => ({ district: $('#municipal-district').value, category: $('#municipal-category').value,
    status: $('#municipal-status').value, from: $('#municipal-from').value, to: $('#municipal-to').value });
  const isManager = () => role === 'supervisor' || role === 'administrador';
  const assignedToMe = reportId => assignments.some(a => a.report_id === reportId && a.fiscalizador_id === client.user?.id);

  function renderStats(visible) {
    for (const [field, selector] of [['district','#stats-district'],['category','#stats-category'],['status','#stats-status']]) {
      const counts = countsBy(visible, field);
      $(selector).innerHTML = counts.length ? counts.map(([label,count]) => `<div class="stat-row"><span>${safeText(label)}</span><strong>${count}</strong></div>`).join('') : '<p class="empty">Sin datos para este período.</p>';
    }
    const zones = criticalZones(visible);
    $('#critical-zones').innerHTML = zones.length ? zones.map((zone,index) =>
      `<div class="stat-row"><span>${index + 1}. ${safeText(zone.district)} · ${zone.key}</span><strong>${zone.count}</strong></div>`
    ).join('') : '<p class="empty">No hay suficientes reportes con coordenadas para identificar zonas.</p>';
  }
  function renderReports() {
    const visible = filterReports(reports, filters());
    $('#municipal-count').textContent = `${visible.length} incidencias coincidentes de ${reports.length} consultadas.`;
    $('#municipal-report-list').innerHTML = visible.length ? visible.map(report => {
      const next = (nextStatus[report.status] || []).filter(status =>
        isManager() || (assignedToMe(report.id) && ['En atención','Atendido'].includes(status)));
      return `<article class="report-card" id="municipal-${safeText(report.id)}"><div class="report-top"><span class="badge">${safeText(report.status)}</span><time datetime="${safeText(report.created_at)}">${new Date(report.created_at).toLocaleDateString('es-PE')}</time></div><h3>${safeText(report.code || 'Reporte histórico')} · ${safeText(report.category)}</h3><p class="location">${safeText(report.district)} · ${safeText(report.reference)}</p><p>${safeText(report.description)}</p><div class="municipal-card-actions"><button class="secondary-button" type="button" data-history="${safeText(report.id)}">Ver historial</button>${next.length ? `<label>Nuevo estado <select data-status-for="${safeText(report.id)}"><option value="">Selecciona</option>${next.map(value => option(value)).join('')}</select></label>` : ''}</div><div class="history-result"></div></article>`;
    }).join('') : '<p class="empty">No hay reportes coincidentes.</p>';
    renderStats(visible);
  }
  function renderNotifications() {
    $('#notification-list').innerHTML = notifications.length ? notifications.map(item =>
      `<article class="report-card"><p>${safeText(item.message)}</p><p class="field-help">${new Date(item.created_at).toLocaleString('es-PE')} · ${item.read_at ? 'Leída' : 'Sin leer'}</p><button class="secondary-button" type="button" data-notification="${safeText(item.id)}" data-report="${safeText(item.report_id)}">Ver reporte y marcar leída</button></article>`
    ).join('') : '<p class="empty">No tienes notificaciones.</p>';
  }
  function renderSelectors() {
    const reportOptions = reports.map(item => option(item.id, `${item.code || 'Histórico'} · ${item.district}`)).join('');
    $('#assignment-report').innerHTML = `<option value="">Selecciona</option>${reportOptions}`;
    $('#inspection-report').innerHTML = `<option value="">Selecciona</option>${assignments.filter(a => a.fiscalizador_id === client.user?.id).map(a => {
      const report = reports.find(r => r.id === a.report_id);
      return report ? option(report.id, `${report.code || 'Histórico'} · ${report.district}`) : '';
    }).join('')}`;
    $('#assignment-person').innerHTML = `<option value="">Selecciona</option>${roles.filter(item => item.role === 'fiscalizador').map(item => {
      const user = users.find(candidate => candidate.id === item.user_id);
      return user ? option(user.id, `${user.full_name} · ${user.email}`) : '';
    }).join('')}`;
    $('#role-user').innerHTML = `<option value="">Selecciona</option>${users.filter(user => !roles.some(item => item.user_id === user.id)).map(user => option(user.id, `${user.full_name} · ${user.email}`)).join('')}`;
  }
  async function refresh() {
    if (!client.user) return;
    try { notifications = await client.notifications(); renderNotifications(); }
    catch (error) { notice('#notification-feedback', error.message); }
    if (role === 'ciudadano') return;
    try {
      [reports, assignments, roles] = await Promise.all([client.municipalReports(), client.assignments(), client.municipalRoles()]);
      users = isManager() ? await client.municipalUsers() : [];
      renderReports(); renderSelectors(); notice('#municipal-feedback', 'Datos municipales actualizados.', true);
    } catch (error) { notice('#municipal-feedback', error.message); }
  }
  async function setUser() {
    role = client.user ? await client.role().catch(() => 'ciudadano') : 'ciudadano';
    $('[data-municipal-only]').hidden = role === 'ciudadano';
    $('[data-admin-only]').hidden = role !== 'administrador';
    $('[data-supervisor-only]').hidden = !isManager();
    $('[data-fiscalizador-only]').hidden = role !== 'fiscalizador';
    if (client.user) await refresh();
    else { reports = []; assignments = []; notifications = []; $('#notification-list').innerHTML = ''; }
  }

  for (const selector of ['#municipal-district','#municipal-category','#municipal-status','#municipal-from','#municipal-to'])
    $(selector).addEventListener('change', renderReports);
  $('#municipal-report-list').addEventListener('change', async event => {
    const selector = event.target.closest('[data-status-for]');
    if (!selector || !selector.value) return;
    const id = selector.dataset.statusFor;
    const status = selector.value; selector.disabled = true;
    try { await client.changeStatus(id, status); await refresh(); }
    catch (error) { notice('#municipal-feedback', error.message); selector.disabled = false; }
  });
  $('#municipal-report-list').addEventListener('click', async event => {
    const button = event.target.closest('[data-history]'); if (!button) return;
    const result = button.closest('.report-card').querySelector('.history-result');
    try {
      const [history, inspections] = await Promise.all([client.statusHistory(button.dataset.history), client.inspections(button.dataset.history)]);
      result.innerHTML = `<h4>Historial</h4>${history.map(item => `<p>${safeText(item.previous_status)} → ${safeText(item.new_status)} · ${new Date(item.changed_at).toLocaleString('es-PE')}</p>`).join('') || '<p>Sin cambios registrados.</p>'}<h4>Inspecciones</h4>${inspections.map(item => `<p>${safeText(item.observations)} · ${safeText(item.actions)}</p>`).join('') || '<p>Sin inspecciones.</p>'}`;
    } catch (error) { result.textContent = error.message; }
  });
  $('#assignment-form').addEventListener('submit', async event => {
    event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
    if (!data.report_id || !data.fiscalizador_id) { notice('#assignment-feedback', 'Selecciona reporte y fiscalizador.'); return; }
    try { await client.assignReport(data.report_id, data.fiscalizador_id); notice('#assignment-feedback', 'Asignación guardada.', true); await refresh(); }
    catch (error) { notice('#assignment-feedback', error.message); }
  });
  $('#inspection-form').addEventListener('submit', async event => {
    event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
    if (!data.report_id || data.observations.trim().length < 15 || data.actions.trim().length < 5) {
      notice('#inspection-feedback', 'Completa el reporte, las observaciones y las acciones.'); return;
    }
    try { await client.createInspection(data.report_id, data.observations.trim(), data.actions.trim()); notice('#inspection-feedback', 'Inspección guardada.', true); event.currentTarget.reset(); }
    catch (error) { notice('#inspection-feedback', error.message); }
  });
  $('#role-form').addEventListener('submit', async event => {
    event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
    if (!data.user_id || !['fiscalizador','supervisor'].includes(data.role)) { notice('#role-feedback', 'Selecciona usuario y rol.'); return; }
    try { await client.assignRole(data.user_id, data.role); notice('#role-feedback', 'Rol asignado.', true); await refresh(); }
    catch (error) { notice('#role-feedback', error.message); }
  });
  $('#notification-list').addEventListener('click', async event => {
    const button = event.target.closest('[data-notification]'); if (!button) return;
    try {
      await client.markNotificationRead(button.dataset.notification);
      await refresh();
      const report = document.getElementById(`report-${button.dataset.report}`);
      report?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) { notice('#notification-feedback', error.message); }
  });
  return { setUser, refresh };
}
