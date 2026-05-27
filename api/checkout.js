const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// Preços completos: card (parcelado) e pix (à vista)
// Solo: setup apenas (mensal) ou setup + assinatura (anual)
// Business: setup apenas (mensal/anual)
const PRECOS = {
  // ── SOLO MENSAL (cobra só o setup) ──────────────────────────────────────
  'solo-start-mensal': { titulo:'OTTO Solo Start – Setup',  card:370,  pix:296  },
  'solo-pro-mensal':   { titulo:'OTTO Solo Pro – Setup',    card:670,  pix:536  },
  'solo-black-mensal': { titulo:'OTTO Solo Black – Setup',  card:870,  pix:696  },

  // ── SOLO ANUAL (setup + assinatura anual juntos) ─────────────────────────
  'solo-start-anual':  { titulo:'OTTO Solo Start – Anual',  card:2170, pix:2096 }, // 1800+370 / 1800+296
  'solo-pro-anual':    { titulo:'OTTO Solo Pro – Anual',    card:3550, pix:3416 }, // 2880+670 / 2880+536
  'solo-black-anual':  { titulo:'OTTO Solo Black – Anual',  card:5190, pix:5016 }, // 4320+870 / 4320+696

  // ── SOLO BLACK ANUAL COM BÔNUS (setup gratuito) ──────────────────────────
  'solo-black-anual-bonus': { titulo:'OTTO Solo Black – Anual (Bônus)', card:4320, pix:4320 },

  // ── BUSINESS MENSAL (setup) ───────────────────────────────────────────────
  'biz-one-mensal':    { titulo:'OTTO Business One – Setup',   card:1000, pix:800  },
  'biz-pro-mensal':    { titulo:'OTTO Business Pro – Setup',   card:1500, pix:1200 },
  'biz-prime-mensal':  { titulo:'OTTO Business Prime – Setup', card:2500, pix:2000 },

  // ── BUSINESS ANUAL ────────────────────────────────────────────────────────
  'biz-one-anual':     { titulo:'OTTO Business One – Anual',   card:5320, pix:5120 }, // 4320+1000 / 4320+800
  'biz-pro-anual':     { titulo:'OTTO Business Pro – Anual',   card:8700, pix:8400 }, // 7200+1500 / 7200+1200
  'biz-prime-anual':   { titulo:'OTTO Business Prime – Anual', card:14020,pix:13520}, // 11520+2500 / 11520+2000
};

const BUMPS = {
  pralink:    { titulo:'PraLink',               preco:444  }, // 12×R$37
  site:       { titulo:'Site de Corretor',      preco:660  }, // 12×R$55
  manutencao: { titulo:'Manutenção do Site',    preco:684  }, // R$57/mês×12
  prapage:    { titulo:'PraPage (por unidade)', preco:444  }, // 12×R$37/un
};

function sendJson(res, status, payload) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json(payload);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return sendJson(res, 405, { erro: 'Método não permitido' });

  try {
    let bodyParsed = req.body || {};
    if (typeof bodyParsed === 'string') {
      try { bodyParsed = JSON.parse(bodyParsed); } catch { bodyParsed = {}; }
    }

    const { plano, tipo = 'card', bumps = [], quantidade = 1, bonus = false } = bodyParsed;
    console.log('[OTTO] body recebido:', JSON.stringify({ plano, tipo, bumps, bonus }));

    // Resolve chave correta (bonus no Black anual)
    const chave = (plano === 'solo-black-anual' && bonus) ? 'solo-black-anual-bonus' : plano;
    const config = PRECOS[chave];
    if (!config) return sendJson(res, 400, { erro: `Plano inválido: ${plano}` });

    // Valor base conforme tipo de pagamento
    const valorBase = tipo === 'pix' ? config.pix : config.card;

    const items = [{
      id: chave,
      title: config.titulo,
      quantity: 1,
      unit_price: valorBase,
      currency_id: 'BRL'
    }];

    // Adiciona bumps
    for (const bump of bumps) {
      const b = BUMPS[bump];
      if (!b) continue;
      const qty = bump === 'prapage' ? Number(quantidade) || 1 : 1;
      items.push({
        id: bump,
        title: b.titulo,
        quantity: qty,
        unit_price: b.preco,
        currency_id: 'BRL'
      });
    }

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items,
        back_urls: {
          success: 'https://otto2-six.vercel.app/obrigado.html',
          failure:  'https://otto2-six.vercel.app/erro.html',
          pending:  'https://otto2-six.vercel.app/aguardando.html'
        },
        auto_return: 'approved',
        notification_url: 'https://otto2-six.vercel.app/api/webhook',
        statement_descriptor: 'OTTO AGAPE',
        external_reference: `${chave}-${tipo}-${Date.now()}`
      }
    });

    const initPoint = result?.init_point || result?.response?.init_point;
    if (!initPoint) throw new Error('init_point não retornado pelo MP');

    return sendJson(res, 200, { url: initPoint });

  } catch (err) {
    console.error('Erro MP:', err);
    return sendJson(res, 500, { erro: 'Erro ao gerar link de pagamento' });
  }
};
