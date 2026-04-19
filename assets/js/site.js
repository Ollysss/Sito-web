(function () {
  const raf = window.requestAnimationFrame.bind(window);
  const STORAGE_LANGUAGE_KEY = "col-games-language";
  const STORAGE_INTRO_KEY = "col-games-intro-seen";
  const TRANSLATION_CACHE_VERSION = "v2";
  const TRANSLATION_CACHE_KEY = `col-games-translation-cache-${TRANSLATION_CACHE_VERSION}`;
  const SUPPORTED_LANGUAGES = [
    { code: "en", label: "EN" },
    { code: "it", label: "ITA" },
    { code: "es", label: "ESP" },
    { code: "ru", label: "РУС" },
    { code: "zh-CN", label: "中文" },
    { code: "ar", label: "AR" },
    { code: "ja", label: "日本語" },
    { code: "fi", label: "FI" },
    { code: "sv", label: "SV" },
    { code: "no", label: "NO" },
    { code: "pl", label: "PL" },
  ];
  const RTL_LANGUAGES = new Set(["ar"]);
  const NAV_LABELS = {
    en: { services: "Services", portfolio: "Portfolio", about: "About", contact: "Contact Us" },
    it: { services: "Servizi", portfolio: "Portfolio", about: "Chi siamo", contact: "Contattaci" },
    es: { services: "Servicios", portfolio: "Portafolio", about: "Acerca de", contact: "Contáctanos" },
    ru: { services: "Услуги", portfolio: "Портфолио", about: "О нас", contact: "Связаться" },
    "zh-CN": { services: "服务", portfolio: "作品集", about: "关于", contact: "联系我们" },
    ar: { services: "الخدمات", portfolio: "المعرض", about: "نبذة عنا", contact: "اتصل بنا" },
    ja: { services: "サービス", portfolio: "ポートフォリオ", about: "概要", contact: "お問い合わせ" },
    fi: { services: "Palvelut", portfolio: "Portfolio", about: "Tietoa", contact: "Ota yhteyttä" },
    sv: { services: "Tjänster", portfolio: "Portfolio", about: "Om", contact: "Kontakta oss" },
    no: { services: "Tjenester", portfolio: "Portefølje", about: "Om", contact: "Kontakt oss" },
    pl: { services: "Usługi", portfolio: "Portfolio", about: "O nas", contact: "Skontaktuj się" },
  };
  const LANGUAGE_WARNING = {
    en: {
      message: "We recommend keeping the site language set to EN (English), as we are still working on translations in other languages and some sections may be difficult to understand due to literal translations. We apologize for the inconvenience.",
      confirm: "Change Language",
      cancel: "Stay in English"
    },
    it: {
      message: "Consigliamo di tenere la lingua del sito selezionata su EN (Inglese), poiché stiamo ancora lavorando sulle traduzioni nelle altre lingue e alcune sezioni potrebbero risultare poco comprensibili a causa delle traduzioni letterali. Ci scusiamo per il disagio.",
      confirm: "Cambia Lingua",
      cancel: "Rimani in Inglese"
    },
    es: {
      message: "Recomendamos mantener el idioma del sitio en EN (Inglés), ya que aún estamos trabajando en las traducciones a otros idiomas y algunas secciones pueden ser difíciles de entender debido a las traducciones literales. Disculpe las molestias.",
      confirm: "Cambiar Idioma",
      cancel: "Permanecer en Inglés"
    },
    ru: {
      message: "Мы рекомендуем сохранить язык сайта на EN (английском), так как мы все еще работаем над переводами на другие языки, и некоторые разделы могут быть трудны для понимания из-за буквальных переводов. Приносим извинения за неудобства.",
      confirm: "Изменить Язык",
      cancel: "Остаться в Английском"
    },
    "zh-CN": {
      message: "我们建议将网站语言保留在EN（英文），因为我们仍在处理其他语言的翻译，由于直译，某些部分可能难以理解。 我们为给您带来的不便表示歉意。",
      confirm: "更改语言",
      cancel: "保留英文"
    },
    ar: {
      message: "نوصي بالاحتفاظ بلغة الموقع على EN (اللغة الإنجليزية)، حيث لا نزال نعمل على الترجمات إلى لغات أخرى وقد يكون من الصعب فهم بعض الأقسام بسبب الترجمات الحرفية. نحتسي عن الإزعاج.",
      confirm: "تغيير اللغة",
      cancel: "البقاء باللغة الإنجليزية"
    },
    ja: {
      message: "サイトの言語をEN（英語）に保つことをお勧めします。他の言語への翻訳はまだ進行中であり、文字通りの翻訳のため、一部のセクションが理解しにくい場合があります。 ご不便をおかけして申し訳ございません。",
      confirm: "言語を変更",
      cancel: "英語に留まる"
    },
    fi: {
      message: "Suosittelemme, että pidät sivuston kielen EN (Englanti) -asetuksissa, koska työskennellemme edelleen käännösten parissa muilla kielillä ja jotkin osiot saattavat olla vaikeaselkoisia kirjaimellisten käännösten vuoksi. Pahoittelemme vaivaa.",
      confirm: "Vaihda Kieli",
      cancel: "Pysy Englanniksi"
    },
    sv: {
      message: "Vi rekommenderar att du behåller webbplatsens språk inställt på EN (Engelska), eftersom vi fortfarande arbetar med översättningar till andra språk och vissa avsnitt kan vara svåra att förstå på grund av bokstavliga översättningar. Vi ber om ursäkt för besväret.",
      confirm: "Ändra Språk",
      cancel: "Stanna på Engelska"
    },
    no: {
      message: "Vi anbefaler å holde nettstedets språk satt til EN (engelsk), da vi fortsatt jobber med oversettelser til andre språk og noen deler kan være vanskelige å forstå på grunn av bokstavelige oversettelser. Vi beklager ulempen.",
      confirm: "Endre Språk",
      cancel: "Bli på Engelsk"
    },
    pl: {
      message: "Zalecamy zachowanie języka witryny ustawionego na EN (angielski), ponieważ nadal pracujemy nad tłumaczeniami na inne języki, a niektóre sekcje mogą być trudne do zrozumienia ze względu na dosłowne tłumaczenia. Przepraszamy za niedogodności.",
      confirm: "Zmień Język",
      cancel: "Pozostań w angielskim"
    }
  };
  const PROTECTED_TERMS = [
    "Digital Frontier",
    "Frontier Design",
    "Web App",
    "Web & App Development",
    "Web & App",
    "Mobile & Web",
    "Web",
    "App",
    "Workflows",
    "AI Agents & Workflows",
    "AI Agents",
    "AI",
    "About",
    "Privacy Policy",
    "Terms of Service",
    "Contact Us",
    "Portfolio",
    "Website Development",
    "Explore Our Ecosystem",
    "View Portfolio",
    "Deep Dive",
    "Explore Stack",
    "Automate Now",
    "Press any key to continue",
    "Enter Dashboard",
    "New Project",
    "Access",
    "Admin",
    "Login",
    "Protected Area",
    "Admin Dashboard",
    "Allowed IPs",
    "Projects",
    "Save Settings",
    "Add Project",
    "Real-time Synchronization",
    "Modular Scaling",
    "Transmit Message",
    "Let's build the extraordinary",
    "Innovating the Digital Frontier",
    "Architecting the future",
    "COL Games",
    "Replay",
  ];
  const TRANSLATABLE_ATTRS = ["placeholder", "aria-label", "title"];
  const EXCLUDED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CANVAS", "SVG", "TEXTAREA", "INPUT", "OPTION"]);
  let introDismissed = false;
  const originalTextByNode = new WeakMap();
  const originalAttrValues = new Map();
  let translationSnapshot = [];
  let initialTitle = document.title;
  let translationCache = {};
  
  // Load cached translations (with version to invalidate old cache)
  (function initializeCache() {
    const storedCache = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (storedCache) {
      try {
        translationCache = JSON.parse(storedCache);
      } catch {
        translationCache = {};
      }
    }
  })();

  function typeEffect(text, element, speed = 40, shouldStop = () => false) {
    return new Promise(async (resolve) => {
      for (let i = 0; i <= text.length; i++) {
        if (shouldStop()) break;
        element.textContent = text.slice(0, i);
        await new Promise((r) => setTimeout(r, speed));
      }
      resolve();
    });
  }

  function backspaceEffect(element, speed = 20, shouldStop = () => false) {
    return new Promise(async (resolve) => {
      const text = element.textContent || "";
      for (let i = text.length; i >= 0; i--) {
        if (shouldStop()) break;
        element.textContent = text.slice(0, i);
        await new Promise((r) => setTimeout(r, speed));
      }
      resolve();
    });
  }

  function getStoredLanguage() {
    return localStorage.getItem(STORAGE_LANGUAGE_KEY) || "en";
  }

  function setStoredLanguage(language) {
    localStorage.setItem(STORAGE_LANGUAGE_KEY, language);
  }

  function getLanguageLabel(language) {
    const entry = SUPPORTED_LANGUAGES.find((item) => item.code === language);
    return entry ? entry.label : "EN";
  }

  function applyStaticNavLabels(language) {
    const labels = NAV_LABELS[language] || NAV_LABELS.en;
    document.querySelectorAll("[data-static-i18n]").forEach((element) => {
      const key = element.getAttribute("data-static-i18n");
      if (key && labels[key]) {
        element.textContent = labels[key];
      }
    });
  }

  function isSkippableText(text) {
    const trimmed = text.trim();
    if (!trimmed) return true;
    if (trimmed === "COL Games") return true;
    if (/^(?:https?:\/\/|mailto:|tel:)/i.test(trimmed)) return true;
    if (/^[\d\s+().-]+$/.test(trimmed)) return true;
    if (/^©\s*\d{4}/.test(trimmed)) return true;
    return false;
  }

  function protectTerms(text) {
    const placeholders = [];
    let output = text;
    
    PROTECTED_TERMS.slice().sort((a, b) => b.length - a.length).forEach((term) => {
      const pattern = new RegExp(
        "\\b" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b",
        "gi"
      );
      output = output.replace(pattern, (match) => {
        const token = `__COL_KEEP_${placeholders.length}__`;
        placeholders.push({ token, value: match });
        return token;
      });
    });
    
    return { text: output, placeholders };
  }

  function restoreTerms(text, placeholders) {
    return placeholders.reduce((acc, item) => {
      const pattern = new RegExp(item.token, 'g');
      return acc.replace(pattern, item.value);
    }, text);
  }

  function captureTranslationSnapshot() {
    if (translationSnapshot.length) return;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent) continue;
      if (parent.closest("[data-no-auto-translate]")) continue;
      if (parent.closest("#intro-loader")) continue;
      if (parent.classList.contains("material-symbols-outlined")) continue;
      if (parent.classList.contains("cursor")) continue;
      if (EXCLUDED_TAGS.has(parent.tagName)) continue;
      if (isSkippableText(node.textContent || "")) continue;

      originalTextByNode.set(node, node.textContent || "");
      nodes.push(node);
    }

    document.querySelectorAll(TRANSLATABLE_ATTRS.map((attr) => `[${attr}]`).join(",")).forEach((element) => {
      const values = {};
      TRANSLATABLE_ATTRS.forEach((attr) => {
        if (element.hasAttribute(attr)) {
          values[attr] = element.getAttribute(attr);
        }
      });
      if (Object.keys(values).length) {
        originalAttrValues.set(element, values);
      }
    });

    translationSnapshot = nodes;
  }

  async function translateString(text, language) {
    if (language === "en") return text;
    if (!translationCache[language]) translationCache[language] = {};
    if (translationCache[language][text]) return translationCache[language][text];

    const protectedText = protectTerms(text);
    const textWithPadding = protectedText.text.replace(/__COL_KEEP_\d+__/g, (match) => ` ${match} `);
    
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(language)}&dt=t&q=${encodeURIComponent(textWithPadding)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Translation request failed: ${response.status}`);
    }

    const data = await response.json();
    const translated = Array.isArray(data?.[0]) ? data[0].map((part) => part?.[0] || "").join("") : text;
    const restored = restoreTerms(translated || text, protectedText.placeholders);
    const cleaned = restored.replace(/\s+/g, ' ').trim();
    
    translationCache[language][text] = cleaned || text;
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(translationCache));
    return cleaned || text;
  }

  async function applyTranslations(language) {
    captureTranslationSnapshot();
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";

    const storedCache = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (storedCache) {
      try {
        translationCache = JSON.parse(storedCache);
      } catch {
        translationCache = {};
      }
    }

    if (language === "en") {
      translationSnapshot.forEach((node) => {
        const original = originalTextByNode.get(node);
        if (original !== undefined) node.textContent = original;
      });
      originalAttrValues.forEach((values, element) => {
        TRANSLATABLE_ATTRS.forEach((attr) => {
          if (values[attr] !== undefined) element.setAttribute(attr, values[attr]);
        });
      });
      document.title = initialTitle;
      return;
    }

    const uniqueTexts = [...new Set(translationSnapshot.map((node) => originalTextByNode.get(node)).filter(Boolean))];
    const translatedPairs = await Promise.all(
      uniqueTexts.map(async (text) => {
        try {
          return [text, await translateString(text, language)];
        } catch {
          return [text, text];
        }
      })
    );
    const translatedMap = new Map(translatedPairs);

    translationSnapshot.forEach((node) => {
      const original = originalTextByNode.get(node);
      if (original !== undefined) node.textContent = translatedMap.get(original) || original;
    });

    originalAttrValues.forEach((values, element) => {
      TRANSLATABLE_ATTRS.forEach((attr) => {
        if (values[attr] !== undefined) {
          translateString(values[attr], language)
            .then((translated) => element.setAttribute(attr, translated))
            .catch(() => element.setAttribute(attr, values[attr]));
        }
      });
    });

    try {
      document.title = await translateString(initialTitle, language);
    } catch {
      document.title = initialTitle;
    }
  }

  async function showLanguageWarning(language) {
    return new Promise((resolve) => {
      // Remove existing modal if any
      const existing = document.getElementById("language-warning-modal");
      if (existing) existing.remove();

      const modal = document.createElement("div");
      modal.id = "language-warning-modal";
      modal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4";
      
      const warnings = LANGUAGE_WARNING[language] || LANGUAGE_WARNING.en;
      
      modal.innerHTML = `
        <div class="bg-surface-container-highest rounded-xl border border-outline-variant/30 max-w-md w-full p-8 shadow-2xl">
          <div class="flex items-start gap-4 mb-6">
            <span class="material-symbols-outlined text-primary text-4xl flex-shrink-0">info</span>
            <div class="flex-1">
              <h2 class="text-lg font-bold text-on-surface mb-3">Language Notice</h2>
              <p class="text-sm text-on-surface-variant leading-relaxed">${warnings.message}</p>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <button 
              id="confirm-language-change" 
              class="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-lg font-semibold hover:brightness-110 transition-all duration-300 active:scale-95"
            >
              ${warnings.confirm}
            </button>
            <button 
              id="cancel-language-change" 
              class="w-full bg-surface-container border border-outline-variant text-on-surface px-6 py-3 rounded-lg font-semibold hover:bg-surface-container-high transition-all duration-300 active:scale-95"
            >
              ${warnings.cancel}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const confirmBtn = modal.querySelector("#confirm-language-change");
      const cancelBtn = modal.querySelector("#cancel-language-change");

      confirmBtn.addEventListener("click", () => {
        modal.remove();
        resolve(true);
      });

      cancelBtn.addEventListener("click", () => {
        modal.remove();
        resolve(false);
      });

      // Close on Escape key
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          modal.remove();
          document.removeEventListener("keydown", handleEscape);
          resolve(false);
        }
      };
      document.addEventListener("keydown", handleEscape);
    });
  }

  function injectLanguageSwitcher() {
    const navRoot = document.querySelector("nav > div");
    if (!navRoot || document.getElementById("language-switcher")) {
      return;
    }

    const controls = navRoot.lastElementChild;
    if (!controls) return;

    const staticLanguage = Array.from(controls.querySelectorAll("button, span")).find(
      (element) => element.textContent?.trim().toUpperCase() === "EN"
    );
    if (staticLanguage) {
      staticLanguage.style.display = "none";
    }

    const wrapper = document.createElement("div");
    wrapper.id = "language-switcher";
    wrapper.className = "ml-2 flex items-center gap-2";
    wrapper.innerHTML = `
      <span class="material-symbols-outlined text-slate-400 text-lg pointer-events-none">language</span>
      <label class="sr-only" for="language-select">Language</label>
      <select
        id="language-select"
        data-language-switch
        class="bg-surface-container-highest/70 text-slate-200 border border-outline-variant/30 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors hover:border-primary/50 focus:border-primary"
      >
        ${SUPPORTED_LANGUAGES.map(
          (item) => `<option value="${item.code}">${item.label}</option>`
        ).join("")}
      </select>
    `;

    controls.appendChild(wrapper);

    const select = wrapper.querySelector("select");
    const stored = getStoredLanguage();
    select.value = stored;
    document.documentElement.lang = stored;
    document.documentElement.dir = RTL_LANGUAGES.has(stored) ? "rtl" : "ltr";
    select.addEventListener("change", async (event) => {
      const language = event.target.value;
      
      // If changing away from English, show warning
      if (language !== "en") {
        const confirmed = await showLanguageWarning(language);
        if (!confirmed) {
          // User chose to stay in English, reset select to "en"
          select.value = "en";
          return;
        }
      }
      
      setStoredLanguage(language);
      applyStaticNavLabels(language);
      applyTranslations(language);
    });
  }

  function injectIntroSkipHint() {
    const introLoader = document.getElementById("intro-loader");
    if (!introLoader || document.getElementById("intro-skip-hint")) return;

    const hint = document.createElement("p");
    hint.id = "intro-skip-hint";
    hint.className = "text-[11px] md:text-xs text-slate-300/80 tracking-wide absolute bottom-12 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none";
    hint.textContent = "Press any key to continue";
    introLoader.appendChild(hint);
  }

  function setupCanvasBackground() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let circuits = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    class Circuit {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.length = Math.random() * 200 + 100;
        this.speed = Math.random() * 1.5 + 0.5;
        this.direction = Math.random() > 0.5 ? 0 : Math.PI / 2;
        this.progress = 0;
        this.alpha = Math.random() * 0.4 + 0.15;
        this.color = Math.random() > 0.5 ? "#c0c1ff" : "#4cd7f6";
      }

      draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = this.alpha * (Math.sin(Date.now() * 0.002 + this.x) * 0.5 + 0.5);
        ctx.lineWidth = 0.5;

        const endX = this.x + Math.cos(this.direction) * this.length;
        const endY = this.y + Math.sin(this.direction) * this.length;

        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        this.progress += this.speed;
        if (this.progress > this.length) this.progress = 0;

        const sparkX = this.x + Math.cos(this.direction) * this.progress;
        const sparkY = this.y + Math.sin(this.direction) * this.progress;

        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha * 2;
        ctx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initBackground() {
      resize();
      circuits = Array.from({ length: 40 }, () => new Circuit());
    }

    function animateBackground() {
      ctx.clearRect(0, 0, width, height);
      circuits.forEach((c) => c.draw());
      raf(animateBackground);
    }

    window.addEventListener("resize", resize);
    initBackground();
    animateBackground();
  }

  function setupIntroBackground() {
    const introCanvas = document.getElementById("intro-bg-canvas");
    const introLoader = document.getElementById("intro-loader");
    if (!introCanvas || !introLoader || introDismissed) return;

    const ictx = introCanvas.getContext("2d");
    let iWidth = 0;
    let iHeight = 0;
    let particles = [];

    function resizeIntro() {
      iWidth = introCanvas.width = window.innerWidth;
      iHeight = introCanvas.height = window.innerHeight;
    }

    class Particle {
      constructor() {
        this.x = Math.random() * iWidth;
        this.y = Math.random() * iHeight;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.color = Math.random() > 0.5 ? "#c0c1ff" : "#4cd7f6";
        this.alpha = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > iWidth) this.speedX *= -1;
        if (this.y < 0 || this.y > iHeight) this.speedY *= -1;
      }

      draw() {
        ictx.beginPath();
        ictx.globalAlpha = this.alpha;
        ictx.fillStyle = this.color;
        ictx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ictx.fill();
      }
    }

    function animateIntroParticles() {
      if (introDismissed) return;
      ictx.clearRect(0, 0, iWidth, iHeight);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      ictx.strokeStyle = "rgba(192, 193, 255, 0.1)";
      ictx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(
            particles[i].x - particles[j].x,
            particles[i].y - particles[j].y
          );
          if (dist < 150) {
            ictx.beginPath();
            ictx.moveTo(particles[i].x, particles[i].y);
            ictx.lineTo(particles[j].x, particles[j].y);
            ictx.stroke();
          }
        }
      }
      raf(animateIntroParticles);
    }

    resizeIntro();
    particles = Array.from({ length: 60 }, () => new Particle());
    animateIntroParticles();
    window.addEventListener("resize", resizeIntro);
  }

  function setupRevealObserver() {
    const revealElements = document.querySelectorAll(".reveal");
    if (!revealElements.length) return;

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => {
        element.classList.add("active");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  function setupIntroSequence() {
    const introLoader = document.getElementById("intro-loader");
    if (!introLoader) return;

    const navEntry = performance.getEntriesByType("navigation")[0];
    const isBackForward = navEntry && navEntry.type === "back_forward";

    // Reset intro animation if user comes back to the page via back/forward
    if (isBackForward) {
      introDismissed = false;
      localStorage.removeItem(STORAGE_INTRO_KEY);
      introLoader.style.display = "flex";
      introLoader.style.opacity = "1";
    } else if (introDismissed) {
      introLoader.style.display = "none";
      return;
    }

    const brandContainer = document.getElementById("intro-brand-container");
    const brandText = document.getElementById("intro-logo-text");
    const servicesContainer = document.getElementById("intro-services-container");
    const serviceIcon = document.getElementById("intro-service-icon");
    const typedText = document.getElementById("intro-typed-text");
    const chatPromptBox = document.getElementById("chat-prompt-box");
    const chatTypedMsg = document.getElementById("chat-typed-msg");

    const services = [
      { text: "Website Development", icon: "language" },
      { text: "Web & App Development", icon: "terminal" },
      { text: "AI Agents & Workflows", icon: "smart_toy" },
    ];

    const finishIntro = () => {
      introDismissed = true;
      localStorage.setItem(STORAGE_INTRO_KEY, "true");
      introLoader.style.opacity = "0";
      window.setTimeout(() => {
        introLoader.style.display = "none";
      }, 1000);
      window.removeEventListener("keydown", handleSkip);
    };

    function handleSkip() {
      if (introDismissed) return;
      finishIntro();
    }

    window.addEventListener("keydown", handleSkip, { once: false });

    const runSequence = async () => {
      if (introDismissed) return;
      await new Promise((resolve) => setTimeout(resolve, 400));
      await typeEffect("COL Games", brandText, 60, () => introDismissed);
      if (introDismissed) return;
      await new Promise((resolve) => setTimeout(resolve, 600));
      await backspaceEffect(brandText, 40, () => introDismissed);
      if (introDismissed) return;

      if (brandContainer) brandContainer.classList.add("hidden");
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (introDismissed) return;

      if (servicesContainer) servicesContainer.classList.remove("hidden");
      for (let i = 0; i < services.length; i++) {
        if (introDismissed) return;
        const service = services[i];
        if (serviceIcon) serviceIcon.textContent = service.icon;
        if (serviceIcon) serviceIcon.classList.add("reveal-active");

        await typeEffect(service.text, typedText, 50, () => introDismissed);
        if (introDismissed) return;
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (introDismissed) return;

        if (i < services.length - 1) {
          await backspaceEffect(typedText, 30, () => introDismissed);
          if (introDismissed) return;
          if (serviceIcon) serviceIcon.classList.remove("reveal-active");
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }

      if (introDismissed) return;

      if (servicesContainer) servicesContainer.classList.add("hidden");
      if (typedText) typedText.textContent = "";
      if (serviceIcon) serviceIcon.textContent = "";
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (introDismissed) return;

      const chatContainer = document.querySelector(".intro-content-wrapper");
      if (chatContainer) chatContainer.classList.remove("hidden");
      if (chatTypedMsg) chatTypedMsg.textContent = "";
      if (chatPromptBox) chatPromptBox.classList.add("visible");
      await typeEffect("You imagine it. We build it.", chatTypedMsg, 40, () => introDismissed);
      if (introDismissed) return;

      await new Promise((resolve) => setTimeout(resolve, 1200));
      finishIntro();
    };

    runSequence();

    window.replayIntro = () => {
      introDismissed = false;
      introLoader.style.display = "flex";
      introLoader.style.opacity = "1";
      if (brandContainer) brandContainer.classList.remove("hidden");
      if (servicesContainer) servicesContainer.classList.add("hidden");
      if (typedText) typedText.textContent = "";
      if (chatTypedMsg) chatTypedMsg.textContent = "";
      if (serviceIcon) serviceIcon.textContent = "";
      if (chatPromptBox) chatPromptBox.classList.remove("visible");
      runSequence();
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const currentLanguage = getStoredLanguage();
    setStoredLanguage(currentLanguage);
    applyStaticNavLabels(currentLanguage);
    injectLanguageSwitcher();
    injectIntroSkipHint();
    setupCanvasBackground();
    setupIntroBackground();
    setupIntroSequence();
    setupRevealObserver();
    applyTranslations(currentLanguage);
  });
})();
