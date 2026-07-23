<?php
require_once __DIR__ . '/inc/auth.php';
require_login();

$pdo = db();

// ── Actions ──────────────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    check_csrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'status') {
        $allowed = ['new', 'contacted', 'booked', 'closed'];
        $status  = in_array($_POST['status'] ?? '', $allowed, true) ? $_POST['status'] : 'new';
        $pdo->prepare('UPDATE leads SET status = ? WHERE id = ?')
            ->execute([$status, (int) ($_POST['id'] ?? 0)]);
    } elseif ($action === 'note') {
        $pdo->prepare('UPDATE leads SET notes = ? WHERE id = ?')
            ->execute([mb_substr(trim((string) ($_POST['notes'] ?? '')), 0, 2000), (int) ($_POST['id'] ?? 0)]);
    } elseif ($action === 'delete') {
        $pdo->prepare('DELETE FROM leads WHERE id = ?')->execute([(int) ($_POST['id'] ?? 0)]);
    }

    // Redirect after POST so a refresh does not repeat the action.
    header('Location: index.php?' . http_build_query(array_filter([
        'status' => $_GET['status'] ?? null,
        'q'      => $_GET['q'] ?? null,
        'page'   => $_GET['page'] ?? null,
    ])));
    exit;
}

// ── Filters ──────────────────────────────────────────────────────
$statusFilter = $_GET['status'] ?? '';
$search       = trim((string) ($_GET['q'] ?? ''));
$page         = max(1, (int) ($_GET['page'] ?? 1));
$perPage      = 25;

$where  = [];
$params = [];

if (in_array($statusFilter, ['new', 'contacted', 'booked', 'closed'], true)) {
    $where[]  = 'status = ?';
    $params[] = $statusFilter;
}

if ($search !== '') {
    $where[]  = '(name LIKE ? OR phone LIKE ? OR email LIKE ? OR interest LIKE ?)';
    $like     = '%' . $search . '%';
    array_push($params, $like, $like, $like, $like);
}

$whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

$countSt = $pdo->prepare("SELECT COUNT(*) FROM leads $whereSql");
$countSt->execute($params);
$total  = (int) $countSt->fetchColumn();
$pages  = max(1, (int) ceil($total / $perPage));
$page   = min($page, $pages);
$offset = ($page - 1) * $perPage;

// LIMIT/OFFSET are cast to int above, so interpolation here is safe — binding
// them as strings makes MySQL reject the query in emulation-off mode.
$listSt = $pdo->prepare(
    "SELECT * FROM leads $whereSql ORDER BY created_at DESC LIMIT $perPage OFFSET $offset"
);
$listSt->execute($params);
$leads = $listSt->fetchAll();

// ── Stats ────────────────────────────────────────────────────────
$stats = $pdo->query(
    "SELECT
        COUNT(*)                                                       AS total,
        SUM(status = 'new')                                            AS new_count,
        SUM(status = 'booked')                                         AS booked,
        SUM(created_at >= CURDATE())                                   AS today,
        SUM(created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY))         AS week
     FROM leads"
)->fetch();

$byInterest = $pdo->query(
    "SELECT COALESCE(NULLIF(interest, ''), 'Not specified') AS label, COUNT(*) AS n
     FROM leads GROUP BY label ORDER BY n DESC LIMIT 6"
)->fetchAll();

$daily = $pdo->query(
    "SELECT DATE(created_at) AS d, COUNT(*) AS n
     FROM leads
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
     GROUP BY d ORDER BY d"
)->fetchAll();

// Fill missing days so the chart shows a continuous fortnight.
$series = [];
for ($i = 13; $i >= 0; $i--) {
    $day = date('Y-m-d', strtotime("-$i day"));
    $series[$day] = 0;
}
foreach ($daily as $row) {
    $series[$row['d']] = (int) $row['n'];
}
$peak = max(1, max($series));

$statusLabels = [
    'new'       => 'New',
    'contacted' => 'Contacted',
    'booked'    => 'Booked',
    'closed'    => 'Closed',
];
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Leads — Camp Sambhar</title>
<link rel="stylesheet" href="assets/admin.css">
</head>
<body>

<header class="topbar">
  <div class="topbar-inner">
    <span class="brand-mark">Camp Sambhar</span>
    <nav>
      <a href="export.php?<?= e(http_build_query(['status' => $statusFilter, 'q' => $search])) ?>">Export CSV</a>
      <a href="logout.php">Sign out</a>
    </nav>
  </div>
</header>

<main class="wrap">

  <section class="stats">
    <div class="stat"><span class="stat-n"><?= (int) $stats['total'] ?></span><span class="stat-l">Total leads</span></div>
    <div class="stat"><span class="stat-n"><?= (int) $stats['today'] ?></span><span class="stat-l">Today</span></div>
    <div class="stat"><span class="stat-n"><?= (int) $stats['week'] ?></span><span class="stat-l">Last 7 days</span></div>
    <div class="stat"><span class="stat-n"><?= (int) $stats['new_count'] ?></span><span class="stat-l">Awaiting contact</span></div>
    <div class="stat"><span class="stat-n"><?= (int) $stats['booked'] ?></span><span class="stat-l">Booked</span></div>
  </section>

  <section class="panels">
    <div class="panel">
      <h2>Leads per day <span class="muted">— last 14 days</span></h2>
      <div class="chart">
        <?php foreach ($series as $day => $n): ?>
          <div class="bar-col" title="<?= e(date('d M', strtotime($day))) ?>: <?= (int) $n ?>">
            <div class="bar" style="height: <?= $n === 0 ? 2 : round(($n / $peak) * 100) ?>%"></div>
            <span class="bar-x"><?= e(date('j', strtotime($day))) ?></span>
          </div>
        <?php endforeach; ?>
      </div>
    </div>

    <div class="panel">
      <h2>By interest</h2>
      <?php if (!$byInterest): ?>
        <p class="muted">No leads yet.</p>
      <?php else: ?>
        <ul class="breakdown">
          <?php $maxI = max(array_column($byInterest, 'n')); ?>
          <?php foreach ($byInterest as $row): ?>
            <li>
              <span class="bd-label"><?= e($row['label']) ?></span>
              <span class="bd-track"><span class="bd-fill" style="width: <?= round(($row['n'] / $maxI) * 100) ?>%"></span></span>
              <span class="bd-n"><?= (int) $row['n'] ?></span>
            </li>
          <?php endforeach; ?>
        </ul>
      <?php endif; ?>
    </div>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>Enquiries <span class="muted">(<?= (int) $total ?>)</span></h2>

      <form method="get" class="filters">
        <input type="search" name="q" value="<?= e($search) ?>" placeholder="Search name, phone, email…">
        <select name="status" onchange="this.form.submit()">
          <option value="">All statuses</option>
          <?php foreach ($statusLabels as $k => $label): ?>
            <option value="<?= e($k) ?>" <?= $statusFilter === $k ? 'selected' : '' ?>><?= e($label) ?></option>
          <?php endforeach; ?>
        </select>
        <button type="submit" class="btn">Filter</button>
        <?php if ($search !== '' || $statusFilter !== ''): ?>
          <a href="index.php" class="btn btn-ghost">Clear</a>
        <?php endif; ?>
      </form>
    </div>

    <?php if (!$leads): ?>
      <p class="empty">No leads match. New enquiries from the landing page appear here automatically.</p>
    <?php else: ?>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Received</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Stay</th>
              <th>Interest</th>
              <th>Campaign</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          <?php foreach ($leads as $lead): ?>
            <tr>
              <td class="nowrap muted"><?= e(date('d M, H:i', strtotime($lead['created_at']))) ?></td>
              <td>
                <strong><?= e($lead['name']) ?></strong>
                <?php if ($lead['email']): ?>
                  <br><a class="sub" href="mailto:<?= e($lead['email']) ?>"><?= e($lead['email']) ?></a>
                <?php endif; ?>
              </td>
              <td class="nowrap">
                <a href="tel:<?= e($lead['phone']) ?>"><?= e($lead['phone']) ?></a>
                <br>
                <a class="sub" target="_blank" rel="noopener"
                   href="https://wa.me/<?= e(preg_replace('/\D/', '', $lead['phone'])) ?>">WhatsApp</a>
              </td>
              <td class="nowrap">
                <?= $lead['check_in'] ? e(date('d M Y', strtotime($lead['check_in']))) : '<span class="muted">—</span>' ?>
                <?php if ($lead['guests']): ?>
                  <br><span class="sub"><?= e($lead['guests']) ?> guest(s)</span>
                <?php endif; ?>
              </td>
              <td><?= $lead['interest'] ? e($lead['interest']) : '<span class="muted">—</span>' ?></td>
              <td>
                <?= $lead['utm_campaign'] ? e($lead['utm_campaign']) : '<span class="muted">—</span>' ?>
                <?php if ($lead['gclid']): ?><br><span class="sub">Google Ads</span><?php endif; ?>
              </td>
              <td>
                <form method="post" class="inline-form">
                  <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                  <input type="hidden" name="action" value="status">
                  <input type="hidden" name="id" value="<?= (int) $lead['id'] ?>">
                  <select name="status" onchange="this.form.submit()" class="status-<?= e($lead['status']) ?>">
                    <?php foreach ($statusLabels as $k => $label): ?>
                      <option value="<?= e($k) ?>" <?= $lead['status'] === $k ? 'selected' : '' ?>><?= e($label) ?></option>
                    <?php endforeach; ?>
                  </select>
                </form>
              </td>
              <td class="nowrap">
                <details class="notes">
                  <summary><?= $lead['notes'] ? 'Note ✓' : 'Note' ?></summary>
                  <form method="post" class="note-form">
                    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                    <input type="hidden" name="action" value="note">
                    <input type="hidden" name="id" value="<?= (int) $lead['id'] ?>">
                    <textarea name="notes" rows="3" placeholder="Follow-up notes…"><?= e($lead['notes']) ?></textarea>
                    <button type="submit" class="btn btn-sm">Save</button>
                  </form>
                </details>
              </td>
            </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>

      <?php if ($pages > 1): ?>
        <nav class="pager">
          <?php for ($i = 1; $i <= $pages; $i++): ?>
            <?php $qs = http_build_query(array_filter(['status' => $statusFilter, 'q' => $search, 'page' => $i])); ?>
            <a class="<?= $i === $page ? 'is-current' : '' ?>" href="?<?= e($qs) ?>"><?= $i ?></a>
          <?php endfor; ?>
        </nav>
      <?php endif; ?>
    <?php endif; ?>
  </section>

</main>

</body>
</html>
