<?php
require_once __DIR__ . '/inc/auth.php';

if (is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    check_csrf();

    // Slows brute force to a crawl without needing to track attempts.
    usleep(400000);

    if (attempt_login(trim($_POST['user'] ?? ''), (string) ($_POST['pass'] ?? ''))) {
        header('Location: index.php');
        exit;
    }
    // Deliberately vague: naming the wrong field helps an attacker.
    $error = 'Incorrect username or password.';
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Sign in — Camp Sambhar Leads</title>
<link rel="stylesheet" href="assets/admin.css">
</head>
<body class="login-page">

<main class="login-card">
  <div class="login-brand">
    <span class="brand-mark">Camp Sambhar</span>
    <p>Lead dashboard</p>
  </div>

  <?php if ($error): ?>
    <p class="alert alert-error"><?= e($error) ?></p>
  <?php endif; ?>

  <form method="post" autocomplete="off">
    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">

    <label for="user">Username</label>
    <input type="text" id="user" name="user" required autofocus>

    <label for="pass">Password</label>
    <input type="password" id="pass" name="pass" required>

    <button type="submit" class="btn btn-primary btn-block">Sign in</button>
  </form>
</main>

</body>
</html>
