# HorAna — Café de Especialidad

Landing page editorial para **HorAna**, una casa de café de especialidad y pastelería artesanal en **Cervantes 610, Floresta**. El sitio está construido con HTML, CSS y JavaScript vanilla: sin frameworks, sin build step y listo para publicar en cualquier hosting estático.

- **Repositorio:** [EntropyDevelopment/horana-cafe](https://github.com/EntropyDevelopment/horana-cafe)
- **Diseño y desarrollo:** [Entropy](https://www.entropydevs.com)

---

## 1. Vista local

El proyecto no necesita instalación de dependencias para ejecutarse. Desde la raíz:

```bash
python -m http.server 4173
```

Abrir [http://127.0.0.1:4173](http://127.0.0.1:4173).

También funciona abriendo `index.html` directamente, aunque se recomienda usar un servidor local para que las rutas y las descargas se comporten igual que en producción.

### Tests visuales y de accesibilidad

No forman parte del sitio publicado. Durante el desarrollo se validó con Chrome headless y `axe-core`:

- Sin errores de consola.
- Sin scroll horizontal a 1440, 390 y 320 px.
- 0 violaciones WCAG 2.0/2.1 A y AA detectadas por axe en las vistas principales.
- Preferencia `prefers-reduced-motion` respetada.

---

## 2. Estructura

```text
horana-cafe/
├── index.html                  # Estructura semántica y contenido completo
├── styles/
│   └── main.css                # Sistema visual, componentes, responsive y animaciones
├── scripts/
│   ├── main.js                 # CONFIG, interacciones y render de la galería
│   └── prepare_assets.py       # Generación de assets derivados (herramienta interna)
├── assets/
│   ├── galeria/                 # Fotos reales de la galería (vacío por ahora)
│   ├── horana_logo_transparent.png
│   ├── horana_emblem.png
│   ├── horana_logo.jpg
│   ├── horana_logo_source.jpg
│   ├── favicon.png
│   ├── og-horana.jpg
│   ├── menu_horana.pdf
│   ├── menu_horana.jpg
│   ├── certificado_barista.jpg
│   └── entropy-logo.webp
├── .gitattributes
├── .gitignore
├── .nojekyll
└── README.md
```

---

## 3. Configuración centralizada

Todo lo que se activa más adelante vive al comienzo de `scripts/main.js`, en el objeto `CONFIG`:

```js
const CONFIG = {
  businessName: "HorAna",
  tagline: "Café de Especialidad",
  address: "Cervantes 610",
  neighborhood: "Floresta",
  mapQuery: "Cervantes 610, Floresta, Ciudad Autónoma de Buenos Aires",
  googleMapsLink: "https://www.google.com/maps/search/?api=1&query=Cervantes+610%2C+Floresta%2C+Ciudad+Aut%C3%B3noma+de+Buenos+Aires",
  googleReviewsUrl: "#", // Pegar aquí el link directo de reseñas de Google Maps
  instagramUrl: null,    // Cambiar por la URL de Instagram cuando se cree la cuenta
  whatsappNumber: null,  // Cambiar cuando esté disponible
  phoneNumber: null,     // Cambiar cuando esté disponible
  email: null,           // Cambiar cuando esté disponible
  developer: {
    name: "Entropy",
    url: "https://www.entropydevs.com",
    displayUrl: "www.entropydevs.com"
  },
  assets: {
    logo: "assets/horana_logo_transparent.png",
    emblem: "assets/horana_emblem.png",
    menuPdf: "assets/menu_horana.pdf",
    menuJpg: "assets/menu_horana.jpg",
    baristaCertificate: "assets/certificado_barista.jpg",
    entropyLogo: "assets/entropy-logo.webp"
  }
};
```

### Activar cada canal

| Campo | Efecto al completarlo |
| --- | --- |
| `googleReviewsUrl` | El CTA de reseñas abre el enlace directo de Google Maps. Mientras sea `"#"`, muestra un toast elegante. |
| `instagramUrl` | El bloque de Instagram y los enlaces del menú móvil/footer abren el perfil y pierden la leyenda “Próximamente”. Mientras sea `null`, muestran el toast preparado. |
| `whatsappNumber` | Convierte la tarjeta de WhatsApp en un enlace `wa.me`. Se recomienda incluir el código de país, por ejemplo `"5491123456789"`. |
| `phoneNumber` | Convierte la tarjeta de Teléfono en un enlace `tel:`. |
| `email` | Convierte la tarjeta de Correo en un enlace `mailto:`. |
| `googleMapsLink` | Actualiza todos los CTA de ubicación. El mapa se construye con `mapQuery` para fijar una única ubicación en Cervantes 610, Floresta. |

> Los canales que sigan en `null` conservan el badge **“Próximamente disponible”** y no muestran datos falsos.

### Rutas de assets

`applyConfig()` sincroniza las imágenes y descargas desde `CONFIG.assets`. Los atributos `src`/`href` estáticos del HTML funcionan como fallback sin JavaScript. Si renombrás un archivo, actualizá la ruta en `CONFIG` y, para mantener el fallback, también en el HTML.

---

## 4. Galería editable

La galería se genera desde el objeto `GALLERY` en `scripts/main.js`:

```js
const GALLERY = {
  productos: [
    {
      title: "Latte art",
      icon: "g-latte",
      src: null,
      alt: "Taza de latte con arte de corazón"
    }
  ],
  espacio: [/* ... */]
};
```

Para reemplazar una tarjeta por una foto real, alcanza con completar `src`:

```js
{
  title: "Latte art",
  icon: "g-latte",
  src: "assets/galeria/latte.jpg",
  alt: "Latte con arte de corazón servido en la barra de HorAna"
}
```

- La imagen se renderiza con `loading="lazy"` y `decoding="async"`.
- Si una imagen falla, la tarjeta vuelve automáticamente a la ilustración de línea y al estado “Próximamente”.
- Las ilustraciones son SVG inline (`#g-latte`, `#g-croissant`, etc.) y no dependen de archivos externos.
- Recomendado: fotos verticales u horizontales de al menos 1200 px de ancho, optimizadas en JPG/WebP por debajo de 250 KB.

---

## 5. Menú

El listado completo está en `index.html`, dentro de `.menu-board`. **No se muestran precios en ningún ítem**; la única referencia es la nota “Los precios se consultan en el local”.

- Las pestañas **Todo / Café / Salado / Dulce / Bebidas** filtran los grupos con JavaScript y actualizan el contador y el estado accesible.
- La categoría **Dulce** conserva sus cinco subcategorías: Cuadrados, Mini tortas, Alfajores, Cookies (rellenas) y Budines.
- Los botones de descarga apuntan a `assets/menu_horana.pdf` y la vista en imagen abre `assets/menu_horana.jpg` en un lightbox.
- Para agregar o quitar productos, editá las listas `<ul class="menu-list">` y, si cambia el total, el contador se recalcula solo.

---

## 6. Certificado de barista

La sección de formación incluye:

- **Barista certificado:** Martín Sebastián del Río.
- **Certificación:** Curso de Barista y Arte Latte.
- **Institución:** Puro Lab — Escuela de Baristas.
- **Aval:** Puro Café · Escuela Gourmet Online.
- **Director:** Marcos de Lauretis.

El archivo `assets/certificado_barista.jpg` incluido en este repositorio es una **pieza de referencia diseñada para el sitio**, porque al momento del desarrollo no se adjuntó la fotografía oficial del certificado. La propia imagen y la ficha lo aclaran con la leyenda “Vista de referencia”.

Para publicar la foto real:

1. Reemplazá `assets/certificado_barista.jpg` por la fotografía oficial (mismo nombre de archivo).
2. Actualizá el `alt` de la imagen en `index.html` si hace falta.
3. Quitá la línea `.certificate__source` (“Vista de referencia · el certificado original se resguarda en el local”) si ya no corresponde.
4. **No vuelvas a ejecutar `scripts/prepare_assets.py`** después del reemplazo: ese script regenera el placeholder.

El lightbox del certificado queda operativo automáticamente con la nueva imagen.

---

## 7. Identidad y sistema visual

Variables principales en `styles/main.css`:

```css
--bg-primary: #FBFBF5;      /* papel crema */
--bg-secondary: #F4EFE6;    /* arena / latte */
--espresso: #412518;        /* marrón espresso */
--caramel-gold: #AA875C;    /* dorado caramelo */
--text-main: #2E1A10;       /* tinta café */
--text-muted: #7D5F43;      /* mocha suave */
```

Tipografías:

- **Cormorant Garamond** para títulos, subtítulos y citas editoriales.
- **Plus Jakarta Sans** para cuerpo, navegación y UI.

Detalles de craft:

- Vapor SVG animado y partículas cálidas en el hero.
- Reveals escalonados con `IntersectionObserver`.
- Líneas doradas que se expanden al revelar cada título.
- Botones con llenado “espresso pour” y transición `cubic-bezier(0.22, 1, 0.36, 1)`.
- Navbar fija con glassmorphism cálido y fondo `rgba(251, 251, 245, 0.88)`.
- Grano de papel sutil, marquee editorial y detalles botánicos de línea fina.
- Foco visible, skip link, `aria-live`, diálogos nativos y cierre con `Escape`.

---

## 8. Accesibilidad y rendimiento

- Contraste revisado para AA; los textos pequeños sobre espresso usan un dorado claro accesible (`--caramel-light`) y los metadatos usan `--text-muted`.
- `prefers-reduced-motion` desactiva animaciones y reveals.
- Imágenes secundarias y mapa con `loading="lazy"`.
- El logo principal y el emblema se cargan con prioridad alta.
- Sin dependencias de JavaScript ni CSS de terceros; solo Google Fonts.
- El menú completo y el contenido principal están en HTML (funcionan sin JS); el filtrado, la galería y los diálogos requieren JavaScript.
- `<noscript>` fuerza la visibilidad de los bloques animados.

---

## 9. Publicación

Al ser un sitio estático, se puede publicar en GitHub Pages, Netlify, Vercel o cualquier servidor web.

### GitHub Pages

1. Subir el proyecto a la rama `main`.
2. En **Settings → Pages**, elegir “Deploy from a branch” y la rama `main` / carpeta `/ (root)`.
3. El archivo `.nojekyll` evita el procesamiento innecesario de Jekyll.

### Antes de publicar

- [ ] Reemplazar el certificado de referencia por la foto oficial.
- [ ] Completar `googleReviewsUrl` con el enlace directo de reseñas.
- [ ] Crear y enlazar `instagramUrl`.
- [ ] Completar `whatsappNumber`, `phoneNumber` y `email` cuando estén disponibles.
- [ ] Actualizar las URLs absolutas de Open Graph/Twitter si se define el dominio final.
- [ ] Revisar que la dirección del mapa sea la ubicación exacta del local.

---

## 10. Créditos

Diseño y desarrollo: **[Entropy](https://www.entropydevs.com) · www.entropydevs.com**

Identidad, menú y contenidos: **HorAna — Café de Especialidad**.

Los assets de marca, el menú y el certificado pertenecen a HorAna. Las ilustraciones SVG de la galería y el código del sitio fueron realizados para este proyecto.
