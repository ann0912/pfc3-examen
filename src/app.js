import { createRepository } from './api.js';
import { districts, categories, validateReport, safeText } from './report.js';

const repository = createRepository(globalThis.APP_CONFIG);
const form = document.querySelector('#report-form');
const list = document.querySelector('#report-list');
const feedback = document.querySelector('#feedback');
const submit = document.querySelector('#submit-report');
const districtFilter = document.querySelector('#district-filter');
let reports = [];

function options(values) { return values.map(value => `<option value="${safeText(value)}">${safeText(value)}</option>`).join(''); }
document.querySelector('#district').insertAdjacentHTML('beforeend', options(districts));
document.querySelector('#category').insertAdjacentHTML('beforeend', options(categories));
districtFilter.insertAdjacentHTML('beforeend', options(districts));
document.querySelector('#data-mode').textContent = repository.mode === 'supabase' ? 'Datos compartidos en Supabase' : 'Demo local: datos solo en este navegador';

function render() {
  const selected = districtFilter.value;
  const visible = reports.filter(item => !selected || item.district === selected);
  document.querySelector('#report-count').textContent = String(visible.length);
  list.innerHTML = visible.length ? visible.map(item => `<article class="report-card"><div class="report-top"><span class="badge">${safeText(item.status)}</span><time datetime="${safeText(item.created_at)}">${new Date(item.created_at).toLocaleDateString('es-PE')}</time></div><h3>${safeText(item.category)}</h3><p class="location">${safeText(item.district)} · ${safeText(item.reference)}</p><p>${safeText(item.description)}</p></article>`).join('') : '<p class="empty">Aún no hay reportes para este filtro. Puedes registrar el primero.</p>';
}

async function refresh() {
  list.innerHTML = '<p class="empty">Cargando reportes…</p>';
  try { reports = await repository.list(); render(); }
  catch (error) { list.innerHTML = `<p class="error" role="alert">${safeText(error.message)} Intenta recargar la página.</p>`; }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const result = validateReport(Object.fromEntries(new FormData(form)));
  form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach(node => { node.textContent = ''; });
  if (!result.valid) {
    for (const [name, message] of Object.entries(result.errors)) {
      form.elements[name].setAttribute('aria-invalid', 'true');
      form.querySelector(`#${name}-error`).textContent = message;
    }
    feedback.textContent = 'Revisa los campos señalados.';
    feedback.className = 'notice error';
    form.querySelector('[aria-invalid]').focus();
    return;
  }
  submit.disabled = true;
  submit.textContent = 'Guardando…';
  feedback.textContent = '';
  try {
    await repository.create(result.value);
    form.reset();
    feedback.textContent = 'Reporte registrado. Ya puedes verlo en la lista.';
    feedback.className = 'notice success';
    await refresh();
  } catch (error) {
    feedback.textContent = `${error.message} Tu reporte no se guardó.`;
    feedback.className = 'notice error';
  } finally {
    submit.disabled = false;
    submit.textContent = 'Registrar punto crítico';
  }
});
districtFilter.addEventListener('change', render);
refresh();
