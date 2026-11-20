const storageKey = 'lima-norte-reportes-demo-v1';

export function createRepository(config, storage = globalThis.localStorage, fetcher = globalThis.fetch) {
  const url = String(config?.url || '').replace(/\/$/, '');
  const key = String(config?.key || '');
  const remote = Boolean(url && key);
  const endpoint = `${url}/rest/v1/critical_reports`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  async function request(path, options = {}) {
    const response = await fetcher(endpoint + path, { ...options, headers: { ...headers, ...options.headers } });
    if (!response.ok) throw new Error(`El servicio no respondió correctamente (${response.status}).`);
    return response.json();
  }

  return {
    mode: remote ? 'supabase' : 'demo-local',
    async list() {
      if (remote) return request('?select=id,district,category,reference,description,status,created_at&order=created_at.desc&limit=50');
      try { return JSON.parse(storage.getItem(storageKey) || '[]'); } catch { return []; }
    },
    async create(value) {
      if (remote) return (await request('', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(value) }))[0];
      const item = { ...value, id: globalThis.crypto.randomUUID(), status: 'Pendiente', created_at: new Date().toISOString() };
      const items = await this.list();
      storage.setItem(storageKey, JSON.stringify([item, ...items]));
      return item;
    }
  };
}
