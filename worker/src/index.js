// Cloudflare Worker — proxy seguro para a API do Gemini.
//
// A chave da API fica no "secret" GEMINI_API_KEY (configurado no Cloudflare)
// e NUNCA é enviada para o navegador. O site chama este Worker; o Worker
// adiciona a chave e conversa com o Gemini.

// Domínios autorizados a usar o proxy (evita que outros sites usem sua cota).
const ALLOWED_ORIGINS = [
  'https://proh.media',
  'https://www.proh.media',
  'http://localhost:5173', // desenvolvimento local (Vite)
];

const MODEL = 'gemini-2.5-flash-preview-09-2025';

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(obj, status, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // Responde ao preflight do navegador.
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Método não permitido.' }, 405, cors);
    }

    // Bloqueia origens não autorizadas.
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return json({ error: 'Origem não autorizada.' }, 403, cors);
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: 'Chave da API não configurada no servidor.' }, 500, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Requisição inválida.' }, 400, cors);
    }

    const niche = (body.niche || '').toString().trim().slice(0, 200);
    if (!niche) {
      return json({ error: 'Informe o segmento do negócio.' }, 400, cors);
    }

    const prompt = `
      Você é um estrategista de marca sênior da agência PROH.
      A filosofia da PROH baseia-se em duas dimensões:
      1) "proPAGAR resultados" (performance, vendas, crescimento).
      2) "proPAGAR valor" (propósito, impacto humano, causas sociais).

      O usuário possui um negócio no seguinte segmento: "${niche}".

      Gere 2 ideias curtas e criativas para esta empresa, uma para cada dimensão da PROH.
      Formate a resposta estritamente como um objeto JSON válido com as seguintes propriedades:
      {
        "resultado": "Uma ideia de campanha focada em performance/vendas em até 25 palavras.",
        "valor": "Uma ideia de ação focada em impacto social/comunidade em até 25 palavras."
      }
      Não inclua marcação markdown no JSON, apenas o objeto.
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (!resp.ok) {
        return json({ error: 'Falha na comunicação com a IA.' }, 502, cors);
      }

      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return json({ error: 'Resposta vazia da IA.' }, 502, cors);
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return json({ error: 'Resposta da IA em formato inesperado.' }, 502, cors);
      }

      return json(parsed, 200, cors);
    } catch {
      return json({ error: 'Erro interno ao gerar a estratégia.' }, 500, cors);
    }
  },
};
