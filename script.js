var app = document.getElementById("app");
var lightbox = document.getElementById("lightbox");
var lightboxImg = document.getElementById("lightbox-img");
var lightboxClose = document.querySelector(".lightbox__close");
var lightboxCaption = document.getElementById("lightbox-caption");
var musicButton = document.getElementById("music-toggle");
var bgMusic = document.getElementById("bg-music");

var currentPage = 0;
var currentWinnersPage = 0;
var WORKS_PER_PAGE = 12;
var WINNERS_PER_PAGE = 12;
var triedAutoplay = false;
var isRouting = false;
var currentSort = "score";
var currentFilter = "all";
var currentView = "cards";
var currentSearch = "";

function getEventTitle() {
  return typeof EVENT !== "undefined" && EVENT.title ? EVENT.title : "COLUMBINA";
}

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

function formatScore(value) {
  var n = Number(value || 0);
  return String(Number.isInteger(n) ? n : n.toFixed(1).replace(".", ","));
}

function getScore(work) {
  return Number(work.score || 0);
}

function getReward(work) {
  return Number(work.reward || 0);
}

function getTotalReward(works) {
  return works.reduce(function(sum, work) {
    return sum + getReward(work);
  }, 0);
}

function getAverageScore(works) {
  if (!works.length) return 0;
  var sum = works.reduce(function(total, work) {
    return total + getScore(work);
  }, 0);
  return sum / works.length;
}

function getWinners() {
  return WORKS.filter(function(work) {
    return work.isWinner;
  }).sort(function(a, b) {
    if (Number(a.place || 999) !== Number(b.place || 999)) {
      return Number(a.place || 999) - Number(b.place || 999);
    }
    if (getScore(b) !== getScore(a)) return getScore(b) - getScore(a);
    return getReward(b) - getReward(a);
  });
}

function getFilteredAndSortedWorks() {
  var works = WORKS.slice();

  if (currentFilter === "winners") {
    works = works.filter(function(work) {
      return work.isWinner;
    });
  }

  if (currentSearch.trim()) {
    var query = currentSearch.trim().toLowerCase();
    works = works.filter(function(work) {
      return String(work.username || "").toLowerCase().includes(query) ||
        String(work.title || "").toLowerCase().includes(query) ||
        String(work.awardTitle || "").toLowerCase().includes(query);
    });
  }

  if (currentSort === "new") {
    works.sort(function(a, b) {
      return Number(b.id || 0) - Number(a.id || 0);
    });
  } else if (currentSort === "reward") {
    works.sort(function(a, b) {
      if (getReward(b) !== getReward(a)) return getReward(b) - getReward(a);
      return getScore(b) - getScore(a);
    });
  } else {
    works.sort(function(a, b) {
      if (getScore(b) !== getScore(a)) return getScore(b) - getScore(a);
      return getReward(b) - getReward(a);
    });
  }

  return works;
}

function getRouteFromUrl() {
  var params = new URLSearchParams(window.location.search);
  var route = params.get("page") || "home";
  if (route === "credits") return "results";
  return route;
}

function urlFor(route) {
  if (route === "home") return window.location.pathname;
  return window.location.pathname + "?page=" + route;
}

function setAppHtml(html) {
  app.innerHTML = html;
}

function renderStatsBlock() {
  var total = WORKS.length;
  var winners = getWinners().length;
  var avg = getAverageScore(WORKS).toFixed(1).replace(".", ",");
  var prize = getTotalReward(WORKS);

  return (
    '<div class="stats-grid">' +
      '<div class="stat-card"><span>Всего работ</span><b>' + total + '</b></div>' +
      '<div class="stat-card"><span>Победителей</span><b>' + winners + '</b></div>' +
      '<div class="stat-card"><span>Средняя оценка</span><b>' + avg + '/10</b></div>' +
      '<div class="stat-card"><span>Призовой фонд</span><b>' + formatTokens(prize) + '</b></div>' +
    '</div>'
  );
}

function renderHome() {
  setAppHtml(
    '<section class="home">' +
      '<div class="cover-shell">' +
        '<div class="cover-card">' +
          '<img class="cover-img" src="' + escapeHtml(EVENT.cover || "img/cover.png") + '" alt="Обложка">' +
          '<div class="cover-overlay">' +
            '<div class="kicker">event archive</div>' +
            '<h1>' + escapeHtml(getEventTitle()) + '</h1>' +
            '<p>Итоги ивента</p>' +
            '<a class="main-btn" href="' + urlFor("results") + '" data-route="results">Итоги</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>'
  );
}

function renderResultsMenu() {
  setAppHtml(
    '<section class="page">' +
      '<div class="page-head">' +
        '<div>' +
          '<div class="kicker">choose section</div>' +
          '<h2>Итоги ивента</h2>' +
          '<p>Два раздела архива: витрина победителей и полный список работ.</p>' +
        '</div>' +
      '</div>' +

      renderStatsBlock() +

      '<div class="menu-grid">' +
        '<a class="menu-card menu-card--winners" href="' + urlFor("winners") + '" data-route="winners">' +
          '<div class="menu-card__mark">Hall I</div>' +
          '<h3>Работы победителей</h3>' +
          '<p>Отдельная витрина лучших работ, мест и наград.</p>' +
          '<span>' + getWinners().length + ' работ</span>' +
        '</a>' +

        '<a class="menu-card menu-card--all" href="' + urlFor("all") + '" data-route="all">' +
          '<div class="menu-card__mark">Hall II</div>' +
          '<h3>Все работы участников</h3>' +
          '<p>Полный архив ивента с оценками по 10-балльной шкале.</p>' +
          '<span>' + WORKS.length + ' работ</span>' +
        '</a>' +

        '<a class="menu-card menu-card--gallery" href="' + urlFor("all") + '" data-route="all" data-gallery-start="true">' +
          '<div class="menu-card__mark">Hall III</div>' +
          '<h3>Режим галереи</h3>' +
          '<p>Только арты крупной сеткой, без лишних данных.</p>' +
          '<span>смотреть визуал</span>' +
        '</a>' +

        '<a class="menu-card menu-card--winners" href="#" id="random-work-card">' +
          '<div class="menu-card__mark">Random</div>' +
          '<h3>Случайная работа</h3>' +
          '<p>Открыть случайный арт из архива.</p>' +
          '<span>рандом</span>' +
        '</a>' +
      '</div>' +
    '</section>'
  );

  var randomCard = document.getElementById("random-work-card");
  if (randomCard) {
    randomCard.onclick = function(event) {
      event.preventDefault();
      openRandomWork();
    };
  }
}

function renderWinners() {
  currentWinnersPage = 0;
  renderWinnersPage();
}

function renderWinnersPage() {
  var winners = getWinners();
  var totalPages = Math.max(1, Math.ceil(winners.length / WINNERS_PER_PAGE));
  var start = currentWinnersPage * WINNERS_PER_PAGE;
  var pageWinners = winners.slice(start, start + WINNERS_PER_PAGE);

  var content = "";

  if (!winners.length) {
    content = '<div class="empty">Победители пока не добавлены в <b>data.js</b>.</div>';
  } else {
    content =
      '<div class="works-grid winners-grid">' + pageWinners.map(renderWorkCard).join("") + '</div>' +
      '<div class="pagination">' +
        '<button class="ghost-btn" id="prev-winners-page" type="button">← Назад</button>' +
        '<span class="page-counter">' + (currentWinnersPage + 1) + ' / ' + totalPages + '</span>' +
        '<button class="main-btn small" id="next-winners-page" type="button">Дальше →</button>' +
      '</div>';
  }

  setAppHtml(
    '<section class="page">' +
      '<div class="page-head">' +
        '<div>' +
          '<a class="back" href="' + urlFor("results") + '" data-route="results">← Назад к итогам</a>' +
          '<div class="kicker">columbina awards</div>' +
          '<h2>Работы победителей</h2>' +
          '<p>Главная витрина ивента: места, оценки и награды. Для стабильности показываем по ' + WINNERS_PER_PAGE + ' работ на странице.</p>' +
        '</div>' +
      '</div>' +
      content +
    '</section>'
  );

  var prev = document.getElementById("prev-winners-page");
  var next = document.getElementById("next-winners-page");

  if (prev) {
    prev.disabled = currentWinnersPage === 0;
    prev.onclick = function() {
      if (currentWinnersPage > 0) {
        currentWinnersPage--;
        renderWinnersPage();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
  }

  if (next) {
    next.disabled = currentWinnersPage >= totalPages - 1;
    next.onclick = function() {
      if (currentWinnersPage < totalPages - 1) {
        currentWinnersPage++;
        renderWinnersPage();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
  }

  attachImageHandlers();
  attachShareHandlers();
}

function renderAllWorks() {
  currentPage = 0;
  renderAllWorksPage();
}

function renderAllWorksPage() {
  var works = getFilteredAndSortedWorks();
  var totalPages = Math.max(1, Math.ceil(works.length / WORKS_PER_PAGE));
  var start = currentPage * WORKS_PER_PAGE;
  var pageWorks = works.slice(start, start + WORKS_PER_PAGE);
  var gridClass = currentView === "gallery" ? "works-grid gallery-grid" : "works-grid";

  setAppHtml(
    '<section class="page">' +
      '<div class="page-head">' +
        '<div>' +
          '<a class="back" href="' + urlFor("results") + '" data-route="results">← Назад к итогам</a>' +
          '<div class="kicker">complete archive</div>' +
          '<h2>Все работы участников</h2>' +
          '<p>Оценка выставлялась по 10-балльной шкале, без комментариев.</p>' +
        '</div>' +
      '</div>' +

      '<div class="toolbar">' +
        '<input class="search-input" id="search-input" placeholder="Найти автора..." value="' + escapeHtml(currentSearch) + '">' +
        '<button class="filter-btn ' + (currentSort === "score" ? "is-active" : "") + '" data-sort="score">Сначала лучшие</button>' +
        '<button class="filter-btn ' + (currentSort === "new" ? "is-active" : "") + '" data-sort="new">Сначала новые</button>' +
        '<button class="filter-btn ' + (currentSort === "reward" ? "is-active" : "") + '" data-sort="reward">По награде</button>' +
        '<button class="filter-btn ' + (currentFilter === "winners" ? "is-active" : "") + '" data-filter="winners">Только победители</button>' +
        '<button class="filter-btn ' + (currentFilter === "all" ? "is-active" : "") + '" data-filter="all">Все</button>' +
        '<button class="filter-btn ' + (currentView === "cards" ? "is-active" : "") + '" data-view="cards">Обычный режим</button>' +
        '<button class="filter-btn ' + (currentView === "gallery" ? "is-active" : "") + '" data-view="gallery">Галерея</button>' +
        '<button class="filter-btn" id="random-work-button">Случайная работа</button>' +
      '</div>' +

      (works.length ? '<div class="' + gridClass + '">' + pageWorks.map(renderWorkCard).join("") + '</div>' :
      '<div class="empty">Работы не найдены.</div>') +

      '<div class="pagination">' +
        '<button class="ghost-btn" id="prev-page" type="button">← Назад</button>' +
        '<span class="page-counter">' + (currentPage + 1) + ' / ' + totalPages + '</span>' +
        '<button class="main-btn small" id="next-page" type="button">Дальше →</button>' +
      '</div>' +

      '<div class="thanks-block">' +
        '<h3>Спасибо всем участникам ' + escapeHtml(getEventTitle()) + '.</h3>' +
        '<p>Каждая работа стала частью архива.</p>' +
      '</div>' +
    '</section>'
  );

  setupToolbar();

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

  var randomButton = document.getElementById("random-work-button");
  if (randomButton) {
    randomButton.onclick = openRandomWork;
  }

  attachImageHandlers();
  attachShareHandlers();
  openWorkFromUrlIfNeeded();
}

function setupToolbar() {
  var input = document.getElementById("search-input");
  if (input) {
    input.oninput = function() {
      currentSearch = input.value;
      currentPage = 0;
      renderAllWorksPage();
    };
  }

  document.querySelectorAll("[data-sort]").forEach(function(button) {
    button.onclick = function() {
      currentSort = button.getAttribute("data-sort");
      currentPage = 0;
      renderAllWorksPage();
    };
  });

  document.querySelectorAll("[data-filter]").forEach(function(button) {
    button.onclick = function() {
      currentFilter = button.getAttribute("data-filter");
      currentPage = 0;
      renderAllWorksPage();
    };
  });

  document.querySelectorAll("[data-view]").forEach(function(button) {
    button.onclick = function() {
      currentView = button.getAttribute("data-view");
      currentPage = 0;
      renderAllWorksPage();
    };
  });
}

function renderWorkCard(work) {
  var winnerBadge = work.isWinner
    ? '<div class="place-badge">' + (work.place ? work.place + ' место' : 'Победитель') + '</div>'
    : '';

  var awardTitle = work.awardTitle
    ? '<div class="award-title-badge">' + escapeHtml(work.awardTitle) + '</div>'
    : '';

  var link = work.postLink
    ? '<a class="post-link" href="' + escapeHtml(work.postLink) + '" target="_blank" rel="noopener">Пост</a>'
    : '';

  var galleryClass = currentView === "gallery" ? " is-gallery" : "";

  return (
    '<article class="work-card' + galleryClass + '" id="work-' + escapeHtml(work.id) + '">' +
      '<button class="image-btn" data-image="' + escapeHtml(work.image) + '" data-work-id="' + escapeHtml(work.id) + '" data-alt="' + escapeHtml(work.username) + '">' +
        '<img src="' + escapeHtml(work.image) + '" alt="Работа ' + escapeHtml(work.username) + '" loading="lazy" decoding="async">' +
        winnerBadge +
        awardTitle +
      '</button>' +
      '<div class="work-body">' +
        '<div class="work-top">' +
          '<div>' +
            '<h3>' + escapeHtml(work.username) + '</h3>' +
            '<p>' + escapeHtml(work.title || "Работа участника") + '</p>' +
          '</div>' +
          '<div class="work-actions">' +
            link +
            '<button class="share-btn" type="button" data-share-id="' + escapeHtml(work.id) + '">Ссылка</button>' +
          '</div>' +
        '</div>' +
        '<div class="result-badges">' +
          '<span class="result-badge result-score">Оценка <b>' + formatScore(work.score) + '/10</b></span>' +
          '<span class="result-badge result-reward">Награда <b>' + formatTokens(work.reward) + '</b></span>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

function renderByRoute(route) {
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

function routeTo(route, push) {
  if (isRouting) return;
  isRouting = true;

  if (push) {
    window.history.pushState({}, "", urlFor(route));
  }

  app.classList.remove("route-enter");
  app.classList.add("route-exit");

  window.setTimeout(function() {
    renderByRoute(route);

    app.classList.remove("route-exit");
    app.classList.add("route-enter");

    window.setTimeout(function() {
      app.classList.remove("route-enter");
      isRouting = false;
    }, 540);
  }, 260);
}

function setupNavigation() {
  document.addEventListener("click", function(event) {
    var link = event.target.closest("a[data-route]");
    if (!link) return;

    event.preventDefault();

    if (link.getAttribute("data-gallery-start") === "true") {
      currentView = "gallery";
    }

    routeTo(link.getAttribute("data-route"), true);
  });

  window.addEventListener("popstate", function() {
    routeTo(getRouteFromUrl(), false);
  });
}

function setupParallax() {
  if (!window.matchMedia || !window.matchMedia("(hover: hover)").matches) return;

  document.addEventListener("mousemove", function(event) {
    var x = (event.clientX / window.innerWidth - 0.5) * 14;
    var y = (event.clientY / window.innerHeight - 0.5) * 14;
    document.body.style.backgroundPosition = (50 + x * 0.08) + "% " + (50 + y * 0.08) + "%";
  });
}

function findWork(id) {
  return WORKS.find(function(work) {
    return String(work.id) === String(id);
  });
}

function openWork(work) {
  if (!work || !lightbox || !lightboxImg) return;

  lightboxImg.src = work.image;
  lightboxImg.alt = work.username || "";

  if (lightboxCaption) {
    lightboxCaption.innerHTML =
      '<div><b>' + escapeHtml(work.username) + '</b>' +
      '<span> — ' + escapeHtml(work.title || "Работа участника") + '</span></div>' +
      '<div><b>' + formatScore(work.score) + '/10</b> · ' + formatTokens(work.reward) + '</div>' +
      '<button class="share-btn" type="button" id="lightbox-share">Скопировать ссылку</button>';
  }

  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");

  var share = document.getElementById("lightbox-share");
  if (share) {
    share.onclick = function() {
      copyText(workUrl(work.id), share);
    };
  }
}

function attachImageHandlers() {
  document.querySelectorAll("[data-image]").forEach(function(button) {
    button.onclick = function() {
      openWork(findWork(button.getAttribute("data-work-id")));
    };
  });
}

function attachShareHandlers() {
  document.querySelectorAll("[data-share-id]").forEach(function(button) {
    button.onclick = function() {
      copyText(workUrl(button.getAttribute("data-share-id")), button);
    };
  });
}

function workUrl(id) {
  return window.location.origin + window.location.pathname + "?page=all&work=" + encodeURIComponent(id);
}

function copyText(text, button) {
  function done() {
    if (!button) return;
    var old = button.textContent;
    button.textContent = "Скопировано";
    window.setTimeout(function() {
      button.textContent = old;
    }, 1200);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(function() {});
  } else {
    var temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    done();
  }
}

function openRandomWork() {
  if (!WORKS.length) return;
  var work = WORKS[Math.floor(Math.random() * WORKS.length)];
  openWork(work);
}

function openWorkFromUrlIfNeeded() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get("work");
  if (!id) return;

  var work = findWork(id);
  if (!work) return;

  window.setTimeout(function() {
    openWork(work);
  }, 250);
}

function closeLightbox() {
  if (!lightbox || !lightboxImg) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  if (lightboxCaption) lightboxCaption.innerHTML = "";
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

  musicButton.textContent = "♪";
  musicButton.setAttribute("aria-label", isPlaying ? "Музыка включена" : "Музыка выключена");

  if (isPlaying) {
    musicButton.classList.remove("is-muted");
    musicButton.classList.add("is-playing");
  } else {
    musicButton.classList.remove("is-playing");
    musicButton.classList.add("is-muted");
  }
}

function tryStartMusic() {
  // Autoplay intentionally disabled.
  // Music starts only after pressing the music button.
  updateMusicButton(false);
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
}

function showIntro() {
  if (document.getElementById("intro")) return;

  var intro = document.createElement("div");
  intro.id = "intro";
  intro.innerHTML =
    '<div class="intro-box">' +
      '<h1>' + escapeHtml(getEventTitle()) + '</h1>' +
      '<p>loading archive...</p>' +
      '<div class="loader-line"><span></span></div>' +
    '</div>';

  document.body.appendChild(intro);

  window.setTimeout(function() {
    intro.classList.add("is-hidden");
    window.setTimeout(function() {
      if (intro.parentNode) intro.parentNode.removeChild(intro);
    }, 650);
  }, 1150);
}

setupNavigation();
setupParallax();
showIntro();
renderByRoute(getRouteFromUrl());
app.classList.add("route-enter");
tryStartMusic();
