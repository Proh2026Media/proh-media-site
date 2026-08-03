<?php
// ============================================================================
// Aviso de lead no WhatsApp — via API não-oficial (conexão por QR Code).
//
// Não passa pela Meta: sem verificação comercial, sem template aprovado e sem
// janela de 24h. A mensagem vai como texto livre.
//
// AS CREDENCIAIS NÃO ficam neste arquivo nem no repositório.
// COMO CONFIGURAR (Gerenciador de Arquivos da Hostinger, na pasta do domínio
// — o nível ACIMA de public_html, onde já está o gemini_key.txt):
//
//   Crie/edite  whatsapp_config.json  conforme o serviço contratado.
//
//   WAME API (https://api-wa.me):
//     {
//       "provedor": "wame",
//       "destino":  "5519995951316",
//       "wame": {
//         "key": "SUA_CHAVE_DE_INSTANCIA"
//       }
//     }
//     (a chave aparece no painel da WAME; ela vai na própria URL, que é
//      como a API autentica. Opcionalmente aceita "url" para trocar o
//      servidor — o padrão é https://us.api-wa.me)
//
//   VÁRIOS DESTINOS: o "destino" também aceita uma lista. Cada um recebe
//   sua própria cópia do aviso; um que falhe não impede os demais.
//     "destino": ["5519995951316", "5519991234567"]
//
//   GRUPO: use o identificador do grupo no lugar do número. Ele termina em
//   "@g.us" e sai da listagem de grupos da API — veja o passo a passo no
//   fim deste arquivo.
//     "destino": ["5519995951316", "120363012345678901@g.us"]
//
//   CÓPIA POR E-MAIL (opcional, mas recomendada): todo lead também chega
//   por e-mail — rede de segurança se o WhatsApp falhar e arquivo
//   pesquisável de tudo que já entrou.
//
//   O envio NÃO pode sair do servidor do site: o SPF do domínio não
//   autoriza a Hostinger, e a mensagem cairia em spam. E o e-mail do
//   domínio é Titan (revendido pela HostGator), cujo plano não libera
//   cliente externo — o webmail entra, mas o SMTP responde
//   "535 authentication failed" mesmo com a senha certa.
//
//   Por isso o envio sai pelo RESEND (HTTPS, sem SMTP). O Titan continua
//   recebendo normalmente; muda só quem despacha o aviso.
//
//     "email": {
//       "para":   "contato@proh.media",
//       "de":     "site@send.proh.media",
//       "resend": { "chave": "re_SUA_CHAVE" }
//     }
//
//   Passos, uma vez só:
//     1. Conta em https://resend.com (faixa grátis: 3.000 e-mails/mês).
//     2. Add domain → use o subdomínio "send.proh.media". O subdomínio
//        mantém os registros do Titan intactos — o recebimento não muda.
//     3. Cole na zona DNS do domínio os registros que o Resend mostrar
//        (SPF e DKIM). Aguarde a verificação ficar verde.
//     4. API Keys → cria a chave e põe em "chave" acima.
//     5. O "de" TEM de ser do domínio verificado, senão o Resend recusa.
//
//   ALTERNATIVA — SMTP autenticado, caso um dia haja uma caixa que libere
//   cliente externo. Só é usado quando não existe o bloco "resend":
//
//       "smtp": {
//         "host":       "smtp.titan.email",
//         "porta":      465,
//         "seguranca":  "ssl",
//         "usuario":    "site@proh.media",
//         "senha":      "SENHA_DA_CONTA_DE_EMAIL"
//       }
//
//   Sem "resend" nem "smtp", o envio cai no mail() do PHP — funciona, mas
//   com entrega muito menos confiável nesse cenário.
//
//   Z-API (https://z-api.io):
//     {
//       "provedor": "zapi",
//       "destino":  "5519995951316",
//       "zapi": {
//         "instancia":   "SUA_INSTANCIA",
//         "token":       "SEU_TOKEN",
//         "clientToken": "SEU_CLIENT_TOKEN"
//       }
//     }
//
//   Evolution API / WAME API e clones (formato sendText):
//     {
//       "provedor": "evolution",
//       "destino":  "5519995951316",
//       "evolution": {
//         "url":       "https://sua-api.com.br",
//         "instancia": "proh",
//         "apikey":    "SUA_CHAVE"
//       }
//     }
//
// O "destino" é quem RECEBE o aviso — precisa ser um número diferente do que
// foi conectado por QR Code (um número não envia mensagem para si mesmo).
// ============================================================================

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://proh.media', 'https://www.proh.media', 'http://localhost:5173'];
if (in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') { http_response_code(204); exit; }
if ($method !== 'POST')    { http_response_code(405); echo json_encode(['error' => 'Método não permitido.']); exit; }

// Limite: 5 envios por minuto por IP (protege contra uso como canal de spam,
// que é justamente o que faz um número conectado ser banido).
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|proh-whats');
$rlFile = sys_get_temp_dir() . '/proh_rl_' . $ipHash;
$now    = time();
$hits   = [];
if (is_readable($rlFile)) {
    foreach (file($rlFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $t) {
        if ($now - (int) $t < 60) { $hits[] = (int) $t; }
    }
}
if (count($hits) >= 5) {
    http_response_code(429);
    header('Retry-After: 60');
    echo json_encode(['error' => 'Muitas solicitações. Aguarde um instante.']);
    exit;
}
$hits[] = $now;
@file_put_contents($rlFile, implode("\n", $hits), LOCK_EX);

// Configuração fora da pasta pública.
$config = null;
foreach ([dirname(__DIR__, 2) . '/whatsapp_config.json', dirname(__DIR__, 3) . '/whatsapp_config.json'] as $cand) {
    if (is_readable($cand)) { $config = json_decode((string) file_get_contents($cand), true); break; }
}
if (!is_array($config) || empty($config['provedor']) || empty($config['destino'])) {
    http_response_code(503);
    echo json_encode(['error' => 'Aviso por WhatsApp não configurado.']);
    exit;
}

$corpo = (string) file_get_contents('php://input', false, null, 0, 8192);
if (strlen($corpo) >= 8192) { http_response_code(413); echo json_encode(['error' => 'Requisição muito grande.']); exit; }
$input = json_decode($corpo, true);
if (!is_array($input)) { http_response_code(400); echo json_encode(['error' => 'Corpo inválido.']); exit; }

// Saneamento. Quebras de linha viram espaço para não permitir injeção de
// estrutura na mensagem final.
$campo = function ($chave, $max) use ($input) {
    $v = trim((string) ($input[$chave] ?? ''));
    $v = preg_replace('/\s+/u', ' ', $v);
    return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max);
};
$nome    = $campo('nome', 80);
$empresa = $campo('empresa', 80);
$email   = $campo('email', 120);
$fone    = $campo('whatsapp', 30);
$tipo    = $campo('tipo', 60);
$momento = $campo('momento', 60);
$desafio = $campo('desafio', 800);

if ($nome === '' || $desafio === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Preencha nome e desafio.']);
    exit;
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'E-mail inválido.', 'campo' => 'email']);
    exit;
}

// Validação do celular informado (formato brasileiro): 55 + DDD + 9 + 8 dígitos.
// A existência real do número só se confirma numa entrega de verdade.
// Além do número legível, monta o link wa.me: o WhatsApp o transforma em
// link clicável sozinho, e um toque já abre a conversa com o lead.
$foneExibicao = '—';
$foneLink     = '';
if ($fone !== '') {
    $d = preg_replace('/\D+/', '', $fone);
    if (strpos($d, '55') === 0 && strlen($d) >= 12) { $d = substr($d, 2); }
    if (strlen($d) !== 11 || (int) substr($d, 0, 2) < 11 || $d[2] !== '9') {
        http_response_code(400);
        echo json_encode(['error' => 'Número de WhatsApp inválido: confira o DDD e os 9 dígitos.', 'campo' => 'whatsapp']);
        exit;
    }
    $foneExibicao = '+55 ' . substr($d, 0, 2) . ' ' . substr($d, 2, 5) . '-' . substr($d, 7);
    $foneLink     = 'https://wa.me/55' . $d;
}

$mensagem = "*Novo lead no site PROH* 🚀\n\n"
    . "*Nome:* {$nome}\n"
    . '*Empresa ou projeto:* ' . ($empresa !== '' ? $empresa : '—') . "\n"
    . '*E-mail:* ' . ($email !== '' ? $email : '—') . "\n"
    . "*WhatsApp:* {$foneExibicao}\n"
    . ($foneLink !== '' ? "💬 Falar agora: {$foneLink}\n" : '')
    . '*Tipo de projeto:* ' . ($tipo !== '' ? $tipo : '—') . "\n"
    . '*Momento:* ' . ($momento !== '' ? $momento : '—') . "\n\n"
    . "*Principal desafio:*\n{$desafio}";

// Destinos: aceita um número, uma lista, ou identificadores de grupo
// (terminam em "@g.us" e não podem ter os dígitos removidos).
$destinos = $config['destino'];
if (!is_array($destinos)) { $destinos = [$destinos]; }
$destinos = array_values(array_filter(array_map(function ($d) {
    $d = trim((string) $d);
    return (strpos($d, '@') !== false) ? $d : preg_replace('/\D+/', '', $d);
}, $destinos), fn ($d) => $d !== ''));
if (!$destinos) {
    http_response_code(503);
    echo json_encode(['error' => 'Nenhum destino configurado.']);
    exit;
}

// Uma requisição por destino. Uma falha não impede as demais — melhor um
// aviso entregue pela metade do que nenhum.
$enviar = function ($destino) use ($config, $mensagem) {
    switch ((string) $config['provedor']) {
        case 'wame':
            $w = (array) ($config['wame'] ?? []);
            if (empty($w['key'])) { return [0, 'Chave da WAME não configurada.']; }
            // A chave da instância vai na URL — é assim que a WAME autentica.
            $base       = rtrim((string) ($w['url'] ?? 'https://us.api-wa.me'), '/');
            $url        = $base . '/' . rawurlencode((string) $w['key']) . '/message/text';
            $cabecalhos = ['Content-Type: application/json'];
            // Alguns painéis também emitem um token de header; se existir, envia.
            if (!empty($w['token'])) { $cabecalhos[] = 'Authorization: Bearer ' . $w['token']; }
            $payload    = json_encode(['to' => $destino, 'text' => $mensagem], JSON_UNESCAPED_UNICODE);
            break;

        case 'zapi':
            $z = (array) ($config['zapi'] ?? []);
            if (empty($z['instancia']) || empty($z['token'])) { return [0, 'Credenciais da Z-API incompletas.']; }
            $url        = 'https://api.z-api.io/instances/' . rawurlencode($z['instancia'])
                        . '/token/' . rawurlencode($z['token']) . '/send-text';
            $cabecalhos = ['Content-Type: application/json'];
            if (!empty($z['clientToken'])) { $cabecalhos[] = 'Client-Token: ' . $z['clientToken']; }
            $payload    = json_encode(['phone' => $destino, 'message' => $mensagem], JSON_UNESCAPED_UNICODE);
            break;

        case 'evolution':
            $e = (array) ($config['evolution'] ?? []);
            if (empty($e['url']) || empty($e['instancia']) || empty($e['apikey'])) { return [0, 'Credenciais da Evolution incompletas.']; }
            $url        = rtrim((string) $e['url'], '/') . '/message/sendText/' . rawurlencode($e['instancia']);
            $cabecalhos = ['Content-Type: application/json', 'apikey: ' . $e['apikey']];
            $payload    = json_encode(['number' => $destino, 'text' => $mensagem], JSON_UNESCAPED_UNICODE);
            break;

        default:
            return [0, 'Provedor de WhatsApp desconhecido.'];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => $cabecalhos,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 20,
    ]);
    $resp = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if ($resp === false) { return [0, 'sem resposta do serviço']; }
    if ($code >= 400)    { return [$code, mb_substr((string) $resp, 0, 200)]; }

    // HTTP 200 não garante entrega: estes serviços costumam devolver o erro
    // no corpo (instância desconectada, número inexistente...). Sem checar
    // isso, uma falha silenciosa passa por sucesso.
    $retorno = json_decode((string) $resp, true);
    if (is_array($retorno)) {
        $temErro = isset($retorno['error']) && $retorno['error'] !== false && $retorno['error'] !== '';
        $negou   = (isset($retorno['success']) && $retorno['success'] === false)
                || (isset($retorno['status'])  && in_array(strtolower((string) $retorno['status']), ['error', 'failed', 'fail'], true));
        if ($temErro || $negou) { return [$code, mb_substr((string) $resp, 0, 200)]; }
    }
    return [$code, $retorno ?? (string) $resp];
};

$entregues = 0;
$relatorio = [];
foreach ($destinos as $d) {
    [$codigo, $detalhe] = $enviar($d);
    $ok = $codigo >= 200 && $codigo < 300;
    if ($ok) { $entregues++; }
    $relatorio[] = ['destino' => $d, 'ok' => $ok, 'codigo' => $codigo, 'detalhe' => $detalhe];
}

// ---------------------------------------------------------------------------
// Cópia por e-mail. Vai SEMPRE, não só quando o WhatsApp falha: além de rede
// de segurança, vira o arquivo pesquisável de todos os leads. O lead conta
// como entregue se QUALQUER um dos dois canais funcionar.
// ---------------------------------------------------------------------------
$emailOk      = false;
$emailDetalhe = 'não configurado';
$emailCfg     = (array) ($config['email'] ?? []);
$paraEmail = trim((string) ($emailCfg['para'] ?? ''));
if ($paraEmail !== '' && filter_var($paraEmail, FILTER_VALIDATE_EMAIL)) {
    // Remetente no próprio domínio: e-mail enviado em nome de outro domínio
    // costuma cair em spam (falha de SPF).
    $de = trim((string) ($emailCfg['de'] ?? 'site@proh.media'));
    if (!filter_var($de, FILTER_VALIDATE_EMAIL)) { $de = 'site@proh.media'; }

    $assunto = 'Novo lead: ' . $nome . ($empresa !== '' ? ' (' . $empresa . ')' : '');
    // Assunto com acento precisa vir codificado, senão chega ilegível.
    $assuntoCodificado = '=?UTF-8?B?' . base64_encode($assunto) . '?=';

    $corpoEmail = "Novo lead pelo site\n"
        . str_repeat('-', 40) . "\n\n"
        . "Nome: {$nome}\n"
        . 'Empresa ou projeto: ' . ($empresa !== '' ? $empresa : '—') . "\n"
        . 'E-mail: ' . ($email !== '' ? $email : '—') . "\n"
        . "WhatsApp: {$foneExibicao}\n"
        . ($foneLink !== '' ? "Falar agora: {$foneLink}\n" : '')
        . 'Tipo de projeto: ' . ($tipo !== '' ? $tipo : '—') . "\n"
        . 'Momento: ' . ($momento !== '' ? $momento : '—') . "\n\n"
        . "Principal desafio:\n{$desafio}\n\n"
        . str_repeat('-', 40) . "\n"
        . 'Recebido em ' . date('d/m/Y \à\s H:i') . "\n";

    $cabecalhosEmail = [
        'From: PROH Site <' . $de . '>',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion(),
    ];
    // Responder ao e-mail leva direto ao lead.
    if ($email !== '') { $cabecalhosEmail[] = 'Reply-To: ' . $email; }

    $resend = (array) ($emailCfg['resend'] ?? []);
    $smtp   = (array) ($emailCfg['smtp'] ?? []);

    if (!empty($resend['chave'])) {
        // ------------------------------------------------------------------
        // Envio pelo Resend (HTTPS, sem SMTP). É o caminho em uso: o e-mail
        // do domínio é Titan de plano revendido, que não libera cliente
        // externo — o webmail entra, o SMTP responde 535. O Titan segue
        // RECEBENDO normalmente; aqui só sai o aviso de lead.
        // ------------------------------------------------------------------
        $payloadEmail = [
            'from'    => 'PROH Site <' . $de . '>',
            'to'      => [$paraEmail],
            'subject' => $assunto,
            'text'    => $corpoEmail,
        ];
        // Responder ao aviso cai direto na caixa do lead.
        if ($email !== '') { $payloadEmail['reply_to'] = $email; }

        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $resend['chave'],
            ],
            CURLOPT_POSTFIELDS     => json_encode($payloadEmail, JSON_UNESCAPED_UNICODE),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 20,
        ]);
        $respEmail = curl_exec($ch);
        $codeEmail = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        $emailOk = $codeEmail >= 200 && $codeEmail < 300;
        // A resposta crua do Resend diz o motivo: domínio não verificado,
        // remetente fora do domínio, chave inválida.
        $emailDetalhe = $emailOk ? 'enviado pelo Resend'
            : 'Resend recusou (HTTP ' . $codeEmail . '): '
              . ($respEmail === false ? 'sem resposta' : mb_substr((string) $respEmail, 0, 200));
    } elseif (!empty($smtp['host']) && !empty($smtp['usuario'])) {
        // ------------------------------------------------------------------
        // Envio autenticado pelo SMTP do provedor de e-mail (HostGator).
        // Necessário porque o servidor do site (Hostinger) não é autorizado
        // a enviar em nome do domínio — o SPF barraria.
        // ------------------------------------------------------------------
        $enviarSmtp = function () use ($smtp, $de, $paraEmail, $assuntoCodificado, $corpoEmail, $cabecalhosEmail) {
            $porta     = (int) ($smtp['porta'] ?? 465);
            $seguranca = strtolower((string) ($smtp['seguranca'] ?? ($porta === 465 ? 'ssl' : 'tls')));
            $endereco  = ($seguranca === 'ssl' ? 'ssl://' : '') . $smtp['host'] . ':' . $porta;

            $contexto = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
            $sock = @stream_socket_client($endereco, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $contexto);
            if (!$sock) { return [false, 'conexão falhou: ' . $errstr]; }
            stream_set_timeout($sock, 15);

            // Respostas SMTP podem vir em várias linhas; a última traz espaço
            // após o código ("250 OK"), as intermediárias trazem hífen.
            $ler = function () use ($sock) {
                $resposta = '';
                while (($linha = fgets($sock, 515)) !== false) {
                    $resposta .= $linha;
                    if (strlen($linha) < 4 || $linha[3] !== '-') { break; }
                }
                return $resposta;
            };
            $conversar = function ($comando) use ($sock, $ler) {
                fwrite($sock, $comando . "\r\n");
                return $ler();
            };
            $codigo = fn ($r) => substr(trim((string) $r), 0, 3);
            // A resposta crua é o que diferencia senha errada de "exige senha
            // de aplicativo" — sem ela o diagnóstico não distingue os dois.
            $crua = fn ($r) => preg_replace('/\s+/', ' ', trim((string) $r));

            $boasVindas = $ler();
            if ($codigo($boasVindas) !== '220') { fclose($sock); return [false, 'servidor não respondeu à conexão: ' . $crua($boasVindas)]; }

            // Identificação no EHLO: o domínio do próprio remetente.
            $eu = substr(strrchr($de, '@') ?: '@localhost', 1);
            $capacidades = $conversar('EHLO ' . $eu);

            if ($seguranca === 'tls') {
                $r = $conversar('STARTTLS');
                if ($codigo($r) !== '220') { fclose($sock); return [false, 'STARTTLS recusado: ' . $crua($r)]; }
                if (!@stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    fclose($sock); return [false, 'não foi possível ativar TLS'];
                }
                $capacidades = $conversar('EHLO ' . $eu);
            }

            // Quais mecanismos de AUTH o servidor anuncia — se LOGIN não estiver
            // na lista, o problema é de mecanismo, não de senha.
            $mecanismos = preg_match('/250[- ]AUTH ([^\r\n]+)/i', (string) $capacidades, $m) ? trim($m[1]) : 'não anunciado';

            $r = $conversar('AUTH LOGIN');
            if ($codigo($r) !== '334') { fclose($sock); return [false, 'servidor recusou AUTH LOGIN (anuncia: ' . $mecanismos . '): ' . $crua($r)]; }
            $r = $conversar(base64_encode((string) $smtp['usuario']));
            if ($codigo($r) !== '334') { fclose($sock); return [false, 'usuário recusado: ' . $crua($r)]; }
            $r = $conversar(base64_encode((string) ($smtp['senha'] ?? '')));
            if ($codigo($r) !== '235') { fclose($sock); return [false, 'autenticação recusada (anuncia: ' . $mecanismos . '): ' . $crua($r)]; }

            $r = $conversar('MAIL FROM:<' . $de . '>');
            if ($codigo($r) !== '250') { fclose($sock); return [false, 'remetente recusado: ' . $crua($r)]; }
            $r = $conversar('RCPT TO:<' . $paraEmail . '>');
            if ($codigo($r) !== '250') { fclose($sock); return [false, 'destinatário recusado: ' . $crua($r)]; }
            $r = $conversar('DATA');
            if ($codigo($r) !== '354') { fclose($sock); return [false, 'servidor recusou o corpo: ' . $crua($r)]; }

            // Linha iniciada por ponto precisa ser escapada, senão encerra o envio.
            $corpoSeguro = preg_replace('/^\./m', '..', str_replace("\n", "\r\n", $corpoEmail));
            $mensagemSmtp = implode("\r\n", array_merge($cabecalhosEmail, [
                'To: ' . $paraEmail,
                'Subject: ' . $assuntoCodificado,
                'Date: ' . date('r'),
            ])) . "\r\n\r\n" . $corpoSeguro . "\r\n.";

            $r = $conversar($mensagemSmtp);
            $conversar('QUIT');
            fclose($sock);
            return [$codigo($r) === '250', $codigo($r) === '250' ? 'enviado' : 'recusado no envio: ' . trim((string) $r)];
        };
        [$emailOk, $emailDetalhe] = $enviarSmtp();
    } else {
        // Sem SMTP configurado: envio pelo servidor local (menos confiável
        // quando o e-mail do domínio é de outro provedor).
        $emailOk = @mail($paraEmail, $assuntoCodificado, $corpoEmail, implode("\r\n", $cabecalhosEmail), '-f' . $de);
        $emailDetalhe = $emailOk ? 'enviado pelo servidor local' : 'mail() falhou';
    }
}
$relatorio[] = [
    'destino' => $paraEmail !== '' ? 'e-mail: ' . $paraEmail : 'e-mail não configurado',
    'ok'      => $emailOk,
    'detalhe' => $emailDetalhe ?? 'não configurado',
];

if ($entregues === 0 && !$emailOk) {
    http_response_code(502);
    echo json_encode([
        'error'   => 'Não foi possível enviar o aviso.',
        'detalhe' => $relatorio[0]['detalhe'] ?? 'falha desconhecida',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Modo diagnóstico: só para quem já conhece a chave (últimos 6 caracteres).
// Devolve o retorno cru do provedor, destino a destino.
$chaveConfig = (string) ($config['wame']['key'] ?? $config['zapi']['token'] ?? $config['evolution']['apikey'] ?? '');
if (($input['diagnostico'] ?? '') !== '' && $chaveConfig !== ''
    && hash_equals(substr($chaveConfig, -6), (string) $input['diagnostico'])) {
    echo json_encode([
        'ok'         => true,
        'entregues'  => $entregues,
        'emailEnviado' => $emailOk,
        'destinos'   => $relatorio,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => true]);

// ============================================================================
// COMO DESCOBRIR O IDENTIFICADOR DE UM GRUPO (para usar em "destino")
//
//   1. O número conectado precisa ser membro do grupo.
//   2. No seu computador, rode (trocando SUA_CHAVE):
//
//        curl -s https://us.api-wa.me/SUA_CHAVE/groups
//
//   3. A resposta lista os grupos. Localize o seu pelo nome e copie o "id"
//      — algo como 120363012345678901@g.us.
//   4. Coloque esse id no "destino" do whatsapp_config.json, sozinho ou
//      junto de números:
//
//        "destino": ["5519995951316", "120363012345678901@g.us"]
// ============================================================================
