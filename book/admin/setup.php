<?php
/**
 * One-time setup helper: generates the password hash for config.php and
 * confirms the database connection works.
 *
 * DELETE THIS FILE once config.php is filled in. It is harmless on its own —
 * it stores nothing and reveals nothing — but there is no reason to leave a
 * hash generator reachable on a production host.
 */

$hash = '';
$password = (string) ($_POST['password'] ?? '');
if ($password !== '') {
    $hash = password_hash($password, PASSWORD_DEFAULT);
}

// Only test the connection once config.php actually exists.
$dbStatus = null;
if (is_file(__DIR__ . '/inc/config.php')) {
    require_once __DIR__ . '/inc/config.php';
    if (DB_NAME !== 'CHANGE_ME') {
        try {
            $pdo = new PDO(
                sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME),
                DB_USER,
                DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            require_once __DIR__ . '/inc/db.php';
            ensure_schema($pdo);
            $n = (int) $pdo->query('SELECT COUNT(*) FROM leads')->fetchColumn();
            $dbStatus = ['ok', "Connected. The leads table exists and holds $n row(s)."];
        } catch (Throwable $e) {
            $dbStatus = ['bad', 'Could not connect: ' . $e->getMessage()];
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Setup — Camp Sambhar Leads</title>
<link rel="stylesheet" href="assets/admin.css">
</head>
<body class="login-page">
<main class="login-card" style="max-width:520px">

  <div class="login-brand">
    <span class="brand-mark">Camp Sambhar</span>
    <p>First-time setup</p>
  </div>

  <h2 style="font-size:15px;margin:0 0 4px">1. Generate your password hash</h2>
  <p class="sub" style="margin:0 0 10px">
    Type the password you want to use. Copy the result into
    <code>inc/config.php</code> as <code>ADMIN_PASS_HASH</code>.
  </p>

  <form method="post">
    <input type="text" name="password" placeholder="Choose a password" required style="width:100%">
    <button type="submit" class="btn btn-primary btn-block">Generate hash</button>
  </form>

  <?php if ($hash !== ''): ?>
    <p class="sub" style="margin:16px 0 4px">Copy this entire line:</p>
    <textarea readonly rows="3" style="width:100%;font-family:ui-monospace,monospace;font-size:12.5px"
      onclick="this.select()"><?= htmlspecialchars("define('ADMIN_PASS_HASH', '$hash');", ENT_QUOTES) ?></textarea>
  <?php endif; ?>

  <h2 style="font-size:15px;margin:26px 0 4px">2. Database</h2>
  <?php if ($dbStatus === null): ?>
    <p class="sub">Create <code>inc/config.php</code> from <code>inc/config.sample.php</code> and fill in your MySQL details, then reload this page.</p>
  <?php else: ?>
    <p class="alert <?= $dbStatus[0] === 'ok' ? '' : 'alert-error' ?>"
       style="<?= $dbStatus[0] === 'ok' ? 'background:#eef6ee;color:#3f5f3f' : '' ?>">
      <?= htmlspecialchars($dbStatus[1], ENT_QUOTES) ?>
    </p>
  <?php endif; ?>

  <h2 style="font-size:15px;margin:26px 0 4px">3. Finish</h2>
  <p class="sub">
    Delete <code>setup.php</code> from the server, then
    <a href="login.php">sign in</a>.
  </p>

</main>
</body>
</html>
