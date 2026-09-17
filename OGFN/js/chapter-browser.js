(function () {
  const JSON_PATH = "../../data/Builds.json";
  const MUSIC_PATH = "../../assets/music/Select.mp3";
  const SELECT_BUTTON_PATH = "../../assets/SelectButtton.png";
  const ART_PATH = "../../art";
  const urlStatusCache = new Map();

  const chapterId = document.body.dataset.chapterId;
  const chapterName = document.body.dataset.chapterName || "Chapter";
  const pageTitle = document.body.dataset.pageTitle || "Select a Season";

  const seasonTrack = document.querySelector("#season-track");
  const seasonRail = document.querySelector("#season-rail");
  const prevButton = document.querySelector("#season-prev");
  const nextButton = document.querySelector("#season-next");
  const chapterBadge = document.querySelector("#chapter-badge");
  const pageTitleEl = document.querySelector("#page-title");
  const modal = document.querySelector("#browser-modal");
  const modalTitle = document.querySelector("#browser-modal-title");
  const modalSubtitle = document.querySelector("#browser-modal-subtitle");
  const modalBody = document.querySelector("#browser-modal-body");
  const modalClose = document.querySelector("#browser-modal-close");
  const modalScrollUp = document.querySelector("#modal-scroll-up");
  const modalScrollDown = document.querySelector("#modal-scroll-down");
  const audio = document.querySelector("#select-audio");
  const musicToggle = document.querySelector("#music-toggle");
  const musicToggleText = document.querySelector("#music-toggle-text");

  let chapterData = null;
  let activeSeason = null;

  function setStaticAssets() {
    if (chapterBadge) {
      chapterBadge.textContent = chapterName.toUpperCase();
    }
    if (pageTitleEl) {
      pageTitleEl.textContent = pageTitle;
    }
    document.title = `Itypto Builds - ${chapterName}`;
  }

  async function loadBuildData() {
    if (window.OGFN_BUILDS && Array.isArray(window.OGFN_BUILDS.chapters)) {
      return window.OGFN_BUILDS.chapters.find((chapter) => chapter.id === chapterId) || null;
    }

    const response = await fetch(JSON_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load builds.json (${response.status})`);
    }
    const data = await response.json();
    return data.chapters.find((chapter) => chapter.id === chapterId) || null;
  }

  function renderSeasonCards(chapter) {
    seasonTrack.innerHTML = "";

    chapter.seasons.forEach((season, index) => {
      const displaySeasonName = `Season ${index + 1}`;
      const isChapter4OgSeason = chapter.id === "ch4" && index === chapter.seasons.length - 1;
      const cardLabel = isChapter4OgSeason ? "OG" : displaySeasonName;
      const modalSeasonName = isChapter4OgSeason ? `${displaySeasonName} (OG)` : displaySeasonName;
      season.browserDisplayName = displaySeasonName;
      season.browserCardLabel = cardLabel;
      season.browserModalName = modalSeasonName;

      const card = document.createElement("button");
      card.type = "button";
      card.className = "season-card";
      card.setAttribute("aria-label", `Open ${modalSeasonName}`);
      card.dataset.seasonNumber = String(season.seasonNumber);

      const art = document.createElement("img");
      art.className = "season-card-art";
      art.src = `${ART_PATH}/Season${season.seasonNumber}.webp`;
      art.alt = modalSeasonName;

      const label = document.createElement("span");
      label.className = "season-card-label";
      label.textContent = cardLabel;

      const select = document.createElement("span");
      select.className = "season-card-select";
      select.setAttribute("aria-hidden", "true");

      const selectImage = document.createElement("img");
      selectImage.src = SELECT_BUTTON_PATH;
      selectImage.alt = "";
      select.appendChild(selectImage);

      card.appendChild(art);
      card.appendChild(label);
      card.appendChild(select);
      card.addEventListener("click", () => openSeasonModal(season));

      seasonTrack.appendChild(card);
    });

    updateArrowState();
    requestAnimationFrame(centerInitialSeasonView);
  }

  function centerInitialSeasonView() {
    const cards = Array.from(seasonTrack.children);
    if (!cards.length) {
      return;
    }

    const leftIndex = Math.floor((cards.length - 1) / 2);
    const rightIndex = Math.ceil((cards.length - 1) / 2);
    const leftCard = cards[leftIndex];
    const rightCard = cards[rightIndex];

    const leftCenter = leftCard.offsetLeft + leftCard.offsetWidth / 2;
    const rightCenter = rightCard.offsetLeft + rightCard.offsetWidth / 2;
    const midpoint = (leftCenter + rightCenter) / 2;
    const targetLeft = Math.max(0, midpoint - seasonRail.clientWidth / 2);

    seasonRail.scrollTo({ left: targetLeft, behavior: "auto" });
    updateArrowState();
  }

  function scrollRail(direction) {
    const cards = Array.from(seasonTrack.children);
    if (!cards.length) {
      return;
    }

    const firstCard = cards[0];
    const style = window.getComputedStyle(seasonTrack);
    const gap = parseFloat(style.gap || "0");
    const cardStep = firstCard.getBoundingClientRect().width + gap;
    const amount = Math.max(cardStep * 2, seasonRail.clientWidth * 0.72);

    seasonRail.scrollBy({
      left: amount * direction,
      behavior: "smooth",
    });
  }

  function updateArrowState() {
    if (!prevButton || !nextButton) {
      return;
    }

    const maxScroll = Math.max(0, seasonRail.scrollWidth - seasonRail.clientWidth);
    prevButton.disabled = seasonRail.scrollLeft <= 4;
    nextButton.disabled = seasonRail.scrollLeft >= maxScroll - 4;
  }

  function createStatusPill(text, className) {
    const pill = document.createElement("span");
    pill.className = `status-pill ${className}`;
    pill.textContent = text;
    return pill;
  }

  function createDownloadCtaElement(element, ariaLabel) {
    element.className = "download-cta";
    element.setAttribute("aria-label", ariaLabel);
    element.textContent = "Download";
    return element;
  }

  function createDownloadLink(url, ariaLabel) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    return createDownloadCtaElement(link, ariaLabel);
  }

  function createDownloadButton(ariaLabel) {
    const button = document.createElement("button");
    button.type = "button";
    return createDownloadCtaElement(button, ariaLabel);
  }

  function createDisabledChip(text) {
    const chip = document.createElement("span");
    chip.className = "download-disabled";
    chip.textContent = text;
    return chip;
  }

  function normalizeBuildLabel(build) {
    return build.displayName || build.version || build.info || "Unknown Build";
  }

  function formatDownloadSourceLabel(download, index) {
    const label = (download.label || "").toLowerCase();
    if (label === "primary") {
      return "Primary Download";
    }

    const alternativeMatch = label.match(/^alternative-(\d+)$/);
    if (alternativeMatch) {
      return `Alternative ${alternativeMatch[1]}`;
    }

    return index === 0 ? "Primary Download" : `Alternative ${index}`;
  }

  function getDownloadHostLabel(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (error) {
      return url;
    }
  }

  function openSeasonModal(season) {
    activeSeason = season;
    renderSeasonBuildList(season);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(updateModalScrollButtons);
  }

  function renderSeasonBuildList(season) {
    const modalSeasonName = season.browserModalName || season.browserDisplayName || season.name;
    modalTitle.textContent = `${chapterName} ${modalSeasonName}`;
    modalSubtitle.textContent = `${season.builds.length} build${season.builds.length === 1 ? "" : "s"} available`;
    modalBody.innerHTML = "";

    if (!season.builds.length) {
      const empty = document.createElement("div");
      empty.className = "browser-empty";
      empty.textContent = "No builds were found for this season yet.";
      modalBody.appendChild(empty);
    } else {
      const list = document.createElement("div");
      list.className = "version-list";

      season.builds.forEach((build) => {
        list.appendChild(createBuildCard(build));
      });

      modalBody.appendChild(list);
    }
  }

  function openDownloadChoices(build, reachableLinks) {
    modalTitle.textContent = normalizeBuildLabel(build);
    modalSubtitle.textContent = "Choose a download source";
    modalBody.innerHTML = "";

    const screen = document.createElement("div");
    screen.className = "download-choice-screen";

    const topbar = document.createElement("div");
    topbar.className = "download-choice-topbar";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "download-back-btn";
    backButton.textContent = "Back";
    backButton.addEventListener("click", () => {
      if (activeSeason) {
        renderSeasonBuildList(activeSeason);
        requestAnimationFrame(updateModalScrollButtons);
      }
    });

    const heading = document.createElement("div");
    heading.className = "download-choice-heading";

    const headingTitle = document.createElement("h3");
    headingTitle.textContent = normalizeBuildLabel(build);

    const headingMeta = document.createElement("p");
    headingMeta.textContent = `${reachableLinks.length} source${reachableLinks.length === 1 ? "" : "s"} available`;

    heading.appendChild(headingTitle);
    heading.appendChild(headingMeta);
    topbar.appendChild(backButton);
    topbar.appendChild(heading);

    const list = document.createElement("div");
    list.className = "download-source-list";

    reachableLinks.forEach((entry, index) => {
      const row = document.createElement("article");
      row.className = "download-source-card";

      const copy = document.createElement("div");
      copy.className = "download-source-copy";

      const title = document.createElement("h4");
      title.className = "download-source-title";
      title.textContent = formatDownloadSourceLabel(entry.download, index);

      const meta = document.createElement("p");
      meta.className = "download-source-meta";
      meta.textContent = getDownloadHostLabel(entry.download.url);

      copy.appendChild(title);
      copy.appendChild(meta);
      row.appendChild(copy);
      row.appendChild(createDownloadLink(entry.download.url, `${title.textContent} for ${normalizeBuildLabel(build)}`));
      list.appendChild(row);
    });

    screen.appendChild(topbar);
    screen.appendChild(list);
    modalBody.appendChild(screen);
    requestAnimationFrame(updateModalScrollButtons);
  }

  function closeSeasonModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function createBuildCard(build) {
    const card = document.createElement("article");
    card.className = "version-card";

    const head = document.createElement("div");
    head.className = "version-head";

    const infoWrap = document.createElement("div");
    infoWrap.className = "version-info";
    const title = document.createElement("h3");
    title.className = "version-title";
    title.textContent = normalizeBuildLabel(build);

    const meta = document.createElement("p");
    meta.className = "version-meta";
    meta.textContent = build.clNumber ? `CL ${build.clNumber}` : "No CL number listed";

    infoWrap.appendChild(title);
    infoWrap.appendChild(meta);

    const statusPill = createStatusPill("Checking", "status-checking");
    head.appendChild(infoWrap);
    head.appendChild(statusPill);

    const actions = document.createElement("div");
    actions.className = "version-actions";
    actions.appendChild(createDisabledChip("Checking links..."));

    card.appendChild(head);
    card.appendChild(actions);

    if (Array.isArray(build.notes) && build.notes.length > 0) {
      build.notes.forEach((noteText) => {
        const note = document.createElement("p");
        note.className = "version-note";
        note.textContent = noteText;
        card.appendChild(note);
      });
    }

    hydrateBuildStatus(build, statusPill, actions);
    return card;
  }

  async function hydrateBuildStatus(build, statusPill, actions) {
    actions.innerHTML = "";

    if (build.status === "lost") {
      statusPill.className = "status-pill status-lost";
      statusPill.textContent = "Lost";
      actions.appendChild(createDisabledChip("No archive available"));
      return;
    }

    if (build.status === "unavailable") {
      statusPill.className = "status-pill status-unavailable";
      statusPill.textContent = "Unavailable";
      actions.appendChild(createDisabledChip("Unavailable"));
      return;
    }

    if (!Array.isArray(build.downloads) || build.downloads.length === 0) {
      statusPill.className = "status-pill status-unavailable";
      statusPill.textContent = "Unavailable";
      actions.appendChild(createDisabledChip("No working links"));
      return;
    }

    const checks = await Promise.all(
      build.downloads.map(async (download) => ({
        download,
        reachable: await checkUrl(download.url),
      }))
    );

    const reachableLinks = checks.filter((entry) => entry.reachable);
    if (!reachableLinks.length) {
      statusPill.className = "status-pill status-unavailable";
      statusPill.textContent = "Unavailable";
      actions.appendChild(createDisabledChip("Host unavailable"));
      return;
    }

    statusPill.className = "status-pill status-available";
    statusPill.textContent = "Available";

    if (reachableLinks.length === 1) {
      actions.appendChild(createDownloadLink(reachableLinks[0].download.url, `Download ${normalizeBuildLabel(build)}`));
      return;
    }

    const pickerButton = createDownloadButton(`Choose a download source for ${normalizeBuildLabel(build)}`);
    pickerButton.addEventListener("click", () => openDownloadChoices(build, reachableLinks));
    actions.appendChild(pickerButton);
  }

  async function checkUrl(url) {
    if (urlStatusCache.has(url)) {
      return urlStatusCache.get(url);
    }

    const checkPromise = probeUrl(url);
    urlStatusCache.set(url, checkPromise);
    return checkPromise;
  }

  async function probeUrl(url) {
    const methods = ["HEAD", "GET"];

    for (const method of methods) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch(url, {
          method,
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal,
        });

        window.clearTimeout(timeout);
        if (response.type === "opaque" || response.ok) {
          return true;
        }
      } catch (error) {
        window.clearTimeout(timeout);
      }
    }

    return false;
  }

  function scrollModal(direction) {
    const amount = Math.max(220, modalBody.clientHeight * 0.72);
    modalBody.scrollBy({
      top: amount * direction,
      behavior: "smooth",
    });
  }

  function updateModalScrollButtons() {
    if (!modalScrollUp || !modalScrollDown) {
      return;
    }

    const maxScroll = Math.max(0, modalBody.scrollHeight - modalBody.clientHeight);
    modalScrollUp.disabled = modalBody.scrollTop <= 4;
    modalScrollDown.disabled = modalBody.scrollTop >= maxScroll - 4;
  }

  function initAudioState() {
    if (!window.OGFNSelectAudioState || !audio) {
      return;
    }

    const sourcePath = "../../assets/music/Select.mp3";

    window.OGFNSelectAudioState.init({
      audio,
      musicToggle,
      musicToggleText,
      sourcePath,
    });
  }

  function attachEvents() {
    if (prevButton) {
      prevButton.addEventListener("click", () => scrollRail(-1));
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => scrollRail(1));
    }

    seasonRail.addEventListener("scroll", updateArrowState, { passive: true });
    window.addEventListener("resize", updateArrowState);

    modalClose.addEventListener("click", closeSeasonModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeSeasonModal();
      }
    });

    if (modalScrollUp) {
      modalScrollUp.addEventListener("click", () => scrollModal(-1));
    }

    if (modalScrollDown) {
      modalScrollDown.addEventListener("click", () => scrollModal(1));
    }

    modalBody.addEventListener("scroll", updateModalScrollButtons, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeSeasonModal();
      }
    });
  }

  async function init() {
    setStaticAssets();
    initAudioState();
    attachEvents();

    try {
      chapterData = await loadBuildData();
      if (!chapterData) {
        modalTitle.textContent = "Chapter Missing";
        modalSubtitle.textContent = "This chapter was not found in Builds.json.";
        modalBody.innerHTML = '<div class="browser-empty">No chapter data could be loaded for this page.</div>';
        return;
      }

      renderSeasonCards(chapterData);
    } catch (error) {
      seasonTrack.innerHTML = "";
      const fallback = document.createElement("div");
      fallback.className = "browser-empty";
      fallback.textContent = "Could not load build data right now.";
      seasonTrack.appendChild(fallback);
    }
  }

  init();
})();
