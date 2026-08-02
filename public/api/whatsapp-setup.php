<?php
// ============================================================================
// Configurador do aviso de leads (Zernio/WhatsApp) — rodar UMA vez no navegador.
//
// PASSO A PASSO COMPLETO:
//   1. No Gerenciador de Arquivos da Hostinger, na pasta do domínio (o nível
//      ACIMA de public_html, onde já existe o gemini_key.txt), crie o arquivo
//      zernio_config.json contendo apenas:  { "apiKey": "SUA_CHAVE" }
//      (a chave fica em Settings → API Keys no painel do Zernio)
//   2. Abra no navegador:
//        https://proh.media/api/whatsapp-setup.php?chave=ABC123
//      onde ABC123 são os ÚLTIMOS 6 caracteres da sua chave da API.
//   3. O script descobre a conta de WhatsApp conectada, grava o accountId na
//      configuração, cria o template "novo_lead" (se não existir) e mostra o
//      status. Se o template ficar PENDING, aguarde a aprovação da Meta e
//      abra a mesma URL de novo para conferir.
//   4. Com o template APPROVED, teste com  &teste=1  no fim da URL: um lead
//      de exemplo chega no WhatsApp da PROH.
//
// O script só lê estado e cria um template fixo — sem risco se ficar no ar —
// mas depois de configurado pode ser apagado pelo Gerenciador de Arquivos.
// ============================================================================

header('Content-Type: text/plain; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

// Limite de acessos: 5 por minuto por IP.
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|proh-zernio-setup');
$rlFile = sys_get_temp_dir() . '/proh_rl_' . $ipHash;
$now    = time();
$hits   = [];
if (is_readable($rlFile)) {
    foreach (file($rlFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $t) {
        if ($now - (int) $t < 60) { $hits[] = (int) $t; }
    }
}
if (count($hits) >= 5) { http_response_code(429); exit("Muitos acessos. Aguarde 1 minuto.\n"); }
$hits[] = $now;
@file_put_contents($rlFile, implode("\n", $hits), LOCK_EX);

// Configuração
$caminhoConfig = '';
$config = null;
foreach ([dirname(__DIR__, 2) . '/zernio_config.json', dirname(__DIR__, 3) . '/zernio_config.json'] as $cand) {
    if (is_readable($cand)) { $caminhoConfig = $cand; $config = json_decode((string) file_get_contents($cand), true); break; }
}
if (!is_array($config) || empty($config['apiKey'])) {
    http_response_code(500);
    exit("[1/4] Configuração: NÃO ENCONTRADA.\n\n"
        . "Crie o arquivo zernio_config.json na pasta do domínio (acima de\n"
        . "public_html), com o conteúdo:  { \"apiKey\": \"SUA_CHAVE\" }\n");
}
$apiKey = (string) $config['apiKey'];

// Proteção: os últimos 6 caracteres da chave, passados em ?chave=
if (($_GET['chave'] ?? '') !== substr($apiKey, -6)) {
    http_response_code(403);
    exit("Acesso negado.\n\nAbra esta URL com ?chave=XXXXXX, onde XXXXXX são os\n"
        . "últimos 6 caracteres da sua chave da API do Zernio.\n");
}

$zernio = function ($metodo, $rota, $corpo = null) use ($apiKey) {
    $ch = curl_init('https://api.zernio.com' . $rota);
    $ops = [
        CURLOPT_CUSTOMREQUEST  => $metodo,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Authorization: Bearer ' . $apiKey],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 25,
    ];
    if ($corpo !== null) { $ops[CURLOPT_POSTFIELDS] = json_encode($corpo, JSON_UNESCAPED_UNICODE); }
    curl_setopt_array($ch, $ops);
    $resp = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return [$code, is_string($resp) ? json_decode($resp, true) : null];
};

$saida = [];
$saida[] = '[1/4] Configuração: encontrada em ' . basename(dirname($caminhoConfig)) . '/zernio_config.json';

// ---- Conta de WhatsApp conectada -------------------------------------------
[$code, $data] = $zernio('GET', '/v1/accounts?platform=whatsapp');
if ($code === 401) { exit(implode("\n", $saida) . "\n[2/4] Conta: CHAVE INVÁLIDA (API respondeu 401). Confira o apiKey.\n"); }
$contas = array_values(array_filter((array) ($data['accounts'] ?? []), fn ($a) => ($a['platform'] ?? '') === 'whatsapp'));
if (!$contas) {
    exit(implode("\n", $saida) . "\n[2/4] Conta: NENHUMA conta de WhatsApp conectada no Zernio.\n"
        . "Conecte o número no painel do Zernio e rode de novo.\n");
}
$accountId = (string) ($config['accountId'] ?? '');
if ($accountId === '') {
    if (count($contas) === 1) {
        $accountId = (string) $contas[0]['_id'];
        $saida[] = '[2/4] Conta: descoberta automaticamente — '
            . ($contas[0]['displayName'] ?? $contas[0]['username'] ?? $accountId);
        // Completa a configuração e grava de volta.
        $config['accountId']        = $accountId;
        $config['templateName']     = $config['templateName']     ?? 'novo_lead';
        $config['templateLanguage'] = $config['templateLanguage'] ?? 'pt_BR';
        $config['destinationPhone'] = $config['destinationPhone'] ?? '5519995951316';
        if (@file_put_contents($caminhoConfig, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX) !== false) {
            $saida[] = '      accountId gravado no zernio_config.json.';
        } else {
            $saida[] = '      ATENÇÃO: não consegui gravar; adicione manualmente "accountId": "' . $accountId . '".';
        }
    } else {
        $lista = array_map(fn ($a) => '  - ' . ($a['displayName'] ?? $a['username'] ?? '?') . '  →  "accountId": "' . $a['_id'] . '"', $contas);
        exit(implode("\n", $saida) . "\n[2/4] Conta: há mais de uma conta de WhatsApp. Adicione ao\n"
            . "zernio_config.json a linha da conta desejada:\n" . implode("\n", $lista) . "\n");
    }
} else {
    $saida[] = '[2/4] Conta: usando accountId já configurado.';
}

// ---- Template do aviso ------------------------------------------------------
$nomeTemplate = (string) ($config['templateName'] ?? 'novo_lead');
$idioma       = (string) ($config['templateLanguage'] ?? 'pt_BR');
[$code, $data] = $zernio('GET', '/v1/whatsapp/templates/' . rawurlencode($nomeTemplate) . '?accountId=' . rawurlencode($accountId));
$status = strtoupper((string) ($data['template']['status'] ?? ''));

if ($code === 404 || $status === '') {
    $corpoTemplate = "Novo lead no site PROH 🚀\n\n"
        . "Nome: {{1}}\nEmpresa: {{2}}\nE-mail: {{3}}\nWhatsApp: {{4}}\n"
        . "Tipo de projeto: {{5}}\nMomento: {{6}}\n\nDesafio: {{7}}";
    [$code, $data] = $zernio('POST', '/v1/whatsapp/templates', [
        'accountId' => $accountId,
        'name'      => $nomeTemplate,
        'category'  => 'UTILITY',
        'language'  => $idioma,
        'components' => [[
            'type' => 'BODY',
            'text' => $corpoTemplate,
            'example' => ['body_text' => [[
                'Maria Silva', 'Empresa X', 'maria@exemplo.com', '+5519999998888',
                'Estratégia', 'Preciso começar imediatamente', 'Quero reposicionar minha marca',
            ]]],
        ]],
    ]);
    $status = strtoupper((string) ($data['template']['status'] ?? ''));
    if ($code >= 400 || $status === '') {
        exit(implode("\n", $saida) . "\n[3/4] Template: FALHA ao criar (HTTP {$code}).\n"
            . 'Detalhe: ' . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n");
    }
    $saida[] = "[3/4] Template \"{$nomeTemplate}\": criado agora — status {$status}.";
} else {
    $saida[] = "[3/4] Template \"{$nomeTemplate}\": já existe — status {$status}.";
}

if ($status === 'APPROVED') {
    $saida[] = '[4/4] Tudo pronto! O formulário do site já envia os avisos.';
    if (($_GET['teste'] ?? '') === '1') {
        [$code, $data] = $zernio('POST', '/v1/inbox/conversations', [
            'accountId'        => $accountId,
            'participantId'    => preg_replace('/\D+/', '', (string) ($config['destinationPhone'] ?? '5519995951316')),
            'templateName'     => $nomeTemplate,
            'templateLanguage' => $idioma,
            'templateParams'   => ['Lead de Teste', 'Configuração', 'teste@proh.media', '—', 'Teste', 'Agora', 'Confirmando a integração do formulário 🎉'],
        ]);
        $saida[] = $code < 400
            ? '      Teste enviado! Confira o WhatsApp da PROH.'
            : '      Teste FALHOU (HTTP ' . $code . '): ' . json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        $saida[] = '      Para um envio de teste, abra esta URL com &teste=1 no fim.';
    }
} elseif ($status === 'PENDING') {
    $saida[] = '[4/4] Aguardando a aprovação da Meta (costuma sair em minutos).';
    $saida[] = '      Abra esta URL de novo daqui a pouco para conferir.';
} else {
    $saida[] = "[4/4] Template com status {$status} — se for REJECTED, me avise para ajustarmos o texto.";
}

echo implode("\n", $saida) . "\n";
