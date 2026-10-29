/* ==========================================================================
   HorAna — Café de Especialidad
   Script principal · CONFIG centralizado al inicio.
   Editar únicamente este bloque para activar enlaces, imágenes y contacto.
   ========================================================================== */

const CONFIG = {
  businessName: "HorAna",
  tagline: "Café de Especialidad",
  address: "Cervantes 610",
  googleMapsLink: "https://www.google.com/maps/search/?api=1&query=Cervantes+610",
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
    baristaCertificate: "assets/certificado_barista.jpg"
  }
};

/* --------------------------------------------------------------------------
   Galería editable
   Para publicar una foto real, completar `src` con la ruta y `alt` descriptivo.
   Las tarjetas sin `src` muestran la ilustración de línea y el estado
   "Próximamente". Ejemplo:
   { title: "Latte art", icon: "g-latte", src: "assets/galeria/latte.jpg",
     alt: "Taza de latte con arte de corazón sobre la barra de HorAna" }
   -------------------------------------------------------------------------- */
const GALLERY = {
  productos: [
    { title: "Latte art", icon: "g-latte", src: null, alt: "Taza de latte con arte de corazón" },
    { title: "Croissant", icon: "g-croissant", src: null, alt: "Croissant recién horneado" },
    { title: "Cookies rellenas", icon: "g-cookies", src: null, alt: "Cookies rellenas de la casa" },
    { title: "Mini tortas", icon: "g-cake", src: null, alt: "Porción de mini torta artesanal" },
    { title: "Bagels", icon: "g-bagel", src: null, alt: "Bagel de la carta de HorAna" },
    { title: "Filtrados", icon: "g-pourover", src: null, alt: "Café filtrado preparado en V60" }
  ],
  espacio: [
    { title: "La barra", icon: "g-bar", src: null, alt: "Barra de café y máquina de espresso de HorAna" },
    { title: "La mesa", icon: "g-table", src: null, alt: "Mesa preparada para dos en el salón" },
    { title: "La ventana", icon: "g-window", src: null, alt: "Ventana del local con luz de tarde" },
    { title: "La repisa", icon: "g-shelf", src: null, alt: "Repisa con plantas y objetos de la casa" },
    { title: "La puerta", icon: "g-door", src: null, alt: "Entrada de HorAna en Cervantes 610" },
    { title: "El rincón verde", icon: "g-plant", src: null, alt: "Rincón con plantas del salón" }
  ]
};

const TOAST_MESSAGES = {
  instagram: "Estamos preparando nuestro perfil oficial de Instagram. ¡Muy pronto vas a poder seguirnos!",
  reviews: "El enlace directo a las reseñas estará disponible muy pronto. Mientras tanto, podés buscarnos en Google Maps como HorAna — Café de Especialidad.",
  whatsapp: "Nuestro WhatsApp estará disponible muy pronto. Por ahora, te esperamos en Cervantes 610.",
  phone: "El teléfono directo estará disponible muy pronto. Por ahora, te esperamos en Cervantes 610.",
  email: "Nuestro correo estará disponible muy pronto. Por ahora, te esperamos en Cervantes 610."
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* --------------------------------------------------------------------------
   Utilidades
   -------------------------------------------------------------------------- */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const isPlaceholder = (value) => !value || value === "#";

function setLink(link, href, external = false) {
  if (!link) return;
  link.href = href;
  if (external) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
}

/* --------------------------------------------------------------------------
   CONFIG → DOM
   -------------------------------------------------------------------------- */
function applyConfig() {
  $$("[data-asset]").forEach((image) => {
    const source = CONFIG.assets[image.dataset.asset];
    if (source && image.getAttribute("src") !== source) image.src = source;
  });

  $$('[data-config-link="menuPdf"]').forEach((link) => {
    setLink(link, CONFIG.assets.menuPdf);
    link.setAttribute("download", "");
  });

  $$('[data-config-link="maps"]').forEach((link) => {
    setLink(link, CONFIG.googleMapsLink, true);
  });

  $$('[data-config-link="reviews"]').forEach((link) => {
    setLink(link, CONFIG.googleReviewsUrl, true);
  });

  const map = $("[data-map]");
  if (map) {
    map.src = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG.address)}&output=embed`;
  }

  const signature = $(".footer__signature");
  if (signature) {
    signature.textContent = `${CONFIG.businessName} · ${CONFIG.tagline} · ${CONFIG.address}`;
  }

  const year = $("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
}

/* --------------------------------------------------------------------------
   Header, progreso de lectura y navegación activa
   -------------------------------------------------------------------------- */
function initScrollUI() {
  const header = $("[data-header]");
  const progress = $("[data-scroll-progress]");
  const sections = ["inicio", "nosotros", "menu", "galeria", "ubicacion", "contacto"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = $$(".nav__link");
  let scheduled = false;

  const update = () => {
    scheduled = false;
    const top = window.scrollY || document.documentElement.scrollTop;
    const height = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    if (header) header.classList.toggle("is-scrolled", top > 18);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, top / height))})`;

    let activeId = sections[0]?.id;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 140) activeId = section.id;
    });

    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const requestUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
}

/* --------------------------------------------------------------------------
   Menú móvil (dialog nativo)
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const dialog = $("#mobile-nav");
  const toggle = $("[data-nav-toggle]");
  const close = $("[data-nav-close]");
  if (!dialog || !toggle) return;

  const setExpanded = (expanded) => {
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", expanded ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  };

  const open = () => {
    if (typeof dialog.showModal !== "function") return;
    dialog.showModal();
    document.body.classList.add("nav-open");
    setExpanded(true);
    window.setTimeout(() => close?.focus(), 80);
  };

  const closeNav = () => {
    if (dialog.open) dialog.close();
  };

  toggle.addEventListener("click", open);
  close?.addEventListener("click", closeNav);

  $$("[data-mobile-link]", dialog).forEach((link) => {
    link.addEventListener("click", () => {
      window.setTimeout(closeNav, 0);
    });
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeNav();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("nav-open");
    setExpanded(false);
    toggle.focus({ preventScroll: true });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && dialog.open) closeNav();
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   Revelado progresivo (IntersectionObserver)
   -------------------------------------------------------------------------- */
let revealObserver = null;

function prepareReveal(elements) {
  elements.forEach((element) => {
    const delay = Number(element.dataset.delay || 0);
    if (delay) element.style.setProperty("--reveal-delay", `${delay}ms`);
  });
}

function initReveal() {
  const elements = $$("[data-reveal], [data-reveal-up]");
  prepareReveal(elements);

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-revealed"));
    return;
  }

  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });

  elements.forEach((element) => revealObserver.observe(element));
}

function observeNewReveals(scope) {
  if (!revealObserver) return;
  const elements = $$("[data-reveal], [data-reveal-up]", scope);
  prepareReveal(elements);
  elements.forEach((element) => revealObserver.observe(element));
}

/* --------------------------------------------------------------------------
   Menú: filtros por categoría
   -------------------------------------------------------------------------- */
function initMenuFilters() {
  const board = $("[data-menu-board]");
  if (!board) return;

  const filters = $$("[data-menu-filter]");
  const groups = $$("[data-menu-group]", board);
  const columns = $$(".menu-col", board);
  const count = $("[data-menu-count]");
  const status = $("#menu-status");
  const labels = { todo: "Todo", cafe: "Café", salado: "Salado", dulce: "Dulce", bebidas: "Bebidas" };

  const countItems = (group) => group.querySelectorAll(".menu-list li").length;
  const total = groups.reduce((sum, group) => sum + countItems(group), 0);
  if (count) count.textContent = String(total);

  const setFilter = (value) => {
    let visibleCount = 0;

    filters.forEach((button) => {
      const active = button.dataset.menuFilter === value;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    groups.forEach((group) => {
      const show = value === "todo" || group.dataset.menuGroup === value;
      group.hidden = !show;
      if (!show) return;

      visibleCount += countItems(group);
      group.classList.remove("is-entering");
      void group.offsetWidth;
      group.classList.add("is-entering");

      group.querySelectorAll(".menu-list li").forEach((item, index) => {
        item.style.setProperty("--item-index", String(index));
      });
    });

    columns.forEach((column) => {
      column.hidden = !Array.from(column.querySelectorAll("[data-menu-group]")).some((group) => !group.hidden);
    });

    board.classList.toggle("is-filtered", value !== "todo");
    if (count) count.textContent = String(value === "todo" ? total : visibleCount);

    if (status) {
      status.textContent = value === "todo"
        ? `Mostrando todo el menú: ${total} preparaciones.`
        : `Mostrando la categoría ${labels[value]}: ${visibleCount} preparaciones.`;
    }
  };

  filters.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.menuFilter));
  });

  setFilter("todo");
}

/* --------------------------------------------------------------------------
   Galería configurable
   -------------------------------------------------------------------------- */
function buildGalleryCard(item, index) {
  const card = document.createElement("article");
  card.className = "gallery-card";
  card.dataset.revealUp = "";
  card.style.setProperty("--reveal-delay", `${(index % 6) * 55}ms`);

  const number = String(index + 1).padStart(2, "0");
  const hasImage = Boolean(item.src);
  const illustration = `<svg viewBox="0 0 200 240" aria-hidden="true"><use href="#${item.icon}"/></svg>`;

  card.innerHTML = `
    <div class="gallery-card__frame">
      ${hasImage ? "" : `<span class="gallery-card__badge">Próximamente</span>`}
      ${illustration}
      ${hasImage ? `<img src="${item.src}" alt="${item.alt || item.title}" width="800" height="1000" loading="lazy" decoding="async">` : ""}
    </div>
    <div class="gallery-card__meta">
      <span class="gallery-card__index">${number}</span>
      <h3 class="gallery-card__title">${item.title}</h3>
    </div>
    <p class="gallery-card__note">Próximamente — Galería en preparación</p>
  `;

  const image = $("img", card);
  if (image) {
    image.addEventListener("error", () => {
      image.remove();
      card.querySelector(".gallery-card__frame")?.insertAdjacentHTML(
        "afterbegin",
        `<span class="gallery-card__badge">Próximamente</span>`
      );
    });
  }

  return card;
}

function initGallery() {
  const tabs = $$("[data-gallery-tab]");
  const panels = $$("[data-gallery-panel]");
  if (!tabs.length || !panels.length) return;

  Object.entries(GALLERY).forEach(([key, items]) => {
    const grid = $(`[data-gallery-grid="${key}"]`);
    if (!grid) return;
    items.forEach((item, index) => grid.appendChild(buildGalleryCard(item, index)));
  });

  const activate = (key, forceReveal = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.galleryTab === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.galleryPanel !== key;
    });

    const activePanel = $(`[data-gallery-panel="${key}"]`);
    if (!activePanel) return;

    if (forceReveal) {
      const cards = $$("[data-reveal-up]", activePanel);
      prepareReveal(cards);
      window.requestAnimationFrame(() => {
        cards.forEach((card) => {
          card.classList.add("is-revealed");
          revealObserver?.unobserve(card);
        });
      });
    } else {
      observeNewReveals(activePanel);
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab.dataset.galleryTab, true));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      const next = tabs[nextIndex];
      next.focus();
      activate(next.dataset.galleryTab, true);
    });
  });

  activate("productos");
}

/* --------------------------------------------------------------------------
   Lightbox de certificado y menú
   -------------------------------------------------------------------------- */
function initLightbox() {
  const dialog = $("#lightbox");
  const image = $("[data-lightbox-image]");
  const caption = $("[data-lightbox-caption]");
  const download = $("[data-lightbox-download]");
  const close = $("[data-lightbox-close]");
  if (!dialog || !image) return;

  const content = {
    certificate: {
      src: CONFIG.assets.baristaCertificate,
      alt: "Certificado de Barista y Arte Latte de Martín Sebastián del Río, Puro Lab",
      caption: "Certificado de Barista y Arte Latte — Martín Sebastián del Río · Puro Lab, Escuela de Baristas."
    },
    menu: {
      src: CONFIG.assets.menuJpg,
      alt: "Menú completo de HorAna, Café de Especialidad",
      caption: "Menú HorAna · Café de Especialidad · Cervantes 610",
      download: CONFIG.assets.menuPdf
    }
  };

  let lastTrigger = null;

  const open = (type, trigger) => {
    const item = content[type];
    if (!item) return;
    lastTrigger = trigger || null;

    image.src = item.src;
    image.alt = item.alt;
    if (caption) caption.textContent = item.caption;

    if (download) {
      if (item.download) {
        download.hidden = false;
        download.href = item.download;
        download.setAttribute("download", "");
      } else {
        download.hidden = true;
      }
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("lightbox-open");
    window.setTimeout(() => close?.focus(), 80);
  };

  const closeLightbox = () => {
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      document.body.classList.remove("lightbox-open");
    }
  };

  $$("[data-lightbox]").forEach((trigger) => {
    trigger.addEventListener("click", () => open(trigger.dataset.lightbox, trigger));
  });

  close?.addEventListener("click", closeLightbox);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeLightbox();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    image.removeAttribute("src");
    if (lastTrigger) {
      const trigger = lastTrigger;
      lastTrigger = null;
      window.setTimeout(() => trigger.focus({ preventScroll: true }), 0);
    }
  });
}

/* --------------------------------------------------------------------------
   Toast elegante para estados "próximamente"
   -------------------------------------------------------------------------- */
function initToast() {
  const toast = $("[data-toast]");
  if (!toast) return null;

  const message = $("[data-toast-message]");
  const close = $("[data-toast-close]");
  let timer = null;

  const hide = () => {
    window.clearTimeout(timer);
    toast.classList.remove("is-visible");
  };

  const show = (text) => {
    if (message) message.textContent = text;
    toast.classList.add("is-visible");
    window.clearTimeout(timer);
    timer = window.setTimeout(hide, 6200);
  };

  close?.addEventListener("click", hide);

  return { show, hide };
}

/* --------------------------------------------------------------------------
   Estados de contacto, Instagram y reseñas
   -------------------------------------------------------------------------- */
function initContactChannels(toast) {
  const channels = {
    whatsapp: { value: CONFIG.whatsappNumber, message: TOAST_MESSAGES.whatsapp },
    phone: { value: CONFIG.phoneNumber, message: TOAST_MESSAGES.phone },
    email: { value: CONFIG.email, message: TOAST_MESSAGES.email }
  };

  $$("[data-channel]").forEach((link) => {
    const type = link.dataset.channel;
    const badge = $(".channel__badge", link);
    let value = channels[type]?.value;
    let href = null;

    if (type === "whatsapp" && value) href = `https://wa.me/${String(value).replace(/\D/g, "")}`;
    if (type === "phone" && value) href = `tel:${String(value).replace(/\s/g, "")}`;
    if (type === "email" && value) href = `mailto:${value}`;

    if (href) {
      link.href = href;
      link.removeAttribute("aria-disabled");
      link.removeAttribute("aria-description");
      if (badge) badge.remove();
      if (type === "whatsapp") {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      return;
    }

    link.setAttribute("href", "#");
    link.removeAttribute("aria-disabled");
    link.setAttribute("aria-description", "Próximamente disponible");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      toast?.show(channels[type]?.message || "Este canal estará disponible muy pronto.");
    });
  });
}

function initInstagram(toast) {
  const links = $$("[data-instagram]");
  if (!links.length) return;

  links.forEach((link) => {
    if (!isPlaceholder(CONFIG.instagramUrl)) {
      link.href = CONFIG.instagramUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.removeAttribute("aria-label");
      $$("[data-instagram-label]", link).forEach((label) => {
        label.textContent = "Instagram";
      });
      return;
    }

    const visibleText = link.textContent.replace(/\s+/g, " ").trim();
    link.setAttribute("href", "#");
    link.setAttribute("aria-label", `${visibleText} — próximamente`);
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const mobileNav = link.closest("#mobile-nav");
      if (mobileNav?.open) mobileNav.close();
      toast?.show(TOAST_MESSAGES.instagram);
    });
  });
}

function initReviews(toast) {
  $$('[data-config-link="reviews"]').forEach((link) => {
    if (!isPlaceholder(CONFIG.googleReviewsUrl)) {
      link.href = CONFIG.googleReviewsUrl;
      return;
    }

    link.setAttribute("href", "#");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      toast?.show(TOAST_MESSAGES.reviews);
    });
  });
}

/* --------------------------------------------------------------------------
   Arranque
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();

  const toast = initToast();
  initScrollUI();
  initMobileNav();
  initGallery();
  initMenuFilters();
  initReveal();
  initLightbox();
  initContactChannels(toast);
  initInstagram(toast);
  initReviews(toast);
});
