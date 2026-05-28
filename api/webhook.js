const crypto = require('crypto');

const ONBOARDING_LINK = 'https://wa.me/5511963798901?text=Ol%C3%A1%21+Acabei+de+contratar+o+OTTO+e+quero+iniciar+o+onboarding.'; // TEMPORÁRIO

async function enviarEmail(destinatario, nome, plano) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'OTTO Ágape <noreply@agapepublicacoes.com.br>',
      to: [destinatario],
      subject: '✅ Pagamento confirmado — Seu OTTO está chegando!',
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <!-- Logo -->
      <tr><td style="padding-bottom:32px;text-align:center;">
        <span style="font-size:28px;font-weight:800;color:#FF5A1F;letter-spacing:-.02em;">OTTO</span>
      </td></tr>

      <!-- Header -->
      <tr><td style="background:#111;border:1px solid #1e1e1e;border-radius:14px;padding:32px;margin-bottom:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,.12);border:2px solid rgba(34,197,94,.3);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <span style="font-size:28px;">✅</span>
          </div>
          <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;">Pagamento confirmado!</h1>
          <p style="color:#888;font-size:15px;margin:0;">Olá${nome ? ', <strong style="color:#fff">' + nome + '</strong>' : ''}! Seu <strong style="color:#FF5A1F">${plano || 'OTTO'}</strong> foi ativado.</p>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin:28px 0;">
          <a href="${ONBOARDING_LINK}" style="display:inline-block;background:#FF5A1F;color:#fff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:99px;text-decoration:none;">
            🚀 Iniciar meu onboarding
          </a>
        </div>
      </td></tr>

      <tr><td style="height:16px;"></td></tr>

      <!-- Passos -->
      <tr><td style="background:#111;border:1px solid #1e1e1e;border-radius:14px;padding:28px;">
        <p style="color:#FF5A1F;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0 0 20px;">Como funciona a implantação</p>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="width:32px;height:32px;border-radius:50%;background:rgba(255,90,31,.12);border:1px solid rgba(255,90,31,.3);text-align:center;vertical-align:middle;color:#FF5A1F;font-size:13px;font-weight:700;">1</td>
              <td style="padding-left:14px;"><strong style="color:#fff;font-size:14px;">Onboarding</strong><br><span style="color:#888;font-size:13px;">Clique no link acima e envie suas informações para iniciarmos.</span></td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="width:32px;height:32px;border-radius:50%;background:rgba(255,90,31,.12);border:1px solid rgba(255,90,31,.3);text-align:center;vertical-align:middle;color:#FF5A1F;font-size:13px;font-weight:700;">2</td>
              <td style="padding-left:14px;"><strong style="color:#fff;font-size:14px;">Briefing</strong><br><span style="color:#888;font-size:13px;">Nossa equipe agenda uma reunião para entender seu negócio.</span></td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="width:32px;height:32px;border-radius:50%;background:rgba(255,90,31,.12);border:1px solid rgba(255,90,31,.3);text-align:center;vertical-align:middle;color:#FF5A1F;font-size:13px;font-weight:700;">3</td>
              <td style="padding-left:14px;"><strong style="color:#fff;font-size:14px;">Configuração e testes</strong><br><span style="color:#888;font-size:13px;">Configuramos e testamos o OTTO — entrega em até 11 dias úteis.</span></td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:12px 0;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="width:32px;height:32px;border-radius:50%;background:rgba(255,90,31,.12);border:1px solid rgba(255,90,31,.3);text-align:center;vertical-align:middle;color:#FF5A1F;font-size:13px;font-weight:700;">4</td>
              <td style="padding-left:14px;"><strong style="color:#fff;font-size:14px;">OTTO no ar!</strong><br><span style="color:#888;font-size:13px;">Seu assistente atende leads 24h no WhatsApp. Assinatura ativa após a entrega.</span></td>
            </tr></table>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="height:16px;"></td></tr>

      <!-- Contato -->
      <tr><td style="background:#111;border:1px solid #1e1e1e;border-radius:14px;padding:20px 28px;">
        <p style="color:#888;font-size:13px;margin:0 0 12px;">Dúvidas? Fale com nossa equipe:</p>
        <p style="margin:0;">
          <a href="https://wa.me/5511963798901" style="color:#FF5A1F;text-decoration:none;font-size:13px;margin-right:20px;">📱 (11) 96379-8901</a>
          <a href="mailto:agi@grupoagape.com.br" style="color:#FF5A1F;text-decoration:none;font-size:13px;">✉️ agi@grupoagape.com.br</a>
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:24px 0;text-align:center;">
        <p style="color:#555;font-size:12px;margin:0;">© ${new Date().getFullYear()} Ágape Publicações — OTTO</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
    })
  });
  return res.ok;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    const { type, data } = body;

    // Só processa pagamentos aprovados
    if (type !== 'payment') return res.status(200).json({ ok: true });

    const paymentId = data?.id;
    if (!paymentId) return res.status(200).json({ ok: true });

    // Busca detalhes do pagamento no MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    const payment = await mpRes.json();

    if (payment.status !== 'approved') {
      console.log(`[WEBHOOK] Pagamento ${paymentId} status: ${payment.status} — ignorando`);
      return res.status(200).json({ ok: true });
    }

    // Extrai dados do pagador
    const email = payment.payer?.email;
    const nome  = payment.payer?.first_name || '';
    const plano = payment.additional_info?.items?.[0]?.title || 'OTTO';
    const ref   = payment.external_reference || '';

    console.log(`[WEBHOOK] Pagamento aprovado: ${paymentId} | ${email} | ${plano}`);

    if (email && !email.includes('test')) {
      const enviado = await enviarEmail(email, nome, plano);
      console.log(`[WEBHOOK] E-mail ${enviado ? 'enviado' : 'falhou'} para ${email}`);
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[WEBHOOK] Erro:', err);
    return res.status(200).json({ ok: true }); // sempre 200 para o MP não retentar
  }
};
