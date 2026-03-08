// ── UI state: status, theme, view mode, animations ──────────────────────────

const outputImg      = document.getElementById("output-img");
const mergeOutputImg = document.getElementById("merge-output-img");
const placeholder    = document.getElementById("output-placeholder");
const indicator      = document.getElementById("processing-indicator");
const statusEl       = document.getElementById("status");
const workspaceEl    = document.getElementById("workspace");
const modeSplitBtn   = document.getElementById("mode-split-btn");
const modeMergeBtn   = document.getElementById("mode-merge-btn");
const themeToggleBtn = document.getElementById("theme-toggle-btn");

let viewMode          = "split";
let generationTimeout = null;

// ── View mode ────────────────────────────────────────────────────────────────

export function getViewMode() {
  return viewMode;
}

export function setViewMode(nextMode) {
  viewMode = nextMode;
  workspaceEl.classList.toggle("merge-mode", viewMode === "merge");
  workspaceEl.classList.toggle("show-sketch", false);
  modeSplitBtn.classList.toggle("active", viewMode === "split");
  modeMergeBtn.classList.toggle("active", viewMode === "merge");
}

export function showSketch() {
  if (viewMode === "merge") {
    workspaceEl.classList.add("show-sketch");
  }
}

export function hideSketch() {
  if (viewMode === "merge") {
    workspaceEl.classList.remove("show-sketch");
  }
}

export function initModeButtons() {
  modeSplitBtn.addEventListener("click", () => setViewMode("split"));
  modeMergeBtn.addEventListener("click", () => setViewMode("merge"));
}

// ── Theme ────────────────────────────────────────────────────────────────────

export function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  localStorage.setItem("klein-theme", theme);
  themeToggleBtn.textContent = theme === "light" ? "Theme: Light" : "Theme: Dark";
}

export function initThemeToggle(onThemeChange) {
  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
    onThemeChange(nextTheme);
  });
}

// ── Status ───────────────────────────────────────────────────────────────────

export function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

// ── Processing indicator ─────────────────────────────────────────────────────

export function markGenerating() {
  indicator.classList.add("active");
  setStatus("generating...");
  clearTimeout(generationTimeout);
  generationTimeout = setTimeout(() => {
    clearGenerating();
    setStatus("listening...");
  }, 15000);
}

export function clearGenerating() {
  indicator.classList.remove("active");
  clearTimeout(generationTimeout);
  generationTimeout = null;
}

// ── Result display ───────────────────────────────────────────────────────────

export function showResult(src) {
  outputImg.src = src;
  mergeOutputImg.src = src;
  outputImg.classList.add("visible");
  mergeOutputImg.classList.add("visible");
  playUpdateAnimation(outputImg);
  playUpdateAnimation(mergeOutputImg);
  placeholder.classList.add("hidden");
  hideSketch();
}

export function resetOutput() {
  outputImg.classList.remove("visible");
  mergeOutputImg.classList.remove("visible");
  outputImg.removeAttribute("src");
  mergeOutputImg.removeAttribute("src");
  placeholder.classList.remove("hidden");
  indicator.classList.remove("active");
  workspaceEl.classList.remove("show-sketch");
}

function playUpdateAnimation(el) {
  el.classList.remove("just-updated");
  void el.offsetWidth;
  el.classList.add("just-updated");
}
