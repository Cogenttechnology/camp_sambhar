# Camp Sambhar — Google Ads Landing Page

A standalone, conversion-focused landing page for paid traffic.
**HTML + CSS + Bootstrap 5** — no build step, no framework. Drop the folder on any host.

```
book/
├─ index.html          ← the landing page
├─ thank-you.html      ← conversion page (5s auto-redirect home)
└─ assets/
   ├─ css/style.css
   ├─ js/main.js
   └─ img/             ← real Camp Sambhar photography
```

---

## Before you run ads — 3 things to set

### 1. Google Ads conversion label
Replace the placeholder in **both** `assets/js/main.js` and `thank-you.html`:

```js
var GADS_CONVERSION = 'AW-XXXXXXXXX/AbC-D_efG';   // ← your real ID/label
```

Also paste your global gtag snippet into the `<head>` of both pages.
Alternatively — and more reliably — set your Ads conversion as a
**destination goal on `/book/thank-you.html`**, which needs no label at all.

### 2. Where the form posts
`assets/js/main.js`:

```js
var ENQUIRY_ENDPOINT = 'api/enquiry.php';
```

That is the bundled PHP endpoint, which stores leads in MySQL and surfaces them
in the dashboard at `/admin/`. Relative on purpose: page and API share an origin
on `book.campsambhar.com`, so there is no CORS preflight.

**See [DEPLOY.md](DEPLOY.md) for the full Hostinger setup** — subdomain,
database, config and the admin password.

**The form never loses a lead:** if the endpoint fails, the visitor still reaches
the thank-you page with a prefilled WhatsApp message ready to send.

### 3. WhatsApp / phone
Currently `+91 94149 91122` throughout. Search and replace `919414991122`
if the ads number differs from the main number.

---

## What makes it convert

| Element | Why |
|---|---|
| Form above the fold, both mobile & desktop | No scroll between ad click and lead capture |
| Only 2 required fields (name, phone) | Every extra field costs completions |
| Price anchors (₹6,500 / ₹3,500) | Pre-qualifies traffic, cuts junk leads |
| Sticky bottom-right rail (Call / WhatsApp / Enquiry) | A CTA is always one tap away |
| Same enquiry modal on every "Check Dates" | One flow, and it pre-selects the stay clicked |
| Trust bar, 4.8★ reviews, DOT/ATOAI accreditation | Third-party proof at decision points |
| FAQ covering cancellation, pets, family | Removes the objections that stall bookings |
| Dedicated thank-you URL | Clean conversion tracking + keeps the lead warm |
| Map loads only on click | Faster page = better Ads Quality Score |

---

## Tracked events

Fired to `gtag` / `fbq` / `dataLayer` when present:

`cta_click` · `phone_click` · `whatsapp_click` · `enquiry_modal_open` ·
`lead_form_start` · `lead_form_error` · `generate_lead` (+ Ads conversion) · `scroll_depth`

Useful in Ads: optimise for **`generate_lead`**; use `lead_form_start` vs
`generate_lead` to spot form drop-off, and `scroll_depth` as an engagement signal.

---

## Testing locally

```bash
cd book
npx serve .        # or: python -m http.server 4500
```

The page is `noindex` by design — it should not compete with the main site in
organic search.

---

## Content sources

All copy and photography come from the client's Phase-1 content pack: the
Welcome/About document, Bird Watching and Stargazing pages, the SaltBox menu,
real policies (cancellation, pet), and verified contact details.
Rates shown are indicative "from" prices — update them in `index.html`
(search for `class="price"`) whenever tariffs change.
