<?php
/**
 * Camp Sambhar — landing page lead capture: configuration.
 *
 * Copy config.sample.php to config.php on the server and fill in the real
 * values. config.php is git-ignored so credentials never reach the repository.
 */

// ── Database (Hostinger: hPanel → Databases → MySQL) ──────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'CHANGE_ME');
define('DB_USER', 'CHANGE_ME');
define('DB_PASS', 'CHANGE_ME');

// ── Admin login ──────────────────────────────────────────────────
// Generate the hash on the server and paste it here — never store a plain
// password. Run once, then delete the file:
//   <?php echo password_hash('your-password', PASSWORD_DEFAULT);
define('ADMIN_USER', 'admin');
define('ADMIN_PASS_HASH', '$2y$10$CHANGE_ME_REPLACE_WITH_A_REAL_HASH');

// Random string, at least 32 characters. Used to sign the session cookie.
define('APP_SECRET', 'CHANGE_ME_TO_A_LONG_RANDOM_STRING');

// ── Notifications ────────────────────────────────────────────────
// Leave NOTIFY_EMAIL empty to disable email alerts.
define('NOTIFY_EMAIL', '');
define('NOTIFY_FROM', 'no-reply@campsambhar.com');

// ── Behaviour ────────────────────────────────────────────────────
// Max submissions accepted from one IP per hour. Blunt but effective against
// the bot floods that paid traffic attracts.
define('RATE_LIMIT_PER_HOUR', 8);

// Show PHP errors on screen. Must stay false in production: a stack trace can
// leak database credentials.
define('DEBUG', false);
