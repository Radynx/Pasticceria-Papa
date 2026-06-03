const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const year = document.querySelector("[data-year]");
const filterButtons = document.querySelectorAll("[data-filter]");
const galleryItems = document.querySelectorAll("[data-category]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
let cookieBanner = document.querySelector("[data-cookie-banner]");
let cookieModal = document.querySelector("[data-cookie-modal]");
let externalConsentInput = document.querySelector("[data-consent-input='external']");
const mapPanel = document.querySelector(".map-panel");
const mapFrame = document.querySelector(".map-panel iframe");
const mapConsent = document.querySelector("[data-map-consent]");
const consentKey = "pasticceriaPapaConsent";
const consentMaxAge = 1000 * 60 * 60 * 24 * 180;

const defaultConsent = {
  necessary: true,
  external: false
};

const ensureCookieUi = () => {
  if (!cookieBanner) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<section class="cookie-banner" data-cookie-banner hidden aria-label="Preferenze cookie">
        <button class="cookie-close" type="button" aria-label="Chiudi banner cookie" data-cookie-reject>×</button>
        <div>
          <p class="eyebrow">Privacy e cookie</p>
          <h2>Gestisci i servizi del sito</h2>
          <p>
            Usiamo solo ciò che serve al funzionamento della pagina. La mappa Google viene caricata
            solo se dai il consenso ai servizi esterni.
          </p>
          <div class="cookie-links">
            <a href="privacy.html">Privacy policy</a>
            <a href="cookie.html">Cookie policy</a>
          </div>
        </div>
        <div class="cookie-actions">
          <button type="button" class="button button-ghost-dark" data-cookie-reject>Rifiuta non necessari</button>
          <button type="button" class="button button-outline" data-cookie-customize>Personalizza</button>
          <button type="button" class="button button-primary" data-cookie-accept>Accetta tutti</button>
        </div>
      </section>`
    );
    cookieBanner = document.querySelector("[data-cookie-banner]");
  }

  if (!cookieModal) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="cookie-modal" data-cookie-modal hidden role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
        <div class="cookie-modal-panel">
          <button class="cookie-close" type="button" aria-label="Chiudi preferenze cookie" data-cookie-modal-close>×</button>
          <p class="eyebrow">Centro preferenze</p>
          <h2 id="cookie-modal-title">Scegli cosa attivare</h2>
          <p>
            Puoi modificare la scelta in qualsiasi momento dal link “Preferenze cookie” nel footer.
          </p>

          <div class="consent-option">
            <div>
              <h3>Cookie tecnici necessari</h3>
              <p>Servono a ricordare la scelta privacy e a far funzionare il sito. Sono sempre attivi.</p>
            </div>
            <label class="switch">
              <input type="checkbox" checked disabled />
              <span>Attivo</span>
            </label>
          </div>

          <div class="consent-option">
            <div>
              <h3>Servizi esterni e mappe</h3>
              <p>
                Permettono di caricare Google Maps integrato. Se non li accetti, resta disponibile
                il link per aprire le indicazioni su Google Maps.
              </p>
            </div>
            <label class="switch">
              <input type="checkbox" data-consent-input="external" />
              <span>Consenti</span>
            </label>
          </div>

          <div class="cookie-actions">
            <button type="button" class="button button-ghost-dark" data-cookie-reject>Rifiuta non necessari</button>
            <button type="button" class="button button-outline" data-cookie-save>Salva preferenze</button>
            <button type="button" class="button button-primary" data-cookie-accept>Accetta tutti</button>
          </div>
        </div>
      </div>`
    );
    cookieModal = document.querySelector("[data-cookie-modal]");
  }

  externalConsentInput = document.querySelector("[data-consent-input='external']");
};

ensureCookieUi();

if (year) {
  year.textContent = new Date().getFullYear();
}

const readConsent = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(consentKey));
    if (!stored || Date.now() - Number(stored.savedAt || 0) > consentMaxAge) {
      return null;
    }
    return { ...defaultConsent, ...stored.categories };
  } catch {
    return null;
  }
};

const saveConsent = (categories) => {
  localStorage.setItem(
    consentKey,
    JSON.stringify({
      savedAt: Date.now(),
      categories: { ...defaultConsent, ...categories }
    })
  );
};

const syncConsentInput = (consent) => {
  if (externalConsentInput) {
    externalConsentInput.checked = Boolean(consent?.external);
  }
};

const loadMap = () => {
  if (mapFrame && !mapFrame.src && mapFrame.dataset.src) {
    mapFrame.src = mapFrame.dataset.src;
  }
  mapPanel?.classList.remove("maps-disabled");
  mapConsent?.classList.add("hidden");
};

const applyConsent = (consent) => {
  syncConsentInput(consent);

  if (consent?.external) {
    loadMap();
  } else {
    if (mapFrame) {
      mapFrame.removeAttribute("src");
    }
    mapPanel?.classList.add("maps-disabled");
    mapConsent?.classList.remove("hidden");
  }
};

const hideCookieUi = () => {
  if (cookieBanner) {
    cookieBanner.hidden = true;
  }
  if (cookieModal) {
    cookieModal.hidden = true;
  }
};

const showCookieModal = () => {
  syncConsentInput(readConsent() || defaultConsent);
  if (cookieModal) {
    cookieModal.hidden = false;
  }
};

const setConsent = (categories) => {
  const consent = { ...defaultConsent, ...categories };
  saveConsent(consent);
  applyConsent(consent);
  hideCookieUi();
};

const initialConsent = readConsent();

applyConsent(initialConsent || defaultConsent);

if (!initialConsent && cookieBanner) {
  cookieBanner.hidden = false;
}

document.querySelectorAll("[data-cookie-accept]").forEach((button) => {
  button.addEventListener("click", () => setConsent({ external: true }));
});

document.querySelectorAll("[data-cookie-reject]").forEach((button) => {
  button.addEventListener("click", () => setConsent({ external: false }));
});

document.querySelectorAll("[data-cookie-customize], [data-cookie-preferences]").forEach((button) => {
  button.addEventListener("click", showCookieModal);
});

document.querySelector("[data-cookie-save]")?.addEventListener("click", () => {
  setConsent({ external: Boolean(externalConsentInput?.checked) });
});

document.querySelector("[data-cookie-modal-close]")?.addEventListener("click", () => {
  cookieModal.hidden = true;
});

document.querySelector("[data-enable-maps]")?.addEventListener("click", () => {
  setConsent({ external: true });
});

const setHeaderState = () => {
  header?.classList.toggle("scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const navLinks = [...document.querySelectorAll("[data-nav] a[href^='#']")];
const navSections = navLinks
  .map((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    return section ? { link, section } : null;
  })
  .filter(Boolean);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const setActiveNav = (activeId) => {
  navSections.forEach(({ link, section }) => {
    const isActive = section.id === activeId;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const updateActiveNav = () => {
  if (!navSections.length) {
    return;
  }

  const headerOffset = (header?.offsetHeight || 0) + 42;
  const scrollPosition = window.scrollY + headerOffset;
  let activeSection = null;

  navSections.forEach(({ section }) => {
    if (section.offsetTop <= scrollPosition) {
      activeSection = section;
    }
  });

  const pageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
  if (pageBottom) {
    activeSection = navSections[navSections.length - 1].section;
  }

  setActiveNav(activeSection?.id);
};

let navTicking = false;

const requestActiveNavUpdate = () => {
  if (navTicking) {
    return;
  }

  navTicking = true;
  window.requestAnimationFrame(() => {
    updateActiveNav();
    navTicking = false;
  });
};

menuToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

document.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const target = href === "#home" ? document.querySelector("main") : document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");

    const top = target.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 0) - 12;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion.matches ? "auto" : "smooth"
    });

    if (href !== "#home") {
      setActiveNav(href.slice(1));
    }

    history.pushState(null, "", href);
  });
});

updateActiveNav();
window.addEventListener("scroll", requestActiveNavUpdate, { passive: true });
window.addEventListener("resize", requestActiveNavUpdate);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    galleryItems.forEach((item) => {
      const isVisible = filter === "all" || item.dataset.category === filter;
      item.hidden = !isVisible;
    });
  });
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
}

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const subject = encodeURIComponent(`Richiesta dal sito - ${name}`);
  const body = encodeURIComponent(`Nome: ${name}\nContatto: ${contact}\n\n${message}`);

  window.location.href = `mailto:f.pap69@libero.com?subject=${subject}&body=${body}`;

  if (formStatus) {
    formStatus.textContent = "Richiesta pronta: controlla il tuo programma email.";
  }

  contactForm.reset();
});
