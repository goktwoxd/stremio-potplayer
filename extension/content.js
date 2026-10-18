/*
 * PotPlayer launcher for Stremio
 *
 * Runs in the page's MAIN world so it can observe Stremio's own
 * navigator.clipboard.writeText(...) call. PotPlayer is launched only when the
 * click armed the extension AND the write promise resolved with an http(s) URL.
 * The clipboard itself is never read.
 */
(() => {
  "use strict";

  const PROTOCOL_URL = "stremio-potplayer:go";
  const ARM_WINDOW_MS = 1500;
  const FALLBACK_LABEL = "copy stream link";

  const sourceLabels = Array.isArray(
    globalThis.__STREMIO_POTPLAYER_COPY_LABELS__
  )
    ? globalThis.__STREMIO_POTPLAYER_COPY_LABELS__
    : [FALLBACK_LABEL];
  const labels = new Set(sourceLabels.map(normalize).filter(Boolean));
  if (labels.size === 0) labels.add(FALLBACK_LABEL);

  let armedAt = 0;
  let armTimer = 0;

  function normalize(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function inPlayer() {
    return location.hash.startsWith("#/player");
  }

  function isCopyItem(node) {
    if (!(node instanceof HTMLElement)) return false;

    const title = normalize(node.getAttribute("title"));
    if (title && labels.has(title)) return true;

    const ariaLabel = normalize(node.getAttribute("aria-label"));
    if (ariaLabel && labels.has(ariaLabel)) return true;

    return labels.has(normalize(node.textContent));
  }

  function arm() {
    armedAt = performance.now();
    clearTimeout(armTimer);
    armTimer = setTimeout(() => {
      armedAt = 0;
    }, ARM_WINDOW_MS);
  }

  function isArmed() {
    return armedAt > 0 && performance.now() - armedAt <= ARM_WINDOW_MS;
  }

  function clearArm() {
    armedAt = 0;
    clearTimeout(armTimer);
  }

  function isStreamUrl(text) {
    return /^https?:\/\/\S+$/i.test(text);
  }

  function showToast(message, isError = false) {
    if (!document.body) return;

    const old = document.getElementById("potplayer-launcher-toast");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.id = "potplayer-launcher-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("aria-atomic", "true");
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed",
      right: "22px",
      bottom: "22px",
      zIndex: "2147483647",
      padding: "10px 14px",
      borderRadius: "8px",
      background: isError
        ? "rgba(96, 24, 28, 0.96)"
        : "rgba(28, 22, 48, 0.96)",
      color: "#ffffff",
      font: "13px/1.4 system-ui, -apple-system, Segoe UI, sans-serif",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.45)",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      opacity: "0",
      transition: "opacity 150ms ease",
      pointerEvents: "none"
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 200);
    }, 2400);
  }

  function launch() {
    clearArm();
    showToast("Opening in PotPlayer...");
    console.info("[PotPlayer launcher] launching");
    location.href = PROTOCOL_URL;
  }

  function hookClipboard() {
    const clipboardPrototype =
      globalThis.Clipboard && globalThis.Clipboard.prototype;
    if (
      !clipboardPrototype ||
      typeof clipboardPrototype.writeText !== "function"
    ) {
      if (document.readyState === "loading") {
        window.addEventListener("DOMContentLoaded", hookClipboard, {
          once: true
        });
      } else {
        console.info("[PotPlayer launcher] Clipboard.writeText is unavailable");
      }
      return;
    }
    if (clipboardPrototype.writeText.__potplayerLauncherWrapped) return;

    const original = clipboardPrototype.writeText;
    const wrapped = function (text) {
      const result = original.apply(this, arguments);

      if (inPlayer()) {
        clearArm();
        return result;
      }

      if (isArmed() && isStreamUrl(String(text))) {
        // One click can only produce one launch; the next click re-arms.
        clearArm();

        if (result && typeof result.then === "function") {
          result.then(
            () => launch(),
            () => {
              showToast("Couldn't copy the stream link. Try again.", true);
              console.info("[PotPlayer launcher] clipboard write failed");
            }
          );
        }
      }

      return result;
    };

    wrapped.__potplayerLauncherWrapped = true;
    try {
      clipboardPrototype.writeText = wrapped;
    } catch (error) {
      console.info("[PotPlayer launcher] could not hook Clipboard.writeText");
    }
  }

  document.addEventListener(
    "click",
    (event) => {
      if (inPlayer()) return;

      const path =
        typeof event.composedPath === "function" ? event.composedPath() : [];
      for (const node of path) {
        if (isCopyItem(node)) {
          arm();
          return;
        }
      }
    },
    true
  );

  hookClipboard();
})();
