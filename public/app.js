// ── Entry point — wires modules together ─────────────────────────────────────

import {
  initCanvasEvents, resizeCanvas, clearCanvas,
  onStroke, onDrawStart, setStrokeColor, resetStrokeColor, getHasDrawn,
} from "./js/canvas.js";
import {
  initConnection, scheduleSend,
  setActivePreset, setUserPromptGetter,
} from "./js/connection.js";
import {
  setStatus, setViewMode, showSketch,
  applyTheme, initThemeToggle, initModeButtons, resetOutput,
} from "./js/ui.js";

// ── DOM refs ─────────────────────────────────────────────────────────────────

const clearBtn    = document.getElementById("clear-btn");
const barClearBtn = document.getElementById("bar-clear-btn");
const presetBtns  = document.querySelectorAll(".preset");
const colorPicker = document.getElementById("color-picker");
const userPrompt  = document.getElementById("user-prompt");

// ── Clear ────────────────────────────────────────────────────────────────────

function clearScene() {
  clearCanvas();
  resetOutput();
  setStatus("draw something");
}

clearBtn.addEventListener("click", clearScene);
barClearBtn.addEventListener("click", clearScene);

// ── Drawing → send ───────────────────────────────────────────────────────────

onDrawStart(() => showSketch());
onStroke(() => scheduleSend());

// ── Color picker ─────────────────────────────────────────────────────────────

colorPicker.addEventListener("input", (e) => {
  setStrokeColor(e.target.value);
});

// ── Preset switching ─────────────────────────────────────────────────────────

presetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    presetBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    setActivePreset(btn.dataset.preset);
    if (getHasDrawn()) scheduleSend(0);
  });
});

// ── User prompt ──────────────────────────────────────────────────────────────

setUserPromptGetter(() => userPrompt.value.trim());

let promptDebounceTimer = null;
userPrompt.addEventListener("input", () => {
  clearTimeout(promptDebounceTimer);
  promptDebounceTimer = setTimeout(() => {
    if (getHasDrawn()) scheduleSend(0);
  }, 400);
});

// ── Theme ────────────────────────────────────────────────────────────────────

initThemeToggle((nextTheme) => {
  applyTheme(nextTheme);
  resetStrokeColor();
  colorPicker.value = nextTheme === "light" ? "#111111" : "#ffffff";
  clearScene();
});

// ── Init ─────────────────────────────────────────────────────────────────────

initCanvasEvents();
initModeButtons();
resizeCanvas();
setStatus("draw something");
setViewMode("split");
applyTheme(localStorage.getItem("klein-theme") === "light" ? "light" : "dark");
initConnection();
