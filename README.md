# Pack Lead — demo de venta

Demostración comercial de una sola página para enseñar a un prospecto qué recibe
con el **Pack Lead**: landing de negocio local, chatbot de captación guiado y
panel de seguimiento de leads.

**Todo es mock.** No hay backend, ni base de datos, ni envíos. El estado vive en
memoria (JavaScript) y se pierde al recargar. Todas las fichas, nombres y
teléfonos son ficticios.

## El efecto de venta

Al completar el chatbot, el lead:

1. se inserta con animación en la columna **Nuevo** del panel;
2. dispara un aviso tipo notificación de móvil: `Nuevo lead: nombre · teléfono`.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Landing (Inicio · Servicios · Contacto), panel kanban y chatbot |
| `assets/styles.css` | Design system dark premium, Sora, responsive 900 / 600 px |
| `assets/app.js` | `CONFIG`, fichas de ejemplo, pipeline, chatbot guiado, avisos |
| `robots.txt` | `Disallow: /` — la demo no debe indexarse |
| `.nojekyll` | GitHub Pages sirve los archivos tal cual |

## Reskin por sector (al vender)

Dos sitios, nada más:

1. **`assets/app.js` → `CONFIG`**: nombre de marca, iniciales, los tres
   servicios, el número de WhatsApp y las palabras rotatorias del hero.
2. **`assets/styles.css` → `:root`**: los tokens de color.

Los textos descriptivos de cada servicio están en `index.html`, marcados como
genéricos y listos para sustituir.

## Alcance de la demo

- El chatbot es un **guion guiado fijo** de tres preguntas. No interpreta texto
  libre ni consulta ningún servicio externo.
- El login del panel es **cosmético** (`usuario` / `demo`): no hay
  autenticación ni datos reales que proteger, y así se indica en pantalla.
- El enlace de WhatsApp es un `wa.me` con número de ejemplo.

Demo · WhiteMoon
