<?php
/**
 * Staging-only consultation form endpoint for the static export deployment.
 * Lives at /api/consultation/ next to the exported Next.js files on the Hostinger (LiteSpeed/PHP) host
 * and delivers leads with WordPress' wp_mail() from the staging WordPress install in the same docroot.
 *
 * On the Node/VPS deployment this file is not used: src/app/api/consultation/route.node.ts handles POSTs.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw  = file_get_contents('php://input') ?: '';
$body = json_decode($raw, true);
if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request']);
    exit;
}
if (!empty($body['company'])) { // honeypot
    echo json_encode(['ok' => true]);
    exit;
}

$clean = static function ($v, int $max = 500): string {
    $s = is_scalar($v) ? (string) $v : '';
    return mb_substr(trim(preg_replace('/[\r\n]+/', ' ', $s) ?? ''), 0, $max);
};
$name    = $clean($body['name'] ?? '', 120);
$email   = $clean($body['email'] ?? '', 160);
$phone   = $clean($body['phone'] ?? '', 40);
$service = $clean($body['service'] ?? '', 80);
$message = mb_substr(trim((string) ($body['message'] ?? '')), 0, 3000);
$page    = $clean($body['page'] ?? '', 200);
$source  = $clean($body['source'] ?? '', 40);

if ($name === '' || $phone === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please provide your name, a valid email and a phone number.']);
    exit;
}

// Simple per-IP throttle (8 requests / 10 minutes) using a temp file.
$ip   = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip   = trim(explode(',', $ip)[0]);
$file = sys_get_temp_dir() . '/la-consult-' . md5($ip);
$hits = is_file($file) ? array_filter(array_map('intval', file($file, FILE_IGNORE_NEW_LINES) ?: []), static fn ($t) => $t > time() - 600) : [];
if (count($hits) >= 8) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Too many requests']);
    exit;
}
$hits[] = time();
@file_put_contents($file, implode("\n", $hits));

// Bootstrap WordPress for wp_mail (same docroot).
$wpLoad = dirname(__DIR__, 2) . '/wp-load.php';
if (!is_file($wpLoad)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Form delivery is not configured']);
    exit;
}
define('WP_USE_THEMES', false);
require_once $wpLoad;

$to = defined('LA_LEAD_EMAIL_TO') ? LA_LEAD_EMAIL_TO : get_option('admin_email');
$subject = sprintf('Free consultation request – %s%s', $name, $service !== '' ? " ({$service})" : '');
$text = implode("\n", [
    "New consultation request (staging site, {$source})",
    '',
    "Name: {$name}",
    "Email: {$email}",
    "Phone: {$phone}",
    "Service: {$service}",
    "Page: {$page}",
    '',
    'Message:',
    $message !== '' ? $message : '(none)',
]);

$sent = wp_mail($to, $subject, $text, ['Reply-To: ' . $email]);
if (!$sent) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Could not send your request']);
    exit;
}
echo json_encode(['ok' => true]);
