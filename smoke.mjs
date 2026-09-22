/* Uji render tanpa peramban untuk memastikan tidak ada error saat komponen dirender. */
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/#/",
  pretendToBeVisual: true,
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
globalThis.navigator = dom.window.navigator;
globalThis.Image = dom.window.Image;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
globalThis.SVGElement = dom.window.SVGElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
try {
  if (!globalThis.crypto?.randomUUID) {
    globalThis.crypto = { ...globalThis.crypto, randomUUID: () => "id-" + Math.random().toString(36).slice(2) };
  }
} catch {
  /* crypto sudah tersedia */
}
globalThis.matchMedia = dom.window.matchMedia ?? (() => ({ matches: false, addListener() {}, removeListener() {} }));

const React = await import("react");
const { renderToPipeableStream } = await import("react-dom/server");
const { default: App } = await import("./src/App.tsx");

const halaman = [
  "/", "/koleksi", "/buku/tambah", "/kategori", "/lokasi",
  "/peminjaman", "/statistik", "/pengaturan", "/login", "/register", "/reset-password",
];

function renderStream(elemen) {
  return new Promise((resolve, reject) => {
    let isi = "";
    const { pipe } = renderToPipeableStream(elemen, {
      onShellError: (err) => reject(err),
      onAllReady: () => {
        const stream = new (await import("stream")).Readable({
          read() {},
        });
        stream.push(isi);
        stream.push(null);
        resolve(isi);
      },
      onError: (err) => reject(err),
    });
    const writable = {
      write: (chunk) => {
        isi += chunk.toString();
        return true;
      },
      end: () => {},
    };
    pipe(writable);
  });
}

let adaGagal = false;
for (const jalur of halaman) {
  dom.window.location.hash = `#${jalur}`;
  try {
    const html = await renderStream(React.createElement(App));
    const petunjuk = /Dashboard|Koleksi Buku|Tambah Buku|Kategori|Lokasi Penyimpanan|Peminjaman|Statistik|Pengaturan|Masuk ke akun/.test(html);
    console.log(`${petunjuk ? "OK " : "?? "} ${jalur.padEnd(15)} (${html.length} karakter)`);
    if (!petunjuk) console.log("   cuplikan:", html.slice(0, 220).replace(/\s+/g, " "));
  } catch (err) {
    adaGagal = true;
    console.error(`GAGAL ${jalur}:`, err?.message ?? err);
    console.error(String(err?.stack ?? "").split("\n").slice(0, 8).join("\n"));
  }
}
console.log(adaGagal ? "ADA HALAMAN YANG GAGAL." : "Semua halaman berhasil dirender.");
if (adaGagal) process.exitCode = 1;
