<?php
/**
 * Lead capture endpoint for the Google Ads landing page.
 *
 * Accepts the exact JSON the existing form already sends — name, phone,
 * checkIn, guests, interest, message, sourcePage — so book/assets/js/main.js
 * needs no change beyond pointing ENQUIRY_ENDPOINT here.
 *
 * Always answers JSON. The form falls back to WhatsApp on any non-2xx, so a
 * failure here still reaches the guest; that fallback must never be triggered
 * by something we could have handled.
 */

require_once __DIR__ . '/../admin/inc/db.php';

header('Content-Type: application/json; charset=utf-8');

// Same-origin on book.campsambhar.com, so CORS is not normally exercised.
// These cover the case where the page is embedded or moved to the main domain.
$allowed = [
    'https://book.campsambhar.com',
    'https://campsambhar.com',
    'https://www.campsambhar.com',
];
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Accept JSON, and form-encoded as a fallback for no-JS submissions.
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$field = static function (string $key, int $max = 255) use ($data): string {
    $v = trim((string) ($data[$key] ?? ''));
    // Strip control characters: they corrupt CSV export and email headers.
    $v = preg_replace('/[\x00-\x1F\x7F]/u', '', $v);
    return mb_substr($v, 0, $max);
};

// Honeypot. Real users never see this field, so anything in it is a bot.
// Answer 200 so the bot believes it succeeded and does not retry.
if ($field('company') !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$name     = $field('name', 120);
$phone    = $field('phone', 32);
$email    = $field('email', 190);
$checkIn  = $field('checkIn', 20);
$guests   = $field('guests', 16);
$interest = $field('interest', 80);
$message  = $field('message', 2000);
$source   = $field('sourcePage', 255);

if ($name === '' || $phone === '') {
    http_response_code(422);
    echo json_encode(['error' => 'Name and phone are required.']);
    exit;
}

// Indian mobile numbers: 10 digits, optionally +91 prefixed.
$digits = preg_replace('/\D/', '', $phone);
if (strlen($digits) < 10 || strlen($digits) > 13) {
    http_response_code(422);
    echo json_encode(['error' => 'Please enter a valid phone number.']);
    exit;
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $email = '';
}

// Normalise the date; an unparseable value is stored as NULL rather than
// rejecting an otherwise good lead.
$checkInSql = null;
if ($checkIn !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkIn)) {
    $checkInSql = $checkIn;
}

$pdo = db();
$ip  = client_ip();

if (recent_submission_count($pdo, $ip) >= RATE_LIMIT_PER_HOUR) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many submissions. Please call us instead.']);
    exit;
}

// Ad attribution, pulled from the landing page URL so the sales team can see
// which campaign produced each lead.
$query = [];
if ($source !== '' && str_contains($source, '?')) {
    parse_str(substr($source, strpos($source, '?') + 1), $query);
}

$st = $pdo->prepare(
    'INSERT INTO leads
        (name, phone, email, check_in, guests, interest, message, source_page,
         gclid, utm_source, utm_campaign, ip, user_agent, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())'
);

$st->execute([
    $name,
    $phone,
    $email !== '' ? $email : null,
    $checkInSql,
    $guests !== '' ? $guests : null,
    $interest !== '' ? $interest : null,
    $message !== '' ? $message : null,
    $source !== '' ? $source : null,
    mb_substr((string) ($query['gclid'] ?? ''), 0, 190) ?: null,
    mb_substr((string) ($query['utm_source'] ?? ''), 0, 120) ?: null,
    mb_substr((string) ($query['utm_campaign'] ?? ''), 0, 120) ?: null,
    $ip,
    mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
]);

$id = (int) $pdo->lastInsertId();

// Email alert. Wrapped so a mail failure never costs us the lead — the row is
// already committed by this point.
if (NOTIFY_EMAIL !== '') {
    $lines = [
        'New enquiry from the Google Ads landing page',
        '',
        'Name:      ' . $name,
        'Phone:     ' . $phone,
        $email !== ''    ? 'Email:     ' . $email       : null,
        $checkIn !== ''  ? 'Check-in:  ' . $checkIn     : null,
        $guests !== ''   ? 'Guests:    ' . $guests      : null,
        $interest !== '' ? 'Interest:  ' . $interest    : null,
        '',
        'Campaign:  ' . ($query['utm_campaign'] ?? '—'),
        'Page:      ' . $source,
        'Received:  ' . date('d M Y, H:i'),
    ];
    $body = implode("\n", array_filter($lines, static fn($l) => $l !== null));

    // Header injection guard: a newline in the subject would let an attacker
    // add arbitrary headers.
    $subject = 'New lead: ' . preg_replace('/[\r\n]/', ' ', $name);

    @mail(
        NOTIFY_EMAIL,
        $subject,
        $body,
        implode("\r\n", [
            'From: Camp Sambhar <' . NOTIFY_FROM . '>',
            'Content-Type: text/plain; charset=utf-8',
        ])
    );
}

echo json_encode(['ok' => true, 'id' => $id]);
