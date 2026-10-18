"use strict";

const assert = require("assert");
const path = require("path");

let now = 1000;
let timerId = 0;
const timers = new Map();

function fakeSetTimeout(fn, ms) {
  const id = ++timerId;
  timers.set(id, { at: now + ms, fn });
  return id;
}
function fakeClearTimeout(id) {
  timers.delete(id);
}
function advance(ms) {
  now += ms;
  for (const [id, timer] of [...timers]) {
    if (timer.at <= now) {
      timers.delete(id);
      timer.fn();
    }
  }
}

class HTMLElement {
  constructor() {
    this.attrs = {};
    this.style = {};
    this.children = [];
    this.parent = null;
    this.textContent = "";
    this.id = "";
    this.childElementCount = 0;
  }
  getAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attrs, name)
      ? this.attrs[name]
      : null;
  }
  setAttribute(name, value) {
    this.attrs[name] = String(value);
  }
  appendChild(child) {
    child.parent = this;
    this.children.push(child);
    this.childElementCount = this.children.length;
    return child;
  }
  remove() {
    if (this.parent) {
      this.parent.children = this.parent.children.filter((c) => c !== this);
      this.parent.childElementCount = this.parent.children.length;
    }
  }
}

const body = new HTMLElement();
const listeners = {};
const document = {
  body,
  readyState: "complete",
  addEventListener(type, fn) {
    listeners[type] = fn;
  },
  createElement() {
    return new HTMLElement();
  },
  getElementById(id) {
    return body.children.find((c) => c.id === id) || null;
  }
};

let launched = null;
const location = { hash: "#/detail/tt1" };
Object.defineProperty(location, "href", {
  get: () => launched,
  set: (value) => {
    launched = value;
  }
});

let failNext = false;
class Clipboard {
  writeText() {
    if (failNext) {
      failNext = false;
      return Promise.reject(new Error("denied"));
    }
    return Promise.resolve();
  }
}

const consoleLogs = [];
global.console = {
  ...console,
  info: (...args) => consoleLogs.push(args.join(" "))
};

global.HTMLElement = HTMLElement;
global.document = document;
global.location = location;
global.Clipboard = Clipboard;
global.performance = { now: () => now };
global.setTimeout = fakeSetTimeout;
global.clearTimeout = fakeClearTimeout;
global.requestAnimationFrame = (fn) => fn();
global.window = global;
global.window.addEventListener = () => {};

require(path.join(__dirname, "..", "extension", "labels.js"));
require(path.join(__dirname, "..", "extension", "content.js"));

const clickListener = listeners.click;
assert.equal(typeof clickListener, "function", "click listener registered");
assert.equal(Clipboard.prototype.writeText.__potplayerLauncherWrapped, true);
assert.equal(
  globalThis.__STREMIO_POTPLAYER_COPY_LABELS__,
  undefined,
  "label global is removed after reading"
);

const clipboard = new Clipboard();
const URL_UNDER_TEST = "https://cdn.example.com/movie.mkv?token=secret";
const flush = () => new Promise((resolve) => setImmediate(resolve));

function click(item, init = {}) {
  clickListener({
    composedPath: () => [item, document],
    shiftKey: false,
    altKey: false,
    ...init
  });
}

function makeItem(text, title) {
  const item = new HTMLElement();
  item.textContent = text;
  if (title) item.setAttribute("title", title);
  return item;
}

async function testLaunchOnLocalizedClick() {
  launched = null;
  const item = makeItem("Copy stream link", "Akış bağlantısını kopyala");
  click(item);
  await clipboard.writeText(URL_UNDER_TEST);
  await flush();
  assert.equal(launched, "stremio-potplayer:go", "Turkish label launches");
  assert.ok(
    document.getElementById("potplayer-launcher-toast").textContent.includes("Opening"),
    "success toast shown"
  );
  assert.ok(
    consoleLogs.some((line) => line.includes("launching")),
    "console.info log written"
  );
  assert.ok(
    !consoleLogs.some((line) => line.includes("token=secret")),
    "URL is not logged"
  );
}

async function testLegacyFrenchLabel() {
  launched = null;
  const item = makeItem("Copier le lien du stream");
  click(item);
  await clipboard.writeText(URL_UNDER_TEST);
  await flush();
  assert.equal(
    launched,
    "stremio-potplayer:go",
    "legacy French label prevents the 1.0.1 regression"
  );
}

async function testNoClickNoLaunch() {
  launched = null;
  await clipboard.writeText(URL_UNDER_TEST);
  await flush();
  assert.equal(launched, null, "write without an armed click does not launch");
}

async function testPlayerExcluded() {
  launched = null;
  location.hash = "#/player/tt1";
  const item = makeItem("Copy stream link");
  click(item);
  await clipboard.writeText(URL_UNDER_TEST);
  await flush();
  assert.equal(launched, null, "in-player menu is ignored");
  location.hash = "#/detail/tt1";
}

async function testOtherMenuIgnored() {
  launched = null;
  const item = makeItem("Play");
  click(item);
  await clipboard.writeText(URL_UNDER_TEST);
  await flush();
  assert.equal(launched, null, "non-copy menu item is ignored");
}

async function testModifierClickSkipsLaunch() {
  launched = null;
  const item = makeItem("Copy stream link");
  click(item, { shiftKey: true });
  await clipboard.writeText(URL_UNDER_TEST);
  await flush();
  assert.equal(launched, null, "Shift-click is copy-only");

  click(item, { altKey: true });
  await clipboard.writeText(URL_UNDER_TEST);
  await flush();
  assert.equal(launched, null, "Alt-click is copy-only");
}

async function testLongTextIgnored() {
  launched = null;
  const item = makeItem("Copy stream link" + "x".repeat(200));
  click(item);
  await clipboard.writeText(URL_UNDER_TEST);
  await flush();
  assert.equal(launched, null, "long container text is not scanned for a label");
}

async function testNonUrlIgnoredAndArmExpires() {
  launched = null;
  const item = makeItem("Copy stream link");
  click(item);
  await clipboard.writeText("not a url");
  await flush();
  assert.equal(launched, null, "non-URL write does not launch");

  advance(1600);
  await clipboard.writeText(URL_UNDER_TEST);
  await flush();
  assert.equal(launched, null, "arm expires after 1.5 seconds");
}

async function testRejectedWriteShowsError() {
  launched = null;
  const item = makeItem("Copy stream link");
  click(item);
  failNext = true;
  await clipboard.writeText(URL_UNDER_TEST).catch(() => {});
  await flush();
  assert.equal(launched, null, "failed clipboard write does not launch");
  assert.ok(
    document.getElementById("potplayer-launcher-toast").textContent.includes("Couldn't copy"),
    "error toast shown"
  );
}

(async () => {
  await testLaunchOnLocalizedClick();
  await testLegacyFrenchLabel();
  await testNoClickNoLaunch();
  await testPlayerExcluded();
  await testOtherMenuIgnored();
  await testModifierClickSkipsLaunch();
  await testLongTextIgnored();
  await testNonUrlIgnoredAndArmExpires();
  await testRejectedWriteShowsError();
  console.log("content.js tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
