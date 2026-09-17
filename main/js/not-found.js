(function () {
  const donutRain = document.querySelector("#donut-rain");
  if (!donutRain) {
    return;
  }

  const donutBase = "../../Assets";
  const donutSources = [
    { src: `${donutBase}/Donut.png`, weight: 0.82 },
    { src: `${donutBase}/HalfDonut.png`, weight: 0.18 },
  ];
  const donutCount = window.innerWidth < 760 ? 34 : 58;

  donutRain.innerHTML = "";

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
    donutRain.appendChild(donut);
  }
})();
