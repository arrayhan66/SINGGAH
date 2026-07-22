import { useState } from "react";
import { ChevronDown } from "lucide-react";
import DustBackground from "../ui/DustBackground";
import PCBBackground from "../ui/PCBBackground";

const faq = [
  {
    question: <>Apa itu SINGGAH?</>,
    answer: (
      <>
        SINGGAH adalah panggung digital tempat civitas akademika Politeknik
        Negeri Banjarmasin, Teknik Elektro memamerkan karya terbaiknya di bidang
        teknologi — mulai dari website, mobile app, IoT, sampai artificial
        intelligence. Semuanya dikemas dalam exhibition hall virtual yang bisa
        dijelajahi layaknya pameran sungguhan, tapi dari layar kamu sendiri.
      </>
    ),
  },
  {
    question: "Bagaimana cara mengikuti pameran ini?",
    answer:
      "Gampang! Cukup daftar dan unggah project kamu lewat halaman registrasi. Tim kami akan meninjau karyamu sebentar, lalu project langsung tayang di Virtual Hall dan siap dilihat pengunjung dari mana saja.",
  },
  {
    question: "Apakah masyarakat umum bisa melihat project yang dipamerkan?",
    answer:
      "Bisa banget. Semua project yang sudah tayang terbuka untuk siapa saja — mahasiswa, dosen, atau masyarakat umum — tanpa perlu login atau daftar akun dulu.",
  },
  {
    question: "Apakah project yang dipamerkan bisa diunduh?",
    answer:
      "Tergantung pemiliknya. Beberapa project menyediakan source code atau dokumentasi lengkap untuk diunduh, sementara yang lain hanya menampilkan demo atau preview saja.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-brand-dark pt-6 pb-12 sm:pt-20 sm:pb-20"
    >
      {/* PCB Background */}
      <PCBBackground />

      {/* Dust Particles */}
      <DustBackground />

      <div className="mx-auto max-w-5xl 2xl:max-w-6xl px-5 sm:px-8">
        <h2 className="text-center text-2xl font-black text-white sm:text-3xl 2xl:text-4xl">
          Pertanyaan yang <span className="text-cyan-300">Sering Diajukan</span>
        </h2>

        <div className="mt-10 space-y-6 sm:mt-16 2xl:space-y-8">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:border-cyan-400/40"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left sm:p-6 2xl:p-8"
                >
                  <span className="text-base font-semibold text-white sm:text-lg 2xl:text-xl">
                    {item.question}
                  </span>

                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-cyan-300 transition-transform duration-300 2xl:w-6 2xl:h-6 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-justify leading-7 text-slate-300 sm:px-6 sm:pb-6 sm:leading-8 2xl:px-8 2xl:pb-8 2xl:text-lg 2xl:leading-9">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
