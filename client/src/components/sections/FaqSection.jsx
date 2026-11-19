import { useState } from "react";
import { FAQ_CTA, FAQ_IMAGE, FAQ_ITEMS } from "./faqData";
import "./FaqSection.css";

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
            <span className="faq-tag">FAQ</span>
            <div className="faq-media">
              {FAQ_IMAGE ? <img src={FAQ_IMAGE} alt="" loading="lazy" /> : null}
            </div>
            <div className="faq-cta">
              <p className="faq-cta-title">{FAQ_CTA.judul}</p>
              <p className="faq-cta-text">{FAQ_CTA.teks}</p>
              <a className="faq-cta-link" href={FAQ_CTA.href}>
                {FAQ_CTA.tautan}
              </a>
            </div>
          </div>
          <div className="faq-main">
            <h2 id="faq-title" className="faq-title">
              Pertanyaan yang sering
              <span className="faq-accent">diajukan tentang buletin</span>
            </h2>
            <ul className="faq-list">
              {FAQ_ITEMS.map((item) => {
                const open = openId === item.id;
                const qId = `faq-q-${item.id}`;
                const aId = `faq-a-${item.id}`;
                return (
                  <li key={item.id}>
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
                        <svg className="faq-chevron" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </h3>
                    <div id={aId} role="region" aria-labelledby={qId} hidden={!open}>
                      <p className="faq-answer">{item.jawab}</p>
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