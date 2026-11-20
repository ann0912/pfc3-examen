const sessionKey = 'lima-norte-auth-v1';

export function createClient(config, fetcher = globalThis.fetch, storage = globalThis.sessionStorage) {
  const url = String(config?.url || '').replace(/\/$/, '');
  const key = String(config?.key || '');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !key) {
    throw new Error('La conexión pública con Supabase no está configurada.');
  }
  let session;
  try { session = JSON.parse(storage.getItem(sessionKey) || 'null'); } catch { session = null; }

  async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
    const response = await fetcher(`${url}${path}`, {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${auth && session?.access_token ? session.access_token : key}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const message = response.status === 401 ? 'La sesión expiró. Inicia sesión de nuevo.'
        : response.status === 403 ? 'No tienes permiso para realizar esta operación.'
        : data.msg || data.message || data.error_description || `Error del servicio (${response.status}).`;
      throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
  }

  function saveSession(value) {
    session = value?.access_token ? {
      access_token: value.access_token, refresh_token: value.refresh_token,
      expires_at: value.expires_at || Math.floor(Date.now() / 1000) + (value.expires_in || 3600),
      user: value.user
    } : null;
    if (session) storage.setItem(sessionKey, JSON.stringify(session));
    else storage.removeItem(sessionKey);
    return session;
  }

  async function ensureSession() {
    if (!session) return null;
    if (session.expires_at <= Math.floor(Date.now() / 1000) + 60) {
      try {
        const value = await request('/auth/v1/token?grant_type=refresh_token', {
          method: 'POST', body: { refresh_token: session.refresh_token }, auth: false
        });
        saveSession(value);
      } catch { saveSession(null); return null; }
    }
    return session;
  }

  async function table(name, query = '', options = {}) {
    await ensureSession();
    if (!session) throw new Error('Inicia sesión para continuar.');
    return request(`/rest/v1/${name}${query}`, options);
  }

  function userId() {
    if (!session?.user?.id) throw new Error('Inicia sesión para continuar.');
    return encodeURIComponent(session.user.id);
  }

  return {
    get user() { return session?.user || null; },
    async restore() {
      await ensureSession();
      if (!session) return null;
      try {
        session.user = await request('/auth/v1/user');
        saveSession(session);
        return session.user;
      } catch { saveSession(null); return null; }
    },
    async signUp({ full_name, phone, district, email, password }) {
      const result = await request('/auth/v1/signup', {
        method: 'POST', auth: false,
        body: { email, password, data: { full_name, phone, district } }
      });
      if (result.access_token) saveSession(result);
      return result;
    },
    async signIn(email, password) {
      const result = await request('/auth/v1/token?grant_type=password', {
        method: 'POST', auth: false, body: { email, password }
      });
      saveSession(result);
      return session.user;
    },
    async signOut() {
      if (session) await request('/auth/v1/logout', { method: 'POST' }).catch(() => {});
      saveSession(null);
    },
    async resetPassword(email) {
      return request('/auth/v1/recover', { method: 'POST', auth: false, body: { email } });
    },
    async profile() {
      const rows = await table('profiles', `?id=eq.${userId()}&select=id,full_name,phone,district&limit=1`);
      return rows[0] || null;
    },
    async role() {
      const rows = await table('municipal_roles', `?user_id=eq.${userId()}&select=role&limit=1`);
      return rows[0]?.role || 'ciudadano';
    },
    async pets() { return table('pets', '?select=id,name,species,breed,age_years,created_at&order=created_at.desc'); },
    async createPet(value) {
      const rows = await table('pets', '', { method: 'POST', body: value, headers: { Prefer: 'return=representation' } });
      return rows[0];
    },
    async updatePet(id, value) {
      const rows = await table('pets', `?id=eq.${encodeURIComponent(id)}&select=id,name,species,breed,age_years`, {
        method: 'PATCH', body: value, headers: { Prefer: 'return=representation' }
      });
      if (!rows.length) throw new Error('No tienes permiso para modificar esta mascota.');
      return rows[0];
    },
    async createReport(value) {
      const rows = await table('critical_reports', '?select=id,code,status,created_at,district,category,reference,description', {
        method: 'POST', body: value, headers: { Prefer: 'return=representation' }
      });
      return rows[0];
    },
    async myReports() {
      return table('critical_reports', `?owner_id=eq.${userId()}&select=id,code,district,category,reference,description,status,created_at,latitude,longitude&order=created_at.desc`);
    },
    async publicLocations() {
      return request('/rest/v1/public_report_locations?select=id,code,district,category,reference,status,latitude,longitude,created_at&order=created_at.desc&limit=500', { auth: false });
    },
    async municipalReports() {
      return table('critical_reports', '?select=id,code,district,category,reference,description,status,created_at,latitude,longitude&order=created_at.desc&limit=500');
    },
    async municipalUsers() {
      return table('profiles', '?select=id,email,full_name,district&order=full_name.asc');
    },
    async municipalRoles() {
      return table('municipal_roles', '?select=user_id,role');
    },
    async assignRole(user_id, role) {
      const rows = await table('municipal_roles', '?on_conflict=user_id', {
        method: 'POST', body: { user_id, role },
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' }
      });
      return rows[0];
    },
    async assignments() {
      return table('report_assignments', '?select=report_id,fiscalizador_id,assigned_at&order=assigned_at.desc');
    },
    async assignReport(report_id, fiscalizador_id) {
      const rows = await table('report_assignments', '?on_conflict=report_id', {
        method: 'POST', body: { report_id, fiscalizador_id },
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' }
      });
      return rows[0];
    },
    async createInspection(report_id, observations, actions) {
      const rows = await table('inspections', '', {
        method: 'POST', body: { report_id, observations, actions },
        headers: { Prefer: 'return=representation' }
      });
      return rows[0];
    },
    async inspections(report_id) {
      return table('inspections', `?report_id=eq.${encodeURIComponent(report_id)}&select=id,observations,actions,inspected_at,fiscalizador_id&order=inspected_at.desc`);
    },
    async changeStatus(id, status) {
      const rows = await table('critical_reports', `?id=eq.${encodeURIComponent(id)}&select=id,status`, {
        method: 'PATCH', body: { status }, headers: { Prefer: 'return=representation' }
      });
      if (!rows.length) throw new Error('No tienes permiso para cambiar este reporte.');
      return rows[0];
    },
    async statusHistory(report_id) {
      return table('report_status_history', `?report_id=eq.${encodeURIComponent(report_id)}&select=previous_status,new_status,changed_at&order=changed_at.desc`);
    },
    async notifications() {
      return table('notifications', '?select=id,report_id,message,read_at,created_at&order=created_at.desc&limit=100');
    },
    async markNotificationRead(id) {
      const rows = await table('notifications', `?id=eq.${encodeURIComponent(id)}&select=id,read_at`, {
        method: 'PATCH', body: { read_at: new Date().toISOString() }, headers: { Prefer: 'return=representation' }
      });
      if (!rows.length) throw new Error('No puedes modificar esta notificación.');
      return rows[0];
    },
    async uploadPhoto(report_id, file) {
      await ensureSession();
      if (!session) throw new Error('Inicia sesión para adjuntar fotografías.');
      if (file.size < 1 || file.size > 5242880 || !['image/jpeg','image/png','image/webp'].includes(file.type))
        throw new Error('Elige una imagen JPEG, PNG o WebP de máximo 5 MB.');
      const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
      const isJpeg = file.type === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      const isPng = file.type === 'image/png' && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
      const isWebp = file.type === 'image/webp' && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
      if (!isJpeg && !isPng && !isWebp) throw new Error('El contenido no coincide con una imagen permitida.');
      const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
      const object_path = `${session.user.id}/${report_id}/${globalThis.crypto.randomUUID()}.${extension}`;
      const upload = await fetcher(`${url}/storage/v1/object/report-evidence/${object_path}`, {
        method: 'POST', headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': file.type }, body: file
      });
      if (!upload.ok) throw new Error(`No se pudo cargar la imagen (${upload.status}).`);
      const rows = await table('report_photos', '', {
        method: 'POST', body: { report_id, object_path, mime_type: file.type, size_bytes: file.size },
        headers: { Prefer: 'return=representation' }
      });
      return rows[0];
    },
    async photos(report_id) {
      return table('report_photos', `?report_id=eq.${encodeURIComponent(report_id)}&select=id,object_path,mime_type,created_at&order=created_at.desc`);
    },
    async signedPhotoUrl(object_path) {
      await ensureSession();
      if (!session) throw new Error('Inicia sesión para ver la fotografía.');
      const result = await request(`/storage/v1/object/sign/report-evidence/${object_path}`, {
        method: 'POST', body: { expiresIn: 300 }
      });
      return `${url}/storage/v1${result.signedURL}`;
    }
  };
}
