/* ═══════════════════════════════════════════════════════════
   Camp Sambhar — landing page behaviour
   Lead capture, validation, conversion tracking hooks, reveals.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Where the enquiry is POSTed. Relative on purpose: when this page and the
  // PHP API sit on the same host (book.campsambhar.com) there is no CORS
  // preflight to satisfy. Use an absolute URL only if they are split apart —
  // and then add that origin to the allow-list in api/enquiry.php.
  var ENQUIRY_ENDPOINT = 'api/enquiry.php';
  var WHATSAPP_NUMBER = '919414991122';

  /* ── Conversion tracking ────────────────────────────────
     Fires into Google Ads / GA4 / Meta when they're present.
     Replace AW-XXXXXXXXX/AbC-D_efG with your real conversion label. */
  var GADS_CONVERSION = 'AW-XXXXXXXXX/AbC-D_efG';

  function track(action, params) {
    params = params || {};
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', action, params);
      }
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', action, params);
      }
      if (window.dataLayer && typeof window.dataLayer.push === 'function') {
        window.dataLayer.push(Object.assign({ event: action }, params));
      }
    } catch (e) {
      /* tracking must never break the page */
    }
  }

  function trackConversion(value) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          send_to: GADS_CONVERSION,
          value: value || 1.0,
          currency: 'INR'
        });
      }
    } catch (e) {}
  }

  /* ── CTA click tracking ── */
  document.querySelectorAll('.js-cta').forEach(function (el) {
    el.addEventListener('click', function () {
      var where = el.getAttribute('data-cta') || 'unknown';
      track('cta_click', { cta_location: where });
      if (/call/.test(where)) track('phone_click', { cta_location: where });
      if (/wa/.test(where)) track('whatsapp_click', { cta_location: where });
    });
  });

  /* ── Enquiry modal ──
     Every "Check Dates" / "Check Availability" CTA opens the same form as a
     popup, pre-selecting the relevant stay where the button declares one. */
  var modalEl = document.getElementById('enquiryModal');
  var enquiryModal = modalEl && window.bootstrap ? new window.bootstrap.Modal(modalEl) : null;

  document.querySelectorAll('.js-open-enquiry').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var interest = btn.getAttribute('data-interest');
      if (interest) {
        var sel = document.getElementById('m_interest');
        if (sel) {
          Array.prototype.forEach.call(sel.options, function (o) {
            if (o.value === interest || o.text === interest) sel.value = o.value;
          });
        }
      }
      track('enquiry_modal_open', { cta_location: btn.getAttribute('data-cta') || 'unknown' });

      if (enquiryModal) {
        enquiryModal.show();
      } else {
        // Bootstrap JS unavailable — fall back to the inline hero form
        var target = document.getElementById('enquire');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Focus the first field once the modal is visible (a11y + faster completion)
  if (modalEl) {
    modalEl.addEventListener('shown.bs.modal', function () {
      var first = document.getElementById('m_name');
      if (first) first.focus();
    });
  }

  /* ── Smooth scroll for any remaining in-page anchors ── */
  document.querySelectorAll('a[href="#enquire"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.getElementById('enquire');
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () {
        var first = document.getElementById('name');
        if (first) first.focus({ preventScroll: true });
      }, 500);
    });
  });

  /* ── Lead forms (hero + modal share one handler) ── */
  var startedForm = false;

  function wireForm(formId, successId, submitId, waId, scrollOnSuccess) {
    var form = document.getElementById(formId);
    if (!form) return;
    var successBox = document.getElementById(successId);
    var submitBtn = document.getElementById(submitId);

    // Track first interaction — useful for funnel drop-off analysis
    form.addEventListener('input', function () {
      if (!startedForm) {
        startedForm = true;
        track('lead_form_start', {});
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot — bots fill hidden fields
      if (form.company && form.company.value) return;

      // Native validation with Bootstrap styling
      var valid = true;
      ['name', 'phone'].forEach(function (fieldName) {
        var field = form.elements[fieldName];
        if (!field) return;
        if (!field.checkValidity()) {
          field.classList.add('is-invalid');
          valid = false;
        } else {
          field.classList.remove('is-invalid');
        }
      });
      if (!valid) {
        track('lead_form_error', {});
        var firstBad = form.querySelector('.is-invalid');
        if (firstBad) firstBad.focus();
        return;
      }

      var checkIn = form.elements.checkIn ? form.elements.checkIn.value : '';
      var guests = form.elements.guests ? form.elements.guests.value : '';
      var interest = form.elements.interest ? form.elements.interest.value : '';

      var data = {
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
        checkIn: checkIn || null,
        guests: guests,
        interest: interest,
        message:
          'Google Ads landing page enquiry — ' + interest +
          ' · ' + guests + ' guest(s)' +
          (checkIn ? ' · check-in ' + checkIn : ''),
        sourcePage: window.location.pathname + window.location.search
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) { return res.ok ? res.json().catch(function () { return {}; }) : Promise.reject(res.status); })
        .then(function () { showSuccess(data, false); })
        // Never lose the lead: fall back to WhatsApp with details prefilled.
        .catch(function () { showSuccess(data, true); });

      function showSuccess(d, fallback) {
        track('generate_lead', { interest: d.interest, guests: d.guests });
        trackConversion(1.0);

        // Hand the lead details to the thank-you page so it can prefill WhatsApp.
        try { sessionStorage.setItem('cs_lead', JSON.stringify(d)); } catch (e) {}

        // Show the inline confirmation briefly, then move to the dedicated
        // thank-you page — a clean conversion URL for Google Ads to track.
        var msg =
          'Hi Camp Sambhar, I would like to check availability.%0A' +
          'Name: ' + encodeURIComponent(d.name) + '%0A' +
          'Phone: ' + encodeURIComponent(d.phone) + '%0A' +
          (d.checkIn ? 'Check-in: ' + encodeURIComponent(d.checkIn) + '%0A' : '') +
          'Guests: ' + encodeURIComponent(d.guests) + '%0A' +
          'Interested in: ' + encodeURIComponent(d.interest);

        var wa = document.getElementById(waId);
        if (wa) wa.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + msg;

        form.hidden = true;
        if (successBox) {
          successBox.hidden = false;
          if (scrollOnSuccess) successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (fallback) {
            var note = successBox.querySelector('p');
            if (note) {
              note.textContent =
                'Our team will contact you shortly. Redirecting you now…';
            }
          }
        }

        setTimeout(function () { window.location.href = 'thank-you.html'; }, 900);
      }
    });
  }

  wireForm('leadForm', 'leadSuccess', 'submitBtn', 'waFollow', true);
  wireForm('leadFormModal', 'leadSuccessModal', 'submitBtnModal', 'waFollowModal', false);

  /* ── Reveal on scroll ──
     Progressive enhancement: elements are visible by default in CSS, and we
     only add the hidden state when JS + IntersectionObserver are available.
     A failsafe reveals everything shortly after load so content can never
     get stuck invisible (which would tank the ad landing-page experience). */
  var revealTargets = document.querySelectorAll(
    '.feature, .stay-card, .review, .exp-item, .map-wrap'
  );
  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -2% 0px' }
    );
    revealTargets.forEach(function (el) { io.observe(el); });

    // Anything still hidden after 2s gets shown regardless.
    setTimeout(function () {
      revealTargets.forEach(function (el) { el.classList.add('in'); });
    }, 2000);
  }

  /* ── Scroll-depth tracking (engagement signal for Ads) ── */
  var marks = [25, 50, 75, 100];
  var hit = {};
  window.addEventListener(
    'scroll',
    function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      var pct = Math.round((window.scrollY / h) * 100);
      marks.forEach(function (m) {
        if (pct >= m && !hit[m]) {
          hit[m] = true;
          track('scroll_depth', { percent: m });
        }
      });
    },
    { passive: true }
  );

  /* ── Map facade: swap in the real iframe on first click ── */
  var mapFacade = document.getElementById('mapFacade');
  if (mapFacade) {
    mapFacade.addEventListener('click', function () {
      if (mapFacade.querySelector('iframe')) return;
      var iframe = document.createElement('iframe');
      iframe.title = 'Camp Sambhar Resort location';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      iframe.src =
        'https://www.google.com/maps?q=Camp+Sambhar+Resort,+Sambhar+Lake,+Rajasthan+303604&output=embed';
      mapFacade.appendChild(iframe);
    });
  }

  /* ── Set a sensible min date on check-in ── */
  var checkin = document.getElementById('checkin');
  if (checkin) {
    var today = new Date();
    checkin.min = today.toISOString().split('T')[0];
  }
})();
