(function () {
  const dataUrl = "../data/tutorials.json";
  const homeHref = "./home.html";
  const tutorialsHref = "./tutorials.html";

  const sidebar = document.querySelector("#sidebar");
  const mainContent = document.querySelector("#main-content");

  function getTutorialSlug() {
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get("tutorial");
    if (querySlug) {
      return querySlug;
    }

    return "";
  }

  function getTutorialHref(slug) {
    return `./tutorials.html?tutorial=${encodeURIComponent(slug)}`;
  }

  function setPageTitle(title) {
    document.title = `Itypto | ${title}`;
  }

  function createAnchor(className, href, text) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = text;
    return link;
  }

  function renderSidebarHome(data) {
    sidebar.innerHTML = "";
    sidebar.appendChild(createAnchor("sidebar-home", homeHref, "< Home"));

    const divider = document.createElement("div");
    divider.className = "sidebar-divider";
    sidebar.appendChild(divider);

    const nav = document.createElement("nav");
    data.tutorials.forEach((tutorial) => {
      nav.appendChild(createAnchor("nav-link", getTutorialHref(tutorial.slug), tutorial.title));
    });
    sidebar.appendChild(nav);
  }

  function renderSidebarTutorial(tutorial) {
    sidebar.innerHTML = "";
    sidebar.appendChild(createAnchor("sidebar-home", homeHref, "< Home"));

    const divider = document.createElement("div");
    divider.className = "sidebar-divider";
    sidebar.appendChild(divider);

    const nav = document.createElement("nav");
    nav.appendChild(createAnchor("sidebar-back-link", tutorialsHref, "All Tutorials"));
    nav.appendChild(createAnchor("nav-link", "#info", tutorial.requirementsTitle || "Requirements"));

    tutorial.sections.forEach((section) => {
      nav.appendChild(createAnchor("nav-link", `#${section.id}`, section.navLabel));
    });

    if (tutorial.helpLink?.url && tutorial.helpLink?.label) {
      nav.appendChild(createAnchor("help-link", tutorial.helpLink.url, tutorial.helpLink.label));
    }

    sidebar.appendChild(nav);
  }

  function createTutorialCard(tutorial) {
    const card = document.createElement("a");
    card.className = "tutorial-card";
    card.href = getTutorialHref(tutorial.slug);

    const imageWrap = document.createElement("div");
    imageWrap.className = "tutorial-card-image-wrap";

    if (tutorial.thumbnail) {
      const image = document.createElement("img");
      image.className = "tutorial-card-image";
      image.src = tutorial.thumbnail;
      image.alt = tutorial.title;
      imageWrap.appendChild(image);
    }

    const title = document.createElement("h2");
    title.className = "tutorial-card-title";
    title.textContent = tutorial.title;

    const meta = document.createElement("p");
    meta.className = "tutorial-card-meta";
    meta.textContent = [tutorial.platform, tutorial.type].filter(Boolean).join(" | ");

    const summary = document.createElement("p");
    summary.className = "tutorial-card-summary";
    summary.textContent = tutorial.summary || "Open tutorial";

    card.appendChild(imageWrap);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(summary);

    return card;
  }

  function renderHome(data) {
    setPageTitle(data.pageTitle || "Tutorials");

    mainContent.innerHTML = "";

    const intro = document.createElement("section");
    intro.className = "home-intro";

    const title = document.createElement("h1");
    title.className = "home-title";
    title.textContent = data.homeTitle || "Tutorials";

    const copy = document.createElement("p");
    copy.className = "home-copy";
    copy.textContent =
      data.homeDescription ||
      "Choose a tutorial below. Add more tutorials in the JSON file and they will show up here automatically.";

    intro.appendChild(title);
    intro.appendChild(copy);
    mainContent.appendChild(intro);

    const grid = document.createElement("section");
    grid.className = "tutorial-card-grid";

    data.tutorials.forEach((tutorial) => {
      grid.appendChild(createTutorialCard(tutorial));
    });

    mainContent.appendChild(grid);
  }

  function renderRequirementItem(item) {
    const listItem = document.createElement("li");
    listItem.appendChild(document.createTextNode(item.text || ""));

    if (item.linkUrl && item.linkText) {
      listItem.appendChild(document.createTextNode(" "));
      const link = document.createElement("a");
      link.className = "external-link";
      link.href = item.linkUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = item.linkText;
      listItem.appendChild(link);
    }

    return listItem;
  }

  function renderStep(step) {
    const container = document.createElement("div");
    container.className = "step-listing";

    const title = document.createElement("h2");
    title.textContent = step.title;

    const copy = document.createElement("p");
    copy.className = "step-copy";
    copy.textContent = step.text || "";

    container.appendChild(title);
    container.appendChild(copy);

    if (step.image) {
      const image = document.createElement("img");
      image.src = step.image;
      image.alt = step.title;
      if (step.landscape) {
        image.classList.add("landscape");
      }

      const imageLink = document.createElement("a");
      imageLink.href = step.imageLink || step.image;
      imageLink.target = "_blank";
      imageLink.rel = "noreferrer";
      imageLink.appendChild(image);
      container.appendChild(imageLink);
    }

    return container;
  }

  function renderTutorial(tutorial) {
    setPageTitle(tutorial.title);

    mainContent.innerHTML = "";

    const header = document.createElement("section");
    header.className = "home-intro";

    const title = document.createElement("h1");
    title.className = "tutorial-title";
    title.textContent = tutorial.title;

    const subtitle = document.createElement("p");
    subtitle.className = "tutorial-subtitle";
    subtitle.textContent = tutorial.summary || "";

    header.appendChild(title);
    header.appendChild(subtitle);
    mainContent.appendChild(header);

    const requirements = document.createElement("section");
    requirements.className = "step";
    requirements.id = "info";

    const requirementsTitle = document.createElement("h1");
    requirementsTitle.textContent = tutorial.requirementsTitle || "Requirements";

    const list = document.createElement("ul");
    list.className = "requirements-list";
    (tutorial.requirements || []).forEach((item) => {
      list.appendChild(renderRequirementItem(item));
    });

    requirements.appendChild(requirementsTitle);
    requirements.appendChild(list);
    mainContent.appendChild(requirements);

    (tutorial.sections || []).forEach((section) => {
      const block = document.createElement("section");
      block.className = "step";
      block.id = section.id;

      if (section.title) {
        const sectionTitle = document.createElement("h1");
        sectionTitle.textContent = section.title;
        block.appendChild(sectionTitle);
      }

      section.steps.forEach((step) => {
        block.appendChild(renderStep(step));
      });

      mainContent.appendChild(block);
    });

    attachScrollSpy();
  }

  function renderMissing(slug) {
    setPageTitle("Tutorials");

    sidebar.innerHTML = "";
    sidebar.appendChild(createAnchor("sidebar-home", homeHref, "< Home"));

    mainContent.innerHTML = "";

    const empty = document.createElement("section");
    empty.className = "empty-state";

    const title = document.createElement("h1");
    title.textContent = "Tutorial Not Found";

    const copy = document.createElement("p");
    copy.className = "empty-copy";
    copy.textContent = `No tutorial with the slug "${slug}" was found in tutorials.json.`;

    const link = createAnchor("sidebar-back-link", tutorialsHref, "Back to Tutorials");

    empty.appendChild(title);
    empty.appendChild(copy);
    empty.appendChild(link);
    mainContent.appendChild(empty);
  }

  function attachScrollSpy() {
    const links = Array.from(document.querySelectorAll(".nav-link"));
    const sections = Array.from(document.querySelectorAll("#main-content .step"));
    if (!links.length || !sections.length) {
      return;
    }

    const sync = () => {
      let currentId = sections[0].id;

      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 120) {
          currentId = section.id;
        }
      });

      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
      });
    };

    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  async function init() {
    try {
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load tutorials.json (${response.status})`);
      }

      const data = await response.json();
      const slug = getTutorialSlug();
      const tutorials = Array.isArray(data.tutorials) ? data.tutorials : [];

      if (!slug) {
        renderSidebarHome(data);
        renderHome(data);
        return;
      }

      const tutorial = tutorials.find((entry) => entry.slug === slug);
      if (!tutorial) {
        renderMissing(slug);
        return;
      }

      renderSidebarTutorial(tutorial);
      renderTutorial(tutorial);
    } catch (error) {
      setPageTitle("Tutorials");
      sidebar.innerHTML = "";
      sidebar.appendChild(createAnchor("sidebar-home", homeHref, "< Home"));

      mainContent.innerHTML = "";
      const empty = document.createElement("section");
      empty.className = "empty-state";

      const title = document.createElement("h1");
      title.textContent = "Tutorials Unavailable";

      const copy = document.createElement("p");
      copy.className = "empty-copy";
      copy.textContent = "The tutorials page could not load its JSON data right now.";

      empty.appendChild(title);
      empty.appendChild(copy);
      mainContent.appendChild(empty);
    }
  }

  init();
})();
