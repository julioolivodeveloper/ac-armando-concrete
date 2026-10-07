(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const profile = "https://maps.app.goo.gl/dNwbdNUeTigsjNuJA";
  const phone = "+16154385306";
  const header = $("[data-header]");
  const menu = $("#mobile-menu");
  const menuButton = $("[data-menu-toggle]");

  const heroSlides = $$("[data-hero-slide]");
  const heroIndex = $("[data-hero-index]");
  if (heroSlides.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let activeSlide = 0;
    setInterval(() => {
      heroSlides[activeSlide].classList.remove("is-active");
      activeSlide = (activeSlide + 1) % heroSlides.length;
      heroSlides[activeSlide].classList.add("is-active");
      heroIndex.textContent = String(activeSlide + 1).padStart(3, "0");
    }, 6500);
  }

  const heroType = $("[data-hero-type]");
  const desktopPhrases = ["from the ground up.", "made for real life.", "built with purpose."];
  const mobilePhrases = ["built to last.", "made for you.", "made with care."];
  const typingPhrases = () => innerWidth <= 600 ? mobilePhrases : desktopPhrases;
  let phraseIndex = 0;
  let characterIndex = 0;
  let deleting = false;
  let typingTimer;
  function typeHeroPhrase() {
    const phrases = typingPhrases();
    const phrase = phrases[phraseIndex % phrases.length];
    if (!document.hidden) {
      if (deleting) {
        characterIndex -= 1;
        heroType.textContent = phrase.slice(0, characterIndex);
        if (characterIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          typingTimer = setTimeout(typeHeroPhrase, 260);
          return;
        }
      } else {
        characterIndex += 1;
        heroType.textContent = phrase.slice(0, characterIndex);
        if (characterIndex >= phrase.length) {
          deleting = true;
          typingTimer = setTimeout(typeHeroPhrase, 1850);
          return;
        }
      }
    }
    typingTimer = setTimeout(typeHeroPhrase, deleting ? 38 : 82);
  }
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typeHeroPhrase();
    addEventListener("resize", () => {
      phraseIndex = 0;
      characterIndex = 0;
      deleting = false;
      clearTimeout(typingTimer);
      heroType.textContent = "";
      typingTimer = setTimeout(typeHeroPhrase, 180);
    }, { passive: true });
  } else heroType.textContent = typingPhrases()[0];

  function closeMenu() {
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
  }
  menuButton.addEventListener("click", () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$("a", menu).forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("click", (event) => {
    if (!menu.hidden && !menu.contains(event.target) && !header.contains(event.target)) closeMenu();
  });
  addEventListener("resize", () => { if (innerWidth > 900) closeMenu(); });
  addEventListener("scroll", () => header.classList.toggle("header-raised", scrollY > 14), { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) { closeMenu(); menuButton.focus(); }
  });

  const contactModal = $("[data-contact-modal]");
  const projectLinks = $$('[data-open-contact]');
  let request = "";
  function openContact(project = "Concrete project") {
    request = `Hi Armando, I'm interested in a concrete project${project && project !== "Concrete project" ? ` for ${project.toLowerCase()}` : ""}. I'd like to share the property location, a few photos and some project details.`;
    const encoded = encodeURIComponent(request);
    const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
    $("[data-contact-call]").href = `tel:${phone}`;
    $("[data-contact-sms]").href = `sms:${phone}${isApple ? "&" : "?"}body=${encoded}`;
    $("[data-contact-message]").textContent = `Your text is ready to review before sending:\n“${request}”`;
    if (!contactModal.open) contactModal.showModal();
  }
  projectLinks.forEach((button) => button.addEventListener("click", () => openContact(button.dataset.project || "Concrete project")));
  $$('[data-close-contact]').forEach((button) => button.addEventListener("click", () => contactModal.close()));
  contactModal.addEventListener("click", (event) => {
    if (event.target === contactModal) {
      const rect = contactModal.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) contactModal.close();
    }
  });

  const lightbox = $("[data-lightbox]");
  const tiles = $$("[data-category]");
  const track = $(`[data-gallery]`);
  const carousel = $(`[data-work-carousel]`);
  const currentCounter = $(`[data-carousel-current]`);
  const totalCounter = $(`[data-carousel-total]`);
  const currentTitle = $(`[data-carousel-title]`);
  const progress = $(`[data-carousel-progress]`);
  const galleryCount = $(`[data-gallery-count]`);
  const previousSlide = $(`[data-carousel-prev]`);
  const nextSlide = $(`[data-carousel-next]`);
  const toggleAutoplay = $(`[data-carousel-toggle]`);
  const pauseIcon = $(`[data-pause-icon]`);
  const playIcon = $(`[data-play-icon]`);
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let autoplayPaused = prefersReducedMotion;
  let pointerInsideCarousel = false;
  let focusInsideCarousel = false;
  let activeTile = tiles[0];
  const visibleSlides = () => tiles.filter((tile) => !tile.hidden);
  function nearestSlide() {
    const visible = visibleSlides();
    if (!visible.length) return null;
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    return visible.reduce((closest, tile) => Math.abs(tile.getBoundingClientRect().left + tile.clientWidth / 2 - center) < Math.abs(closest.getBoundingClientRect().left + closest.clientWidth / 2 - center) ? tile : closest, visible[0]);
  }
  function updateCarouselStatus(tile = nearestSlide()) {
    const visible = visibleSlides();
    if (!visible.length) return;
    activeTile = visible.includes(tile) ? tile : visible[0];
    const index = visible.indexOf(activeTile);
    currentCounter.textContent = String(index + 1).padStart(2, "0");
    totalCounter.textContent = String(visible.length).padStart(2, "0");
    currentTitle.textContent = $(".work-tile-label strong", activeTile).textContent;
    progress.style.width = `${((index + 1) / visible.length) * 100}%`;
    galleryCount.textContent = String(visible.length);
    previousSlide.disabled = visible.length < 2;
    nextSlide.disabled = visible.length < 2;
  }
  function moveCarousel(step) {
    const visible = visibleSlides();
    if (visible.length < 2) return;
    const current = visible.indexOf(activeTile);
    const next = visible[(current + step + visible.length) % visible.length];
    const offset = next.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({ left: offset, behavior: prefersReducedMotion ? "auto" : "smooth" });
    updateCarouselStatus(next);
  }
  function updateAutoplayButton() {
    pauseIcon.hidden = autoplayPaused;
    playIcon.hidden = !autoplayPaused;
    toggleAutoplay.setAttribute("aria-label", autoplayPaused ? "Resume automatic slideshow" : "Pause automatic slideshow");
    toggleAutoplay.setAttribute("aria-pressed", String(autoplayPaused));
  }
  $$('[data-filter]').forEach((filter) => filter.addEventListener("click", () => {
    const category = filter.dataset.filter;
    $$('[data-filter]').forEach((button) => button.setAttribute("aria-pressed", String(button === filter)));
    tiles.forEach((tile) => { tile.hidden = category !== "all" && !tile.dataset.category.split(" ").includes(category); });
    activeTile = visibleSlides()[0];
    track.scrollTo({ left: 0, behavior: "auto" });
    updateCarouselStatus(activeTile);
  }));
  previousSlide.addEventListener("click", () => moveCarousel(-1));
  nextSlide.addEventListener("click", () => moveCarousel(1));
  toggleAutoplay.addEventListener("click", () => { autoplayPaused = !autoplayPaused; updateAutoplayButton(); });
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); moveCarousel(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); moveCarousel(1); }
    if (event.key === "Home") { event.preventDefault(); track.scrollTo({ left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" }); updateCarouselStatus(visibleSlides()[0]); }
    if (event.key === "End") { event.preventDefault(); const visible = visibleSlides(); const last = visible[visible.length - 1]; if (last) { const offset = last.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft; track.scrollTo({ left: offset, behavior: prefersReducedMotion ? "auto" : "smooth" }); updateCarouselStatus(last); } }
  });
  carousel.addEventListener("pointerenter", () => { pointerInsideCarousel = true; });
  carousel.addEventListener("pointerleave", () => { pointerInsideCarousel = false; });
  carousel.addEventListener("focusin", () => { focusInsideCarousel = true; });
  carousel.addEventListener("focusout", (event) => { if (!carousel.contains(event.relatedTarget)) focusInsideCarousel = false; });
  track.addEventListener("scroll", () => requestAnimationFrame(() => updateCarouselStatus()), { passive: true });
  toggleAutoplay.hidden = prefersReducedMotion;
  updateAutoplayButton();
  updateCarouselStatus(tiles[0]);
  setInterval(() => {
    if (!autoplayPaused && !pointerInsideCarousel && !focusInsideCarousel && !document.hidden && !lightbox.open) moveCarousel(1);
  }, 5200);
  $$('[data-image]').forEach((tile) => tile.addEventListener("click", () => {
    const img = $("[data-lightbox-image]");
    img.src = `assets/${tile.dataset.image}`;
    img.alt = $("img", tile).alt;
    $("[data-lightbox-caption]").textContent = tile.dataset.caption;
    lightbox.showModal();
  }));
  $("[data-close-photo]").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("close", () => { $("[data-lightbox-image]").removeAttribute("src"); });
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      const rect = lightbox.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close();
    }
  });

  const chat = $("[data-chat]");
  const feed = $("[data-chat-body]");
  const actions = $("[data-chat-actions]");
  const form = $("[data-chat-form]");
  const input = $("#chat-question");
  let projectContext = "";
  let lang = "en";
  const normalize = (value) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const spanish = (value) => /[¿¡ñáéíóú]/i.test(value) || /\b(hola|precio|precios|costo|cuanto|servicios|horario|donde|cotizar|resena|opinion|llamar|telefono|terreno|concreto|sendero|escalera)\b/i.test(normalize(value));
  const t = (english, spanishText) => lang === "es" ? spanishText : english;
  const replies = [
    { type: "service", match: /\b(driveway|driveways|approach|entrada para autos|entrada|estacionamiento)\b/, project: "Driveway", en: "AC Armando Concrete's project photos show residential concrete driveways and approaches. Share the property location and what you would like to change, and Armando can talk through the project with you.", es: "Las fotos de AC Armando Concrete muestran entradas de concreto para viviendas. Comparte la ubicación y lo que te gustaría cambiar para hablar del proyecto con Armando.", link: "./#work" },
    { type: "service", match: /\b(walkway|walkways|sidewalk|sidewalks|path|paths|sendero|senderos|banqueta|banquetas|acceso peatonal)\b/, project: "Walkway or sidewalk", en: "The portfolio includes residential paths and long commercial sidewalks. Tell us the route, the site and any transitions or access you want to plan.", es: "El portafolio incluye senderos residenciales y banquetas comerciales. Cuéntanos del recorrido, el lugar y los accesos que deseas planear.", link: "./#work" },
    { type: "service", match: /\b(steps|stair|stairs|entry|entrance|escalon|escalones|escalera|escaleras|entrada)\b/, project: "Concrete steps or entry", en: "There are photos of exterior steps and concrete entries in Armando's portfolio. Share a photo of the levels you want to connect and the type of access you have in mind.", es: "El portafolio de Armando incluye escalones y accesos de concreto. Comparte una foto de los niveles que deseas conectar y del acceso que tienes en mente.", link: "./#work" },
    { type: "service", match: /\b(retaining|block wall|retaining wall|muro|muros|muro de contencion)\b/, project: "Retaining wall", en: "The project photos include concrete blockwork and retaining walls. The right scope depends on the site. Share the location and photos so Armando can review what you have in mind.", es: "Las fotos de proyectos incluyen muros de bloque y contención. El alcance depende del terreno. Comparte ubicación y fotos para que Armando revise tu idea.", link: "./#work" },
    { type: "service", match: /\b(patio|patios|slab|flatwork|pad|piso|losa|losas|plataforma)\b/, project: "Patio or concrete flatwork", en: "The portfolio includes poured concrete flatwork and prepared residential pads. Describe how you want the surface to work and what is around it.", es: "El portafolio incluye losas y superficies de concreto residencial. Cuéntanos cómo deseas usar el espacio y qué hay alrededor.", link: "./#work" },
    { type: "service", match: /\b(site work|sitework|grading|ground|preparation|excavat|preparacion del terreno|preparar el terreno|nivelacion|excavacion|maquinaria)\b/, project: "Site work or preparation", en: "Armando's photos show site grading, preparation and job-site equipment. Tell us about access, the ground and the concrete work that follows.", es: "Las fotos de Armando muestran nivelación, preparación del terreno y maquinaria. Cuéntanos sobre el acceso, el terreno y el trabajo de concreto que planeas.", link: "./#work" },
    { type: "price", match: /\b(price|pricing|cost|costs|quote|estimate|how much|precio|precios|cuanto cuesta|cuanto sale|cotizacion|cotizar|presupuesto)\b/, en: "Each project depends on its size, location, access and preparation. Call or text Armando with a few details to talk about your project and next steps.", es: "Cada proyecto depende de su tamaño, ubicación, acceso y preparación. Llama o escribe a Armando con algunos detalles para conversar sobre tu proyecto.", project: "Concrete estimate" },
    { type: "location", match: /\b(where|area|areas|location|town|city|serve|serving|nashville|tennessee|tn|donde|zona|ciudad|ubicacion|atiende|trabajan)\b/, en: "The public Google Business Profile places AC Armando Concrete in the Nashville, Tennessee area. Contact Armando to confirm availability for your project location.", es: "El perfil público de Google ubica a AC Armando Concrete en el área de Nashville, Tennessee. Contacta a Armando para confirmar disponibilidad en la ubicación de tu proyecto.", project: "Project location", link: profile, external: true },
    { type: "contact", match: /\b(contact|phone|call|text|sms|whatsapp|hablar|contactar|contacto|llamar|llamada|telefono|teléfono|mensaje|celular)\b/, en: "Call or text Armando directly at (615) 438-5306. If you've worked together, you can also leave an honest review on Google.", es: "Llama o envía un mensaje a Armando al (615) 438-5306. Si ya trabajaron juntos, también puedes dejar una reseña honesta en Google.", project: "Concrete project", link: profile, external: true },
    { type: "google", match: /\b(google|profile|maps|reviews|business profile|perfil|mapas|resenas|reseñas|opiniones)\b/, en: "Open AC Armando Concrete's Google profile and choose “Write a review” to share honest feedback.", es: "Abre el perfil de Google de AC Armando Concrete y elige “Escribir una reseña” para compartir tu opinión honesta.", project: "Google review", link: profile, external: true },
  ];
  function bubble(message, type = "assistant") {
    const item = document.createElement("div");
    item.className = `chat-bubble ${type}`;
    item.textContent = message;
    feed.append(item);
    feed.scrollTop = feed.scrollHeight;
    return item;
  }
  function addChatLink(parent, label, url, external = false) {
    const anchor = document.createElement("a");
    anchor.className = "chat-link";
    anchor.href = url;
    anchor.textContent = label;
    if (external) { anchor.target = "_blank"; anchor.rel = "noopener noreferrer"; }
    parent.append(anchor);
  }
  function contacts(parent, message) {
    const encoded = encodeURIComponent(message);
    const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
    const group = document.createElement("div");
    group.className = "chat-contact-grid";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", t("Contact Armando", "Contactar a Armando"));
    [[t("Call", "Llamar"), `tel:${phone}`], [t("Send a text", "Enviar mensaje"), `sms:${phone}${isApple ? "&" : "?"}body=${encoded}`], [t("Leave a review", "Dejar reseña"), profile]].forEach(([label, href], index) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      if (index === 1) link.setAttribute("aria-label", t("Send a text message to Armando", "Enviar mensaje de texto a Armando"));
      if (index === 2) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      group.append(link);
    });
    parent.append(group);
  }
  function renderActions(options = []) {
    actions.replaceChildren();
    options.forEach(({ label, action, project }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => {
        if (project) projectContext = project;
        if (typeof action === "function") action();
        else answer(action || label);
      });
      actions.append(button);
    });
  }
  const suggested = () => renderActions([
    { label: t("Driveways", "Entradas para autos"), action: t("Tell me about driveways", "Cuéntame sobre entradas para autos"), project: "Driveway" },
    { label: t("Walkways & steps", "Senderos y escalones"), action: t("Tell me about walkways and steps", "Cuéntame sobre senderos y escalones") },
    { label: t("Site preparation", "Preparación del terreno"), action: t("Tell me about site work", "Cuéntame sobre site work") },
    { label: t("Contact Armando", "Contactar a Armando"), action: contactAnswer },
  ]);
  function contactAnswer() {
    const message = `Hi Armando, I'm reaching out about ${projectContext || "a concrete project"}.`;
    bubble(t("Here are direct ways to get in touch. The message is prepared for you to review before sending.", "Aquí están las opciones para contactar. Puedes revisar el mensaje antes de enviarlo."));
    contacts(feed.lastElementChild, message);
    suggested();
  }
  function answer(question) {
    const value = question.trim().slice(0, 240);
    if (!value) return;
    lang = spanish(value) ? "es" : "en";
    bubble(value, "user");
    const normalized = normalize(value);
    const reply = replies.find((item) => item.match.test(normalized));
    if (reply?.project && reply.type !== "location" && reply.type !== "contact" && reply.type !== "google") projectContext = reply.project;
    if (/^(hi|hello|hey|hola|good morning|good afternoon|gracias|thanks)[!.\s]*$/i.test(normalized)) {
      bubble(t("Hi, welcome to AC Armando Concrete. Ask about our concrete work, project photos or how to contact Armando.", "¡Hola! Bienvenido a AC Armando Concrete. Pregunta sobre el trabajo de concreto, las fotos de proyectos o cómo contactar a Armando."));
    } else if (reply) {
      const response = bubble(reply[lang]);
      if (reply.link) addChatLink(response, reply.external ? (reply.type === "google" ? t("Open Google to leave a review ↗", "Abrir Google para dejar una reseña ↗") : t("Open Google Business Profile ↗", "Abrir perfil de Google ↗")) : t("Explore project photos ↗", "Ver fotos de proyectos ↗"), reply.link, reply.external);
      contacts(response, `Hi Armando, I'm interested in ${projectContext || reply.project || "a concrete project"}. My question: ${value}`);
    } else {
      const response = bubble(t("I don't have a confirmed answer to that yet. Call or text Armando directly to talk about the project.", "No tengo una respuesta confirmada todavía. Llama o escribe a Armando para conversar sobre el proyecto."));
      contacts(response, `Hi Armando, I have a question about a concrete project: ${value}`);
    }
    input.value = "";
    suggested();
    feed.scrollTop = feed.scrollHeight;
  }
  function openChat() {
    if (!chat.open) chat.showModal();
    if (!feed.children.length) {
      bubble("Hi, I'm the AC Armando Concrete project assistant. Ask me about the concrete work, the project photos or how to contact Armando.");
      suggested();
    }
  }
  $$('[data-open-chat]').forEach((button) => button.addEventListener("click", openChat));
  $("[data-close-chat]").addEventListener("click", () => chat.close());
  form.addEventListener("submit", (event) => { event.preventDefault(); answer(input.value); });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    $$(".reveal").forEach((item) => observer.observe(item));
  } else $$(".reveal").forEach((item) => item.classList.add("visible"));
  $("[data-current-year]").textContent = String(new Date().getFullYear());
})();
