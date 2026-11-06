// OllieWise.com worker: serves the static site and handles waitlist signups.
// POST /api/waitlist  { email, phone? }  ->  stored in D1 (binding: DB), welcome
// email sent via Resend (secret: RESEND_API_KEY).

const WELCOME_FROM = 'Ollie at OllieWise <hello@olliewise.com>';
const WELCOME_SUBJECT = "You're in the nest";
const WELCOME_HTML = `
<div style="background:#FAF6EF; padding:32px 16px; font-family:-apple-system,'Segoe UI',sans-serif; color:#3A2E28;">
  <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:20px; padding:32px;">
    <h1 style="font-size:22px; margin:0 0 16px;">You're in the nest</h1>
    <p style="line-height:1.6; margin:0 0 14px;">
      Thank you for joining the OllieWise waitlist. We're welcoming a small
      group of early users soon, and you're on the list. Ollie will hoot
      when it's your turn.
    </p>
    <p style="line-height:1.6; margin:0 0 14px;">
      Until then, here is one small habit to start tomorrow: drink warm
      water soon after you wake. Warm, not hot.
    </p>
    <p style="line-height:1.6; margin:0 0 20px;">Talk soon,<br>Ollie</p>
    <p style="font-size:12px; color:#7A6E68; margin:0;">
      You'll get one email when the doors open, and no others. To leave
      the nest, reply and say so.
    </p>
  </div>
</div>`;

// ⭐ The beta is open (2026-11-06): the site invites people in rather than
// collecting a waitlist. iPhone people get the TestFlight link at once.
// Android people need their Gmail added to the Play tester list by hand, so
// they get a "coming within a day" note and the team gets an alert.
const TESTFLIGHT_LINK = 'https://testflight.apple.com/join/MwQbJQtA';
const TESTFLIGHT_APP = 'https://apps.apple.com/app/testflight/id899247664';
const TEAM_ALERT_TO = 'hello@olliewise.com';

function wrap(inner) {
  return `<div style="background:#FAF6EF; padding:32px 16px; font-family:-apple-system,'Segoe UI',sans-serif; color:#3A2E28;">
  <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:20px; padding:32px;">${inner}
    <p style="line-height:1.6; margin:0 0 20px;">Talk soon,<br>Ollie</p>
    <p style="font-size:12px; color:#7A6E68; margin:0;">You asked for an invite at olliewise.com. To leave the nest, reply and say so.</p>
  </div>
</div>`;
}
const P = (t) => `<p style="line-height:1.6; margin:0 0 14px;">${t}</p>`;

const IPHONE_SUBJECT = 'Your OllieWise invite';
const IPHONE_HTML = wrap(`
    <h1 style="font-size:22px; margin:0 0 16px;">Welcome to the nest</h1>
    ${P('Thank you for trying OllieWise. Open this email on your iPhone, then:')}
    ${P(`<strong>1.</strong> Install TestFlight, Apple's free app for trying new apps: <a href="${TESTFLIGHT_APP}" style="color:#3A2E28;">TestFlight</a>`)}
    ${P(`<strong>2.</strong> Tap your invite, then Accept and Install: <a href="${TESTFLIGHT_LINK}" style="color:#3A2E28;">Join the OllieWise beta</a>`)}
    ${P('<strong>3.</strong> Open OllieWise from your home screen and say hello to Ollie.')}
    ${P('Your honest feedback shapes OllieWise. Reply to this email any time.')}`);

const ANDROID_SUBJECT = 'Your OllieWise invite is coming';
const ANDROID_HTML = wrap(`
    <h1 style="font-size:22px; margin:0 0 16px;">Welcome to the nest</h1>
    ${P('Thank you for trying OllieWise on Android. Ollie is adding this Gmail address to the beta, and your invite link arrives by email within a day.')}
    ${P("Open the link on your Android phone while signed in with this same Gmail address. If you don't see our email, look in Promotions.")}
    ${P('Until then, here is one small habit to start tomorrow: drink warm water soon after you wake. Warm, not hot.')}`);

async function resendEmail(env, to, subject, html) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: WELCOME_FROM, to, subject, html }),
  });
}

async function sendWelcome(env, email, phone) {
  try {
    if (phone === 'iphone') {
      await resendEmail(env, email, IPHONE_SUBJECT, IPHONE_HTML);
    } else if (phone === 'android') {
      await resendEmail(env, email, ANDROID_SUBJECT, ANDROID_HTML);
      const safe = email.replace(/[<>&"]/g, '');
      await resendEmail(env, TEAM_ALERT_TO, `New Android tester: ${safe}`,
        `<p>Add <strong>${safe}</strong> to First Wave in Play Console (Internal testing, Testers), then send the Android invite.</p>`);
    } else {
      await resendEmail(env, email, WELCOME_SUBJECT, WELCOME_HTML);
    }
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
      let phone = '';
      let honeypot = '';
      try {
        const form = await request.formData();
        email = String(form.get('email') || '').trim().toLowerCase();
        phone = String(form.get('phone') || '').trim().toLowerCase();
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

      // Which phone they use is optional and only ever one of two values.
      if (phone !== 'iphone' && phone !== 'android') phone = '';

      let inserted = false;
      try {
        const res = await env.DB.prepare(
          'INSERT OR IGNORE INTO waitlist (email) VALUES (?)'
        ).bind(email).run();
        inserted = res.meta.changes > 0;
      } catch (e) {
        return json(500, { ok: false, error: 'storage error' });
      }
      // The phone is saved in a second step, so a problem here can never
      // lose a signup. The column is added the first time it is needed.
      if (phone) {
        const savePhone = () => env.DB.prepare(
          "UPDATE waitlist SET phone = ? WHERE email = ? AND (phone IS NULL OR phone = '')"
        ).bind(phone, email).run();
        try {
          await savePhone();
        } catch (e) {
          try {
            await env.DB.prepare('ALTER TABLE waitlist ADD COLUMN phone TEXT').run();
            await savePhone();
          } catch (e2) {
            // Leave the signup as it is: email saved, phone not recorded.
          }
        }
      }
      // The invite goes out on a first signup, and also to an earlier
      // waitlist signup who comes back and picks a phone (2026-11-06), sent
      // after the response so the visitor never waits on it.
      if ((inserted || phone) && env.RESEND_API_KEY) {
        ctx.waitUntil(sendWelcome(env, email, phone));
      }
      return json(200, { ok: true, already: !inserted });
    }

    // Everything else: the static site.
    return env.ASSETS.fetch(request);
  },
};
