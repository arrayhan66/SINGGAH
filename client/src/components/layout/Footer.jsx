import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/icons/logo.webp";

function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className={`mt-auto w-full ${isDark ? "border-t border-white/10 bg-night-deep" : "border-t border-neutral-400 bg-white shadow-sm"}`}>
      <div className="w-full flex flex-col items-center justify-between gap-5 px-6 py-6 sm:px-8 md:px-12 lg:flex-row lg:py-8 2xl:px-16 3xl:px-20">
        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-10 sm:w-10 md:h-11 md:w-11 2xl:h-14 2xl:w-14">
            <img
              src={logo}
              alt="SINGGAH Logo"
              className="h-10 w-10 object-contain sm:h-12 sm:w-12 2xl:h-16 2xl:w-16"
            />
          </div>

          <h2 className={`text-base font-bold sm:text-lg md:text-xl 2xl:text-2xl ${isDark ? "text-white" : "text-neutral-900"}`}>
            SINGGAH
          </h2>
        </NavLink>

        {/* MENU */}
        <div className={`flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm md:text-base lg:gap-x-10 2xl:text-lg ${isDark ? "text-slate-300" : "text-[#6B7280]"}`}>
          <NavLink to="/" className={`transition ${isDark ? "hover:text-cyan-300" : "hover:text-blue-600"}`}>
            Beranda
          </NavLink>

          <NavLink to="/karya" className={`transition ${isDark ? "hover:text-cyan-300" : "hover:text-blue-600"}`}>
            Karya
          </NavLink>

          <NavLink to="/about" className={`transition ${isDark ? "hover:text-cyan-300" : "hover:text-blue-600"}`}>
            Tentang
          </NavLink>

          <NavLink to="/berita" className={`transition ${isDark ? "hover:text-cyan-300" : "hover:text-blue-600"}`}>
            Berita
          </NavLink>
        </div>

        {/* COPYRIGHT */}
        <p className={`text-center text-[10px] sm:text-xs md:text-sm 2xl:text-base ${isDark ? "text-slate-500" : "text-[#6B7280]"}`}>
          Copyright © 2026 SINGGAH — Dibuat ElektroPoliban
        </p>
      </div>
    </footer>
  );
}

export default Footer;
