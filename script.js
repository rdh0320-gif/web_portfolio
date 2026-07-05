      await new Promise(function (resolve) {
        setTimeout(resolve, id === "home" ? 1600 : 1200);
      });
    }
  });
}
function initPortfolioCarousel() {
  const track = document.getElementById("portfolioTrack");
  if (!track) return;
  const prev = document.querySelector(".portfolio-prev");
  const next = document.querySelector(".portfolio-next");
  const meter = document.querySelector(".portfolio-meter i");
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
