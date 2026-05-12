var app = document.getElementById("app");
var lightbox = document.getElementById("lightbox");
var lightboxImg = document.getElementById("lightbox-img");
var lightboxClose = document.querySelector(".lightbox__close");
var musicButton = document.getElementById("music-toggle");
var bgMusic = document.getElementById("bg-music");

var currentPage = 0;
var WORKS_PER_PAGE = 12;
var triedAutoplay = false;

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatTokens(value) {
  return String(Number(value || 0).toLocaleString("ru-RU")) + " токенов";
}

function getSortedWorks() {
  return WORKS.slice().sort(function(a, b) {
    if (Number(b.score || 0) !== Number(a.score || 0)) return Number(b.score || 0) - Number(a.score || 0);
    return Number(b.reward || 0) - Number(a.reward || 0);
  });
}

function getWinners() {
  return WORKS.filter(function(work) {
    return work.isWinner;
  }).sort(function(a, b) {
    return Number(a.place || 999) - Number(b.place || 999);
  });
}

function getRouteFromUrl() {
  var params = new URLSearchParams(window.location.search);
  return params.get("page") || "home";
}

function urlFor(route) {
  if (route === "home") return window.location.pathname;
  return window.location.pathname + "?page=" + route;
}

function renderHome() {
  app.innerHTML =
    '<section class="home">' +
      '<div class="cover-shell">' +
        '<div class="cover-card">' +
          '<img class="cover-img" src="' + escapeHtml(EVENT.cover) + '" alt="Обложка ивента ' + escapeHtml(EVENT.title) + '">' +
          '<div class="cover-overlay">' +
            '<div class="kicker">event archive</div>' +
            '<h1>' + escapeHtml(EVENT.title) + '</h1>' +
            '<p>' + escapeHtml(EVENT.subtitle) + '</p>' +
            '<div class="home-stats">' + escapeHtml(EVENT.stats) + '</div>' +
            '<a class="main-btn" href="' + urlFor("results") + '" data-route="results">Итоги</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
}

function renderResultsMenu() {
  app.innerHTML =
    '<section class="page">' +
      '<div class="page-head">' +
        '<div>' +
          '<div class="kicker">choose section</div>' +
          '<h2>Итоги ивента</h2>' +
          '<p>Выбери, что открыть: работы победителей или полный архив участников.</p>' +
        '</div>' +
      '</div>' +

      '<div class="menu-grid">' +
        '<a class="menu-card menu-card--winners" href="' + urlFor("winners") + '" data-route="winners">' +
          '<div class="menu-card__mark">I</div>' +
          '<h3>Работы победителей</h3>' +
          '<p>Отдельная витрина лучших работ и наград.</p>' +
          '<span>' + getWinners().length + ' работ</span>' +
        '</a>' +

        '<a class="menu-card menu-card--all" href="' + urlFor("all") + '" data-route="all">' +
          '<div class="menu-card__mark">II</div>' +
          '<h3>Все работы участников</h3>' +
          '<p>Полный архив ивента с оценками по 10-балльной шкале.</p>' +
          '<span>' + WORKS.length + ' работ</span>' +
        '</a>' +
      '</div>' +
    '</section>';
}

function renderWinners() {
  var winners = getWinners();

  app.innerHTML =
    '<section class="page">' +
      '<div class="page-head">' +
        '<div>' +
          '<a class="back" href="' + urlFor("results") + '" data-route="results">← Назад к итогам</a>' +
          '<div class="kicker">winner gallery</div>' +
          '<h2>Работы победителей</h2>' +
          '<p>Главная витрина ивента: победители, оценки и награды.</p>' +
        '</div>' +
      '</div>' +

      (winners.length ? '<div class="works-grid winners-grid">' + winners.map(renderWorkCard).join("") + '</div>' :
      '<div class="empty">Победители пока не добавлены в <b>data.js</b>.</div>') +
    '</section>';

  attachImageHandlers();
}

function renderAllWorks() {
  currentPage = 0;
  renderAllWorksPage();
}

function renderAllWorksPage() {
  var works = getSortedWorks();
  var totalPages = Math.max(1, Math.ceil(works.length / WORKS_PER_PAGE));
  var start = currentPage * WORKS_PER_PAGE;
  var pageWorks = works.slice(start, start + WORKS_PER_PAGE);

  app.innerHTML =
    '<section class="page">' +
      '<div class="page-head">' +
        '<div>' +
          '<a class="back" href="' + urlFor("results") + '" data-route="results">← Назад к итогам</a>' +
          '<div class="kicker">complete archive</div>' +
          '<h2>Все работы участников</h2>' +
          '<p>Оценка выставлялась по 10-балльной шкале, без комментариев.</p>' +
        '</div>' +
      '</div>' +

      (works.length ? '<div class="works-grid">' + pageWorks.map(renderWorkCard).join("") + '</div>' :
      '<div class="empty">Работы пока не добавлены в <b>data.js</b>.</div>') +

      '<div class="pagination">' +
        '<button class="ghost-btn" id="prev-page" type="button">← Назад</button>' +
        '<span class="page-counter">' + (currentPage + 1) + ' / ' + totalPages + '</span>' +
        '<button class="main-btn small" id="next-page" type="button">Дальше →</button>' +
      '</div>' +
    '</section>';

  var prev = document.getElementById("prev-page");
  var next = document.getElementById("next-page");

  if (prev) {
    prev.disabled = currentPage === 0;
    prev.onclick = function() {
      if (currentPage > 0) {
        currentPage--;
        renderAllWorksPage();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
  }

  if (next) {
    next.disabled = currentPage >= totalPages - 1;
    next.onclick = function() {
      if (currentPage < totalPages - 1) {
        currentPage++;
        renderAllWorksPage();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
  }

  attachImageHandlers();
}

function renderWorkCard(work) {
  var winnerBadge = work.isWinner
    ? '<div class="place-badge">' + (work.place ? work.place + ' место' : 'Победитель') + '</div>'
    : '';

  var link = work.postLink
    ? '<a class="post-link" href="' + escapeHtml(work.postLink) + '" target="_blank" rel="noopener">Пост</a>'
    : '';

  return (
    '<article class="work-card">' +
      '<button class="image-btn" data-image="' + escapeHtml(work.image) + '" data-alt="' + escapeHtml(work.username) + '">' +
        '<img src="' + escapeHtml(work.image) + '" alt="Работа ' + escapeHtml(work.username) + '" loading="lazy" decoding="async">' +
        winnerBadge +
        '<div class="score-badge">' + Number(work.score || 0) + '/10</div>' +
      '</button>' +
      '<div class="work-body">' +
        '<div class="work-top">' +
          '<div>' +
            '<h3>' + escapeHtml(work.username) + '</h3>' +
            '<p>' + escapeHtml(work.title || "Работа участника") + '</p>' +
          '</div>' +
          link +
        '</div>' +
        '<div class="work-meta">' +
          '<span>Оценка: <b>' + Number(work.score || 0) + '/10</b></span>' +
          '<span>Награда: <b>' + formatTokens(work.reward) + '</b></span>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

function routeTo(route, push) {
  if (push) {
    window.history.pushState({}, "", urlFor(route));
  }

  if (route === "results") {
    renderResultsMenu();
    return;
  }

  if (route === "winners") {
    renderWinners();
    return;
  }

  if (route === "all") {
    renderAllWorks();
    return;
  }

  renderHome();
}

function setupNavigation() {
  document.addEventListener("click", function(event) {
    var link = event.target.closest("a[data-route]");
    if (!link) return;

    event.preventDefault();
    routeTo(link.getAttribute("data-route"), true);
  });

  window.addEventListener("popstate", function() {
    routeTo(getRouteFromUrl(), false);
  });
}

function attachImageHandlers() {
  var buttons = document.querySelectorAll("[data-image]");
  buttons.forEach(function(button) {
    button.onclick = function() {
      lightboxImg.src = button.getAttribute("data-image");
      lightboxImg.alt = button.getAttribute("data-alt") || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    };
  });
}

function closeLightbox() {
  if (!lightbox || !lightboxImg) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
}

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener("click", function(event) {
    if (event.target === lightbox) closeLightbox();
  });
}

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") closeLightbox();
});

function updateMusicButton(isPlaying) {
  if (!musicButton) return;

  if (isPlaying) {
    musicButton.textContent = "♪ Музыка: вкл";
    musicButton.classList.remove("is-muted");
    musicButton.classList.add("is-playing");
  } else {
    musicButton.textContent = "♪ Музыка";
    musicButton.classList.remove("is-playing");
    musicButton.classList.add("is-muted");
  }
}

function tryStartMusic() {
  if (!bgMusic || triedAutoplay) return;
  triedAutoplay = true;

  bgMusic.volume = 0.35;

  var playPromise = bgMusic.play();

  if (playPromise && typeof playPromise.then === "function") {
    playPromise.then(function() {
      updateMusicButton(true);
    }).catch(function() {
      updateMusicButton(false);
      musicButton.textContent = "♪ Нажми для музыки";
    });
  }
}

if (musicButton && bgMusic) {
  bgMusic.volume = 0.35;

  musicButton.addEventListener("click", function() {
    if (bgMusic.paused) {
      bgMusic.play().then(function() {
        updateMusicButton(true);
      }).catch(function() {
        updateMusicButton(false);
      });
    } else {
      bgMusic.pause();
      updateMusicButton(false);
    }
  });

  document.addEventListener("click", function startOnFirstClick() {
    if (bgMusic.paused) {
      bgMusic.play().then(function() {
        updateMusicButton(true);
      }).catch(function() {});
    }
    document.removeEventListener("click", startOnFirstClick);
  });
}

setupNavigation();
routeTo(getRouteFromUrl(), false);
tryStartMusic();
