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
      className="relative overflow-hidden bg-brand-dark pt-6 pb-10 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pb-24 3xl:pt-24 3xl:pb-28 4xl:pt-28 4xl:pb-32"
    >
      <PCBBackground />
      <DustBackground />

      <div className="mx-auto max-w-4xl px-4 sm:max-w-5xl sm:px-5 md:px-8 lg:max-w-6xl xl:max-w-6xl 3xl:max-w-7xl 3xl:px-12 4xl:max-w-[1400px] 4xl:px-16">
        <h2 className="text-center text-xl font-black text-white sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 3xl:text-5xl 4xl:text-6xl">
          Pertanyaan yang <span className="text-cyan-300">Sering Diajukan</span>
        </h2>

        <div className="mt-8 space-y-4 sm:mt-10 sm:space-y-5 md:space-y-6 lg:mt-12 lg:space-y-7 3xl:mt-16 3xl:space-y-8 4xl:mt-20 4xl:space-y-10">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:border-cyan-400/40 sm:rounded-2xl"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 p-3.5 text-left sm:p-5 md:p-6 lg:p-7 xl:p-8 3xl:p-9 4xl:p-10"
                >
                  <span className="text-sm font-semibold text-white sm:text-base md:text-lg lg:text-lg xl:text-xl 3xl:text-2xl 4xl:text-3xl">
                    {item.question}
                  </span>

                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-cyan-300 transition-transform duration-300 sm:size-5 md:size-[22px] lg:size-6 3xl:size-7 4xl:size-8 ${
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
                    <p className="px-3.5 pb-3.5 text-justify text-sm leading-6 text-slate-300 sm:px-5 sm:pb-5 sm:text-sm sm:leading-7 md:px-6 md:pb-6 md:text-base lg:text-base lg:leading-8 3xl:px-8 3xl:pb-8 3xl:text-lg 3xl:leading-9 4xl:text-xl 4xl:leading-10">
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
