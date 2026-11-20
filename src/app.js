import { createClient } from './client.js';
import { districts, categories, validateReport, validateCitizen, validatePet, safeText } from './report.js';
import { initializeMunicipal } from './municipal.js';

const $ = selector => document.querySelector(selector);
const client = createClient(globalThis.APP_CONFIG);
const municipal = initializeMunicipal(client);
const form = $('#report-form');
const list = $('#report-list');
let reports = [];
let pets = [];

function options(values) { return values.map(value => `<option value="${safeText(value)}">${safeText(value)}</option>`).join(''); }
for (const selector of ['#district','#district-filter','#signup-district','#map-district']) $(selector).insertAdjacentHTML('beforeend', options(districts));
$('#category').insertAdjacentHTML('beforeend', options(categories));
$('#map-category').insertAdjacentHTML('beforeend', options(categories));
$('#data-mode').textContent = 'Datos compartidos en Supabase';
const map = globalThis.L.map('map').setView([-12.02, -77.055], 11);
globalThis.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18, attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const mapLayer = globalThis.L.layerGroup().addTo(map);
let mapReports = [];
let selectedMarker;

function renderMap() {
  mapLayer.clearLayers();
  const district = $('#map-district').value;
  const category = $('#map-category').value;
  const visible = mapReports.filter(item => (!district || item.district === district) &&
    (!category || item.category === category));
  for (const item of visible) {
    globalThis.L.marker([item.latitude, item.longitude]).addTo(mapLayer)
      .bindPopup(`<strong>${safeText(item.category)}</strong><br>${safeText(item.district)} · ${safeText(item.reference)}<br>${safeText(item.status)}`);
  }
  $('#map-feedback').textContent = visible.length ? `${visible.length} ubicaciones aproximadas visibles.` : 'No hay incidencias con coordenadas para este filtro.';
}
async function refreshMap() {
  try { mapReports = await client.publicLocations(); renderMap(); }
  catch (error) { $('#map-feedback').textContent = `No se pudo cargar el mapa: ${error.message}`; }
}
map.on('click', event => {
  if (!client.user) { $('#map-feedback').textContent = 'Inicia sesión para elegir una ubicación.'; return; }
  const { lat, lng } = event.latlng;
  if (lat < -12.5 || lat > -11.5 || lng < -77.5 || lng > -76.5) {
    $('#map-feedback').textContent = 'Elige un punto dentro de Lima Norte.'; return;
  }
  $('#latitude').value = lat.toFixed(6); $('#longitude').value = lng.toFixed(6);
  if (selectedMarker) map.removeLayer(selectedMarker);
  selectedMarker = globalThis.L.marker([lat, lng]).addTo(map);
  $('#selected-coordinates').textContent = `Punto seleccionado: ${lat.toFixed(5)}, ${lng.toFixed(5)}. También describe el lugar manualmente.`;
});
for (const selector of ['#map-district','#map-category']) $(selector).addEventListener('change', renderMap);

function notice(selector, message, ok = false) {
  const node = $(selector);
  node.textContent = message;
  node.className = `notice ${ok ? 'success' : 'error'}`;
}
function renderReports() {
  const selected = $('#district-filter').value;
  const visible = reports.filter(item => !selected || item.district === selected);
  $('#report-count').textContent = String(visible.length);
  list.innerHTML = visible.length ? visible.map(item =>
    `<article class="report-card" id="report-${safeText(item.id)}"><div class="report-top"><span class="badge">${safeText(item.status)}</span><time datetime="${safeText(item.created_at)}">${new Date(item.created_at).toLocaleDateString('es-PE')}</time></div><h3>${safeText(item.category)}</h3><p class="location">${safeText(item.district)} · ${safeText(item.reference)}</p><p>${safeText(item.description)}</p><p class="report-code">Código: ${safeText(item.code || 'histórico sin código')}</p><label class="field-help">Añadir fotografía<input type="file" accept="image/jpeg,image/png,image/webp" data-photo-upload="${safeText(item.id)}"></label><button type="button" class="secondary-button" data-photo-view="${safeText(item.id)}">Ver fotografías</button><div class="photo-result"></div></article>`
  ).join('') : '<p class="empty">Aún no tienes reportes para este filtro.</p>';
}
function renderPets() {
  $('#pet-list').innerHTML = pets.length ? pets.map(pet =>
    `<article class="report-card"><h3>${safeText(pet.name)}</h3><p>${safeText(pet.species)} · ${safeText(pet.breed || 'Raza no indicada')} · ${safeText(pet.age_years)} años</p><button class="secondary-button" type="button" data-edit-pet="${safeText(pet.id)}">Editar</button></article>`
  ).join('') : '<p class="empty">Aún no has registrado mascotas.</p>';
}
async function refresh() {
  list.innerHTML = '<p class="empty">Cargando reportes…</p>';
  $('#pet-list').innerHTML = '<p class="empty">Cargando mascotas…</p>';
  try {
    [reports, pets] = await Promise.all([client.myReports(), client.pets()]);
    renderReports(); renderPets();
  } catch (error) {
    const message = `<p class="error" role="alert">${safeText(error.message)} Intenta recargar la página.</p>`;
    list.innerHTML = message; $('#pet-list').innerHTML = message;
  }
}
async function showSession() {
  const signed = Boolean(client.user);
  document.querySelectorAll('[data-auth-only]').forEach(node => { node.hidden = !signed; });
  document.querySelectorAll('[data-guest-only]').forEach(node => { node.hidden = signed; });
  $('#account-status').textContent = signed ? `Sesión iniciada: ${client.user.email}` : 'Inicia sesión para registrar y consultar tus datos.';
  if (signed) await refresh();
  await municipal.setUser();
}
$('#signup-form').addEventListener('submit', async event => {
  event.preventDefault();
  const result = validateCitizen(Object.fromEntries(new FormData(event.currentTarget)));
  if (!result.valid) { notice('#signup-feedback', Object.values(result.errors)[0]); return; }
  const button = event.currentTarget.querySelector('button[type=submit]'); button.disabled = true;
  try {
    const response = await client.signUp(result.value);
    event.currentTarget.reset();
    notice('#signup-feedback', response.access_token ? 'Cuenta creada y sesión iniciada.' : 'Revisa tu correo para confirmar la cuenta antes de ingresar.', true);
    await showSession();
  } catch (error) { notice('#signup-feedback', error.message); }
  finally { button.disabled = false; }
});
$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const button = event.currentTarget.querySelector('button[type=submit]'); button.disabled = true;
  try { await client.signIn(String(data.email || '').trim(), String(data.password || '')); event.currentTarget.reset(); await showSession(); }
  catch (error) { notice('#login-feedback', error.message); }
  finally { button.disabled = false; }
});
$('#logout').addEventListener('click', async () => { await client.signOut(); reports = []; pets = []; await showSession(); });
$('#pet-form').addEventListener('submit', async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const result = validatePet(data);
  if (!result.valid) { notice('#pet-feedback', Object.values(result.errors)[0]); return; }
  const button = $('#pet-submit'); button.disabled = true;
  try {
    if (data.id) await client.updatePet(data.id, result.value); else await client.createPet(result.value);
    notice('#pet-feedback', data.id ? 'Mascota actualizada.' : 'Mascota registrada.', true);
    event.currentTarget.reset(); event.currentTarget.elements.id.value = '';
    $('#pet-cancel').hidden = true; button.textContent = 'Guardar mascota'; await refresh();
  } catch (error) { notice('#pet-feedback', error.message); }
  finally { button.disabled = false; }
});
$('#pet-list').addEventListener('click', event => {
  const button = event.target.closest('[data-edit-pet]');
  if (!button) return;
  const pet = pets.find(item => item.id === button.dataset.editPet);
  if (!pet) return;
  for (const name of ['id','name','species','breed','age_years']) $('#pet-form').elements[name].value = pet[name] ?? '';
  $('#pet-submit').textContent = 'Actualizar mascota'; $('#pet-cancel').hidden = false;
  $('#pet-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('#pet-cancel').addEventListener('click', () => {
  $('#pet-form').reset(); $('#pet-form').elements.id.value = '';
  $('#pet-submit').textContent = 'Guardar mascota'; $('#pet-cancel').hidden = true;
});
$('#report-list').addEventListener('change', async event => {
  const input = event.target.closest('[data-photo-upload]'); if (!input || !input.files[0]) return;
  const result = input.closest('.report-card').querySelector('.photo-result');
  result.textContent = 'Cargando fotografía…'; input.disabled = true;
  try { await client.uploadPhoto(input.dataset.photoUpload, input.files[0]); result.textContent = 'Fotografía guardada.'; }
  catch (error) { result.textContent = error.message; }
  finally { input.disabled = false; input.value = ''; }
});
$('#report-list').addEventListener('click', async event => {
  const button = event.target.closest('[data-photo-view]'); if (!button) return;
  const result = button.closest('.report-card').querySelector('.photo-result');
  result.textContent = 'Cargando fotografías…';
  try {
    const photos = await client.photos(button.dataset.photoView);
    result.textContent = '';
    if (!photos.length) { result.textContent = 'Sin fotografías adjuntas.'; return; }
    for (const photo of photos) {
      const image = document.createElement('img');
      image.className = 'report-photo'; image.alt = 'Evidencia fotográfica de la incidencia';
      image.src = await client.signedPhotoUrl(photo.object_path);
      result.append(image);
    }
  } catch (error) { result.textContent = error.message; }
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  const result = validateReport(Object.fromEntries(new FormData(form)));
  form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach(node => { node.textContent = ''; });
  if (!result.valid) {
    for (const [name, message] of Object.entries(result.errors)) {
      if (form.elements[name]) form.elements[name].setAttribute('aria-invalid', 'true');
      const error = form.querySelector(`#${name}-error`); if (error) error.textContent = message;
    }
    notice('#feedback', 'Revisa los campos señalados.'); form.querySelector('[aria-invalid]')?.focus(); return;
  }
  const button = $('#submit-report'); button.disabled = true; button.textContent = 'Guardando…';
  try {
    const photo = $('#report-photo').files[0];
    if (photo && (photo.size < 1 || photo.size > 5242880 || !['image/jpeg','image/png','image/webp'].includes(photo.type)))
      throw new Error('La imagen debe ser JPEG, PNG o WebP de máximo 5 MB.');
    const created = await client.createReport(result.value);
    let photoMessage = '';
    if (photo) {
      try { await client.uploadPhoto(created.id, photo); photoMessage = ' Fotografía adjuntada.'; }
      catch (error) { photoMessage = ` El reporte se guardó, pero la foto falló: ${error.message}`; }
    }
    form.reset(); notice('#feedback', `Reporte ${created.code} registrado con estado ${created.status}.${photoMessage}`, !photoMessage.includes('falló'));
    $('#selected-coordinates').textContent = 'Ubicación manual: describe el lugar arriba; puedes marcar un punto en el mapa.';
    if (selectedMarker) { map.removeLayer(selectedMarker); selectedMarker = null; }
    await refresh(); await refreshMap(); await municipal.refresh();
  } catch (error) { notice('#feedback', `${error.message} Tu reporte no se guardó.`); }
  finally { button.disabled = false; button.textContent = 'Registrar punto crítico'; }
});
$('#district-filter').addEventListener('change', renderReports);
await client.restore(); await showSession(); await refreshMap();
