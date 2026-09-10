/* ============================================================
   Pack Lead — landing de demostración · WhiteMoon
   TODO ES MOCK: el formulario no envía nada a ningún sitio.

   RESKIN POR SECTOR: toca solo CONFIG (en assets/config.js,
   que se carga antes que este archivo) y los tokens de :root
   en assets/styles.css.
   ============================================================ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------------------------------------------------------
   1. Reskin: vuelca CONFIG en el marcado
   --------------------------------------------------------- */
function applyConfig() {
  $$('[data-brand-name]').forEach(el => { el.textContent = CONFIG.brand; });
  $$('[data-zone]').forEach(el => { el.textContent = CONFIG.zone; });
  $$('[data-hours]').forEach(el => { el.textContent = CONFIG.hours; });
  $$('[data-phone]').forEach(el => { el.textContent = CONFIG.phone; });
  $$('[data-svc]').forEach(el => {
    const i = Number(el.dataset.svc) - 1;
    if (CONFIG.services[i]) el.textContent = CONFIG.services[i];
  });
  $$('[data-wa]').forEach(a => {
    a.href = 'https://wa.me/' + CONFIG.whatsapp +
             '?text=' + encodeURIComponent(CONFIG.whatsappText);
  });
  document.title = CONFIG.brand;
}

/* ---------------------------------------------------------
   2. Formulario: nombre + teléfono, con validación
   --------------------------------------------------------- */
const form = $('#leadForm');
const success = $('#success');

const RULES = {
  nombre: {
    input: $('#nombre'),
    err: $('#errNombre'),
    check: v => {
      if (!v) return 'Escribe tu nombre.';
      if (v.length < 2) return 'El nombre es demasiado corto.';
      return '';
    }
  },
  telefono: {
    input: $('#telefono'),
    err: $('#errTelefono'),
    check: v => {
      const digits = v.replace(/\D/g, '');
      if (!digits) return 'Escribe un teléfono de contacto.';
      if (digits.length < 9) return 'El teléfono necesita al menos 9 dígitos.';
      if (digits.length > 15) return 'Ese teléfono tiene demasiados dígitos.';
      return '';
    }
  }
};

function validateField(key, { silent = false } = {}) {
  const rule = RULES[key];
  const problem = rule.check(rule.input.value.trim());
  const field = rule.input.closest('.field');

  if (problem && !silent) {
    field.classList.add('is-bad');
    rule.err.textContent = problem;
    rule.err.hidden = false;
    rule.input.setAttribute('aria-invalid', 'true');
  } else if (!problem) {
    field.classList.remove('is-bad');
    rule.err.hidden = true;
    rule.input.removeAttribute('aria-invalid');
  }
  return !problem;
}

Object.keys(RULES).forEach(key => {
  const { input } = RULES[key];
  /* al escribir solo se limpia el error, no se marca de nuevo */
  input.addEventListener('input', () => validateField(key, { silent: true }));
  input.addEventListener('blur', () => {
    if (input.value.trim()) validateField(key);
  });
});

form.addEventListener('submit', e => {
  e.preventDefault();

  const ok = Object.keys(RULES).map(k => validateField(k)).every(Boolean);
  if (!ok) {
    const firstBad = $('.field.is-bad input');
    if (firstBad) firstBad.focus();
    return;
  }

  /* Demostración: no se envía nada. Solo se muestra el estado de éxito. */
  form.hidden = true;
  success.hidden = false;
  success.setAttribute('role', 'status');
  success.focus?.();
});

/* ---------------------------------------------------------
   3. Scroll reveal con stagger
   --------------------------------------------------------- */
(function reveal() {
  const items = $$('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
})();

/* ---------------------------------------------------------
   4. FAQ: solo una pregunta abierta a la vez
   --------------------------------------------------------- */
const qas = $$('.qa');
qas.forEach(qa => {
  qa.addEventListener('toggle', () => {
    if (!qa.open) return;
    qas.forEach(other => { if (other !== qa) other.open = false; });
  });
});

/* ---------------------------------------------------------
   5. Arranque
   --------------------------------------------------------- */
applyConfig();
