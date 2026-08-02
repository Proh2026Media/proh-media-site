# Evolution API na VPS — roteiro de instalação

Recebe os leads do formulário do site pelo WhatsApp, sem passar pela Meta.
A conexão é por QR Code, como o WhatsApp Web.

**Antes de começar:** contrate a VPS (KVM 1 basta), escolha **Ubuntu 24.04**
e o datacenter de **São Paulo**. Anote o IP que a Hostinger mostrar.

---

## 1. Apontar o subdomínio

No painel onde fica o DNS de `proh.media`, crie um registro:

| Tipo | Nome | Valor |
|---|---|---|
| A | `api` | IP da sua VPS |

Isso cria `api.proh.media`. A propagação leva de alguns minutos a uma hora —
o passo 5 só funciona depois que ela terminar.

Para conferir se já propagou, no seu Mac:

```bash
dig +short api.proh.media
```

Quando responder o IP da VPS, pode seguir.

---

## 2. Entrar na VPS

No terminal do seu Mac (troque pelo IP real):

```bash
ssh root@SEU_IP
```

Na primeira vez ele pergunta se confia no servidor — responda `yes` e digite
a senha que você definiu na Hostinger.

---

## 3. Instalar o Docker

Se você escolheu o template com Docker, pule para o passo 4. Senão:

```bash
curl -fsSL https://get.docker.com | sh
```

Confirme que ficou de pé:

```bash
docker --version && docker compose version
```

---

## 4. Subir os arquivos

Ainda na VPS, crie a pasta:

```bash
mkdir -p /opt/evolution && cd /opt/evolution
```

Agora, **em outro terminal do seu Mac** (não feche o da VPS), envie os três
arquivos desta pasta:

```bash
cd "/Users/alysonviana/Downloads/PROH Media Site/infra/evolution"
scp docker-compose.yml Caddyfile .env.exemplo root@SEU_IP:/opt/evolution/
```

---

## 5. Configurar as senhas

De volta ao terminal da VPS:

```bash
cd /opt/evolution
cp .env.exemplo .env

# Gera as duas chaves — copie cada uma, você vai colar no arquivo:
echo "API_KEY:  $(openssl rand -hex 32)"
echo "SENHA DB: $(openssl rand -hex 24)"

nano .env
```

No editor, substitua os valores de `API_KEY` e `POSTGRES_PASSWORD` pelos que
acabou de gerar. Para salvar: `Ctrl+O`, `Enter`, depois `Ctrl+X`.

**Guarde a `API_KEY`** — ela é o que o site vai usar para falar com a API.

---

## 6. Ligar tudo

```bash
docker compose up -d
```

Na primeira vez ele baixa as imagens (uns 2 minutos). Depois confira:

```bash
docker compose ps
```

Os quatro serviços devem aparecer como `running`. Se algum estiver
reiniciando, veja o motivo com `docker compose logs evolution`.

---

## 7. Testar

Do seu Mac (troque pela sua chave):

```bash
curl -s https://api.proh.media/ -H "apikey: SUA_API_KEY"
```

Deve responder um JSON com a versão da Evolution. Se der erro de
certificado, o DNS ainda não propagou — espere e tente de novo.

---

## 8. Criar a instância e ler o QR Code

```bash
curl -s -X POST https://api.proh.media/instance/create \
  -H "apikey: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"proh","integration":"WHATSAPP-BAILEYS","qrcode":true}'
```

A resposta traz o QR Code em base64. Para escaneá-lo com conforto, abra o
painel por um túnel SSH — no seu Mac:

```bash
ssh -L 8080:localhost:8080 root@SEU_IP -N
```

Deixe esse terminal aberto e acesse no navegador:
`http://localhost:8080/manager` (a chave é a `API_KEY`).

No celular: **WhatsApp → Configurações → Aparelhos conectados → Conectar
aparelho** e aponte para o QR.

> Conecte o **19 99198-7721**, não o número principal da agência.

---

## 9. Ligar ao site

No Gerenciador de Arquivos da Hostinger, na pasta do domínio (o nível acima
de `public_html`, onde já está o `gemini_key.txt`), crie
`whatsapp_config.json`:

```json
{
  "provedor": "evolution",
  "destino": "5519995951316",
  "evolution": {
    "url": "https://api.proh.media",
    "instancia": "proh",
    "apikey": "SUA_API_KEY"
  }
}
```

O `destino` é quem **recebe** o aviso — precisa ser diferente do número
conectado no passo 8.

Pronto: envie o formulário no site e a mensagem deve chegar em segundos.

---

## Manutenção

```bash
cd /opt/evolution

docker compose logs -f evolution   # acompanhar o que está acontecendo
docker compose restart evolution   # reiniciar após alguma falha
docker compose pull && docker compose up -d   # atualizar versões
```

**Se a sessão cair** (troca de celular, WhatsApp Web deslogado), é só repetir
o passo 8 para gerar um QR novo. Enquanto isso, o formulário do site continua
funcionando: ele volta sozinho para o `wa.me` quando a API não responde.
