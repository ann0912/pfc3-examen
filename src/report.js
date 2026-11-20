export const districts = ['Los Olivos', 'Comas', 'San Martín de Porres', 'Independencia'];
export const categories = ['Heces acumuladas', 'Presencia de orina', 'Deterioro de espacio público', 'Mascota sin supervisión'];

export function validateReport(input) {
  const district = String(input.district ?? '').trim();
  const category = String(input.category ?? '').trim();
  const reference = String(input.reference ?? '').trim();
  const description = String(input.description ?? '').trim();
  const latitude = input.latitude === '' || input.latitude == null ? null : Number(input.latitude);
  const longitude = input.longitude === '' || input.longitude == null ? null : Number(input.longitude);
  const errors = {};
  if (!districts.includes(district)) errors.district = 'Selecciona un distrito de Lima Norte.';
  if (!categories.includes(category)) errors.category = 'Selecciona el tipo de problema.';
  if (reference.length < 5 || reference.length > 120) errors.reference = 'Indica una referencia entre 5 y 120 caracteres.';
  if (description.length < 15 || description.length > 500) errors.description = 'Describe el problema entre 15 y 500 caracteres.';
  if ((latitude === null) !== (longitude === null) ||
      (latitude !== null && (!Number.isFinite(latitude) || latitude < -12.5 || latitude > -11.5 ||
        !Number.isFinite(longitude) || longitude < -77.5 || longitude > -76.5))) {
    errors.location = 'Selecciona un punto válido de Lima Norte o deja ambos valores vacíos.';
  }
  return { valid: Object.keys(errors).length === 0, errors,
    value: { district, category, reference, description,
      ...(latitude === null ? {} : { latitude, longitude }) } };
}

export function validateCitizen(input) {
  const full_name = String(input.full_name ?? '').trim();
  const phone = String(input.phone ?? '').trim();
  const district = String(input.district ?? '').trim();
  const email = String(input.email ?? '').trim().toLowerCase();
  const password = String(input.password ?? '');
  const errors = {};
  if (full_name.length < 3 || full_name.length > 120) errors.full_name = 'Indica un nombre entre 3 y 120 caracteres.';
  if (!/^[0-9+ ()-]{7,20}$/.test(phone)) errors.phone = 'Indica un teléfono válido.';
  if (!districts.includes(district)) errors.district = 'Selecciona un distrito de Lima Norte.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Indica un correo válido.';
  if (password.length < 8 || password.length > 72) errors.password = 'La contraseña debe tener entre 8 y 72 caracteres.';
  return { valid: Object.keys(errors).length === 0, errors, value: { full_name, phone, district, email, password } };
}

export function validatePet(input) {
  const name = String(input.name ?? '').trim();
  const species = String(input.species ?? '').trim();
  const breed = String(input.breed ?? '').trim();
  const age_years = Number(input.age_years);
  const errors = {};
  if (name.length < 1 || name.length > 80) errors.name = 'Indica el nombre de la mascota.';
  if (!['Perro', 'Gato', 'Otro'].includes(species)) errors.species = 'Selecciona una especie.';
  if (breed.length > 80) errors.breed = 'La raza no puede superar 80 caracteres.';
  if (!Number.isFinite(age_years) || age_years < 0 || age_years > 40 ||
      !/^\d{1,2}(\.\d)?$/.test(String(input.age_years ?? ''))) errors.age_years = 'Indica una edad entre 0 y 40 años.';
  return { valid: Object.keys(errors).length === 0, errors,
    value: { name, species, breed: breed || null, age_years } };
}

export function safeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
