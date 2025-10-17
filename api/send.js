// /api/send.js
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Domain'i Resend > Domains altında doğrulayana kadar onboarding kullan.
    const FROM = 'Berliva Tax <onboarding@resend.dev>'; // doğrulayınca: 'Berliva Tax <info@berliva-tax.com>'

    await resend.emails.send({
      from: FROM,
      to: 'berliva-tax@outlook.de',
      reply_to: email,
      subject: `İletişim Formu · ${name}`,
      html: `
        <h2>Yeni Mesaj</h2>
        <p><b>İsim:</b> ${name}</p>
        <p><b>E-posta:</b> ${email}</p>
        <p><b>Mesaj:</b></p>
        <p>${(message || '').replace(/\n/g,'<br>')}</p>
      `
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Mail gönderilemedi' });
  }
}
