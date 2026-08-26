// LIGHT MODE - versi pembanding skripsi, terpisah dari dark mode
import { NavLink } from "react-router-dom";
import logo from "../../assets/icons/logo.webp";

function LightModeFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-400 bg-white w-full shadow-sm">
      <div className="w-full flex flex-col items-center justify-between gap-5 px-6 py-6 sm:px-8 md:px-12 lg:flex-row lg:py-8 2xl:px-16 3xl:px-20">
        {/* LOGO */}
        <NavLink to="/light-mode" className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-10 sm:w-10 md:h-11 md:w-11 2xl:h-14 2xl:w-14">
            <img
              src={logo}
              alt="SINGGAH Logo"
              className="h-10 w-10 object-contain sm:h-12 sm:w-12 2xl:h-16 2xl:w-16"
            />
          </div>

          <h2 className="text-base font-bold text-neutral-900 sm:text-lg md:text-xl 2xl:text-2xl">
            SINGGAH <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 ml-1">Light Mode</span>
          </h2>
        </NavLink>

        {/* MENU */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#6B7280] sm:text-sm md:text-base lg:gap-x-10 2xl:text-lg">
          <NavLink to="/light-mode" className="transition hover:text-blue-600">
            Beranda
          </NavLink>

          <NavLink to="/karya" className="transition hover:text-blue-600">
            Karya
          </NavLink>

          <NavLink to="/about" className="transition hover:text-blue-600">
            Tentang
          </NavLink>

          <NavLink to="/berita" className="transition hover:text-blue-600">
            Berita
          </NavLink>
        </div>

        {/* COPYRIGHT */}
        <p className="text-center text-[10px] text-[#6B7280] sm:text-xs md:text-sm 2xl:text-base">
          Copyright &copy; 2026 SINGGAH &mdash; Dibuat ElektroPoliban
        </p>
      </div>
    </footer>
  );
}

export default LightModeFooter;
