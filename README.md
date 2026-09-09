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

Estética clara y editorial —Fraunces para los titulares, Sora para el texto—
pensada para parecer la web real de un cliente, no la de la agencia.

1. **Hero** — titular, subtítulo y CTA al formulario.
2. **Servicios** — tres genéricos con imagen, título y descripción. Sin precios.
3. **Cómo funciona** — pasos 01 · 02 · 03 con los números en grande.
4. **Contacto** — el formulario: nombre y teléfono, con validación. Al enviar
   muestra un check verde grande y «Datos completados. Ahora te llamamos.»
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

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Landing completa |
| `assets/styles.css` | Design system claro, responsive 900 / 620 px |
| `assets/app.js` | `CONFIG`, validación del formulario, reveal, acordeón |
| `assets/img/*.svg` | Imágenes de ejemplo, sustituibles por fotos reales |
| `panel/index.html` | Login cosmético + tablero |
| `panel/panel.css` | Design system dark del panel |
| `panel/panel.js` | Fichas ficticias, kanban, arrastre |
| `robots.txt` | `Disallow: /` — la demo no debe indexarse |
| `.nojekyll` | GitHub Pages sirve los archivos tal cual |

## Reskin por sector (al vender)

1. **`assets/app.js` → `CONFIG`**: nombre de marca, zona, horario, teléfono,
   WhatsApp y los tres servicios.
2. **`assets/styles.css` → `:root`**: los tokens de color y las dos fuentes.
3. **`assets/img/`**: sustituye los SVG de ejemplo por fotos reales del negocio
   (mismas proporciones: 4/3 en las tarjetas, 9/10 en el hero).

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
