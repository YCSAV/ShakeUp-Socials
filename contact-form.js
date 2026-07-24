// Submits the contact form to Web3Forms via fetch (no page reload / no redirect),
// and shows an inline status message in the #cf-status element.
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('cf-status');
  var btn = form.querySelector('button[type="submit"]');
  var btnLabel = btn ? btn.textContent : '';

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot spam check — if a bot filled this hidden field, silently drop it.
    var honeypot = form.querySelector('input[name="botcheck"]');
    if (honeypot && honeypot.checked) return;

    var data = Object.fromEntries(new FormData(form).entries());

    status.textContent = '';
    status.className = 'form-status';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (result.success) {
          form.reset();
          status.textContent = "Thanks — your message is on its way. We'll get back to you soon.";
          status.classList.add('is-success');
        } else {
          status.textContent = result.message || 'Something went wrong. Please try again or email us directly.';
          status.classList.add('is-error');
        }
      })
      .catch(function () {
        status.textContent = 'Something went wrong. Please try again or email us directly.';
        status.classList.add('is-error');
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
      });
  });
})();
