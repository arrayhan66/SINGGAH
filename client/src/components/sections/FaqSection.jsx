import { useState } from "react";
import { FAQ_CTA, FAQ_IMAGE, FAQ_ITEMS } from "./faqData";
import "./FaqSection.css";

const FAQ_CHIPS = [{ label: "Bantuan" }, { label: "Panduan" }, { label: "Kontak" }]; // aksi klik belum ditentukan, isi nanti

export default function FaqSection() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="faq-wrap">
        <div className="faq-grid">
          <div className="faq-side">
            <div className="faq-tagrow">
              <span className="faq-tag">FAQ</span>
              <div className="faq-chips">{FAQ_CHIPS.map((c) => (<button key={c.label} type="button" className="faq-chip" onClick={() => {}}>{c.label}</button>))}</div>
            </div>
            <div className="faq-media">
              {FAQ_IMAGE ? <img src={FAQ_IMAGE} alt="" loading="lazy" /> : null}
              <div className="faq-media-overlay" aria-hidden="true"></div>
              <div className="faq-media-content">
                <div className="faq-media-copy">
                  <p className="faq-media-title">{FAQ_CTA.judul}</p>
                  <p className="faq-media-text">{FAQ_CTA.teks}</p>
                </div>
                <a className="faq-media-btn" href={FAQ_CTA.href} aria-label="Hubungi admin prodi">
                  <svg className="faq-media-btn-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="faq-main">
            <h2 id="faq-title" className="faq-title">
              Pertanyaan yang sering
              <br />
              diajukan tentang <span className="faq-accent">Singgah</span>
            </h2>
            <ul className="faq-list">
              {FAQ_ITEMS.map((item) => {
                const open = openId === item.id;
                const qId = `faq-q-${item.id}`;
                const aId = `faq-a-${item.id}`;
                return (
                  <li key={item.id} className={open ? "is-open" : ""}>
                    <h3 className="faq-q">
                      <button
                        type="button"
                        className="faq-btn"
                        aria-expanded={open}
                        aria-controls={aId}
                        id={qId}
                        onClick={() => toggle(item.id)}
                      >
                        <span>{item.tanya}</span>
                        <svg className="faq-arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 2.5v11M3.5 9 8 13.5 12.5 9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </h3>
                    <div id={aId} role="region" aria-labelledby={qId} className="faq-panel" aria-hidden={!open}>
                      <div className="faq-panel-inner">
                        <p className="faq-answer">{item.jawab}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
