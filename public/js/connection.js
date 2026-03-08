// ── fal.ai realtime connection ────────────────────────────────────────────────

import { fal } from "https://esm.sh/@fal-ai/client@1?bundle";
import { PRESETS, composePrompt } from "./presets.js";
import { getHasDrawn, captureCanvas } from "./canvas.js";
import { setStatus, markGenerating, clearGenerating, showResult } from "./ui.js";

// Important: fal.realtime.connect adds the realtime path internally.
const FAL_APP = "fal-ai/flux-2/klein";

let connection        = null;
let sendDebounceTimer = null;
let activePreset      = "studio";
let getUserPrompt     = () => "";

export function setActivePreset(preset) {
  activePreset = preset;
}

export function setUserPromptGetter(fn) {
  getUserPrompt = fn;
}

export function initConnection() {
  setStatus("listening...");
  connection = fal.realtime.connect(FAL_APP, {
    connectionKey: "klein-realtime",
    throttleInterval: 64,
    tokenProvider: async (app) => {
      const response = await fetch("/api/fal/realtime-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app }),
      });
      if (!response.ok) {
        throw new Error(`Token request failed (${response.status})`);
      }
      return response.text();
    },
    tokenExpirationSeconds: 110,
    onResult: (result) => {
      clearGenerating();

      if (result?.error || result?.status === "error") {
        console.warn("[fal realtime result]", result);
        setStatus("listening...");
        return;
      }

      const images = result?.images;
      if (!images?.length) {
        setStatus("listening...");
        return;
      }
      const img = images[images.length - 1];
      if (!img?.content) {
        setStatus("listening...");
        return;
      }
      const src = toImageSrc(img);
      if (!src) {
        setStatus("listening...");
        return;
      }
      showResult(src);
      setStatus("ready");
    },
    onError: (error) => {
      console.error("[fal realtime]", error);
      clearGenerating();
      setStatus("connection error");
    },
  });
}

function toImageSrc(img) {
  const mime = img.content_type ?? "image/jpeg";
  const content = img.content;

  if (typeof content === "string") {
    if (content.startsWith("data:image/")) return content;
    return `data:${mime};base64,${content}`;
  }

  if (content instanceof Uint8Array || content instanceof ArrayBuffer) {
    const bytes = content instanceof Uint8Array ? content : new Uint8Array(content);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return `data:${mime};base64,${btoa(binary)}`;
  }

  console.error("[image] Unsupported content type:", typeof content, content);
  return null;
}

// ── Send ─────────────────────────────────────────────────────────────────────

export function scheduleSend(delay = 128) {
  clearTimeout(sendDebounceTimer);
  sendDebounceTimer = setTimeout(sendToFal, delay);
}

function sendToFal() {
  if (!getHasDrawn()) return;

  markGenerating();
  let dataUrl;
  try {
    dataUrl = captureCanvas();
  } catch (err) {
    console.error("[capture]", err);
    clearGenerating();
    return;
  }

  const prompt = composePrompt(
    PRESETS[activePreset] ?? PRESETS.studio,
    getUserPrompt()
  );

  const payload = {
    image_url:                dataUrl,
    prompt,
    image_size:               "square",
    num_inference_steps:      3,
    seed:                     35,
    output_feedback_strength: 1,
  };

  if (!connection) {
    initConnection();
  }

  try {
    connection.send(payload);
  } catch (err) {
    console.error("[send]", err);
    clearGenerating();
    setStatus("send error");
  }
}
