// ── Preset definitions ───────────────────────────────────────────────────────

export const PRESETS = {
  studio:       "premium product render, modern industrial design object, clean lighting, realistic material",
  toy:          "cute collectible designer toy, smooth plastic body, playful proportions",
  ceramic:      "handcrafted ceramic object, matte glaze, subtle imperfections, gallery product shot",
  plush:        "soft plush fabric object, stitched seams, cozy toy aesthetic",
  wood:         "carved wooden object, natural wood grain texture, warm studio lighting, realistic product shot",
  metal:        "brushed metal object, high-end industrial product, clean reflections",
  stone:        "carved stone object, smooth sculpture, soft shadows, museum lighting",
  anime:        "anime-inspired stylized object, clean cel shading, bold shape language, playful cartoon look",
  neon:         "neon glow, dark background, vibrant cyan and magenta lines, cyberpunk",
  glass:        "translucent borosilicate glass, caustics, elegant minimal form",
  ink:          "Japanese ink wash painting, sumi-e, expressive brush strokes, minimal",
};

export function composePrompt(stylePrompt, userDescription) {
  const bgHint = document.body.classList.contains("light-theme")
    ? "Keep a pure white background unchanged."
    : "Keep a pure black background unchanged.";
  const subjectHint = userDescription ? ` The subject is: ${userDescription}.` : "";
  return `${stylePrompt}.${subjectHint} ${bgHint} Transform only the sketched object in the center. No extra scene or environment. Preserve overall silhouette from the sketch.`;
}
