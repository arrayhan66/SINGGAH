// Mencegah lompatan scroll saat tombol "Lihat Semua / Lihat Lebih Banyak"
// melebarkan grid. Browser scroll-anchoring (dan layout yang bergeser) akan
// ikut mendorong halaman ke bawah mengikuti tombol yang pindah; di sini posisi
// scroll dibekukan ulang setelah setiap tahap layout hingga list selesai
// dirender, supaya pengguna yang scroll sendiri ke bawah.
const TICKS_MS = [40, 120, 300, 800, 2000]

function scrollToY(y) {
  try {
    window.scrollTo({ top: y, left: 0, behavior: "instant" })
  } catch {
    window.scrollTo(0, y)
  }
}

export function keepScrollOnExpand() {
  const y = Math.max(0, window.scrollY || 0)

  // Nonaktifkan scroll anchoring untuk sementara selama list melebar.
  const html = document.documentElement
  const prev = html.style.overflowAnchor
  html.style.overflowAnchor = "none"
  const release = () => {
    if (html.style.overflowAnchor === "none") html.style.overflowAnchor = prev || ""
  }

  for (const ms of TICKS_MS) window.setTimeout(() => scrollToY(y), ms)
  window.setTimeout(release, TICKS_MS[TICKS_MS.length - 1] + 200)
}