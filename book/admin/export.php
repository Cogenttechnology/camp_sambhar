<?php
/** CSV export, honouring whatever filters the dashboard has applied. */

require_once __DIR__ . '/inc/auth.php';
require_login();

$pdo = db();

$where  = [];
$params = [];

$statusFilter = $_GET['status'] ?? '';
if (in_array($statusFilter, ['new', 'contacted', 'booked', 'closed'], true)) {
    $where[]  = 'status = ?';
    $params[] = $statusFilter;
}

$search = trim((string) ($_GET['q'] ?? ''));
if ($search !== '') {
    $where[]  = '(name LIKE ? OR phone LIKE ? OR email LIKE ? OR interest LIKE ?)';
    $like     = '%' . $search . '%';
    array_push($params, $like, $like, $like, $like);
}

$whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$st = $pdo->prepare("SELECT * FROM leads $whereSql ORDER BY created_at DESC");
$st->execute($params);

$filename = 'camp-sambhar-leads-' . date('Y-m-d') . '.csv';

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Pragma: no-cache');

$out = fopen('php://output', 'w');

// BOM so Excel opens UTF-8 correctly — without it Indian names with accents
// arrive mangled.
fwrite($out, "\xEF\xBB\xBF");

fputcsv($out, [
    'ID', 'Received', 'Name', 'Phone', 'Email', 'Check-in', 'Guests',
    'Interest', 'Status', 'Campaign', 'Source', 'Google Click ID', 'Notes',
]);

/**
 * Excel treats a leading =, +, - or @ as a formula, which turns an exported
 * cell into a code-execution vector. Prefixing with an apostrophe neutralises
 * it while leaving the text readable.
 */
$safe = static function (?string $v): string {
    $v = (string) $v;
    return $v !== '' && strpbrk($v[0], "=+-@\t\r") !== false ? "'" . $v : $v;
};

while ($row = $st->fetch()) {
    fputcsv($out, [
        $row['id'],
        $row['created_at'],
        $safe($row['name']),
        $safe($row['phone']),
        $safe($row['email']),
        $row['check_in'],
        $safe($row['guests']),
        $safe($row['interest']),
        $row['status'],
        $safe($row['utm_campaign']),
        $safe($row['source_page']),
        $safe($row['gclid']),
        $safe($row['notes']),
    ]);
}

fclose($out);
