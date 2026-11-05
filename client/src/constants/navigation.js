import { Home, LayoutGrid, Info, Newspaper } from "lucide-react"

export const visitorMenu = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/karya", label: "Karya", icon: LayoutGrid },
  { to: "/about", label: "Tentang", icon: Info },
  { to: "/berita", label: "Berita", icon: Newspaper },
]

export const akademikMenu = {
  label: "Lingkungan Akademik",
  items: [
    { to: "/akademik/tur-virtual", label: "Tur Virtual" },
    { to: "/akademik/dosen", label: "Daftar Dosen" },
    { to: "/akademik/jadwal-ruangan", label: "Jadwal Ruangan" },
  ],
}
