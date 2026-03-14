export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { nombre, correo, pass, rol, ph } = await req.json();

  const SUPA_URL = process.env.SUPA_URL;
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
    return new Response(JSON.stringify({ error: authData.message }), { status: 400 });
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

  return new Response(JSON.stringify({ ok: true, id: authData.id }), { status: 200 });
};

export const config = { path: "/api/crear-usuario" };