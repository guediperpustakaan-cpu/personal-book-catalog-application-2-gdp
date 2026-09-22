/* Uji render tanpa peramban untuk memastikan tidak ada error saat komponen dirender. */
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/#/",
  pretendToBeVisual: true,
});

function tetapkanGlobal(nama, nilai) {
  try {
    Object.defineProperty(globalThis, nama, {
      value: nilai,
      writable: true,
      configurable: true,
    });
  } catch {
    /* properti sudah ada dan tidak bisa ditimpa; biarkan nilai yang ada */
  }
}

tetapkanGlobal("window", dom.window);
tetapkanGlobal("document", dom.window.document);
tetapkanGlobal("localStorage", dom.window.localStorage);
tetapkanGlobal("navigator", dom.window.navigator);
tetapkanGlobal("Image", dom.window.Image);
tetapkanGlobal("HTMLElement", dom.window.HTMLElement);
tetapkanGlobal("HTMLInputElement", dom.window.HTMLInputElement);
tetapkanGlobal("HTMLTextAreaElement", dom.window.HTMLTextAreaElement);
tetapkanGlobal("SVGElement", dom.window.SVGElement);
tetapkanGlobal("Element", dom.window.Element);
tetapkanGlobal("Node", dom.window.Node);
tetapkanGlobal("getComputedStyle", dom.window.getComputedStyle);
tetapkanGlobal("requestAnimationFrame", (cb) => setTimeout(cb, 0));
tetapkanGlobal("cancelAnimationFrame", (id) => clearTimeout(id));
try {
  if (!globalThis.crypto?.randomUUID) {
    tetapkanGlobal("crypto", {
      ...globalThis.crypto,
      randomUUID: () => "id-" + Math.random().toString(36).slice(2),
    });
  }
} catch {
  /* crypto sudah tersedia */
}
tetapkanGlobal("matchMedia", dom.window.matchMedia ?? (() => ({ matches: false, addListener() {}, removeListener() {} })));

const React = await import("react");
const { renderToPipeableStream } = await import("react-dom/server");
const { Writable } = await import("stream");
const { default: App } = await import("./src/App.tsx");

const halaman = [
  "/", "/koleksi", "/buku/tambah", "/kategori", "/lokasi",
  "/peminjaman", "/statistik", "/pengaturan", "/login", "/register", "/reset-password",
];

/**
 * Render aplikasi untuk satu rute.
 * Memakai `renderToPipeableStream` karena seluruh halaman dimuat malas
 * (React.lazy + Suspense) yang tidak didukung oleh `renderToString`.
 */
function renderStream(elemen) {
  return new Promise((resolve, reject) => {
    let isi = "";
    const tujuan = new Writable({
      write(chunk, _encoding, callback) {
        isi += chunk.toString();
        callback();
      },
    });
    tujuan.on("finish", () => resolve(isi));
    tujuan.on("error", reject);
    const { pipe } = renderToPipeableStream(elemen, {
      onShellError: (err) => reject(err),
      onError: (err) => reject(err),
    });
    pipe(tujuan);
  });
}

let adaGagal = false;
let selesai = 0;
for (const jalur of halaman) {
  dom.window.location.hash = `#${jalur}`;
  console.log(`[mulai] ${jalur}`);
  try {
    const html = await Promise.race([
      renderStream(React.createElement(App)),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("render melebihi 15 detik")), 15000)
      ),
    ]);
    selesai += 1;
    const petunjuk =
      /Dashboard|Koleksi Buku|Tambah Buku|Kategori|Lokasi Penyimpanan|Peminjaman|Statistik|Pengaturan|Masuk ke akun|Buat akun baru|Atur ulang kata sandi/.test(
        html
      );
    console.log(`${petunjuk ? "OK " : "?? "} ${jalur.padEnd(15)} (${html.length} karakter)`);
    if (!petunjuk) console.log("   cuplikan:", html.slice(0, 220).replace(/\s+/g, " "));
  } catch (err) {
    adaGagal = true;
    console.error(`GAGAL ${jalur}:`, err?.message ?? err);
    console.error(String(err?.stack ?? "").split("\n").slice(0, 8).join("\n"));
  }
}
console.log(adaGagal ? "ADA HALAMAN YANG GAGAL." : "Semua halaman berhasil dirender.");
console.log(`Total selesai: ${selesai} dari ${halaman.length}`);
if (adaGagal) process.exitCode = 1;
