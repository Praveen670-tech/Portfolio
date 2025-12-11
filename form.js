// form.js — submit contact form to Formspree with fetch + fallback and UI feedback
(() => {
  'use strict';

  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit');
  const statusEl = document.getElementById('form-status');

  if (!form) return;

  function setStatus(msg, isError = false) {
    statusEl.textContent = msg;
    statusEl.classList.toggle('error', !!isError);
    statusEl.style.color = isError ? '#b91c1c' : '#064e3b';
  }

  function validate() {
    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="_replyto"]');
    const message = form.querySelector('[name="message"]');

    if (!name.value.trim()) { name.focus(); return 'Please enter your name.'; }
    if (!email.value.trim()) { email.focus(); return 'Please enter your email.'; }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!re.test(email.value)) { email.focus(); return 'Please enter a valid email.'; }
    if (!message.value.trim()) { message.focus(); return 'Please enter your message.'; }
    return null;
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const invalid = validate();
    if (invalid) { setStatus(invalid, true); return; }

    // disable
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

    // gather
    const data = new FormData(form);
    if (data.get('_gotcha')) {
      setStatus('Spam detected — not sent.', true);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
      return;
    }

    const payload = {};
    data.forEach((v,k) => payload[k] = v);

    const endpoint = form.action; // ensure this is your formspree endpoint

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStatus('Thanks — your message was sent. I will get back to you soon!', false);
        form.reset();
      } else {
        const json = await res.json().catch(() => null);
        const err = json && json.error ? json.error : 'Unable to send message. Please try again later.';
        setStatus(err, true);
      }
    } catch (err) {
      console.error('Form error:', err);
      // fallback - try a standard form submit (will reload the page)
      setStatus('Network error — retrying using normal submit...', true);
      // remove this handler and submit normally
      form.removeEventListener('submit', arguments.callee);
      form.submit();
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
    }
  });

  // small nicety: set current year in footer
  try { document.getElementById('year').textContent = new Date().getFullYear(); } catch(e){}
})();
