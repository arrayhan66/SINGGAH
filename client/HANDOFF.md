# Handoff: Perbaikan Kerentanan Dependensi Client

Tanggal: 2026-11-13
Repo: `C:\Users\admin\SINGGAH`
Scope: `client` (Vite + React)

## Status Saat Ini

- **Belum ada perubahan kode/dependensi yang diterapkan.** `package.json` dan `package-lock.json` masih versi lama.
- `npm audit` sudah dijalankan. Hasil lokal: **53 kerentanan** (1 critical, 10 high, 42 moderate).
- Dashboard hosting melaporkan 43 kerentanan / 23 siap diperbaiki. Selisih angka wajar karena snapshot database audit berbeda.
- File `audit.json` sementara sudah dihapus, tidak ada file untracked yang tertinggal.
- Environment: Node `v24.22.1`, npm `11.19.1`. `npm view` sempat crash native sekali; ulangi command jika terjadi.

## Temuan High/Critical (Prioritas)

| Paket | Terpasang | Target | Jenis | Catatan |
|---|---:|---:|---|---|
| `dompurify` | 3.4.14 | **3.4.17** | direct | Critical: SAFE_FOR_TEMPLATES bypass + IN_PLACE handler |
| `axios` | 1.18.1 | **1.20.0** | direct | 12 advisory high (SSRF, prototype pollution, ReDoS) |
| `vite` | 8.1.0 | **8.1.6** | dev direct | launch-editor & custom middleware |
| `sharp` | 0.35.4 | **0.35.5** | dev direct | librsvg CVE |
| `follow-redirects` | 1.16.0 | **1.16.1** | transitive via axios | credential header leak |
| `prosemirror-view` | 1.42.1 | **1.42.3** | transitive via `@tiptap/pm` | XSS paste handling |
| `zod` | 4.4.3 | **4.6.6** | transitive via eslint-plugin-react-hooks | memory exhaustion |

## Temuan Penting Lainnya

- `@tiptap/core` high (rentang `>=2.0.0-alpha.0 <3.30.4` / `>=3.7.0 <3.30.5`). Perlu upgrade seluruh paket `@tiptap/*` (saat ini `^3.27.3`).
- `source-map-js` high, `brace-expansion` high, `browserslist` high.
- Moderate: `@gltf-transform/cli`, `eslint`/`minimatch`, `@tailwindcss/typography`/`postcss-selector-parser`, `fflate`, `colord`, `baseline-browser-mapping`.
- Sebagian fix moderate memerlukan **major upgrade** (`eslint` 9.x, `@gltf-transform/cli` 3.x, `@tailwindcss/typography` 0.5.4), jadi jangan asal `npm audit fix --force`.

## Rencana Perbaikan

### 1. Update direct dependency (aman, tanpa major)

```bash
npm install axios@^1.20.0 dompurify@^3.4.17
npm install -D vite@^8.1.6 sharp@^0.35.5
```

### 2. Paksa transitive dependency ke versi patch

Tambahkan ke `package.json` (level root):

```json
"overrides": {
  "follow-redirects": "^1.16.1",
  "prosemirror-view": "^1.42.3",
  "zod": "^4.6.6",
  "source-map-js": "^1.2.2",
  "fflate": "^0.6.11",
  "colord": "^2.9.4",
  "baseline-browser-mapping": "^2.11.0",
  "browserslist": "^4.28.7",
  "brace-expansion": "^5.0.12",
  "minimatch": "^11.0.1"
}
```

Lalu:

```bash
npm install
```

Catatan: `brace-expansion`/`minimatch` override bisa memengaruhi ESLint/glob; verifikasi lint setelahnya. Jika bermasalah, hapus override tersebut dan biarkan diselesaikan lewat upgrade ESLint.

### 3. Upgrade Tiptap (high)

```bash
npm install @tiptap/core@^3.30.5 @tiptap/pm@^3.30.5 @tiptap/react@^3.30.5 @tiptap/starter-kit@^3.30.5 \
  @tiptap/extension-file-handler@^3.30.5 @tiptap/extension-horizontal-rule@^3.30.5 \
  @tiptap/extension-image@^3.30.5 @tiptap/extension-link@^3.30.5 \
  @tiptap/extension-placeholder@^3.30.5 @tiptap/extension-text-align@^3.30.5 \
  @tiptap/extension-underline@^3.30.5
```

Jika registry belum menyediakan 3.30.5, cek `npm view @tiptap/core versions --json` dan pilih patch terbaru >= 3.30.5.

### 4. Moderate (opsional, terpisah)

- `eslint` -> 9.39.5 (major; sesuaikan `eslint.config.js`)
- `@gltf-transform/cli` -> 3.5.1 (major; hanya tooling aset)
- `@tailwindcss/typography` -> 0.5.4

## Verifikasi

```bash
npm audit
npm run build
npm run lint
npm run dev
```

Smoke test yang perlu dicek manual:
- Editor Tiptap: paste konten kaya, upload gambar, link, align, placeholder.
- Form yang memakai `zod`/validasi (jika ada).
- Halaman yang memakai `axios` (request API, redirect).
- Build production + preview.

## File yang Disentuh

- Belum ada.
- `HANDOFF.md` ini ditambahkan sebagai dokumen handoff.

## Next Step untuk Agent Berikutnya

1. Jalankan langkah 1 dan 2, lalu `npm audit` untuk melihat sisa temuan.
2. Jika high masih ada, lanjut langkah 3 (Tiptap).
3. Jalankan `npm run build` dan `npm run lint`; perbaiki jika ada breaking change.
4. Jangan commit `node_modules`, `dist`, atau file audit sementara.
5. Commit hanya `package.json`, `package-lock.json`, dan perubahan kode yang diperlukan.
