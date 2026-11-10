\# DESIGN.md SINGGAH



\## Identitas

Galeri digital karya civitas Poliban. Tampilan bersih dan polos, terasa dibuat manusia, bukan template AI. Dasar off-white, aksen biru. Identitas SINGGAH dipertahankan, tidak ada perubahan besar yang tidak diminta.



\## Aturan utama

\- Contoh referensi dari pemilik proyek (Squarespace, DataLens) diikuti PERSIS. Jangan menambah elemen, kartu, hitungan, atau gaya sendiri. Contoh polos berarti hasil polos.

\- Responsif desktop dan mobile.



\## Warna

\- Semua warna lewat variabel tema. Tidak ada hex atau rgba baru.

\- Light: aksen biru terang. Dark: aksen cyan.

\- Keadaan default tanpa class = DARK. Light memakai class html.light dan prefix light: (BUKAN dark:).

\- Warna kartu dan latar harus jelas berbeda.

\- Dilarang: ungu dan lavender, termasuk di gradasi dan tint.

\- Pengecualian disengaja: band galeri 3D selalu gelap, pilnya selalu putih.



\## Bentuk

\- Tanpa gradasi (kecuali vignette di galeri 3D), tanpa glow, tanpa blob, tanpa bayangan tebal.

\- Tidak semua kartu abu-abu.

\- Kotak bersarang paling banyak dua tingkat.

\- Satu sistem: satu gaya kartu, satu skala radius, satu gaya tombol, satu gaya link.



\## Tipografi

\- Judul tidak terlalu tebal.

\- Dilarang huruf kapital semua dengan jarak antar huruf lebar.

\- Label kecil boleh kapital dengan letter-spacing maksimal .02em.

\- Tombol memakai huruf biasa.



\## Tulisan

\- Terdengar manusiawi, seperti orang bercerita, bukan brosur.

\- Header dan deskripsi pendek TANPA koma. Tanpa garis miring "/" di header.

\- Dilarang kata "ruang pameran".

\- Skala Poliban: jangan sebut "Elektro" kecuali tentang Jurusan Teknik Elektro.

\- Tombol berupa kata kerja plus objek.

\- Tidak ada angka, kutipan, atau klaim karangan.



\## Layout

\- Tepi kiri dan kanan konten sejajar.

\- Tidak ada keterangan di bawah gambar.



\## Gerak

\- Tidak ada animasi karena scroll (reveal, fade-in, parallax) kecuali sudah ada dan disengaja.

\- Hormati prefers-reduced-motion.



\## Jangan diubah tanpa diminta

\- HeroRays.jsx dan teks hero yang sudah final.

\- Branch main.



\## Nilai dari kode (DIISI OPENCODE, bukan dikarang)

| Hal | Nilai | Sumber (file dan baris) |

|---|---|---|

| Variabel warna dasar light | INKONSISTEN — `--color-paper: #f3f5f8` (token), tetapi halaman Beranda memakai `#f5f8fc` dan hero light `#f6f9fe` | `client/src/index.css:71`; `client/src/styles/beranda-light.css:22`; `client/src/index.css:983` |

| Variabel warna dasar dark | `--color-brand-dark: #041d38` (dipakai `html`/`body`); `--color-night: #0b1220` (konteks hall/3D) | `client/src/index.css:51`; `client/src/index.css:672-677`; `client/src/index.css:56` |

| Variabel aksen light | `#2563eb` (= `--color-blue-600`) | `client/src/index.css:984`; `client/src/styles/light-shared.css:63`; `client/src/components/layout/NavbarVisitor.jsx:20` |

| Variabel aksen dark | INKONSISTEN — `#22d3ee` (= `--color-cyan-400`) lewat `--hero-accent`, tetapi `--snav-a` navbar tetap `#2563eb` | `client/src/index.css:973`; `client/src/components/layout/NavbarVisitor.jsx:20` |

| Variabel border | INKONSISTEN — `--snav-bd: rgba(148,163,184,0.35)` (scope `#hero` dan `.snav-*`); border kartu light `#d6e4fb`; `--color-paper-border: #e5e9ef`; `--color-night-border: #223047` | `client/src/index.css:977`; `client/src/styles/light-shared.css:368`; `client/src/index.css:72`; `client/src/index.css:61` |

| Radius kartu | INKONSISTEN — `rounded-2xl` = 16px (kartu statistik) dan `16px` (kartu showcase); ada juga 20px/22px di stylesheet akademik | `client/src/components/sections/Hero/HeroStats.jsx:110`; `client/src/index.css:1100`; `client/src/styles/akademik-light.css:228,479` |

| Radius tombol | `10px` (`rounded-[10px]`; tombol navbar `.snav-mbtn`, `.snav-login`, `.snav-cta`) | `client/src/components/sections/Hero/Hero.jsx:56,63`; `client/src/components/layout/NavbarVisitor.jsx:74-75` |

| Tinggi tombol | INKONSISTEN — hero `h-12` = 48px (≥2560px `h-14` = 56px); mobile menu `44px`; navbar `40px` | `client/src/components/sections/Hero/Hero.jsx:56,63`; `client/src/components/layout/NavbarVisitor.jsx:74`; `client/src/components/layout/NavbarVisitor.jsx:75` |

| Font utama | `Poppins`, sans-serif (dimuat lewat 6 `@font-face`; tidak ada file `tailwind.config`, token tema ada di blok `@theme`) | `client/src/index.css:7-48`; `client/src/index.css:676`; `client/src/index.css:50-85` |

| Font judul | INKONSISTEN — h1 hero `Unbounded`, sans-serif; judul section (`h2`) tidak menetapkan font-family sehingga mewarisi `Poppins` | `client/src/components/sections/Hero/Hero.jsx:31`; `client/index.html:23`; `client/src/components/sections/FAQ.jsx:55`; `client/src/components/sections/About.jsx:76` |

| Ukuran dan bobot judul section | INKONSISTEN — `text-3xl font-black` (About), `text-xl font-black` (FAQ), `text-[2.1rem] font-bold` (KaryaSinggah), `text-2xl font-black` (KaryaProjectSection), h1 hero `clamp(1.645rem, 5vw, 3.055rem)` bobot 700 | `client/src/components/sections/About.jsx:76`; `client/src/components/sections/FAQ.jsx:55`; `client/src/components/sections/KaryaSinggah.jsx:287`; `client/src/components/sections/karya/KaryaProjectSection.jsx:125`; `client/src/components/sections/Hero/Hero.jsx:32-33` |

| Ukuran teks isi | INKONSISTEN — tidak ada `font-size` dasar eksplisit di `body`; paragraf hero `17px` → `18px`; deskripsi kartu statistik `12px` (`text-xs`) | `client/src/index.css:675-679`; `client/src/components/sections/Hero/Hero.jsx:45`; `client/src/components/sections/Hero/HeroStats.jsx:261` |

