(function () {
  const menuButton = document.querySelector("#menu-button");
  if (!menuButton) {
    return;
  }

  const discordHref = "https://discord.com/users/1061701828544319538";
  const homeHref = "./home.html";
  const buildsHref = "../../OGFN/Html/Builds.html";
  const tutorialsHref = "../../OGFN/Html/Tutorials.html";
  const projectsHref = "../../OGFN/Html/Project.html";
  const assetsHref = "../../OGFN/Html/Assets.html";
  const aboutHref = "../../OGFN/Html/AbtMe.html";
  const assetBaseHref = "../../OGFN/assets";

  const menu = document.createElement("div");
  menu.className = "site-menu";
  menu.setAttribute("hidden", "");
  menu.innerHTML = `
    <a class="site-menu-link" href="${homeHref}">
      <span class="site-menu-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 4.2 3.2 11v9.1h6.2v-5.8h5.2v5.8h6.2V11L12 4.2Z"></path>
        </svg>
      </span>
      <span>Home</span>
    </a>
    <div class="site-menu-group-label">OGFN</div>
    <a class="site-menu-link" href="${buildsHref}">
      <span class="site-menu-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M4 5.2h16v4.9H4V5.2Zm0 6.8h16v6.8H4V12Zm2.2-4.9v1.2h2.4V7.1H6.2Zm0 6.8V17h2.4v-3.1H6.2Z"></path>
        </svg>
      </span>
      <span>Builds</span>
    </a>
    <a class="site-menu-link" href="${tutorialsHref}">
      <span class="site-menu-icon" aria-hidden="true">
        <img src="${assetBaseHref}/Tutorials.png" alt="" />
      </span>
      <span>Tutorials</span>
    </a>
    <a class="site-menu-link" href="${projectsHref}">
      <span class="site-menu-icon" aria-hidden="true">
        <img src="${assetBaseHref}/Project.png" alt="" />
      </span>
      <span>Projects</span>
    </a>
    <a class="site-menu-link" href="${assetsHref}">
      <span class="site-menu-icon" aria-hidden="true">
        <img src="${assetBaseHref}/Asset.png" alt="" />
      </span>
      <span>Assets</span>
    </a>
    <div class="site-menu-group-label">Personal</div>
    <a class="site-menu-link" href="${discordHref}" target="_blank" rel="noreferrer">
      <span class="site-menu-icon" aria-hidden="true">
        <img src="${assetBaseHref}/Discord.png" alt="" />
      </span>
      <span>Contact me</span>
    </a>
    <a class="site-menu-link" href="${aboutHref}">
      <span class="site-menu-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 2.8a9.2 9.2 0 1 0 9.2 9.2A9.2 9.2 0 0 0 12 2.8Zm0 4.1a2.4 2.4 0 1 1-2.4 2.4A2.4 2.4 0 0 1 12 6.9Zm0 10.6a5.6 5.6 0 0 1-4.4-2.1c.1-1.5 2.9-2.3 4.4-2.3s4.3.8 4.4 2.3A5.6 5.6 0 0 1 12 17.5Z"></path>
        </svg>
      </span>
      <span>About me</span>
    </a>
  `;

  menuButton.insertAdjacentElement("afterend", menu);
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-haspopup", "true");

  function closeMenu() {
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    menu.hidden = false;
    menuButton.setAttribute("aria-expanded", "true");
  }

  menuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  menu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    if (!menu.hidden) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
    }
  });
})();
