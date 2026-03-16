export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nombre, correo, pass, rol, ph } = req.body;

  const SUPA_URL = process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  const authRes = await fetch(`${SUPA_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: correo,
      password: pass,
      email_confirm: true
    })
  });

  const authData = await authRes.json();
  if (!authRes.ok) {
    return res.status(400).json({ error: authData.message });
  }

  await fetch(`${SUPA_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({
      id: authData.id,
      nombre,
      rol,
      ph: ph || null,
      activo: true
    })
  });

  return res.status(200).json({ ok: true, id: authData.id });
}