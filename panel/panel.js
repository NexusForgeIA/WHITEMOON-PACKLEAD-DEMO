/* ============================================================
   Panel de leads — demostración · WhiteMoon
   TODO ES MOCK. Sin backend, sin base de datos, sin envíos.
   El estado vive en memoria y se pierde al recargar.
   Nombres, teléfonos y llamadas programadas inventados.
   La agenda no avisa a nadie: no hay calendario ni recordatorios.
   «Pedir reseña» no envía nada: abre WhatsApp con el mensaje
   escrito para que lo mande el dueño a mano. Sin IA, sin API.
   ============================================================ */

/* CONFIG vive en assets/config.js (cargado antes que este archivo):
   marca, WhatsApp y enlace de reseña, todos de ejemplo. */
const SERVICES = CONFIG.services;

/* Fichas de ejemplo.
   `cita` = [días desde hoy, hora, minuto], o un número = horas desde ahora
   (así la primera cita de la demo siempre queda por delante, sea la hora que sea). */
const SEED = [
  { name: 'Juan Ejemplo',     phone: '600 000 011', service: 0, time: 'Hoy 09:42',  status: 'nuevo',      cita: 2 },
  { name: 'Lucía Ficticia',   phone: '600 000 012', service: 2, time: 'Hoy 10:15',  status: 'nuevo' },
  { name: 'Marta Ejemplo',    phone: '600 000 002', service: 1, time: 'Ayer 18:30', status: 'contactado' },
  { name: 'Pedro Muestra',    phone: '600 000 021', service: 0, time: 'Ayer 17:05', status: 'contactado', cita: [2, 12, 0] },
  { name: 'Ana Demostración', phone: '600 000 022', service: 2, time: 'Ayer 12:20', status: 'contactado', cita: [1, 9, 30] },
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
let editingId = null;   /* ficha con el selector de fecha abierto */

/* ---------------------------------------------------------
   1. Login cosmético (sin autenticación real)
   --------------------------------------------------------- */
$('#gateForm').addEventListener('submit', e => {
  e.preventDefault();
  $('#gate').hidden = true;
  $('#board').hidden = false;
});

/* ---------------------------------------------------------
   2. Fechas
   --------------------------------------------------------- */

/* 'YYYY-MM-DDTHH:MM' en hora local, que es lo que aceptan los inputs */
function toLocalISO(d) {
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
         'T' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function offsetISO(days, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return toLocalISO(d);
}

/* Dentro de N horas, redondeado a la media hora siguiente.
   Si cae fuera del horario de atención, salta a las 10:00 del día siguiente:
   así la demo enseña una cita creíble se abra a la hora que se abra. */
function enHorasISO(horas) {
  const d = new Date();
  d.setHours(d.getHours() + horas, d.getMinutes() < 30 ? 30 : 60, 0, 0);
  if (d.getHours() < 9 || d.getHours() >= 19) {
    d.setDate(d.getDate() + (d.getHours() >= 19 ? 1 : 0));
    d.setHours(10, 0, 0, 0);
  }
  return toLocalISO(d);
}

/* Devuelve etiquetas legibles para una cita */
function whenParts(iso) {
  const d = new Date(iso);
  const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dia0 = new Date(d);
  dia0.setHours(0, 0, 0, 0);
  const dias = Math.round((dia0 - hoy) / 86400000);

  let dia;
  if (dias === 0) dia = 'hoy';
  else if (dias === 1) dia = 'mañana';
  else if (dias === -1) dia = 'ayer';
  else dia = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

  return { dia, hora, pasada: d.getTime() < Date.now() };
}

/* ---------------------------------------------------------
   3. Datos
   --------------------------------------------------------- */
function seedLeads() {
  uid = 0;
  extraIdx = 0;
  editingId = null;
  leads = SEED.map(l => {
    const { cita, ...resto } = l;
    return {
      ...resto,
      id: 'l' + (++uid),
      fresh: false,
      reviewAsked: false,
      when: !cita ? null
          : typeof cita === 'number' ? enHorasISO(cita)
          : offsetISO(cita[0], cita[1], cita[2])
    };
  });
}

function addLead() {
  const src = EXTRA[extraIdx % EXTRA.length];
  extraIdx++;
  leads.unshift({
    ...src,
    id: 'l' + (++uid),
    time: 'Hoy ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    status: 'nuevo',
    fresh: true,
    reviewAsked: false,
    when: null
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

function setWhen(id, iso) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  lead.when = iso;
  editingId = null;
  render();
}

/* Abre WhatsApp con la petición de reseña ya escrita.
   Semi-manual a propósito: el mensaje lo envía el dueño desde su
   WhatsApp. No hay envío automático, ni API, ni backend.
   El número y el enlace de reseña son los de ejemplo de CONFIG. */
function reviewURL(lead) {
  const texto = 'Hola ' + lead.name + ', soy ' + CONFIG.brand + '. ' +
    'Gracias por confiar en nosotros. Si te ha ido bien, ' +
    '¿nos dejas una reseña en Google? Nos ayuda muchísimo: ' + CONFIG.reviewLink;
  return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(texto);
}

function askReview(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  window.open(reviewURL(lead), '_blank', 'noopener');
  lead.reviewAsked = true;   /* solo en memoria, como el resto de la demo */
  render();
}

/* ---------------------------------------------------------
   4. Ficha
   --------------------------------------------------------- */
function buildSchedEditor(lead) {
  const box = document.createElement('form');
  box.className = 'sched';

  /* valor de partida: la cita actual o mañana a las 10:00 */
  const inicial = lead.when || offsetISO(1, 10, 0);
  const [fechaIni, horaIni] = inicial.split('T');

  const row = document.createElement('div');
  row.className = 'sched__row';

  const fecha = document.createElement('input');
  fecha.type = 'date';
  fecha.className = 'sched__in';
  fecha.value = fechaIni;
  fecha.setAttribute('aria-label', 'Fecha de la llamada');

  const hora = document.createElement('input');
  hora.type = 'time';
  hora.className = 'sched__in';
  hora.value = horaIni;
  hora.setAttribute('aria-label', 'Hora de la llamada');

  row.append(fecha, hora);

  const err = document.createElement('p');
  err.className = 'sched__err';
  err.hidden = true;

  const acciones = document.createElement('div');
  acciones.className = 'sched__acts';

  const guardar = document.createElement('button');
  guardar.type = 'submit';
  guardar.className = 'card__btn card__btn--go';
  guardar.textContent = 'Guardar';

  const cancelar = document.createElement('button');
  cancelar.type = 'button';
  cancelar.className = 'card__btn';
  cancelar.textContent = 'Cancelar';
  cancelar.addEventListener('click', () => { editingId = null; render(); });

  acciones.append(guardar, cancelar);

  box.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!fecha.value || !hora.value) {
      err.textContent = 'Indica fecha y hora.';
      err.hidden = false;
      return;
    }
    setWhen(lead.id, fecha.value + 'T' + hora.value);
  });

  box.append(row, err, acciones);
  return box;
}

function buildCard(lead) {
  const idx = STATES.indexOf(lead.status);
  const editando = editingId === lead.id;

  const card = document.createElement('article');
  card.className = 'card' + (lead.fresh ? ' is-fresh' : '');
  /* mientras se edita la fecha no se arrastra: estorbaría a los campos */
  card.draggable = !editando;
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

  card.append(top, svc, tel);

  /* insignias: llamada programada y reseña pedida */
  const badges = document.createElement('div');
  badges.className = 'card__badges';

  if (lead.when) {
    const { dia, hora, pasada } = whenParts(lead.when);
    const cita = document.createElement('p');
    cita.className = 'card__when' + (pasada ? ' is-past' : '');
    cita.textContent = 'Llamada · ' + dia + ' ' + hora;
    badges.appendChild(cita);
  }
  if (lead.reviewAsked) {
    const rev = document.createElement('p');
    rev.className = 'card__rev';
    rev.textContent = 'Reseña pedida ✓';
    badges.appendChild(rev);
  }
  if (badges.children.length) card.appendChild(badges);

  /* mover entre columnas */
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
  card.appendChild(nav);

  /* programar la llamada */
  if (editando) {
    card.appendChild(buildSchedEditor(lead));
  } else {
    const fila = document.createElement('div');
    fila.className = 'card__nav card__nav--sched';

    const programar = document.createElement('button');
    programar.type = 'button';
    programar.className = 'card__btn card__btn--go';
    programar.textContent = lead.when ? 'Cambiar llamada' : 'Programar llamada';
    programar.addEventListener('click', () => { editingId = lead.id; render(); });
    fila.appendChild(programar);

    if (lead.when) {
      const quitar = document.createElement('button');
      quitar.type = 'button';
      quitar.className = 'card__btn';
      quitar.textContent = 'Quitar';
      quitar.addEventListener('click', () => setWhen(lead.id, null));
      fila.appendChild(quitar);
    }

    card.appendChild(fila);
  }

  /* pedir reseña — destacado cuando el lead ya está cerrado,
     que es cuando toca pedirla */
  const cerrado = lead.status === 'cerrado';
  const filaRev = document.createElement('div');
  filaRev.className = 'card__nav card__nav--sched';

  const resena = document.createElement('button');
  resena.type = 'button';
  resena.className = 'card__btn' + (cerrado ? ' card__btn--rev' : '');
  resena.textContent = lead.reviewAsked ? 'Reenviar reseña' : 'Pedir reseña';
  resena.title = 'Abre WhatsApp con el mensaje escrito. Lo envías tú.';
  resena.addEventListener('click', () => askReview(lead.id));

  filaRev.appendChild(resena);
  card.appendChild(filaRev);

  card.addEventListener('dragstart', ev => {
    ev.dataTransfer.setData('text/plain', lead.id);
    ev.dataTransfer.effectAllowed = 'move';
    card.classList.add('is-dragging');
  });
  card.addEventListener('dragend', () => card.classList.remove('is-dragging'));

  return card;
}

/* ---------------------------------------------------------
   5. Agenda
   --------------------------------------------------------- */
function buildAgendaEntry(lead) {
  const { dia, hora, pasada } = whenParts(lead.when);

  const li = document.createElement('li');
  li.className = 'ag' + (pasada ? ' is-past' : '');

  const cuando = document.createElement('span');
  cuando.className = 'ag__when';
  const d = document.createElement('b');
  d.textContent = dia;
  const h = document.createElement('span');
  h.textContent = hora;
  cuando.append(d, h);

  const quien = document.createElement('span');
  quien.className = 'ag__who';
  const n = document.createElement('b');
  n.textContent = lead.name;
  const meta = document.createElement('span');
  meta.textContent = lead.phone + ' · ' + (SERVICES[lead.service] || 'Otra consulta');
  quien.append(n, meta);

  const estado = document.createElement('span');
  estado.className = 'ag__state ag__state--' + lead.status;
  estado.textContent = LABEL[lead.status];

  const ver = document.createElement('button');
  ver.type = 'button';
  ver.className = 'ag__go';
  ver.textContent = 'Ver ficha';
  ver.addEventListener('click', () => resaltar(lead.id));

  li.append(cuando, quien, estado, ver);
  return li;
}

/* Lleva el foco a la ficha correspondiente y la marca un momento */
let resaltarTimer = null;
function resaltar(id) {
  const card = $('.card[data-id="' + id + '"]');
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  $$('.card.is-target').forEach(c => c.classList.remove('is-target'));
  card.classList.add('is-target');
  clearTimeout(resaltarTimer);
  resaltarTimer = setTimeout(() => card.classList.remove('is-target'), 2200);
}

function renderAgenda() {
  const lista = $('#agendaList');
  lista.textContent = '';

  const citas = leads
    .filter(l => l.when)
    .sort((a, b) => new Date(a.when) - new Date(b.when));

  $('#agendaCount').textContent = citas.length;

  if (!citas.length) {
    const vacio = document.createElement('li');
    vacio.className = 'ag__empty';
    vacio.textContent = 'Sin llamadas programadas. Usa «Programar llamada» en cualquier ficha.';
    lista.appendChild(vacio);
    return;
  }
  citas.forEach(l => lista.appendChild(buildAgendaEntry(l)));
}

/* ---------------------------------------------------------
   6. Pintado general
   --------------------------------------------------------- */
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
  renderAgenda();
}

/* ---------------------------------------------------------
   7. Arrastrar y soltar entre columnas
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
   8. Acciones del tablero
   --------------------------------------------------------- */
$('#btnNuevo').addEventListener('click', addLead);
$('#btnReset').addEventListener('click', () => { seedLeads(); render(); });

/* ---------------------------------------------------------
   9. Arranque
   --------------------------------------------------------- */
seedLeads();
render();
