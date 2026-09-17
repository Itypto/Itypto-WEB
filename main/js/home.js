(function () {
  const USER_ID = "1061701828544319538";
  const API_URL = `https://api.lanyard.rest/v1/users/${USER_ID}`;

  const elements = {
    avatar: document.querySelector("#discord-avatar"),
    statusDot: document.querySelector("#status-dot"),
    displayName: document.querySelector("#discord-display-name"),
    username: document.querySelector("#discord-username"),
    donutRain: document.querySelector("#donut-rain"),
  };

  function createDonutRain() {
    if (!elements.donutRain) {
      return;
    }

    const donutBase = "../../Assets";
    const donutSources = [
      { src: `${donutBase}/Donut.png`, weight: 0.82 },
      { src: `${donutBase}/HalfDonut.png`, weight: 0.18 },
    ];
    const donutCount = window.innerWidth < 760 ? 34 : 58;

    elements.donutRain.innerHTML = "";

    for (let index = 0; index < donutCount; index += 1) {
      const donut = document.createElement("img");
      const sourceRoll = Math.random();
      const donutSource = sourceRoll < donutSources[0].weight ? donutSources[0].src : donutSources[1].src;
      const size = `${Math.round(54 + Math.random() * 74)}px`;
      const left = `${Math.round(Math.random() * 100)}vw`;
      const duration = `${8 + Math.random() * 8}s`;
      const delay = `${Math.random() * -18}s`;
      const opacity = `${0.12 + Math.random() * 0.18}`;

      donut.className = "falling-donut";
      donut.src = donutSource;
      donut.alt = "";
      donut.decoding = "async";
      donut.loading = "eager";
      donut.style.setProperty("--donut-size", size);
      donut.style.setProperty("--donut-left", left);
      donut.style.setProperty("--donut-duration", duration);
      donut.style.setProperty("--donut-delay", delay);
      donut.style.setProperty("--donut-opacity", opacity);
      elements.donutRain.appendChild(donut);
    }
  }

  function getAvatarUrl(user) {
    if (user.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    }

    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }

  function setStatus(status) {
    const normalizedStatus = status || "offline";
    elements.statusDot.className = `status-dot status-${normalizedStatus}`;
  }

  function render(data) {
    const user = data.discord_user;
    const displayName = user.global_name || user.display_name || user.username || "Itypto";

    elements.avatar.src = getAvatarUrl(user);
    elements.avatar.alt = `${displayName} Discord avatar`;
    elements.displayName.textContent = displayName;
    elements.username.textContent = `@${user.username}`;

    setStatus(data.discord_status);
  }

  async function updatePresence() {
    try {
      const response = await fetch(API_URL, { cache: "no-store" });
      const json = await response.json();

      if (!json.success || !json.data) {
        throw new Error("Lanyard did not return presence data.");
      }

      render(json.data);
    } catch (error) {
      elements.displayName.textContent = "Discord presence unavailable";
      elements.username.textContent = "Lanyard could not be reached right now.";
      setStatus("offline");
      console.error(error);
    }
  }

  updatePresence();
  createDonutRain();
  setInterval(updatePresence, 10000);
})();
