const body = document.body;
const progress = document.querySelector(".progress");
const navLinks = [...document.querySelectorAll(".nav-link")];
const brand = document.querySelector(".brand");
const sections = [...document.querySelectorAll("[data-nav]")];
const revealItems = [...document.querySelectorAll(".reveal")];

setTimeout(function () {
  body.classList.add("ready");
}, 550);

function setActive(key) {
  navLinks.forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.target === key);
  });
}

function scrollToTarget(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

navLinks.forEach(function (btn) {
  btn.addEventListener("click", function () {
    scrollToTarget(btn.dataset.target);
  });
});

if (brand) {
  brand.addEventListener("click", function (event) {
    event.preventDefault();
    scrollToTarget("home");
  });
}

document.addEventListener("scroll", function () {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = Math.max(0, Math.min(1, scrollY / max)) * 100 + "%";
}, { passive: true });

const revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
revealItems.forEach(function (item) {
  revealObserver.observe(item);
});

const navObserver = new IntersectionObserver(function (entries) {
  const visible = entries.filter(function (entry) {
    return entry.isIntersecting;
  }).sort(function (a, b) {
    return b.intersectionRatio - a.intersectionRatio;
  })[0];
  if (visible) setActive(visible.target.dataset.nav);
}, { threshold: [0.18, 0.32, 0.5], rootMargin: "-22% 0px -42% 0px" });
sections.forEach(function (section) {
  navObserver.observe(section);
});

function initBeyondHero() {
  const hero = document.querySelector(".beyond-hero");
  const media = document.getElementById("beyondMedia");
  if (!hero || !media) return;

  function move(event) {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    hero.style.setProperty("--mx", x * 90 + "px");
    hero.style.setProperty("--my", y * 70 + "px");
    hero.style.setProperty("--tilt-x", x * 18 + "px");
    hero.style.setProperty("--tilt-y", y * 14 + "px");
  }

  hero.addEventListener("pointermove", move, { passive: true });
  hero.addEventListener("pointerleave", function () {
    hero.style.setProperty("--mx", "0px");
    hero.style.setProperty("--my", "0px");
    hero.style.setProperty("--tilt-x", "0px");
    hero.style.setProperty("--tilt-y", "0px");
  });
  media.addEventListener("click", function () {
    media.classList.toggle("is-open");
  });
}

initBeyondHero();

function initPortfolioCarousel() {
  const track = document.getElementById("portfolioTrack");
  if (!track) return;
  const prev = document.querySelector(".portfolio-prev");
  const next = document.querySelector(".portfolio-next");
  const meter = document.querySelector(".portfolio-meter i");
  const cards = [...track.querySelectorAll(".portfolio-card")];

  function cardStep() {
    const card = track.querySelector(".portfolio-card");
    if (!card) return track.clientWidth * 0.8;
    const gap = Number(getComputedStyle(track).columnGap.replace("px", "")) || 28;
    return card.getBoundingClientRect().width + gap;
  }

  function updateControls() {
    const max = Math.max(1, track.scrollWidth - track.clientWidth);
    const ratio = Math.max(0, Math.min(1, track.scrollLeft / max));
    if (meter) meter.style.width = 18 + ratio * 82 + "%";
    if (prev) prev.disabled = track.scrollLeft <= 4;
    if (next) next.disabled = track.scrollLeft >= max - 4;
  }

  function moveBy(direction) {
    track.scrollBy({ left: cardStep() * direction, behavior: "smooth" });
  }

  if (prev) prev.addEventListener("click", function () { moveBy(-1); });
  if (next) next.addEventListener("click", function () { moveBy(1); });
  track.addEventListener("scroll", updateControls, { passive: true });

  track.addEventListener("wheel", function (event) {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      event.preventDefault();
    }
  }, { passive: false });

  function setHoveredCard(activeCard) {
    cards.forEach(function (item) {
      item.classList.toggle("is-hovered", item === activeCard);
    });
  }

  track.addEventListener("mousemove", function (event) {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const card = target ? target.closest(".portfolio-card") : null;
    setHoveredCard(card && track.contains(card) ? card : null);
  });

  track.addEventListener("mouseleave", function () {
    setHoveredCard(null);
  });


  updateControls();
  window.addEventListener("resize", updateControls, { passive: true });
}

initPortfolioCarousel();
function initPortfolioCards() {
  const track = document.getElementById("portfolioTrack");
  const cards = [...document.querySelectorAll(".portfolio-card")];
  if (!track || cards.length === 0) return;

  let pressState = null;
  let suppressNextClick = false;

  function closeCards() {
    cards.forEach(function (item) { item.classList.remove("is-open"); });
  }

  function toggleCard(card) {
    const willOpen = !card.classList.contains("is-open");
    closeCards();
    if (willOpen) card.classList.add("is-open");
  }

  cards.forEach(function (card) {
    card.addEventListener("pointerenter", function () {
      card.classList.add("is-hovered");
    });

    card.addEventListener("pointerleave", function () {
      card.classList.remove("is-hovered");
    });

    card.addEventListener("click", function (event) {
      if (suppressNextClick) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      toggleCard(card);
    });

    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleCard(card);
      }
      if (event.key === "Escape") {
        closeCards();
      }
    });
  });

  track.addEventListener("pointerdown", function (event) {
    const card = event.target.closest(".portfolio-card");
    if (!card || !track.contains(card)) return;
    pressState = { card: card, x: event.clientX, y: event.clientY };
  }, true);

  track.addEventListener("pointerup", function (event) {
    if (!pressState) return;
    const moved = Math.abs(event.clientX - pressState.x) > 7 || Math.abs(event.clientY - pressState.y) > 7;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const releasedCard = target ? target.closest(".portfolio-card") : null;
    if (!moved && releasedCard === pressState.card) {
      event.preventDefault();
      event.stopPropagation();
      toggleCard(pressState.card);
      suppressNextClick = true;
      window.setTimeout(function () { suppressNextClick = false; }, 250);
    }
    pressState = null;
  }, true);

  track.addEventListener("pointercancel", function () {
    pressState = null;
  }, true);
}

initPortfolioCards();

function initGuestbook() {
  const openButton = document.getElementById("guestbookOpen");
  const modal = document.getElementById("guestbookModal");
  const form = document.getElementById("guestbookForm");
  const nameInput = document.getElementById("guestName");
  const messageInput = document.getElementById("guestMessage");
  const list = document.getElementById("guestbookList");
  if (!openButton || !modal || !form || !nameInput || !messageInput || !list) return;

  const storageKey = "dh-port-guestbook";
  const nameKey = "dh-port-guest-name";

  function getEntries() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(storageKey, JSON.stringify(entries.slice(0, 20)));
  }

  function escapeText(value) {
    return value.replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }

  function renderEntries() {
    const entries = getEntries();
    if (entries.length === 0) {
      list.innerHTML = '<p class="guestbook-empty">아직 남겨진 댓글이 없습니다.</p>';
      return;
    }
    list.innerHTML = entries.map(function (entry) {
      return '<article class="guestbook-item"><strong>' + escapeText(entry.name) + '</strong><time>' + escapeText(entry.date) + '</time><p>' + escapeText(entry.message) + '</p></article>';
    }).join("");
  }

  function openGuestbook() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    nameInput.value = localStorage.getItem(nameKey) || nameInput.value;
    renderEntries();
    setTimeout(function () {
      (nameInput.value ? messageInput : nameInput).focus();
    }, 30);
  }

  function closeGuestbook() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    openButton.focus();
  }

  openButton.addEventListener("click", openGuestbook);
  modal.querySelectorAll("[data-guestbook-close]").forEach(function (button) {
    button.addEventListener("click", closeGuestbook);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeGuestbook();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    if (!name || !message) return;
    localStorage.setItem(nameKey, name);
    const date = new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    const entries = [{ name: name, message: message, date: date }].concat(getEntries());
    saveEntries(entries);
    messageInput.value = "";
    renderEntries();
    messageInput.focus();
  });

  renderEntries();
}

initGuestbook();
