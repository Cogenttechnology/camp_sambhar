<?php
/**
 * Database connection and schema.
 *
 * The table is created on first use so deployment is "upload and go" — there is
 * no migration step to forget, which matters when the person deploying is not
 * the person who wrote this.
 */

require_once __DIR__ . '/config.php';

if (DEBUG) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        // Never echo the driver message: it contains the credentials.
        http_response_code(500);
        exit(DEBUG ? 'DB error: ' . $e->getMessage() : 'Database unavailable.');
    }

    ensure_schema($pdo);
    return $pdo;
}

function ensure_schema(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS leads (
            id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name         VARCHAR(120)  NOT NULL,
            phone        VARCHAR(32)   NOT NULL,
            email        VARCHAR(190)  NULL,
            check_in     DATE          NULL,
            guests       VARCHAR(16)   NULL,
            interest     VARCHAR(80)   NULL,
            message      TEXT          NULL,
            source_page  VARCHAR(255)  NULL,
            gclid        VARCHAR(190)  NULL,
            utm_source   VARCHAR(120)  NULL,
            utm_campaign VARCHAR(120)  NULL,
            status       ENUM('new','contacted','booked','closed') NOT NULL DEFAULT 'new',
            notes        TEXT          NULL,
            ip           VARCHAR(45)   NULL,
            user_agent   VARCHAR(255)  NULL,
            created_at   DATETIME      NOT NULL,
            INDEX idx_created (created_at),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

/** Requests per IP in the last hour — the rate-limit check. */
function recent_submission_count(PDO $pdo, string $ip): int
{
    $st = $pdo->prepare(
        'SELECT COUNT(*) FROM leads WHERE ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)'
    );
    $st->execute([$ip]);
    return (int) $st->fetchColumn();
}

function client_ip(): string
{
    // Hostinger sits behind a proxy, so REMOTE_ADDR alone is the load balancer.
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = trim(explode(',', $_SERVER[$key])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '0.0.0.0';
}
