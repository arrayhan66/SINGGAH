import "./Bulletin.css";
import "./sections/DosenCarousel.css";

import BulletinBook from "./BulletinBook";

export default function Bulletin() {
  return (
    <section id="bulletin" className="bl" aria-labelledby="bulletin-title">
      <div className="px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="bl-wrap">
          <header className="bl-header">
            <div className="bl-heading">
              <span className="dc-tag">Bulletin terbaru</span>
              <h2 id="bulletin-title" className="bl-title">
                Hasil riset terbaru
                <span className="bl-title-line">
                  dalam satu <span className="bl-title-accent">buletin</span>
                </span>
              </h2>
            </div>
            <p className="bl-desc">
              Tidak semua orang sempat membaca jurnal yang panjang. Karena itu, hasil riset prodi diringkas dalam satu terbitan yang bisa dibaca dengan tenang.
            </p>
          </header>
          <BulletinBook />
        </div>
      </div>
    </section>
  );
}
