/* ============================================================
   Pack Lead — demo de venta · WhiteMoon
   TODO ES MOCK. Sin backend, sin base de datos, sin envíos.
   El estado vive en memoria (se pierde al recargar).

   RESKIN POR SECTOR: toca solo el objeto CONFIG y los tokens
   de color en assets/styles.css.
   ============================================================ */

const CONFIG = {
  brand: 'Tu Negocio Local',
  mark: 'TN',
  services: ['Servicio 1', 'Servicio 2', 'Servicio 3'],
  otherLabel: 'Otra consulta',
  whatsapp: '34600000000',          // número de ejemplo
  rotatingWords: ['consulta', 'llamada', 'visita', 'pregunta']
};

/* Fichas de ejemplo. Nombres y teléfonos inventados. */
const SEED = [
  { name: 'Juan Ejemplo',      phone: '600 000 011', service: 0, time: 'Hoy 09:42',  status: 'nuevo' },
  { name: 'Lucía Ficticia',    phone: '600 000 012', service: 2, time: 'Hoy 10:15',  status: 'nuevo' },
  { name: 'Marta Ejemplo',     phone: '600 000 002', service: 1, time: 'Ayer 18:30', status: 'contactado' },
  { name: 'Pedro Muestra',     phone: '600 000 021', service: 0, time: 'Ayer 17:05', status: 'contactado' },
  { name: 'Ana Demostración',  phone: '600 000 022', service: 2, time: 'Ayer 12:20', status: 'contactado' },
  { name: 'Carlos Prueba',     phone: '600 000 031', service: 1, time: 'Lun 11:00',  status: 'cerrado' },
  { name: 'Elena Ejemplo',     phone: '600 000 032', service: 0, time: 'Lun 09:30',  status: 'cerrado' }
];

const STATES = ['nuevo', 'contactado', 'cerrado'];
const LABEL = { nuevo: 'Nuevo', contactado: 'Contactado', cerrado: 'Cerrado' };

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

let leads = [];
let uid = 0;

/* ---------------------------------------------------------
   1. Reskin: vuelca CONFIG en el marcado
   --------------------------------------------------------- */
function applyBrand() {
  $$('[data-brand-name]').forEach(el => { el.textContent = CONFIG.brand; });
  $$('[data-brand-mark]').forEach(el => { el.textContent = CONFIG.mark; });
  $$('[data-svc]').forEach(el => {
    const i = Number(el.dataset.svc) - 1;
    if (CONFIG.services[i]) el.textContent = CONFIG.services[i];
  });
  $$('a[href*="wa.me"]').forEach(a => {
    a.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' +
             encodeURIComponent('Hola, quiero información');
  });
  document.title = CONFIG.brand + ' — Demo Pack Lead';
}

/* ---------------------------------------------------------
   2. Cambio de vista (landing <-> panel)
   --------------------------------------------------------- */
function showView(name, opts = {}) {
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + name));
  if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
  $('#launcher').classList.toggle('is-hidden', !$('#chat').hidden);
}

document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-view]');
  if (!trigger) return;
  const target = trigger.dataset.view;
  const isAnchor = trigger.tagName === 'A' && trigger.getAttribute('href') || '';

  if (target === 'landing' && isAnchor) {
    // enlace del nav: asegura la landing y deja que el ancla haga scroll
    if (!$('#view-landing').classList.contains('is-active')) {
      e.preventDefault();
      showView('landing', { keepScroll: true });
      requestAnimationFrame(() => {
        const el = document.querySelector(trigger.getAttribute('href'));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    }
    return;
  }
  e.preventDefault();
  showView(target);
});

/* ---------------------------------------------------------
   3. Panel: login cosmético (sin autenticación real)
   --------------------------------------------------------- */
$('#gateForm').addEventListener('submit', e => {
  e.preventDefault();
  $('#gate').hidden = true;
  $('#board').hidden = false;
});

$('#btnReset').addEventListener('click', () => {
  seedLeads();
  render();
});

/* ---------------------------------------------------------
   4. Pipeline
   --------------------------------------------------------- */
function seedLeads() {
  uid = 0;
  leads = SEED.map(l => ({ ...l, id: 'l' + (++uid), fresh: false }));
}

function buildCard(lead) {
  const idx = STATES.indexOf(lead.status);
  const card = document.createElement('article');
  card.className = 'card' + (lead.fresh ? ' is-fresh' : '');
  card.draggable = true;
  card.dataset.id = lead.id;

  if (lead.fresh) {
    const badge = document.createElement('span');
    badge.className = 'card__new';
    badge.textContent = 'NUEVO';
    card.appendChild(badge);
  }

  const top = document.createElement('div');
  top.className = 'card__top';
  const name = document.createElement('span');
  name.className = 'card__name';
  name.textContent = lead.name;
  const time = document.createElement('span');
  time.className = 'card__time';
  time.textContent = lead.time;
  top.append(name, time);

  const svc = document.createElement('span');
  svc.className = 'card__svc';
  svc.textContent = CONFIG.services[lead.service] || CONFIG.otherLabel;

  const tel = document.createElement('p');
  tel.className = 'card__tel';
  tel.textContent = lead.phone;

  const nav = document.createElement('div');
  nav.className = 'card__nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'card__btn';
  prev.textContent = idx === 0 ? '←' : '← ' + LABEL[STATES[idx - 1]];
  prev.disabled = idx === 0;
  prev.addEventListener('click', () => move(lead.id, -1));
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'card__btn';
  next.textContent = idx === STATES.length - 1 ? '→' : LABEL[STATES[idx + 1]] + ' →';
  next.disabled = idx === STATES.length - 1;
  next.addEventListener('click', () => move(lead.id, 1));
  nav.append(prev, next);

  card.append(top, svc, tel, nav);

  card.addEventListener('dragstart', ev => {
    ev.dataTransfer.setData('text/plain', lead.id);
    ev.dataTransfer.effectAllowed = 'move';
    card.classList.add('is-dragging');
  });
  card.addEventListener('dragend', () => card.classList.remove('is-dragging'));

  return card;
}

function move(id, delta) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  const idx = STATES.indexOf(lead.status) + delta;
  if (idx < 0 || idx >= STATES.length) return;
  lead.status = STATES[idx];
  lead.fresh = false;
  render();
}

function setStatus(id, status) {
  const lead = leads.find(l => l.id === id);
  if (!lead || lead.status === status) return;
  lead.status = status;
  lead.fresh = false;
  render();
}

function render() {
  STATES.forEach(state => {
    const body = $('[data-drop="' + state + '"]');
    body.textContent = '';
    const items = leads.filter(l => l.status === state);
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'col__empty';
      empty.textContent = 'Sin fichas en esta columna';
      body.appendChild(empty);
    } else {
      items.forEach(l => body.appendChild(buildCard(l)));
    }
  });
  updateCounts();
}

function updateCounts() {
  const c = {
    total: leads.length,
    nuevo: leads.filter(l => l.status === 'nuevo').length,
    contactado: leads.filter(l => l.status === 'contactado').length,
    cerrado: leads.filter(l => l.status === 'cerrado').length
  };
  Object.keys(c).forEach(k => {
    $$('[data-count-' + k + ']').forEach(el => { el.textContent = c[k]; });
  });
}

/* drag & drop entre columnas */
$$('.col').forEach(col => {
  const state = col.dataset.col;
  col.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    col.classList.add('is-over');
  });
  col.addEventListener('dragleave', e => {
    if (!col.contains(e.relatedTarget)) col.classList.remove('is-over');
  });
  col.addEventListener('drop', e => {
    e.preventDefault();
    col.classList.remove('is-over');
    setStatus(e.dataTransfer.getData('text/plain'), state);
  });
});

/* ---------------------------------------------------------
   5. Chatbot GUIADO (guion fijo, sin envío de datos)
   --------------------------------------------------------- */
const chat = $('#chat');
const chatLog = $('#chatLog');
const chatFoot = $('#chatFoot');
const launcher = $('#launcher');

let draft = { service: null, name: '', phone: '' };
let busy = false;

function bubble(text, who) {
  const p = document.createElement('p');
  p.className = 'msg msg--' + who;
  p.textContent = text;
  chatLog.appendChild(p);
  chatLog.scrollTop = chatLog.scrollHeight;
  return p;
}

function typing() {
  const d = document.createElement('div');
  d.className = 'msg msg--bot typing';
  d.innerHTML = '<span></span><span></span><span></span>';
  chatLog.appendChild(d);
  chatLog.scrollTop = chatLog.scrollHeight;
  return d;
}

function botSay(text, delay = 620) {
  return new Promise(resolve => {
    const dots = typing();
    setTimeout(() => {
      dots.remove();
      bubble(text, 'bot');
      resolve();
    }, delay);
  });
}

function clearFoot() { chatFoot.textContent = ''; }

/* el pie del chat cambia de alto: hay que reajustar el scroll del log */
function scrollLog() {
  requestAnimationFrame(() => { chatLog.scrollTop = chatLog.scrollHeight; });
}

function askOptions(list, onPick) {
  clearFoot();
  const box = document.createElement('div');
  box.className = 'opts';
  list.forEach((label, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opt';
    b.textContent = label;
    b.addEventListener('click', () => { clearFoot(); onPick(label, i); });
    box.appendChild(b);
  });
  chatFoot.appendChild(box);
  scrollLog();
}

function askInput({ placeholder, type = 'text', validate, onDone }) {
  clearFoot();
  const form = document.createElement('form');
  form.className = 'entry';
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  const send = document.createElement('button');
  send.type = 'submit';
  send.textContent = 'Enviar';
  form.append(input, send);

  const err = document.createElement('p');
  err.className = 'entry__err';
  err.hidden = true;

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const value = input.value.trim();
    const problem = validate(value);
    if (problem) {
      err.textContent = problem;
      err.hidden = false;
      return;
    }
    clearFoot();
    onDone(value);
  });

  chatFoot.append(form, err);
  scrollLog();
  input.focus();
}

async function startChat(preselect) {
  busy = true;
  chatLog.textContent = '';
  clearFoot();
  draft = { service: null, name: '', phone: '' };

  await botSay('Hola, soy el asistente de contacto de ' + CONFIG.brand + '.', 420);

  if (preselect !== null && preselect !== undefined) {
    draft.service = preselect;
    bubble(CONFIG.services[preselect], 'user');
    await stepName();
  } else {
    await botSay('¿Qué necesitas?');
    askOptions(CONFIG.services.concat(CONFIG.otherLabel), async (label, i) => {
      draft.service = i < CONFIG.services.length ? i : null;
      bubble(label, 'user');
      await stepName();
    });
  }
  busy = false;
}

async function stepName() {
  await botSay('Perfecto. ¿Cómo te llamas?');
  askInput({
    placeholder: 'Tu nombre',
    validate: v => v.length < 2 ? 'Escribe un nombre para continuar.' : '',
    onDone: async v => {
      draft.name = v;
      bubble(v, 'user');
      await stepPhone();
    }
  });
}

async function stepPhone() {
  await botSay('Gracias, ' + draft.name.split(' ')[0] + '. ¿Un teléfono para contactarte?');
  askInput({
    placeholder: 'Teléfono',
    type: 'tel',
    validate: v => {
      const digits = v.replace(/\D/g, '');
      return digits.length < 9 ? 'Necesitamos un teléfono de al menos 9 dígitos.' : '';
    },
    onDone: async v => {
      draft.phone = v;
      bubble(v, 'user');
      await finishChat();
    }
  });
}

async function finishChat() {
  await botSay('¡Gracias, ' + draft.name.split(' ')[0] + '! Te contactamos en breve.');

  const lead = {
    id: 'l' + (++uid),
    name: draft.name,
    phone: draft.phone,
    service: draft.service,
    time: 'Hoy ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    status: 'nuevo',
    fresh: true
  };
  leads.unshift(lead);
  render();
  showToast(lead);

  clearFoot();
  const box = document.createElement('div');
  box.className = 'opts';

  const seeIt = document.createElement('button');
  seeIt.type = 'button';
  seeIt.className = 'opt';
  seeIt.textContent = 'Ver la ficha en el panel';
  seeIt.addEventListener('click', () => {
    closeChat();
    $('#gate').hidden = true;
    $('#board').hidden = false;
    showView('pipeline');
  });

  const again = document.createElement('button');
  again.type = 'button';
  again.className = 'opt';
  again.textContent = 'Empezar de nuevo';
  again.addEventListener('click', () => startChat(null));

  box.append(seeIt, again);
  chatFoot.appendChild(box);
  scrollLog();
}

function openChat(preselect) {
  chat.hidden = false;
  launcher.classList.add('is-hidden');
  if (!busy) startChat(preselect);
}

function closeChat() {
  chat.hidden = true;
  launcher.classList.remove('is-hidden');
}

launcher.addEventListener('click', () => openChat(null));
$('#chatClose').addEventListener('click', closeChat);

document.addEventListener('click', e => {
  const t = e.target.closest('[data-chat-open]');
  if (!t) return;
  const svc = t.dataset.chatService;
  openChat(svc ? Number(svc) - 1 : null);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !chat.hidden) closeChat();
});

/* ---------------------------------------------------------
   6. Aviso tipo notificación de móvil (ilustración)
   --------------------------------------------------------- */
const toast = $('#toast');
let toastTimer = null;

function showToast(lead) {
  clearTimeout(toastTimer);
  toast.classList.remove('is-out');
  /* si el chat está abierto ocuparía su cabecera: se aparta a la izquierda */
  toast.classList.toggle('is-shifted', !chat.hidden);
  $('#toastText').textContent = 'Nuevo lead: ' + lead.name + ' · ' + lead.phone;
  toast.hidden = false;
  toastTimer = setTimeout(() => {
    toast.classList.add('is-out');
    setTimeout(() => { toast.hidden = true; }, 300);
  }, 6000);
}

/* ---------------------------------------------------------
   7. Detalles de interfaz
   --------------------------------------------------------- */

/* palabra rotatoria del hero */
(function rotator() {
  const el = $('[data-rotate]');
  if (!el) return;
  let i = 0;
  setInterval(() => {
    el.classList.add('is-out');
    setTimeout(() => {
      i = (i + 1) % CONFIG.rotatingWords.length;
      el.textContent = CONFIG.rotatingWords[i];
      el.classList.remove('is-out');
    }, 220);
  }, 2600);
})();

/* scroll reveal con stagger */
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
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
})();

/* cursor personalizado (solo desktop con puntero fino) */
(function cursor() {
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  if (window.innerWidth <= 1024) return;

  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  let x = 0, y = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
  });

  (function loop() {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseover', e => {
    const hot = e.target.closest('a,button,input,.card');
    ring.classList.toggle('is-hot', !!hot);
  });
})();

/* ---------------------------------------------------------
   8. Arranque
   --------------------------------------------------------- */
applyBrand();
seedLeads();
render();
