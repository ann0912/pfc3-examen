export const districts = ['Los Olivos', 'Comas', 'San Martín de Porres', 'Independencia'];
export const categories = ['Heces acumuladas', 'Presencia de orina', 'Deterioro de espacio público', 'Mascota sin supervisión'];

export function validateReport(input) {
  const district = String(input.district ?? '').trim();
  const category = String(input.category ?? '').trim();
  const reference = String(input.reference ?? '').trim();
  const description = String(input.description ?? '').trim();
  const errors = {};
  if (!districts.includes(district)) errors.district = 'Selecciona un distrito de Lima Norte.';
  if (!categories.includes(category)) errors.category = 'Selecciona el tipo de problema.';
  if (reference.length < 5 || reference.length > 120) errors.reference = 'Indica una referencia entre 5 y 120 caracteres.';
  if (description.length < 15 || description.length > 500) errors.description = 'Describe el problema entre 15 y 500 caracteres.';
  return { valid: Object.keys(errors).length === 0, errors, value: { district, category, reference, description } };
}

export function safeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
