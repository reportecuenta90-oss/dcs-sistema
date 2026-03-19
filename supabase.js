import { createClient } from "@supabase/supabase-js";

// ── Supabase cliente ──────────────────────────────────────────────────────────
export const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseAuth = createClient(SUPA_URL, SUPA_KEY);

// ── Timeout helper — si Supabase no responde en 10s, falla limpio ─────────────
function conTimeout(promesa, ms = 10000) {
  return Promise.race([
    promesa,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Tiempo de espera agotado")), ms)
    ),
  ]);
}

export const supa = {
  _h: {
    "Content-Type": "application/json",
    "apikey": SUPA_KEY,
    "Authorization": "Bearer " + SUPA_KEY,
  },

  async get(table, params = "") {
    try {
      const r = await conTimeout(
        fetch(`${SUPA_URL}/rest/v1/${table}?${params}`, { headers: this._h })
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn(`[supa.get] ${table}:`, e.message);
      return null; // null = fallo, [] = vacío pero OK
    }
  },

  async post(table, body) {
    try {
      const r = await conTimeout(
        fetch(`${SUPA_URL}/rest/v1/${table}`, {
          method: "POST",
          headers: { ...this._h, "Prefer": "return=representation" },
          body: JSON.stringify(body),
        })
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      return Array.isArray(d) ? d[0] : d;
    } catch (e) {
      console.warn(`[supa.post] ${table}:`, e.message);
      return null;
    }
  },

  async patch(table, id, body) {
    try {
      const r = await conTimeout(
        fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
          method: "PATCH",
          headers: { ...this._h, "Prefer": "return=representation" },
          body: JSON.stringify(body),
        })
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      return Array.isArray(d) ? d[0] : d;
    } catch (e) {
      console.warn(`[supa.patch] ${table}:`, e.message);
      return null;
    }
  },

  async delete(table, id) {
    try {
      const r = await conTimeout(
        fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
          method: "DELETE",
          headers: this._h,
        })
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    } catch (e) {
      console.warn(`[supa.delete] ${table}:`, e.message);
    }
  },

  // Polling cada 8s como alternativa a websockets
  sub(table, cb) {
    const iv = setInterval(async () => {
      const d = await this.get(table, "order=id.desc&limit=100");
      if (d !== null) cb(d); // solo actualiza si la llamada fue exitosa
    }, 8000);
    return () => clearInterval(iv);
  },
};
