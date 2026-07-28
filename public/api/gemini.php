<?php
// ============================================================================
// Proxy seguro do Gemini — roda no próprio servidor da Hostinger.
//
// A CHAVE NÃO fica neste arquivo nem no repositório.
// COMO CONFIGURAR (uma única vez, pelo Gerenciador de Arquivos da Hostinger):
//   1. Navegue até a pasta do domínio (ex.: /domains/proh.media/) — o nível
//      ACIMA da pasta pública (public_html).
//   2. Crie um arquivo chamado  gemini_key.txt  contendo APENAS a chave.
//   3. Pronto: os deploys não tocam nesse arquivo e ele fica fora da web.
// ============================================================================

header('Content-Type: application/json; charset=utf-8');

// CORS: o site publicado usa o mesmo domínio (não precisa), mas liberamos o
// dev local e o www explicitamente.
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

// Chave: procurada fora da pasta pública (1 ou 2 níveis acima), com
// fallback para variável de ambiente.
$apiKey = '';
foreach ([dirname(__DIR__, 2) . '/gemini_key.txt', dirname(__DIR__, 3) . '/gemini_key.txt'] as $cand) {
    if (is_readable($cand)) { $apiKey = trim((string) file_get_contents($cand)); break; }
}
if ($apiKey === '') { $apiKey = trim((string) (getenv('GEMINI_API_KEY') ?: '')); }
if ($apiKey === '') {
    http_response_code(500);
    echo json_encode(['error' => 'Chave da API não configurada no servidor.']);
    exit;
}

$input = json_decode((string) file_get_contents('php://input'), true);
$niche = trim((string) ($input['niche'] ?? ''));
if (function_exists('mb_substr')) { $niche = mb_substr($niche, 0, 200); } else { $niche = substr($niche, 0, 200); }
if ($niche === '') { http_response_code(400); echo json_encode(['error' => 'Informe o segmento do negócio.']); exit; }

$prompt = "Você é um estrategista de marca sênior da agência PROH.\n"
    . "A filosofia da PROH baseia-se em duas dimensões:\n"
    . "1) \"Propagar crescimento\" (performance, vendas, crescimento).\n"
    . "2) \"Propagar impacto\" (propósito, impacto humano, causas sociais).\n\n"
    . "O usuário possui um negócio no seguinte segmento: \"{$niche}\".\n\n"
    . "Gere 2 ideias curtas e criativas para esta empresa, uma para cada dimensão.\n"
    . "Formate a resposta estritamente como um objeto JSON válido com as propriedades:\n"
    . "{\"resultado\": \"ideia de campanha focada em performance/vendas em até 25 palavras\", "
    . "\"valor\": \"ideia de ação focada em impacto social/comunidade em até 25 palavras\"}\n"
    . "Não inclua marcação markdown no JSON, apenas o objeto.";

$payload = json_encode([
    'contents'         => [['parts' => [['text' => $prompt]]]],
    'generationConfig' => ['responseMimeType' => 'application/json'],
]);

$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=' . urlencode($apiKey);
$ch  = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 30,
]);
$resp = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($resp === false || $code >= 400) {
    http_response_code(502);
    echo json_encode(['error' => 'Falha na comunicação com a IA.']);
    exit;
}

$data = json_decode((string) $resp, true);
$text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
$out  = json_decode((string) $text, true);
if (!is_array($out) || (!isset($out['resultado']) && !isset($out['valor']))) {
    http_response_code(502);
    echo json_encode(['error' => 'Resposta da IA em formato inesperado.']);
    exit;
}

echo json_encode(
    ['resultado' => (string) ($out['resultado'] ?? ''), 'valor' => (string) ($out['valor'] ?? '')],
    JSON_UNESCAPED_UNICODE
);
