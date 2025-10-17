// Vercel Serverless Function (paket yok)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  try {
    const { name, email, message } = await readJson(req);
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Berliva Tax <onboarding@resend.dev>', // domain doğrulanınca info@berliva-tax.com
        to: ['berliva-tax@outlook.de'],
        reply_to: email,
        subject: `İletişim Formu · ${name}`,
        html: `
          <h2>Yeni Mesaj</h2>
          <p><b>İsim:</b> ${escapeHtml(name)}</p>
          <p><b>E-posta:</b> ${escapeHtml(email)}</p>
          <p><b>Mesaj:</b><br>${escapeHtml(String(message)).replace(/\n/g,'<br>')}</p>
        `
      })
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ error: 'Resend error', detail: t });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}

// helpers
async function readJson(req){
  if (req.body && typeof req.body === 'object') return req.body;
  const bufs = []; for await (const ch of req) bufs.push(ch);
  return JSON.parse(Buffer.concat(bufs).toString() || '{}');
}
function escapeHtml(s){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
