// ── Canvas drawing and capture ───────────────────────────────────────────────

const canvas = document.getElementById("draw-canvas");
const ctx    = canvas.getContext("2d");

let isDrawing   = false;
let lastX       = 0;
let lastY       = 0;
let hasDrawn    = false;
let strokeColor = null; // null = use theme default

let onStrokeCallback    = null;
let onDrawStartCallback = null;

export function onStroke(cb) {
  onStrokeCallback = cb;
}

export function onDrawStart(cb) {
  onDrawStartCallback = cb;
}

export function getHasDrawn() {
  return hasDrawn;
}

export function setStrokeColor(color) {
  strokeColor = color;
  ctx.strokeStyle = color;
}

export function resetStrokeColor() {
  strokeColor = null;
}

// ── Theme palette ────────────────────────────────────────────────────────────

export function getThemePalette() {
  const light = document.body.classList.contains("light-theme");
  return {
    canvasBg: light ? "#f5f5f5" : "#111111",
    stroke: light ? "#111111" : "#ffffff",
  };
}

// ── Canvas sizing ────────────────────────────────────────────────────────────

function applyCanvasDefaults() {
  const { canvasBg, stroke } = getThemePalette();
  ctx.fillStyle = canvasBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = strokeColor ?? stroke;
  ctx.lineWidth   = 3;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
}

export function resizeCanvas() {
  const pane = document.getElementById("draw-pane");
  const rect = pane.getBoundingClientRect();
  canvas.width  = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);
  applyCanvasDefaults();
}

// ── Clear ────────────────────────────────────────────────────────────────────

export function clearCanvas() {
  ctx.fillStyle = getThemePalette().canvasBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  applyCanvasDefaults();
  hasDrawn = false;
}

// ── Drawing handlers ─────────────────────────────────────────────────────────

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  }
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function startDraw(e) {
  isDrawing = true;
  if (onDrawStartCallback) onDrawStartCallback();
  const { x, y } = getPos(e);
  lastX = x;
  lastY = y;
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function draw(e) {
  if (!isDrawing) return;
  e.preventDefault();
  const { x, y } = getPos(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  lastX = x;
  lastY = y;
  hasDrawn = true;
  if (onStrokeCallback) onStrokeCallback();
}

function endDraw() {
  if (!isDrawing) return;
  isDrawing = false;
  if (onStrokeCallback) onStrokeCallback();
}

export function initCanvasEvents() {
  canvas.addEventListener("mousedown",  startDraw);
  canvas.addEventListener("mousemove",  draw);
  canvas.addEventListener("mouseup",    endDraw);
  canvas.addEventListener("mouseleave", endDraw);
  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove",  draw,      { passive: false });
  canvas.addEventListener("touchend",   endDraw);
  window.addEventListener("resize", resizeCanvas);
}

// ── Canvas capture ───────────────────────────────────────────────────────────

export function captureCanvas() {
  const SIZE = 704;
  const tmp  = document.createElement("canvas");
  tmp.width  = SIZE;
  tmp.height = SIZE;
  const tc   = tmp.getContext("2d");

  tc.fillStyle = getThemePalette().canvasBg;
  tc.fillRect(0, 0, SIZE, SIZE);

  const scale = Math.min(SIZE / canvas.width, SIZE / canvas.height);
  const w  = canvas.width  * scale;
  const h  = canvas.height * scale;
  const dx = (SIZE - w) / 2;
  const dy = (SIZE - h) / 2;
  tc.drawImage(canvas, dx, dy, w, h);

  return tmp.toDataURL("image/jpeg", 0.5);
}
