# Deploying to Hostinger — `book.campsambhar.com`

The landing page, the lead API and the admin dashboard are one PHP + MySQL
bundle. No build step, no Node, no Composer — upload and configure.

```
book/                        ← upload the CONTENTS of this folder to the subdomain root
├─ index.html                landing page
├─ thank-you.html            conversion page
├─ .htaccess                 HTTPS redirect, security headers, caching
├─ api/enquiry.php           receives the form, writes the lead, emails you
├─ admin/                    the dashboard
│  ├─ index.php              leads, filters, statuses, stats
│  ├─ export.php             CSV download
│  ├─ login.php  logout.php  setup.php
│  └─ inc/                   config + db + auth  (blocked from the web)
└─ assets/                   css, js, images
```

---

## 1. Create the subdomain

hPanel → **Domains → Subdomains** → create `book`.

Note the folder it creates — usually `public_html/book`. That folder becomes the
document root for `book.campsambhar.com`.

## 2. Create the database

hPanel → **Databases → MySQL Databases**. Create a database and a user, and give
that user **all privileges** on it.

Write down the four values: host (`localhost`), database name, username,
password. Hostinger prefixes names, so they look like `u123456789_leads`.

## 3. Upload

Upload **the contents of `book/`** — not the folder itself — into the subdomain
folder. `index.html` must sit at the root, so that
`https://book.campsambhar.com/` serves the landing page directly.

Use hPanel → File Manager, or FTP.

## 4. Configure

Copy `admin/inc/config.sample.php` to `admin/inc/config.php` and fill in:

```php
define('DB_NAME', 'u123456789_leads');
define('DB_USER', 'u123456789_admin');
define('DB_PASS', 'the password you chose');

define('ADMIN_USER', 'admin');
define('ADMIN_PASS_HASH', '…');   // step 5 generates this

define('APP_SECRET', 'any long random string, 32+ characters');

define('NOTIFY_EMAIL', 'bookings@campsambhar.com');   // '' to disable alerts
```

`config.php` is git-ignored, so the live credentials never reach the repository.

## 5. Generate the password hash

Open **`https://book.campsambhar.com/admin/setup.php`**.

Type the password you want, copy the generated `define('ADMIN_PASS_HASH', …)`
line into `config.php`, and reload the page — it also confirms the database
connects and creates the `leads` table.

**Then delete `setup.php` from the server.**

## 6. Test it

1. Open `https://book.campsambhar.com/` and submit the form.
2. Sign in at `https://book.campsambhar.com/admin/` — the lead should be listed.
3. Check that the notification email arrived.

---

## Before you spend on ads

**Google Ads conversion label.** Still a placeholder in two files:

```js
var GADS_CONVERSION = 'AW-XXXXXXXXX/AbC-D_efG';   // assets/js/main.js
```

`thank-you.html` has the same constant. Paste your global gtag snippet into the
`<head>` of both pages.

Simpler and more reliable: set the Ads conversion as a **destination goal on
`/thank-you.html`** — no label needed.

**Check the phone number.** `919414991122` appears throughout `index.html` and
`main.js`. Search and replace if the ads number differs.

---

## How it behaves

**A lead is never lost.** If the API is unreachable the form still advances to
the thank-you page with a prefilled WhatsApp message — the guest completes the
enquiry either way. Test this by renaming `api/enquiry.php` temporarily.

**Bots are handled quietly.** A hidden honeypot field catches most of them; the
response is a normal `200` so they do not retry. Submissions are also capped at
8 per IP per hour (`RATE_LIMIT_PER_HOUR`).

**Google Ads attribution is stored.** `gclid`, `utm_source` and `utm_campaign`
are parsed from the landing-page URL and saved with each lead, so the dashboard
shows which campaign produced it.

---

## Security notes

- `admin/inc/` is blocked by its own `.htaccess`. **Confirm this after upload**
  by visiting `https://book.campsambhar.com/admin/inc/config.php` — you should
  get 403 or 404, never PHP source or a blank page. If it renders blank, the
  block is not active: contact Hostinger support about `AllowOverride`.
- Passwords are stored as bcrypt hashes, never plain text.
- The admin session cookie is `HttpOnly` and `SameSite=Lax`; all forms carry
  CSRF tokens.
- Every query uses prepared statements.
- CSV export escapes leading `=`, `+`, `-` and `@` so a malicious lead name
  cannot execute as a formula when the file is opened in Excel.
- `DEBUG` must stay `false` in production — a stack trace can expose the
  database password.

---

## Maintenance

**Back up the leads.** hPanel → Databases → phpMyAdmin → Export. The CSV export
in the dashboard is a convenience, not a backup: it omits nothing important but
is not a restorable dump.

**Changing the admin password:** re-upload `setup.php`, generate a new hash,
update `config.php`, delete `setup.php` again.
