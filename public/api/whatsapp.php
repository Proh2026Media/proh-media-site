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
$foneExibicao = '—';
if ($fone !== '') {
    $d = preg_replace('/\D+/', '', $fone);
    if (strpos($d, '55') === 0 && strlen($d) >= 12) { $d = substr($d, 2); }
    if (strlen($d) !== 11 || (int) substr($d, 0, 2) < 11 || $d[2] !== '9') {
        http_response_code(400);
        echo json_encode(['error' => 'Número de WhatsApp inválido: confira o DDD e os 9 dígitos.', 'campo' => 'whatsapp']);
        exit;
    }
    $foneExibicao = '+55 ' . substr($d, 0, 2) . ' ' . substr($d, 2, 5) . '-' . substr($d, 7);
}

$mensagem = "*Novo lead no site PROH* 🚀\n\n"
    . "*Nome:* {$nome}\n"
    . '*Empresa ou projeto:* ' . ($empresa !== '' ? $empresa : '—') . "\n"
    . '*E-mail:* ' . ($email !== '' ? $email : '—') . "\n"
    . "*WhatsApp:* {$foneExibicao}\n"
    . '*Tipo de projeto:* ' . ($tipo !== '' ? $tipo : '—') . "\n"
    . '*Momento:* ' . ($momento !== '' ? $momento : '—') . "\n\n"
    . "*Principal desafio:*\n{$desafio}";

$destino = preg_replace('/\D+/', '', (string) $config['destino']);

// Monta a requisição conforme o provedor.
switch ((string) $config['provedor']) {
    case 'zapi':
        $z = (array) ($config['zapi'] ?? []);
        if (empty($z['instancia']) || empty($z['token'])) {
            http_response_code(503); echo json_encode(['error' => 'Credenciais da Z-API incompletas.']); exit;
        }
        $url      = 'https://api.z-api.io/instances/' . rawurlencode($z['instancia'])
                  . '/token/' . rawurlencode($z['token']) . '/send-text';
        $cabecalhos = ['Content-Type: application/json'];
        if (!empty($z['clientToken'])) { $cabecalhos[] = 'Client-Token: ' . $z['clientToken']; }
        $payload  = json_encode(['phone' => $destino, 'message' => $mensagem], JSON_UNESCAPED_UNICODE);
        break;

    case 'evolution':
        $e = (array) ($config['evolution'] ?? []);
        if (empty($e['url']) || empty($e['instancia']) || empty($e['apikey'])) {
            http_response_code(503); echo json_encode(['error' => 'Credenciais da Evolution incompletas.']); exit;
        }
        $url        = rtrim((string) $e['url'], '/') . '/message/sendText/' . rawurlencode($e['instancia']);
        $cabecalhos = ['Content-Type: application/json', 'apikey: ' . $e['apikey']];
        $payload    = json_encode(['number' => $destino, 'text' => $mensagem], JSON_UNESCAPED_UNICODE);
        break;

    default:
        http_response_code(503);
        echo json_encode(['error' => 'Provedor de WhatsApp desconhecido.']);
        exit;
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

if ($resp === false || $code >= 400) {
    http_response_code(502);
    echo json_encode([
        'error'   => 'Não foi possível enviar o aviso.',
        'detalhe' => $resp === false ? 'sem resposta do serviço' : 'API HTTP ' . $code,
    ]);
    exit;
}

echo json_encode(['ok' => true]);
