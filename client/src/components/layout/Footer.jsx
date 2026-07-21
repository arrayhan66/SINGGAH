import { NavLink } from "react-router-dom"
import logo from "../../assets/icons/logo.png"

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#02111f]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:py-10">
        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl">
            <img
              src={logo}
              alt="PamerIT Logo"
              className="h-12 w-12 object-contain"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">SINGGAH</h2>
          </div>
        </NavLink>

        {/* MENU */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300 sm:gap-x-8 sm:text-base">
          <NavLink to="/" className="transition hover:text-cyan-300">
            Beranda
          </NavLink>

          <NavLink to="/categories" className="transition hover:text-cyan-300">
            Karya Unggulan
          </NavLink>

          <NavLink to="/about" className="transition hover:text-cyan-300">
            Tentang
          </NavLink>

          <NavLink to="/berita" className="transition hover:text-cyan-300">
            Berita
          </NavLink>
        </div>

        {/* COPYRIGHT */}
        <p className="text-center text-xs text-slate-500 sm:text-sm">
          Copyright © 2026 SINGGAH — Dibuat ElektroPoliban
        </p>
      </div>
    </footer>
  )
}

export default Footer
