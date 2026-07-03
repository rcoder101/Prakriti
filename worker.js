// OllieWise.com worker: serves the static site and handles waitlist signups.
// POST /api/waitlist  { email }  ->  stored in D1 (binding: DB), welcome
// email sent via Resend (secret: RESEND_API_KEY).

const WELCOME_FROM = 'Ollie at OllieWise <hello@olliewise.com>';
const WELCOME_SUBJECT = "You're in the nest";
const WELCOME_HTML = `
<div style="background:#FAF6EF; padding:32px 16px; font-family:-apple-system,'Segoe UI',sans-serif; color:#3A2E28;">
  <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:20px; padding:32px;">
    <h1 style="font-size:22px; margin:0 0 16px;">You're in the nest 🪺</h1>
    <p style="line-height:1.6; margin:0 0 14px;">
      Thanks for joining the OllieWise waitlist. We're welcoming a small
      group of early users soon, and you're on the list &mdash; Ollie will
      hoot the moment it's your turn.
    </p>
    <p style="line-height:1.6; margin:0 0 14px;">
      Until then, one small thing you can start tomorrow: a glass of warm
      water when you wake, 45 minutes before your coffee. It's the first
      habit Ollie gives almost everyone.
    </p>
    <p style="line-height:1.6; margin:0 0 20px;">Talk soon,<br>Ollie 🦉</p>
    <p style="font-size:12px; color:#7A6E68; margin:0;">
      You'll get one email when the doors open &mdash; that's it. To leave
      the nest, just reply and say so.
    </p>
  </div>
</div>`;

async function sendWelcome(env, email) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: WELCOME_FROM,
        to: email,
        subject: WELCOME_SUBJECT,
        html: WELCOME_HTML,
      }),
    });
  } catch (e) {
    // Never let a failed email break the signup itself.
  }
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/waitlist' && request.method === 'POST') {
      let email = '';
      let honeypot = '';
      try {
        const form = await request.formData();
        email = String(form.get('email') || '').trim().toLowerCase();
        honeypot = String(form.get('nickname') || '');
      } catch {
        return json(400, { ok: false, error: 'bad request' });
      }

      // Bots love filling hidden fields; humans never see it.
      if (honeypot) return json(200, { ok: true });

      // Light validation — the real gate is the double-opt-in email later.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
        return json(400, { ok: false, error: 'invalid email' });
      }

      let inserted = false;
      try {
        const res = await env.DB.prepare(
          'INSERT OR IGNORE INTO waitlist (email) VALUES (?)'
        ).bind(email).run();
        inserted = res.meta.changes > 0;
      } catch (e) {
        return json(500, { ok: false, error: 'storage error' });
      }
      // Welcome email only on first signup (not on repeat submissions),
      // sent after the response so the visitor never waits on it.
      if (inserted && env.RESEND_API_KEY) {
        ctx.waitUntil(sendWelcome(env, email));
      }
      return json(200, { ok: true });
    }

    // Everything else: the static site.
    return env.ASSETS.fetch(request);
  },
};
