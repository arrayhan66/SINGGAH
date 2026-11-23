import "./Bulletin.css";
import "./sections/DosenCarousel.css";

import BulletinBook from "./BulletinBook";
import { Link } from "react-router-dom";
import blImage from "../assets/images/bulletin/bulletin-image.jpg";
import blImage2 from "../assets/images/bulletin/bulletin2.jpg";
import blStageBg from "../assets/images/coverbuku/flipbook-backround.jpeg";

/* BL-HEY-START */
const BL_HEYZINE = ""; // link Heyzine sebelumnya: https://heyzine.com/flip-book/35bf24598b.html
/* BL-HEY-END */

// Isi gambar kartu di sini nanti. Contoh:
//   import cover from "../assets/bulletin/cover.jpg";
//   const BL_IMAGE = cover;
const BL_IMAGE = blImage;

// Foto kedua panel. Isi nanti. Contoh:
//   import blImage2 from "../assets/images/bulletin/bulletin-image-2.jpg";
//   const BL_IMAGE_2 = blImage2;
const BL_IMAGE_2 = blImage2;
const BL_LINK = "/penelitian/buletin";

export default function Bulletin() {
  return (
    <section id="bulletin" className="bl" aria-labelledby="bulletin-title">
      <div className="px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="bl-wrap">
          <div className="bl-showcase">
            <div className="bl-sc-head">
              <div className="bl-sc-head-title">
              <div className="bl-heading">
                <span className="dc-tag">Bulletin terbaru</span>
              <h2 id="bulletin-title" className="bl-title">
                Hasil riset terbaru dalam<br />
                satu <span className="bl-title-accent">buletin</span>
              </h2>
            </div>

                </div>
                <p className="bl-sc-desc">Buka saja dan baca yang menarik buatmu, semoga ada satu halaman yang membuatmu berhenti dan berpikir.</p>
              </div>
              <div className="bl-card">
                <div className="bl-card-bar">
                  <span className="bl-card-bar-name">Edisi terbaru</span>
                  <Link className="bl-card-link" to={BL_LINK}>
                    Lihat semua edisi
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
                <div className="bl-card-stage" style={{ "--bl-stage-bg": `url(${blStageBg})` }}>
                  {BL_HEYZINE ? (
  <iframe
    className="bl-hey-frame"
    src={BL_HEYZINE}
    title="Buletin Singgah"
    allowFullScreen
    allow="clipboard-write"
    loading="lazy"
  />
) : (
  <BulletinBook />
)}
                </div>
                <div className="bl-card-cap">
                  <strong>Baca seperti buku</strong>
                  <span>Klik atau seret sudut halaman untuk membalik. Pakai tombol zoom bila tulisannya terlalu kecil.</span>
                </div>
              </div>
              <ul className="bl-sc-points">
                <li>Bisa dibaca langsung di halaman</li>
                <li>Tersedia PDF untuk dibaca offline</li>
                <li>Nyaman dibaca di HP</li>
                <li>Gratis diakses</li>
              </ul>
              {/* BL-LAMA: tidak dirender, jangan dihapus */}
              {false && (
                <>
            <ul className="bl-points">
              <li>Ringkasan hasil riset</li>
              <li>Bisa dibaca langsung di halaman</li>
              <li>Tersedia PDF untuk dibaca offline</li>
              <li>Nyaman dibaca di HP</li>
            </ul>
            <div className="bl-actions">
              <Link className="bl-action-primary" to={BL_LINK}>
                Lihat Semua Edisi
              </Link>
              <Link className="bl-action-link" to={BL_LINK}>
                Baca edisi terbaru
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </div>

            {/* BL-PANEL-START */}
            <Link className="bl-promo" to={BL_LINK} aria-label="Buka arsip buletin">
              <div className="bl-promo-text">
                <span className="bl-promo-eyebrow">Menu Buletin</span>
                <strong className="bl-promo-title">Jelajahi semua edisi</strong>
                <p className="bl-promo-desc">
                  Arsip buletin riset prodi, dari terbitan terbaru hingga edisi sebelumnya.
                </p>
                <span className="bl-promo-btn">
                  Buka Arsip Buletin
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
              <div className="bl-promo-photos" aria-hidden="true">
                <div className="bl-promo-photo bl-promo-photo-back">
                  {BL_IMAGE_2 ? <img src={BL_IMAGE_2} alt="" loading="lazy" /> : <div className="bl-promo-ph" />}
                </div>
                <div className="bl-promo-photo bl-promo-photo-front">
                  {BL_IMAGE ? <img src={BL_IMAGE} alt="" loading="lazy" /> : <div className="bl-promo-ph" />}
                </div>
              </div>
            </Link>
            {/* BL-PANEL-END */}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
