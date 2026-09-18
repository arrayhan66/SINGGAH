// Mencegah lompatan scroll saat tombol "Lihat Semua / Lihat Lebih Banyak"
// melebarkan/menutup grid. Browser scroll-anchoring akan ikut mendorong halaman
// (ke bawah saat list melebar, ke atas saat menyusut) mengikuti tombol yang
// bergeser. Posisi scroll dipatok ulang SEKALI setelah React selesai
// commit+layout (rAF + satu delay singkat), lalu anchoring dibiarkan normal —
// tidak boleh menahan gestur scroll user selama beberapa detik.
const RESTORE_MS = 50
const RELEASE_MS = 120

function scrollToY(y) {
  try {
    window.scrollTo({ top: y, left: 0, behavior: "instant" })
  } catch {
    window.scrollTo(0, y)
  }
}

export function keepScrollOnExpand() {
  const y = Math.max(0, window.scrollY || 0)

  // Nonaktifkan scroll anchoring hanya selama pemindahan awal, supaya browser
  // tidak ikut menarik viewport mengikuti tombol yang pindah posisi.
  const html = document.documentElement
  const prev = html.style.overflowAnchor
  html.style.overflowAnchor = "none"

  let active = true
  const release = () => {
    if (!active) return
    active = false
    html.style.overflowAnchor = prev || ""
  }
  const restore = () => {
    if (!active) return
    scrollToY(y)
  }

  requestAnimationFrame(restore)
  setTimeout(restore, RESTORE_MS)
  setTimeout(release, RELEASE_MS)
}