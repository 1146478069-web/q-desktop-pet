const fs = require("node:fs/promises");
const path = require("node:path");

const outDir = path.join(process.cwd(), "dist", "renderer");

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Q Desktop Pet</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <div id="root"></div>
    <script src="./app.js"></script>
  </body>
</html>
`;

const css = String.raw`
html,
body,
#root {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.pet-body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
  user-select: none;
}

.pet-window {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: transparent;
  -webkit-app-region: drag;
}

.pet-button {
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  filter: drop-shadow(0 14px 16px rgba(0, 0, 0, 0.28));
  transform-origin: 50% 88%;
  -webkit-app-region: no-drag;
}

.pet-button--idle {
  animation: pet-idle-float 4s ease-in-out infinite;
}

.pet-button--bounce {
  animation: pet-bounce 620ms cubic-bezier(0.22, 1.35, 0.36, 1);
}

.pet-avatar {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.pet-bubble {
  position: absolute;
  left: 50%;
  bottom: min(calc(100vh - 58px), calc(24px + var(--pet-size)));
  max-width: min(72vw, 220px);
  padding: 9px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  color: #202124;
  font: 600 15px/1.35 system-ui, sans-serif;
  text-align: center;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  transform: translateX(-50%);
  pointer-events: none;
  -webkit-app-region: no-drag;
}

.settings-window {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24px;
  background: #f4f6f8;
  color: #17202a;
  font: 14px/1.45 system-ui, sans-serif;
}

.settings-panel {
  width: min(100%, 720px);
  margin: 0 auto;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.settings-kicker {
  margin: 0 0 2px;
  color: #607086;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.settings-header h1 {
  margin: 0;
  font-size: 28px;
}

.settings-upload,
.avatar-option {
  border: 1px solid #d9e0e8;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

.settings-upload {
  min-height: 40px;
  padding: 0 14px;
  border-color: #1f6feb;
  background: #1f6feb;
  color: #fff;
  font-weight: 700;
}

.settings-notice,
.settings-preview,
.settings-section {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
}

.settings-notice--success {
  background: #e7f6ed;
  color: #17633a;
}

.settings-notice--error {
  background: #fdecea;
  color: #9f1d1d;
}

.settings-preview,
.avatar-option,
.toggle-row,
.size-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-preview img {
  width: 88px;
  height: 88px;
  object-fit: contain;
}

.settings-section {
  border: 1px solid #d9e0e8;
}

.settings-section h2 {
  margin: 0 0 12px;
  font-size: 16px;
}

.avatar-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 10px;
}

.avatar-option {
  min-width: 0;
  padding: 8px;
  background: #fff;
  color: #17202a;
  text-align: left;
}

.sound-list {
  display: grid;
  gap: 10px;
}

.sound-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid #d9e0e8;
  border-radius: 8px;
  background: #fff;
  color: #17202a;
  font: inherit;
  cursor: pointer;
  text-align: left;
}

.sound-option small {
  color: #607086;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar-option--active {
  border-color: #1f6feb;
  background: #eef5ff;
}

.avatar-option img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.avatar-option span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size-control,
.toggle-row {
  justify-content: space-between;
  min-height: 40px;
}

.size-control input {
  width: min(100%, 360px);
}

@keyframes pet-idle-float {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-6px) rotate(1deg); }
}

@keyframes pet-bounce {
  0% { transform: translateY(0) scale(1); }
  28% { transform: translateY(-18px) scale(1.04, 0.96); }
  54% { transform: translateY(3px) scale(0.97, 1.05); }
  100% { transform: translateY(0) scale(1); }
}
`;

const js = String.raw`
(function () {
  const DEFAULT_SETTINGS = {
    activeAvatarId: null,
    petSize: 180,
    alwaysOnTop: true,
    animationsEnabled: true,
    bubblesEnabled: true,
  };
  const DEFAULT_PET = "data:image/svg+xml,%3Csvg width='256' height='256' viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='128' cy='134' rx='86' ry='78' fill='%23fff6fb'/%3E%3Ccircle cx='91' cy='112' r='18' fill='%233a2c43'/%3E%3Ccircle cx='165' cy='112' r='18' fill='%233a2c43'/%3E%3Cpath d='M104 151 Q128 170 152 151' fill='none' stroke='%233a2c43' stroke-width='10' stroke-linecap='round'/%3E%3Ccircle cx='73' cy='142' r='13' fill='%23ffb7ce'/%3E%3Ccircle cx='183' cy='142' r='13' fill='%23ffb7ce'/%3E%3C/svg%3E";
  const POKE_LINES = ["\\u55ef\\uff1f", "\\u6478\\u6478\\u5934\\uff1f", "\\u6211\\u5728\\u8fd9\\u91cc\\u5462"];
  const ANNOYED_LINES = ["\\u522b\\u4e00\\u76f4\\u6233\\u5566", "\\u54fc\\uff0c\\u6709\\u70b9\\u70e6\\u4e86", "\\u7ed9\\u6211\\u4e00\\u70b9\\u7a7a\\u95f4\\u561b"];
  const ANGRY_LINES = ["\\u54fc\\uff01", "\\u4e0d\\u8981\\u518d\\u6233\\u5566\\uff01", "\\u6211\\u8981\\u8eb2\\u8d77\\u6765\\u4e86"];
  const REWARD_LINES = ["\\u597d\\u8212\\u670d\\u5440", "\\u8c22\\u8c22\\u4f60\\u6478\\u6478", "\\u5f00\\u5fc3\\uff01"];
  const POKE_WINDOW_MS = 5000;
  const LONG_PRESS_MS = 700;
  const root = document.getElementById("root");
  const view = new URLSearchParams(location.search).get("view") === "settings" ? "settings" : "pet";
  let state = { settings: DEFAULT_SETTINGS, avatars: [] };
  let pokeCount = 0;
  let lastPokeAt = 0;
  let pressTimer = null;
  let longPressFired = false;
  let moving = false;
  let suppressContextUntil = 0;
  let currentAudio = null;

  function fileUrl(filePath) {
    return "file://" + filePath.replace(/\\/g, "/");
  }

  function activeAvatar() {
    return state.avatars.find((avatar) => avatar.id === state.settings.activeAvatarId);
  }

  function avatarSrc(avatar) {
    return avatar ? fileUrl(avatar.assetPath) : DEFAULT_PET;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }

  function pick(lines) {
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function showBubble(text) {
    const bubble = document.getElementById("bubble");
    if (!bubble || !state.settings.bubblesEnabled) return;
    bubble.className = "pet-bubble";
    bubble.textContent = text;
    setTimeout(function () {
      bubble.className = "";
      bubble.textContent = "";
    }, 2200);
  }

  function playEffect(kind) {
    const effects = state.settings.audioEffects || {};
    const effect = effects[kind];
    if (!effect) return;
    try {
      if (currentAudio) currentAudio.pause();
      currentAudio = new Audio(fileUrl(effect.assetPath));
      currentAudio.volume = 0.85;
      currentAudio.play().catch(function () {});
    } catch {}
  }

  function bouncePet(pet) {
    if (!pet || !state.settings.animationsEnabled) return;
    pet.classList.remove("pet-button--bounce");
    requestAnimationFrame(function () { pet.classList.add("pet-button--bounce"); });
    setTimeout(function () { pet.classList.remove("pet-button--bounce"); }, 620);
  }

  function handlePoke(pet) {
    const now = Date.now();
    if (now - lastPokeAt > POKE_WINDOW_MS) pokeCount = 0;
    lastPokeAt = now;
    pokeCount += 1;
    bouncePet(pet);

    if (pokeCount <= 2) {
      showBubble(pick(POKE_LINES));
      playEffect("poke");
    } else if (pokeCount <= 5) {
      showBubble(pick(ANNOYED_LINES));
      playEffect("annoyed");
    } else {
      showBubble(pick(ANGRY_LINES));
      playEffect("annoyed");
    }
  }

  function handleReward(pet) {
    pokeCount = 0;
    lastPokeAt = 0;
    bouncePet(pet);
    showBubble(pick(REWARD_LINES));
    playEffect("reward");
  }

  function setState(next) {
    state = next;
    render();
  }

  async function init() {
    state = await window.desktopPet.getState();
    window.desktopPet.onStateChanged(setState);
    render();
  }

  function renderPet() {
    document.body.className = "pet-body";
    const settings = state.settings;
    const avatar = activeAvatar();
    root.innerHTML = [
      '<main class="pet-window" style="--pet-size:' + settings.petSize + 'px">',
      '  <div id="bubble"></div>',
      '  <button id="pet" class="pet-button ' + (settings.animationsEnabled ? "pet-button--idle" : "") + '" style="width:' + settings.petSize + 'px;height:' + settings.petSize + 'px" aria-label="Q desktop pet">',
      '    <img class="pet-avatar" src="' + avatarSrc(avatar) + '" alt="" draggable="false" />',
      '  </button>',
      '</main>',
    ].join("");
    const pet = document.getElementById("pet");
    root.oncontextmenu = function (event) {
      event.preventDefault();
      if (Date.now() > suppressContextUntil) window.desktopPet.showContextMenu();
    };

    function beginMove(event) {
      moving = true;
      suppressContextUntil = Date.now() + 700;
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      window.desktopPet.beginMove({ screenX: event.screenX, screenY: event.screenY });
    }

    pet.onmousedown = function (event) {
      if ((event.buttons & 3) === 3) {
        beginMove(event);
        event.preventDefault();
        return;
      }

      if (event.button === 0) {
        longPressFired = false;
        pressTimer = setTimeout(function () {
          longPressFired = true;
          pressTimer = null;
          handleReward(pet);
        }, LONG_PRESS_MS);
      }
    };

    pet.onmousemove = function (event) {
      if ((event.buttons & 3) === 3 && !moving) beginMove(event);
      if (moving) window.desktopPet.movePet({ screenX: event.screenX, screenY: event.screenY });
    };

    window.onmousemove = function (event) {
      if (!moving) return;
      if ((event.buttons & 3) !== 3) {
        moving = false;
        window.desktopPet.endMove();
        return;
      }
      window.desktopPet.movePet({ screenX: event.screenX, screenY: event.screenY });
    };

    window.onmouseup = function (event) {
      if (moving) {
        moving = false;
        suppressContextUntil = Date.now() + 700;
        window.desktopPet.endMove();
        return;
      }

      if (event.button === 0) {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
          if (!longPressFired) handlePoke(pet);
        }
      }
    };
  }

  function renderSettings() {
    document.body.className = "";
    const settings = state.settings;
    const effects = settings.audioEffects || {};
    const avatar = activeAvatar();
    root.innerHTML = [
      '<main class="settings-window"><section class="settings-panel">',
      '<header class="settings-header"><div><p class="settings-kicker">Q Desktop Pet</p><h1>Settings</h1></div><button class="settings-upload" id="upload">Upload avatar</button></header>',
      '<div id="notice"></div>',
      '<section class="settings-preview"><img src="' + avatarSrc(avatar) + '" alt=""><div><span>Active avatar</span><strong>' + (avatar ? avatar.name : "Default pet") + '</strong></div></section>',
      '<section class="settings-section"><h2>Avatar library</h2><div class="avatar-list">' + (state.avatars.length ? state.avatars.map(function (item) {
        return '<button class="avatar-option ' + (item.id === settings.activeAvatarId ? "avatar-option--active" : "") + '" data-id="' + item.id + '"><img src="' + avatarSrc(item) + '" alt=""><span>' + item.name + '</span></button>';
      }).join("") : '<p>No custom avatars yet.</p>') + '</div></section>',
      '<section class="settings-section"><h2>Reaction sounds</h2><div class="sound-list">',
      soundButton("poke", "Poke sound", effects.poke),
      soundButton("annoyed", "Annoyed sound", effects.annoyed),
      soundButton("reward", "Reward sound", effects.reward),
      '</div></section>',
      '<section class="settings-section"><h2>Behavior</h2>',
      '<label class="size-control"><span>Pet size <strong>' + settings.petSize + 'px</strong></span><input id="petSize" type="range" min="96" max="320" value="' + settings.petSize + '"></label>',
      '<label class="toggle-row"><span>Always on top</span><input id="alwaysOnTop" type="checkbox" ' + (settings.alwaysOnTop ? "checked" : "") + '></label>',
      '<label class="toggle-row"><span>Animations</span><input id="animationsEnabled" type="checkbox" ' + (settings.animationsEnabled ? "checked" : "") + '></label>',
      '<label class="toggle-row"><span>Speech bubbles</span><input id="bubblesEnabled" type="checkbox" ' + (settings.bubblesEnabled ? "checked" : "") + '></label>',
      '</section></section></main>',
    ].join("");

    const notice = document.getElementById("notice");
    document.getElementById("upload").onclick = async function () {
      const result = await window.desktopPet.chooseAvatarFile();
      notice.className = "settings-notice " + (result.ok ? "settings-notice--success" : "settings-notice--error");
      notice.textContent = result.ok ? "Avatar uploaded." : (result.message || "Could not upload avatar.");
    };
    root.querySelectorAll(".sound-option").forEach(function (button) {
      button.onclick = async function () {
        const result = await window.desktopPet.chooseAudioFile(button.dataset.sound);
        notice.className = "settings-notice " + (result.ok ? "settings-notice--success" : "settings-notice--error");
        notice.textContent = result.ok ? "Sound uploaded." : (result.message || "Could not upload sound.");
      };
    });
    root.querySelectorAll(".avatar-option").forEach(function (button) {
      button.onclick = function () { window.desktopPet.setActiveAvatar(button.dataset.id); };
    });
    document.getElementById("petSize").oninput = function (event) {
      window.desktopPet.updateSettings({ petSize: Number(event.target.value) });
    };
    ["alwaysOnTop", "animationsEnabled", "bubblesEnabled"].forEach(function (id) {
      document.getElementById(id).onchange = function (event) {
        const patch = {};
        patch[id] = event.target.checked;
        window.desktopPet.updateSettings(patch);
      };
    });
  }

  function soundButton(kind, label, effect) {
    return '<button class="sound-option" data-sound="' + kind + '"><span>' + label + '</span><small>' + escapeHtml(effect ? effect.name : "Not set") + '</small></button>';
  }

  function render() {
    if (view === "settings") renderSettings();
    else renderPet();
  }

  init().catch(function (error) {
    root.textContent = "Failed to start desktop pet: " + error.message;
  });
})();
`;

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
  await fs.writeFile(path.join(outDir, "style.css"), css, "utf8");
  await fs.writeFile(path.join(outDir, "app.js"), js, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
