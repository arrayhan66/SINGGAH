import { NavLink } from "react-router-dom";
import logo from "../../assets/icons/logo.png";

function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#02111f]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-6 sm:px-5 sm:gap-6 sm:py-8 md:px-8 lg:max-w-[1280px] lg:flex-row lg:py-10 xl:max-w-[1400px] 3xl:max-w-[1700px] 3xl:gap-8 3xl:px-12 3xl:py-12 4xl:py-14">
        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-10 sm:w-10 md:h-11 md:w-11 2xl:h-14 2xl:w-14">
            <img
              src={logo}
              alt="SINGGAH Logo"
              className="h-10 w-10 object-contain sm:h-12 sm:w-12 2xl:h-16 2xl:w-16"
            />
          </div>

          <h2 className="text-base font-bold text-white sm:text-lg md:text-xl 2xl:text-2xl">
            SINGGAH
          </h2>
        </NavLink>

        {/* MENU */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-slate-300 sm:gap-x-6 sm:text-sm md:gap-x-8 md:text-base lg:gap-x-10 xl:gap-x-12 2xl:gap-x-16 2xl:text-lg">
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
        <p className="text-center text-[10px] text-slate-500 sm:text-xs md:text-sm 2xl:text-base">
          Copyright © 2026 SINGGAH — Dibuat ElektroPoliban
        </p>
      </div>
    </footer>
  );
}

export default Footer;
