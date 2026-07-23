<?php
/**
 * Session auth and CSRF for the admin panel.
 *
 * One shared account is enough here: this guards a lead list for a small team,
 * not a multi-tenant application.
 */

require_once __DIR__ . '/db.php';

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => $https,
        'httponly' => true,   // keeps the cookie out of reach of JavaScript
        'samesite' => 'Lax',
    ]);

    session_name('cs_admin');
    session_start();
}

function is_logged_in(): bool
{
    start_session();
    return !empty($_SESSION['uid']) && ($_SESSION['secret'] ?? '') === substr(APP_SECRET, 0, 16);
}

function require_login(): void
{
    if (!is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function attempt_login(string $user, string $pass): bool
{
    start_session();

    // hash_equals for the username too, so response time does not reveal
    // whether the username was the part that was wrong.
    $userOk = hash_equals(ADMIN_USER, $user);
    $passOk = password_verify($pass, ADMIN_PASS_HASH);

    if (!$userOk || !$passOk) {
        return false;
    }

    session_regenerate_id(true);   // defeats session fixation
    $_SESSION['uid']    = $user;
    $_SESSION['secret'] = substr(APP_SECRET, 0, 16);
    return true;
}

function logout(): void
{
    start_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function csrf_token(): string
{
    start_session();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function check_csrf(): void
{
    start_session();
    $sent = $_POST['csrf'] ?? '';
    if (!is_string($sent) || !hash_equals($_SESSION['csrf'] ?? '', $sent)) {
        http_response_code(403);
        exit('Invalid request token. Please reload the page and try again.');
    }
}

/** Escape for HTML output. Every dynamic value in a template goes through this. */
function e(?string $v): string
{
    return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
