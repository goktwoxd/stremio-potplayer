/*
 * Stremio -> PotPlayer
 *
 * Watches for clicks on Stremio's "Copy Stream Link" menu item. Once Stremio
 * has written the stream URL to the clipboard, hands off to the
 * "stremio-potplayer:" protocol, which launches PotPlayer with /clipboard.
 */
(() => {
  "use strict";

  const PROTOCOL_URL = "stremio-potplayer:go";
  const COPY_LABEL = "copy stream link";
  const SETTLE_MS = 300;
  const POLL_INTERVAL_MS = 150;
  const POLL_ATTEMPTS = 14;
  const DEDUPE_MS = 4000;

  let handling = false;
  let lastUrl = "";
  let lastLaunchAt = 0;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function normalize(value) {
    return (value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isCopyItem(node) {
    if (!(node instanceof HTMLElement)) return false;
    if (normalize(node.getAttribute("title")) === COPY_LABEL) return true;
    return normalize(node.textContent) === COPY_LABEL;
  }

  function findCopyItem(event) {
    const path =
      typeof event.composedPath === "function" ? event.composedPath() : [];
    for (const node of path) {
      if (isCopyItem(node)) return node;
    }
    return null;
  }

  async function readClipboard() {
    try {
      return (await navigator.clipboard.readText()).trim();
    } catch (error) {
      console.debug("[Stremio->PotPlayer] clipboard read failed:", error);
      return "";
    }
  }

  function isStreamUrl(text) {
    return /^https?:\/\/\S+$/i.test(text);
  }

  function showToast(message, isError = false) {
    const old = document.getElementById("stremio-potplayer-toast");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.id = "stremio-potplayer-toast";
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

    document.documentElement.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 200);
    }, 2400);
  }

  function launchPotPlayer() {
    // A custom-scheme navigation hands off to the OS and leaves the SPA in place.
    window.location.href = PROTOCOL_URL;
  }

  async function handleCopyClick() {
    if (handling) return;
    handling = true;

    try {
      await sleep(SETTLE_MS);

      for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
        const text = await readClipboard();

        if (isStreamUrl(text)) {
          const now = Date.now();
          const isDuplicate =
            text === lastUrl && now - lastLaunchAt < DEDUPE_MS;

          if (!isDuplicate) {
            lastUrl = text;
            lastLaunchAt = now;
            console.debug("[Stremio->PotPlayer] launching:", text);
            showToast("Opening in PotPlayer...");
            launchPotPlayer();
          }
          return;
        }

        await sleep(POLL_INTERVAL_MS);
      }

      showToast("Couldn't read the stream link. Try again.", true);
    } finally {
      handling = false;
    }
  }

  document.addEventListener(
    "click",
    (event) => {
      if (!findCopyItem(event)) return;
      // Let Stremio's own handler run and write the clipboard first.
      setTimeout(handleCopyClick, 0);
    },
    true
  );
})();
