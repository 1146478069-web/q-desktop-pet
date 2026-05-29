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
  position: relative;
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

.pet-button--classic {
  overflow: visible;
}

.pet-button--paper3d {
  overflow: visible;
  perspective: 760px;
  transform-style: preserve-3d;
  --idle-speed: 3.7s;
  --action-speed: 780ms;
  --turn-depth: 18deg;
}

.pet-motion--soft {
  --idle-speed: 5.4s;
  --action-speed: 1040ms;
  --turn-depth: 11deg;
}

.pet-motion--lively {
  --idle-speed: 3.4s;
  --action-speed: 720ms;
  --turn-depth: 24deg;
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

.pet-paper {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: 50% 86%;
}

.pet-button--paper3d .pet-avatar {
  position: relative;
  z-index: 2;
  display: block;
  transform: translateZ(18px);
  filter:
    saturate(1.06)
    contrast(1.03)
    drop-shadow(8px 1px 0 rgba(72, 91, 118, 0.22))
    drop-shadow(13px 2px 0 rgba(72, 91, 118, 0.12));
}

.pet-shadow {
  position: absolute;
  left: 50%;
  bottom: 2%;
  z-index: 0;
  width: 66%;
  height: 18%;
  border-radius: 50%;
  background: rgba(24, 34, 48, 0.26);
  filter: blur(4px);
  transform: translateX(-50%) rotateX(70deg) translateZ(-62px);
  transform-origin: 50% 50%;
  pointer-events: none;
}

.pet-sparkles,
.pet-sleep-marks {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  opacity: 0;
}

.pet-sparkles i {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffd166;
  box-shadow: 0 0 15px rgba(255, 209, 102, 0.72);
}

.pet-sparkles i:nth-child(1) {
  left: 18%;
  top: 24%;
}

.pet-sparkles i:nth-child(2) {
  right: 16%;
  top: 34%;
  width: 8px;
  height: 8px;
  background: #80d8ff;
}

.pet-sparkles i:nth-child(3) {
  right: 28%;
  top: 16%;
  width: 6px;
  height: 6px;
  background: #ff9ec4;
}

.pet-sleep-marks i {
  position: absolute;
  right: 20%;
  top: 12%;
  color: rgba(55, 67, 86, 0.82);
  font: 800 22px/1 system-ui, sans-serif;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.8);
}

.pet-sleep-marks i:nth-child(2) {
  right: 10%;
  top: 4%;
  font-size: 30px;
}

.pet-action--idle .pet-paper {
  animation: pet-paper-idle var(--idle-speed) ease-in-out infinite;
}

.pet-action--poke .pet-paper {
  animation: pet-paper-poke var(--action-speed) cubic-bezier(0.22, 1.35, 0.36, 1);
}

.pet-action--reward .pet-paper {
  animation: pet-paper-reward var(--action-speed) ease-in-out;
}

.pet-action--reward .pet-sparkles,
.pet-action--poke .pet-sparkles {
  animation: pet-sparkle-pop var(--action-speed) ease-out;
}

.pet-action--annoyed .pet-paper {
  animation: pet-paper-annoyed var(--action-speed) ease-in-out;
}

.pet-action--angry .pet-paper {
  animation: pet-paper-angry var(--action-speed) ease-in-out;
}

.pet-action--sleepy .pet-paper {
  animation: pet-paper-sleepy 3.2s ease-in-out infinite;
}

.pet-action--sleepy .pet-sleep-marks {
  animation: pet-sleep-marks 3.2s ease-in-out infinite;
}

.pet-action--carried .pet-paper {
  animation: pet-paper-carried 900ms ease-in-out infinite;
}

.pet-action--carried .pet-shadow {
  opacity: 0.56;
  transform: translateX(-50%) scale(0.74) rotateX(70deg) translateZ(-62px);
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

.segmented-control {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 4px;
  border: 1px solid #d9e0e8;
  border-radius: 8px;
  background: #edf2f7;
}

.segment-option {
  min-height: 34px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #536275;
  font: 700 13px/1 system-ui, sans-serif;
  cursor: pointer;
}

.segment-option--active {
  background: #fff;
  color: #1f6feb;
  box-shadow: 0 1px 4px rgba(24, 36, 50, 0.12);
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

@keyframes pet-paper-idle {
  0%, 100% { transform: translateY(0) rotateY(calc(var(--turn-depth) * -0.55)) rotateZ(-1deg); }
  50% { transform: translateY(-7px) rotateY(var(--turn-depth)) rotateZ(1deg); }
}

@keyframes pet-paper-poke {
  0% { transform: translateY(0) rotateY(0deg) scale(1); }
  34% { transform: translateY(-18px) rotateY(calc(var(--turn-depth) * -1)) scale(1.05, 0.95); }
  64% { transform: translateY(3px) rotateY(calc(var(--turn-depth) * 0.6)) scale(0.96, 1.05); }
  100% { transform: translateY(0) rotateY(0deg) scale(1); }
}

@keyframes pet-paper-reward {
  0% { transform: rotateX(0deg) rotateY(0deg) translateY(0) scale(1); }
  38% { transform: rotateX(10deg) rotateY(calc(var(--turn-depth) * 0.35)) translateY(-12px) scale(1.06, 0.97); }
  68% { transform: rotateX(-5deg) rotateY(calc(var(--turn-depth) * -0.25)) translateY(2px) scale(0.98, 1.04); }
  100% { transform: rotateX(0deg) rotateY(0deg) translateY(0) scale(1); }
}

@keyframes pet-paper-annoyed {
  0%, 100% { transform: translateX(0) rotateY(0deg) rotateZ(0deg); }
  18% { transform: translateX(-7px) rotateY(-26deg) rotateZ(-4deg); }
  36% { transform: translateX(7px) rotateY(16deg) rotateZ(3deg); }
  54% { transform: translateX(-5px) rotateY(-32deg) rotateZ(-3deg); }
  72% { transform: translateX(4px) rotateY(12deg) rotateZ(2deg); }
}

@keyframes pet-paper-angry {
  0%, 100% { transform: translateX(0) rotateY(0deg) rotateZ(0deg) scale(1); }
  14% { transform: translateX(-11px) rotateY(-44deg) rotateZ(-6deg) scale(1.03); }
  28% { transform: translateX(10px) rotateY(28deg) rotateZ(5deg) scale(0.99); }
  42% { transform: translateX(-8px) rotateY(-50deg) rotateZ(-5deg) scale(1.03); }
  56% { transform: translateX(6px) rotateY(20deg) rotateZ(4deg) scale(1); }
}

@keyframes pet-paper-sleepy {
  0%, 100% { transform: translateY(7px) rotateX(11deg) rotateY(-7deg) scale(0.98, 1.02); }
  50% { transform: translateY(12px) rotateX(16deg) rotateY(7deg) scale(0.96, 1.04); }
}

@keyframes pet-paper-carried {
  0%, 100% { transform: translateY(-20px) rotateZ(-5deg) rotateY(-14deg); }
  50% { transform: translateY(-27px) rotateZ(5deg) rotateY(14deg); }
}

@keyframes pet-sparkle-pop {
  0% { opacity: 0; transform: scale(0.7); }
  32% { opacity: 1; transform: scale(1.15); }
  100% { opacity: 0; transform: translateY(-18px) scale(0.75); }
}

@keyframes pet-sleep-marks {
  0%, 100% { opacity: 0.34; transform: translateY(4px) scale(0.94); }
  50% { opacity: 1; transform: translateY(-5px) scale(1.04); }
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
    audioEffects: {},
    visualMode: "paper3d",
    motionIntensity: "lively",
  };
  const DEFAULT_PET = "data:image/svg+xml,%3Csvg width='256' height='256' viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='128' cy='134' rx='86' ry='78' fill='%23fff6fb'/%3E%3Ccircle cx='91' cy='112' r='18' fill='%233a2c43'/%3E%3Ccircle cx='165' cy='112' r='18' fill='%233a2c43'/%3E%3Cpath d='M104 151 Q128 170 152 151' fill='none' stroke='%233a2c43' stroke-width='10' stroke-linecap='round'/%3E%3Ccircle cx='73' cy='142' r='13' fill='%23ffb7ce'/%3E%3Ccircle cx='183' cy='142' r='13' fill='%23ffb7ce'/%3E%3C/svg%3E";
  const POKE_LINES = ["\\u55ef\\uff1f", "\\u6478\\u6478\\u5934\\uff1f", "\\u6211\\u5728\\u8fd9\\u91cc\\u5462"];
  const ANNOYED_LINES = ["\\u522b\\u4e00\\u76f4\\u6233\\u5566", "\\u54fc\\uff0c\\u6709\\u70b9\\u70e6\\u4e86", "\\u7ed9\\u6211\\u4e00\\u70b9\\u7a7a\\u95f4\\u561b"];
  const ANGRY_LINES = ["\\u54fc\\uff01", "\\u4e0d\\u8981\\u518d\\u6233\\u5566\\uff01", "\\u6211\\u8981\\u8eb2\\u8d77\\u6765\\u4e86"];
  const REWARD_LINES = ["\\u597d\\u8212\\u670d\\u5440", "\\u8c22\\u8c22\\u4f60\\u6478\\u6478", "\\u5f00\\u5fc3\\uff01"];
  const POKE_WINDOW_MS = 5000;
  const LONG_PRESS_MS = 700;
  const ACTION_DURATION_MS = {
    poke: 780,
    reward: 1100,
    annoyed: 1200,
    angry: 1450,
    carried: 0,
  };
  const SLEEPY_AFTER_MS = 18000;
  const root = document.getElementById("root");
  const view = new URLSearchParams(location.search).get("view") === "settings" ? "settings" : "pet";
  let state = { settings: DEFAULT_SETTINGS, avatars: [] };
  let actionName = "idle";
  let actionToken = 0;
  let actionTimer = null;
  let sleepyTimer = null;
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

  function isPaper3d() {
    return state.settings.visualMode !== "classic";
  }

  function setPetAction(nextAction, duration) {
    actionName = nextAction;
    actionToken += 1;
    const token = actionToken;
    if (actionTimer) {
      clearTimeout(actionTimer);
      actionTimer = null;
    }
    render();
    if (nextAction === "idle" && view === "pet") resetSleepyTimer();
    if (duration > 0) {
      actionTimer = setTimeout(function () {
        if (token === actionToken) setPetAction("idle", 0);
      }, duration);
    }
  }

  function resetSleepyTimer() {
    if (sleepyTimer) clearTimeout(sleepyTimer);
    if (view !== "pet") return;
    sleepyTimer = setTimeout(function () {
      if (!moving && actionName === "idle") setPetAction("sleepy", 0);
    }, SLEEPY_AFTER_MS);
  }

  function wakePet() {
    if (actionName === "sleepy") setPetAction("idle", 0);
    resetSleepyTimer();
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
    if (!pet || !state.settings.animationsEnabled || isPaper3d()) return;
    pet.classList.remove("pet-button--bounce");
    requestAnimationFrame(function () { pet.classList.add("pet-button--bounce"); });
    setTimeout(function () { pet.classList.remove("pet-button--bounce"); }, 620);
  }

  function handlePoke(pet) {
    wakePet();
    const now = Date.now();
    if (now - lastPokeAt > POKE_WINDOW_MS) pokeCount = 0;
    lastPokeAt = now;
    pokeCount += 1;
    bouncePet(pet);

    if (pokeCount <= 2) {
      setPetAction("poke", ACTION_DURATION_MS.poke);
      showBubble(pick(POKE_LINES));
      playEffect("poke");
    } else if (pokeCount <= 5) {
      setPetAction("annoyed", ACTION_DURATION_MS.annoyed);
      showBubble(pick(ANNOYED_LINES));
      playEffect("annoyed");
    } else {
      setPetAction("angry", ACTION_DURATION_MS.angry);
      showBubble(pick(ANGRY_LINES));
      playEffect("annoyed");
    }
  }

  function handleReward(pet) {
    wakePet();
    pokeCount = 0;
    lastPokeAt = 0;
    bouncePet(pet);
    setPetAction("reward", ACTION_DURATION_MS.reward);
    showBubble(pick(REWARD_LINES));
    playEffect("reward");
  }

  function setState(next) {
    state = next;
    render();
    resetSleepyTimer();
  }

  async function init() {
    state = await window.desktopPet.getState();
    window.desktopPet.onStateChanged(setState);
    render();
    resetSleepyTimer();
  }

  function renderPet() {
    document.body.className = "pet-body";
    const settings = state.settings;
    const avatar = activeAvatar();
    const paper3d = isPaper3d();
    const visualMode = paper3d ? "paper3d" : "classic";
    const intensity = settings.motionIntensity === "soft" ? "soft" : "lively";
    const actionClass = settings.animationsEnabled ? " pet-action--" + actionName : "";
    const classicIdleClass = !paper3d && settings.animationsEnabled ? " pet-button--idle" : "";
    const src = avatarSrc(avatar);
    const petMarkup = paper3d
      ? [
        '    <span class="pet-shadow"></span>',
        '    <span class="pet-sparkles"><i></i><i></i><i></i></span>',
        '    <span class="pet-sleep-marks"><i>z</i><i>Z</i></span>',
        '    <span class="pet-paper">',
        '      <img class="pet-avatar" src="' + src + '" alt="" draggable="false" />',
        '    </span>',
      ].join("")
      : '    <img class="pet-avatar" src="' + src + '" alt="" draggable="false" />';
    root.innerHTML = [
      '<main class="pet-window" style="--pet-size:' + settings.petSize + 'px">',
      '  <div id="bubble"></div>',
      '  <button id="pet" class="pet-button pet-button--' + visualMode + ' pet-motion--' + intensity + classicIdleClass + actionClass + '" style="width:' + settings.petSize + 'px;height:' + settings.petSize + 'px" aria-label="Q desktop pet">',
      petMarkup,
      '  </button>',
      '</main>',
    ].join("");
    const pet = document.getElementById("pet");
    root.oncontextmenu = function (event) {
      event.preventDefault();
      if (Date.now() > suppressContextUntil) window.desktopPet.showContextMenu();
    };

    function beginMove(event) {
      wakePet();
      moving = true;
      suppressContextUntil = Date.now() + 700;
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      setPetAction("carried", ACTION_DURATION_MS.carried);
      window.desktopPet.beginMove({ screenX: event.screenX, screenY: event.screenY });
    }

    function finishMove() {
      moving = false;
      suppressContextUntil = Date.now() + 700;
      window.desktopPet.endMove();
      setPetAction("idle", 0);
      resetSleepyTimer();
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
        finishMove();
        return;
      }
      window.desktopPet.movePet({ screenX: event.screenX, screenY: event.screenY });
    };

    window.onmouseup = function (event) {
      if (moving) {
        finishMove();
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
      '<label class="toggle-row"><span>2.5D paper effect</span><input id="visualMode" type="checkbox" ' + (settings.visualMode !== "classic" ? "checked" : "") + '></label>',
      '<div class="toggle-row"><span>Motion intensity</span><div class="segmented-control" role="group" aria-label="Motion intensity"><button class="segment-option ' + (settings.motionIntensity === "soft" ? "segment-option--active" : "") + '" data-intensity="soft" type="button">Soft</button><button class="segment-option ' + (settings.motionIntensity !== "soft" ? "segment-option--active" : "") + '" data-intensity="lively" type="button">Lively</button></div></div>',
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
    document.getElementById("visualMode").onchange = function (event) {
      window.desktopPet.updateSettings({ visualMode: event.target.checked ? "paper3d" : "classic" });
    };
    root.querySelectorAll(".segment-option").forEach(function (button) {
      button.onclick = function () {
        window.desktopPet.updateSettings({ motionIntensity: button.dataset.intensity });
      };
    });
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
