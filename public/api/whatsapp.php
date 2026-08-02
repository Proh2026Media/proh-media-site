<?php
// ============================================================================
// Aviso interno de lead via Zernio (WhatsApp) — roda no servidor da Hostinger.
//
// O formulário do site continua abrindo o wa.me para o visitante; este proxy
// apenas garante que a PROH receba o lead no WhatsApp mesmo que o visitante
// abandone antes de enviar a mensagem.
//
// A CHAVE NÃO fica neste arquivo nem no repositório.
// COMO CONFIGURAR (uma única vez):
//   1. Pelo Gerenciador de Arquivos da Hostinger, na pasta do domínio (o
//      nível ACIMA de public_html), crie  zernio_config.json  contendo:
//        { "apiKey": "SUA_CHAVE_DA_API_DO_ZERNIO" }
//   2. Abra  https://proh.media/api/whatsapp-setup.php?chave=XXXXXX  (os
//      últimos 6 caracteres da chave). O configurador descobre a conta,
//      completa este arquivo e cria o template "novo_lead" sozinho.
//
// Por que template: o WhatsApp não permite mensagem livre para iniciar uma
// conversa — fora da janela de 24h só entram templates aprovados. Enviar por
// template torna o aviso confiável a qualquer hora.
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

// Limite de requisições: 5 por minuto por IP (um formulário legítimo não
// precisa de mais; protege contra uso do endpoint como canal de spam).
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|proh-zernio');
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

// Configuração: procurada fora da pasta pública (1 ou 2 níveis acima).
$config = null;
foreach ([dirname(__DIR__, 2) . '/zernio_config.json', dirname(__DIR__, 3) . '/zernio_config.json'] as $cand) {
    if (is_readable($cand)) { $config = json_decode((string) file_get_contents($cand), true); break; }
}
if (!is_array($config) || empty($config['apiKey']) || empty($config['accountId']) || empty($config['destinationPhone'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Integração do WhatsApp não configurada no servidor.']);
    exit;
}

$corpo = (string) file_get_contents('php://input', false, null, 0, 8192);
if (strlen($corpo) >= 8192) { http_response_code(413); echo json_encode(['error' => 'Requisição muito grande.']); exit; }
$input = json_decode($corpo, true);
if (!is_array($input)) { http_response_code(400); echo json_encode(['error' => 'Corpo inválido.']); exit; }

// Saneamento: corta no tamanho, remove quebras (vão como variáveis de template).
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
$desafio = $campo('desafio', 600);

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

// Validação do WhatsApp do visitante (formato brasileiro, normalizado para
// padrão internacional). O campo é opcional; quando preenchido, precisa ser
// um celular plausível: 55 + DDD (11–99) + 9 + 8 dígitos.
// Observação: a existência REAL do número no WhatsApp não tem consulta
// prévia nas regras oficiais — só o resultado de um envio de verdade revela
// número inválido (erro 131021 da Meta).
$foneNormalizado = '';
if ($fone !== '') {
    $digitos = preg_replace('/\D+/', '', $fone);
    if (strpos($digitos, '55') === 0 && strlen($digitos) >= 12) { $digitos = substr($digitos, 2); }
    if (strlen($digitos) === 10) { // formato antigo sem o 9: rejeita para celular
        http_response_code(400);
        echo json_encode(['error' => 'Número de WhatsApp incompleto: use DDD + 9 dígitos.', 'campo' => 'whatsapp']);
        exit;
    }
    $ddd = (int) substr($digitos, 0, 2);
    if (strlen($digitos) !== 11 || $ddd < 11 || $digitos[2] !== '9') {
        http_response_code(400);
        echo json_encode(['error' => 'Número de WhatsApp inválido: confira o DDD e os 9 dígitos.', 'campo' => 'whatsapp']);
        exit;
    }
    $foneNormalizado = '55' . $digitos;
}

// Envio do aviso via Zernio: template aprovado, direto para o número da PROH.
$payload = json_encode([
    'accountId'        => (string) $config['accountId'],
    'participantId'    => preg_replace('/\D+/', '', (string) $config['destinationPhone']),
    'templateName'     => (string) ($config['templateName'] ?? 'novo_lead'),
    'templateLanguage' => (string) ($config['templateLanguage'] ?? 'pt_BR'),
    'templateParams'   => [
        $nome,
        $empresa !== '' ? $empresa : '—',
        $email   !== '' ? $email   : '—',
        $foneNormalizado !== '' ? '+' . $foneNormalizado : '—',
        $tipo    !== '' ? $tipo    : '—',
        $momento !== '' ? $momento : '—',
        $desafio,
    ],
], JSON_UNESCAPED_UNICODE);

$ch = curl_init('https://api.zernio.com/v1/inbox/conversations');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $config['apiKey'],
    ],
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 20,
]);
$resp = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($resp === false || $code >= 400) {
    // O aviso é um reforço: o visitante segue pelo wa.me de qualquer forma.
    // Expõe apenas o status (sem corpo) para diagnóstico.
    http_response_code(502);
    echo json_encode(['error' => 'Não foi possível enviar o aviso.', 'detalhe' => $resp === false ? 'sem resposta' : 'API HTTP ' . $code]);
    exit;
}

echo json_encode(['ok' => true]);
