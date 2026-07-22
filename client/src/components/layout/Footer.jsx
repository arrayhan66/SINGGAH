import { NavLink } from "react-router-dom";
import logo from "../../assets/icons/logo.png";

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#02111f]">
      <div className="mx-auto flex max-w-7xl 2xl:max-w-[1700px] flex-col items-center justify-between gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:py-10 2xl:py-14">
        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 2xl:h-14 2xl:w-14 items-center justify-center overflow-hidden rounded-xl">
            <img
              src={logo}
              alt="PamerIT Logo"
              className="h-12 w-12 2xl:h-16 2xl:w-16 object-contain"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white 2xl:text-2xl">
              SINGGAH
            </h2>
          </div>
        </NavLink>

        {/* MENU */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300 sm:gap-x-8 sm:text-base 2xl:gap-x-16 2xl:text-lg">
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
        <p className="text-center text-xs text-slate-500 sm:text-sm 2xl:text-base">
          Copyright © 2026 SINGGAH — Dibuat ElektroPoliban
        </p>
      </div>
    </footer>
  );
}

export default Footer;
