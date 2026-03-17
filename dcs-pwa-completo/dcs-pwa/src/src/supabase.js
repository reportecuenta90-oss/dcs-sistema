import { createClient } from "@supabase/supabase-js";

// ── Supabase cliente ──────────────────────────────────────────────────────────
export const SUPA_URL = "https://irldxqsbfczabbvdjnkg.supabase.co";
export const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlybGR4cXNiZmN6YWJidmRqbmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzk0NTgsImV4cCI6MjA4ODY1NTQ1OH0.OHghV0zicn6wIsOqcBuw3qu6pBTkBy5o50mXkSHTmb0";

export const supabaseAuth = createClient(SUPA_URL, SUPA_KEY);

export const supa = {
  _h: { "Content-Type": "application/json", "apikey": SUPA_KEY, "Authorization": "Bearer " + SUPA_KEY },

  async get(table, params = "") {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}`, { headers: this._h });
    return r.ok ? r.json() : [];
  },

  async post(table, body) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...this._h, "Prefer": "return=representation" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    return Array.isArray(d) ? d[0] : d;
  },

  async patch(table, id, body) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...this._h, "Prefer": "return=representation" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    return Array.isArray(d) ? d[0] : d;
  },

  async delete(table, id) {
    await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: this._h,
    });
  },

  // Polling cada 8s como alternativa a websockets en entorno web simple
  sub(table, cb) {
    const iv = setInterval(async () => {
      const d = await this.get(table, "order=id.desc&limit=100");
      cb(d);
    }, 8000);
    return () => clearInterval(iv);
  },
};
