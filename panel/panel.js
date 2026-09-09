/* ============================================================
   Panel de leads — demostración · WhiteMoon
   TODO ES MOCK. Sin backend, sin base de datos, sin envíos.
   El estado vive en memoria y se pierde al recargar.
   Nombres y teléfonos inventados.
   ============================================================ */

const SERVICES = ['Servicio 1', 'Servicio 2', 'Servicio 3'];

/* Fichas de ejemplo */
const SEED = [
  { name: 'Juan Ejemplo',     phone: '600 000 011', service: 0, time: 'Hoy 09:42',  status: 'nuevo' },
  { name: 'Lucía Ficticia',   phone: '600 000 012', service: 2, time: 'Hoy 10:15',  status: 'nuevo' },
  { name: 'Marta Ejemplo',    phone: '600 000 002', service: 1, time: 'Ayer 18:30', status: 'contactado' },
  { name: 'Pedro Muestra',    phone: '600 000 021', service: 0, time: 'Ayer 17:05', status: 'contactado' },
  { name: 'Ana Demostración', phone: '600 000 022', service: 2, time: 'Ayer 12:20', status: 'contactado' },
  { name: 'Carlos Prueba',    phone: '600 000 031', service: 1, time: 'Lun 11:00',  status: 'cerrado' },
  { name: 'Elena Ejemplo',    phone: '600 000 032', service: 0, time: 'Lun 09:30',  status: 'cerrado' }
];

/* Fichas que añade el botón "Simular nuevo lead" */
const EXTRA = [
  { name: 'Sofía Prueba',    phone: '600 000 041', service: 1 },
  { name: 'Diego Ficticio',  phone: '600 000 042', service: 0 },
  { name: 'Nuria Ejemplo',   phone: '600 000 043', service: 2 },
  { name: 'Hugo Muestra',    phone: '600 000 044', service: 1 }
];

const STATES = ['nuevo', 'contactado', 'cerrado'];
const LABEL = { nuevo: 'Nuevo', contactado: 'Contactado', cerrado: 'Cerrado' };

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

let leads = [];
let uid = 0;
let extraIdx = 0;

/* ---------------------------------------------------------
   1. Login cosmético (sin autenticación real)
   --------------------------------------------------------- */
$('#gateForm').addEventListener('submit', e => {
  e.preventDefault();
  $('#gate').hidden = true;
  $('#board').hidden = false;
});

/* ---------------------------------------------------------
   2. Datos
   --------------------------------------------------------- */
function seedLeads() {
  uid = 0;
  extraIdx = 0;
  leads = SEED.map(l => ({ ...l, id: 'l' + (++uid), fresh: false }));
}

function addLead() {
  const src = EXTRA[extraIdx % EXTRA.length];
  extraIdx++;
  leads.unshift({
    ...src,
    id: 'l' + (++uid),
    time: 'Hoy ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    status: 'nuevo',
    fresh: true
  });
  render();
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

/* ---------------------------------------------------------
   3. Pintado
   --------------------------------------------------------- */
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
  svc.textContent = SERVICES[lead.service] || 'Otra consulta';

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
    $$('[data-count-' + state + ']').forEach(el => { el.textContent = items.length; });
  });
}

/* ---------------------------------------------------------
   4. Arrastrar y soltar entre columnas
   --------------------------------------------------------- */
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
   5. Acciones del tablero
   --------------------------------------------------------- */
$('#btnNuevo').addEventListener('click', addLead);
$('#btnReset').addEventListener('click', () => { seedLeads(); render(); });

/* ---------------------------------------------------------
   6. Arranque
   --------------------------------------------------------- */
seedLeads();
render();
