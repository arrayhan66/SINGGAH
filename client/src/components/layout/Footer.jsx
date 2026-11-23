import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import SmartImage from "../ui/SmartImage";
import logo from "../../assets/icons/logo.webp";
import footerBg from "../../assets/images/bg-cover/Poliban-Depan-malam.jpg";
import "./Footer.css";

function Footer() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const tipe = user?.tipe || "umum";

  return (
    <footer className={`sf ${isDark ? "sf-dark bg-night-deep" : "sf-light bg-white"}`}>
      <div className="sf-card" style={{ backgroundImage: `url(${footerBg})` }}>
        <div className="sf-brand">
          <NavLink to="/" className="sf-logo">
            <SmartImage src={logo} alt="Singgah Logo" eager className="sf-logo-img" />
            <span className="sf-name">Singgah</span>
          </NavLink>
          <p className="sf-desc">
            Singgah mengumpulkan karya dan riset program studi dalam satu galeri, supaya mahasiswa, dosen, dan mitra bisa menemukan apa yang mereka cari.
          </p>
        </div>

        <nav className="sf-cols" aria-label="Footer">
          <div className="sf-col">
            <div className="sf-col-title">Karya</div>
            <ul className="sf-col-list">
              <li><NavLink className="sf-link" to="/karya?kategori=produk-unggulan">Produk Unggulan</NavLink></li>
              <li><NavLink className="sf-link" to="/karya?kategori=inovasi">Inovasi</NavLink></li>
              <li><NavLink className="sf-link" to="/karya?kategori=publikasi-ilmiah">Publikasi Ilmiah</NavLink></li>
              {tipe !== "umum" && (
                <li><NavLink className="sf-link" to="/upload">Upload Karya</NavLink></li>
              )}
            </ul>
          </div>
          <div className="sf-col">
            <div className="sf-col-title">Penelitian &amp; PkM</div>
            <ul className="sf-col-list">
              <li><NavLink className="sf-link" to="/penelitian/kegiatan">Kegiatan Penelitian</NavLink></li>
              <li><NavLink className="sf-link" to="/penelitian/buletin">Buletin</NavLink></li>
              <li><NavLink className="sf-link" to="/pkm/kegiatan">Kegiatan PkM</NavLink></li>
              <li><NavLink className="sf-link" to="/pkm/diseminasi">Diseminasi</NavLink></li>
            </ul>
          </div>
          <div className="sf-col">
            <div className="sf-col-title">Zona Akademik</div>
            <ul className="sf-col-list">
              <li><NavLink className="sf-link" to="/akademik/tur-virtual">Tur Virtual</NavLink></li>
              <li><NavLink className="sf-link" to="/pemenang">Prestasi</NavLink></li>
              <li><NavLink className="sf-link" to="/dosen">Daftar Dosen</NavLink></li>
            </ul>
          </div>
          <div className="sf-col">
            <div className="sf-col-title">Kolaborasi</div>
            <ul className="sf-col-list">
              <li><NavLink className="sf-link" to="/kemitraan">Kemitraan</NavLink></li>
              <li><NavLink className="sf-link" to="/pengajuan-masalah">Pengajuan Masalah</NavLink></li>
            </ul>
          </div>
          <div className="sf-col">
            <div className="sf-col-title">Tentang</div>
            <ul className="sf-col-list">
              <li><NavLink className="sf-link" to="/tentang/profil">Profile</NavLink></li>
              <li><NavLink className="sf-link" to="/tentang/struktur-organisasi">Struktur Organisasi</NavLink></li>
              <li><NavLink className="sf-link" to="/about">Informasi Singgah</NavLink></li>
              <li><NavLink className="sf-link" to="/berita">Pengumuman</NavLink></li>
              <li><NavLink className="sf-link" to="/faq">FAQ</NavLink></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="sf-bottom">
        <p className="sf-copy">Copyright © 2026 Singgah — Dibuat ElektroPoliban</p>
        <nav className="sf-legal" aria-label="Legal">
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
