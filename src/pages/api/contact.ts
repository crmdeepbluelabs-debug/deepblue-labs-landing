export const prerender = false;
import type { APIRoute } from 'astro';

const required = (v?: string) => typeof v === 'string' && v.trim().length > 0;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.formData();

    // Honeypot (bots suelen llenarlo)
    const hp = String(body.get('company') || '');
    if (hp) return new Response(JSON.stringify({ ok: true }), { status: 200 });

    // Tiempo mínimo en página (otro simple filtro)
    const startedAt = Number(body.get('startedAt') || 0);
    if (!startedAt || Date.now() - startedAt < 3000) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429 });
    }

    const name = String(body.get('name') || '');
    const email = String(body.get('email') || '');
    const message = String(body.get('message') || '');
    const budget = String(body.get('budget') || 'No especificado');

    if (![name, email, message].every(required)) {
      return new Response(JSON.stringify({ error: 'missing_fields' }), { status: 400 });
    }

    const FORMSPARK_ID = import.meta.env.FORMSPARK_ID;
    if (!FORMSPARK_ID) {
      return new Response(JSON.stringify({ error: 'server_misconfigured' }), { status: 500 });
    }

    // Envío a Formspark (server-side para ocultar el ID)
    const res = await fetch(`https://submit-form.com/${FORMSPARK_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name, email, message, budget,
        source: 'DeepBlue Labs Landing',
        userAgent: request.headers.get('user-agent') || '',
      })
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'upstream_failed' }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: 'unknown' }), { status: 500 });
  }
};