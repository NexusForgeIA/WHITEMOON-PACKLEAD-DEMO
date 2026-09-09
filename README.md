# Pack Lead — demo de venta

Dos piezas separadas, para enseñar en la venta lo que recibe un negocio local
con el **Pack Lead**.

| Pieza | Ruta | Qué es |
|---|---|---|
| **Landing** | `/` | La web del cliente: clara, editorial, con formulario de contacto |
| **Panel** | `/panel/` | La herramienta interna con las fichas de los leads |

**El panel no está enlazado desde la landing.** Es deliberado: el visitante de
la web nunca ve ni el panel ni los leads de nadie. En la venta se abre aparte,
escribiendo la URL.

**Todo es mock.** No hay backend, ni base de datos, ni envíos. El formulario no
manda nada a ningún sitio y el panel guarda su estado en memoria (se pierde al
recargar). Todos los nombres y teléfonos son inventados.

## Landing (`/`)

Identidad WhiteMoon en claro: fondo blanco, morado `#7c4dff` como único acento
y **Sora** en todo, con contraste de pesos fuerte (200 en los titulares, 600 en
los acentos). Fotografía abstracta de tecnología, sin personas.

1. **Hero** — titular, subtítulo y CTA al formulario.
2. **Servicios** — tres genéricos con imagen, título y descripción. Sin precios.
3. **Cómo funciona** — pasos 01 · 02 · 03 con los números en grande.
4. **Contacto** — el formulario: nombre y teléfono, con validación. Al enviar
   muestra un check grande y «Datos completados. Ahora te llamamos.»
   El check es **verde** a propósito: es color semántico de éxito, no de marca.
   Es el único elemento de la página que no es morado.
5. **Preguntas** — cuatro dudas frecuentes en acordeón.

## Panel (`/panel/`)

Dark corporativo, deliberadamente distinto de la landing: se ve a simple vista
que es la herramienta interna y no la web pública.

- Login **cosmético** (`usuario` / `demo`) etiquetado `DEMO · sin autenticación
  real`. No hay auth ni datos reales que proteger.
- Kanban **Nuevo · Contactado · Cerrado** con siete fichas ficticias.
- Las fichas se mueven con los botones de cada tarjeta o arrastrándolas.
- «Simular nuevo lead» añade una ficha animada en la columna Nuevo, para
  enseñar cómo entra un contacto.

### Agenda de llamadas

Cada ficha lleva un botón **«Programar llamada»** que abre un selector de fecha
y hora dentro de la propia tarjeta. Al guardar, la ficha muestra la insignia
`Llamada · [día] [hora]` y la cita entra en el bloque **Agenda de llamadas**,
ordenado por fecha y hora. Cada entrada tiene un «Ver ficha» que lleva a su
tarjeta y la resalta un momento.

Las citas pasadas se ven en gris, tanto en la insignia como en la agenda.

**No hay calendario detrás.** Ni Cal.com, ni Google Calendar, ni avisos, ni
recordatorios: las citas viven en memoria como el resto del panel y se pierden
al recargar. «Reiniciar demo» las devuelve al estado inicial.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Landing completa |
| `assets/styles.css` | Design system claro, responsive 900 / 620 px |
| `assets/app.js` | `CONFIG`, validación del formulario, reveal, acordeón |
| `assets/img/*` | Fotos en WebP con fallback JPG (ver créditos abajo) |
| `panel/index.html` | Login cosmético + tablero |
| `panel/panel.css` | Design system dark del panel |
| `panel/panel.js` | Fichas ficticias, kanban, arrastre |
| `robots.txt` | `Disallow: /` — la demo no debe indexarse |
| `.nojekyll` | GitHub Pages sirve los archivos tal cual |

## Reskin por sector (al vender)

1. **`assets/app.js` → `CONFIG`**: nombre de marca, zona, horario, teléfono,
   WhatsApp y los tres servicios.
2. **`assets/styles.css` → `:root`**: los tokens de color y la fuente.
3. **`assets/img/`**: sustituye las fotos por las del negocio real, en las
   mismas proporciones (4/3 en las tarjetas, 9/10 en el hero) y manteniendo
   los pares `.webp` + `.jpg`. Actualiza el `alt` de cada una en `index.html`.

## Créditos de las fotos

Fotografías de [Unsplash](https://unsplash.com/license) (uso libre, no
requiere atribución; se acredita por cortesía):

| Archivo | Autoría |
|---|---|
| `hero` | Sandro Katalina |
| `servicio-1` | Milad Fakurian |
| `servicio-2` | Conny Schneider |
| `servicio-3` | Milad Fakurian |

Se sirven en WebP con fallback JPG, recortadas al tamaño final y con
`width`/`height` declarados para evitar saltos de maquetación.

Los textos descriptivos están en `index.html`, redactados en genérico y listos
para reemplazar.

## Alcance de la demo

- El formulario pide **solo nombre y teléfono**. No hay pasos, ni selector de
  servicio, ni envío real.
- El enlace de WhatsApp es un `wa.me` con número de ejemplo, etiquetado como
  tal en la página.
- Ambas páginas llevan `noindex` en el `<meta>` y quedan cubiertas por el
  `robots.txt`.

Demo · WhiteMoon
