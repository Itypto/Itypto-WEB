(function () {
  const STORAGE_KEY = "ogfn-select-audio-state";

  function getStorage() {
    try {
      return window.sessionStorage;
    } catch (error) {
      return null;
    }
  }

  function readState() {
    const storage = getStorage();
    if (!storage) {
      return null;
    }

    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function writeState(state) {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function resolveTrackKey(sourcePath) {
    try {
      return new URL(sourcePath, window.location.href).pathname;
    } catch (error) {
      return sourcePath || "";
    }
  }

  function normalizeTime(time, duration) {
    if (!Number.isFinite(time) || time < 0) {
      return 0;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return time;
    }

    return time % duration;
  }

  function createSnapshot(audio, enabled, trackKey) {
    return {
      enabled: Boolean(enabled),
      trackKey,
      currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      savedAt: Date.now(),
    };
  }

  function init(options) {
    const audio = options?.audio;
    if (!audio) {
      return null;
    }

    const musicToggle = options?.musicToggle || null;
    const musicToggleText = options?.musicToggleText || null;
    const navigationSelector = options?.navigationSelector || "";
    const sourcePath = typeof options?.sourcePath === "function" ? options.sourcePath() : options?.sourcePath;
    const source = audio.querySelector("source");

    if (source && sourcePath && source.getAttribute("src") !== sourcePath) {
      source.src = sourcePath;
      audio.load();
    }

    const trackKey = resolveTrackKey(sourcePath || source?.getAttribute("src") || audio.currentSrc || "");
    const persistedState = readState();
    let musicEnabled = Boolean(persistedState && persistedState.enabled && persistedState.trackKey === trackKey);
    let resumeApplied = false;
    let lastPersistAt = 0;

    function syncToggle() {
      if (!musicToggle) {
        return;
      }

      musicToggle.dataset.state = musicEnabled ? "on" : "off";
      musicToggle.setAttribute("aria-label", musicEnabled ? "Turn music off" : "Turn music on");
      if (musicToggleText) {
        musicToggleText.textContent = musicEnabled ? "Music On" : "Music Off";
      }
    }

    function persist(force) {
      const now = Date.now();
      if (!force && now - lastPersistAt < 300) {
        return;
      }

      lastPersistAt = now;
      writeState(createSnapshot(audio, musicEnabled, trackKey));
    }

    function applyResumeTime() {
      if (resumeApplied) {
        return;
      }

      resumeApplied = true;

      if (!persistedState || persistedState.trackKey !== trackKey) {
        return;
      }

      let targetTime = Number(persistedState.currentTime) || 0;
      if (persistedState.enabled && Number.isFinite(persistedState.savedAt)) {
        targetTime += Math.max(0, (Date.now() - persistedState.savedAt) / 1000);
      }

      const setCurrentTime = () => {
        const normalizedTime = normalizeTime(targetTime, audio.duration);
        if (normalizedTime > 0) {
          try {
            audio.currentTime = normalizedTime;
          } catch (error) {
          }
        }
      };

      if (audio.readyState >= 1) {
        setCurrentTime();
      } else {
        audio.addEventListener("loadedmetadata", setCurrentTime, { once: true });
      }
    }

    async function playAudio() {
      if (!musicEnabled) {
        return false;
      }

      applyResumeTime();
      audio.muted = false;
      audio.volume = 1;

      try {
        await audio.play();
        persist(true);
        return true;
      } catch (error) {
        return false;
      }
    }

    async function toggleMusic() {
      musicEnabled = !musicEnabled;
      syncToggle();

      if (musicEnabled) {
        await playAudio();
      } else {
        persist(true);
        audio.pause();
        audio.muted = true;
        persist(true);
      }
    }

    function activateAudio() {
      if (!musicEnabled || !audio.paused) {
        return;
      }

      void playAudio();
    }

    if (musicToggle) {
      musicToggle.addEventListener("click", toggleMusic);
    }

    if (navigationSelector) {
      document.querySelectorAll(navigationSelector).forEach((link) => {
        link.addEventListener("click", () => persist(true), { capture: true });
      });
    }

    audio.addEventListener("play", () => persist(true));
    audio.addEventListener("pause", () => persist(true));
    audio.addEventListener("timeupdate", () => persist(false));
    window.addEventListener("pagehide", () => persist(true));
    window.addEventListener("beforeunload", () => persist(true));
    document.addEventListener("click", activateAudio, { once: true });

    if (musicEnabled) {
      syncToggle();
      void playAudio();
    } else {
      audio.pause();
      audio.muted = true;
      syncToggle();
      persist(true);
    }

    return {
      persist: () => persist(true),
      isEnabled: () => musicEnabled,
      play: () => playAudio(),
    };
  }

  window.OGFNSelectAudioState = {
    init,
  };
})();
