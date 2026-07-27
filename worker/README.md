# Proxy Gemini (Cloudflare Worker)

Este Worker é o intermediário seguro entre o site e a API do Gemini.
A chave da API fica guardada como **secret** no Cloudflare e **nunca** é
enviada para o navegador.

```
Site (proh.media)  ──POST { niche }──►  Worker  ──+ chave──►  Gemini
                   ◄── { resultado, valor } ──────────────────┘
```

---

## Como publicar (opção fácil: painel do Cloudflare)

1. Acesse **dash.cloudflare.com** → menu **Workers & Pages** → **Create** → **Create Worker**.
2. Dê o nome `proh-gemini-proxy` e clique em **Deploy** (cria um Worker vazio).
3. Clique em **Edit code**, apague o conteúdo e cole todo o arquivo
   [`src/index.js`](src/index.js). Clique em **Deploy**.
4. Abra o Worker → **Settings** → **Variables and Secrets** → **Add**:
   - Tipo: **Secret**
   - Nome: `GEMINI_API_KEY`
   - Valor: **sua chave do Gemini** (cole aqui, no painel — só você vê)
   - Salve e faça **Deploy** de novo.
5. Copie a URL do Worker (algo como
   `https://proh-gemini-proxy.SEU-SUBDOMINIO.workers.dev`).

## Como publicar (opção linha de comando: wrangler)

Dentro da pasta `worker/`:

```bash
npx wrangler login
npx wrangler secret put GEMINI_API_KEY   # cole a chave quando pedir
npx wrangler deploy
```

---

## Ligar o site ao proxy

Com a URL do Worker em mãos, defina a variável de ambiente do **site**:

- **Desenvolvimento** (arquivo `.env.local` na raiz do projeto):
  ```
  VITE_GEMINI_PROXY_URL=https://proh-gemini-proxy.SEU-SUBDOMINIO.workers.dev
  ```
- **Produção (Hostinger)**: adicione a mesma variável `VITE_GEMINI_PROXY_URL`
  nas *variáveis de ambiente do build* do deploy, e publique de novo.

## Segurança

- A chave só existe no Cloudflare (secret). Não vai para o Git nem para o site.
- O Worker só aceita requisições dos domínios listados em `ALLOWED_ORIGINS`
  (dentro de `src/index.js`). Ajuste essa lista se o domínio mudar.
- Recomendado: no Google, limite a **cota** da chave para evitar surpresas.
