"use strict";

const assert = require("assert");
const path = require("path");

require(path.join(__dirname, "..", "extension", "labels.js"));

const labels = new Set(globalThis.__STREMIO_POTPLAYER_COPY_LABELS__ || []);

const required = [
  "copy stream link",
  // Current Stremio translations.
  "copier le lien du flux",
  "copia link dello stream",
  "copiar link da stream",
  "kopier streamlink",
  "sao chép liên kết nguồn phát",
  "stream link másolása",
  "akış bağlantısını kopyala",
  "stream-link kopieren",
  // Historical labels kept for older Stremio Web snapshots.
  "copier le lien du stream",
  "copia il link dello stream",
  "copiar link de transmissão",
  "kopier stream link",
  "sao chép liên kết luồng",
  "adatfolyam hivatkozásának másolása"
];

for (const label of required) {
  assert.ok(labels.has(label), `missing label: ${label}`);
}

console.log(`labels.js tests passed (${labels.size} labels)`);
