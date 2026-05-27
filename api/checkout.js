const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const PRECOS = {
  // SOLO
  'solo-start-mensal':  { titulo: 'OTTO Solo Start – Mensal',  setup: 297,  parcelas: null  },
  'solo-start-anual':   { titulo: 'OTTO Solo Start – Anual',   setup: 1800, parcelas: 12    },
  'solo-pro-mensal':    { titulo: 'OTTO Solo Pro – Mensal',     setup: 537,  parcelas: null  },
  'solo-pro-anual':     { titulo: 'OTTO Solo Pro – Anual',      setup: 2880, parcelas: 12    },
  'solo-black-mensal':  { titulo: 'OTTO Solo Black – Mensal',   setup: 697,  parcelas: null  },
  'solo-black-anual':   { titulo: 'OTTO Solo Black – Anual',    setup: 4320, parcelas: 12    },
  // BUSINESS
  'biz-one-mensal':     { titulo: 'OTTO Business One – Mensal', setup: 397,  parcelas: null  },
  'biz-one-anual':      { titulo: 'OTTO Business One – Anual',  setup: 397,  parcelas: null  },
  'biz-pro-mensal':     { titulo: 'OTTO Business Pro – Mensal', setup: 637,  parcelas: null  },
  'biz-pro-anual':      { titulo: 'OTTO Business Pro – Anual',  setup: 797,  parcelas: null  },
  'biz-prime-anual':    { titulo: 'OTTO Business Prime – Anual',setup: 11520,parcelas: 12    },
};

const BUMPS = {
  pralink:     { titulo: 'PraLink',              preco: 444  },
  site:        { titulo: 'Site de Corretor',     preco: 660  },
  manutencao:  { titulo: 'Manutenção do Site',   preco: 684  },
  prapage:     { titulo: 'PraPage (por unidade)', preco: 444  },
};

function sendJson(res, status, payload) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json(payload);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { erro: 'Método não permitido' });
  }

  try {
    let bodyParsed = req.body || {};
    if (typeof bodyParsed === 'string') {
      try { bodyParsed = JSON.parse(bodyParsed); } catch { bodyParsed = {}; }
    }
    const { plano, bumps = [], quantidade = 1 } = bodyParsed;
    const config = PRECOS[plano];

    if (!config) {
      return sendJson(res, 400, { erro: 'Plano inválido' });
    }

    const items = [
      {
        id: plano,
        title: config.titulo,
        quantity: 1,
        unit_price: config.setup,
        currency_id: 'BRL'
      }
    ];

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
          failure: 'https://otto2-six.vercel.app/erro.html',
          pending: 'https://otto2-six.vercel.app/pendente.html'
        },
        auto_return: 'approved',
        notification_url: 'https://otto2-six.vercel.app/api/webhook',
        statement_descriptor: 'OTTO AGAPE',
        external_reference: `${plano}-${Date.now()}`
      }
    });

    const initPoint = result?.init_point || result?.response?.init_point;
    if (!initPoint) {
      throw new Error('Não foi possível gerar o link de pagamento');
    }

    return sendJson(res, 200, { url: initPoint });
  } catch (err) {
    console.error('Erro MP:', err);
    return sendJson(res, 500, { erro: 'Erro ao gerar link de pagamento' });
  }
};
