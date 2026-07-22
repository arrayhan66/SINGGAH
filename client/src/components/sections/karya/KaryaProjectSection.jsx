import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DustBackground from "../../ui/DustBackground";
import GlowBackground from "../../ui/GlowBackground";
import useSearchAndExpand from "../../../hooks/useSearchAndExpand";
import SearchBar from "../../ui/SearchBar";
import OutlineButton from "../../ui/OutlineButton";
import KaryaProjectCard from "./KaryaProjectCard";
import { karyaCategories, karyaProjects } from "../../../data/karyaData";

// Set limit awal 6 (karena kita pakai 3 kolom, jadinya pas 2 baris)
const INITIAL_COUNT = 6;

function KaryaProjectSection() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const category = karyaCategories.find((item) => item.slug === slug);

  // FILTER STATUS: Sesuai skema database, hanya ambil project yang "published".
  const categoryProjects = karyaProjects.filter(
    (item) =>
      item.category === slug && (item.status === "published" || !item.status),
  );

  const {
    search,
    handleSearchChange,
    visibleData: visibleProjects,
    filteredData: filteredProjects,
    showAll,
    setShowAll,
  } = useSearchAndExpand(categoryProjects, INITIAL_COUNT);

  // Jika URL kategori tidak valid
  if (!category) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-navy py-20 text-center 2xl:py-32">
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-xl font-semibold text-slate-300 2xl:text-2xl">
            Kategori tidak ditemukan.
          </p>
          <button
            onClick={() => navigate("/karya")}
            className="mt-6 rounded-xl border border-cyan-400/30 px-5 py-3 text-cyan-300 transition hover:bg-cyan-400 hover:text-black 2xl:mt-8 2xl:px-8 2xl:py-4 2xl:text-lg"
          >
            Kembali ke Daftar Kategori
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="karya-detail"
      className="relative min-h-screen overflow-hidden bg-brand-navy pt-20 pb-6 sm:pt-24 sm:pb-10 lg:pt-28 lg:pb-12 2xl:pt-32 2xl:pb-20"
    >
      <GlowBackground />
      <DustBackground />

      {/* Menggunakan max-w-360 sesuai saran Tailwind Intellisense */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative 2xl:max-w-360 2xl:px-12">
        {/* Tombol Kembali */}
        <div className="mb-6 flex sm:mb-8 2xl:mb-10">
          <Link
            to="/karya"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-2 pl-3 pr-4 text-sm text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 2xl:py-3 2xl:pl-4 2xl:pr-5 2xl:text-base"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-cyan-400/20 2xl:h-8 2xl:w-8">
              <ArrowLeft
                size={14}
                className="transition-transform duration-300 group-hover:-translate-x-0.5 2xl:size-5"
              />
            </span>
            Kembali
          </Link>
        </div>

        {/* Judul Kategori */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl 2xl:text-6xl">
            {category.title}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 2xl:mt-6 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9">
            {category.desc}
          </p>
        </div>

        <div className="mt-8 2xl:mt-12">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder={`Cari di kategori ${category.title}...`}
          />
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:mt-16 2xl:gap-10">
          {visibleProjects.length > 0 ? (
            visibleProjects.map((project) => (
              <KaryaProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-16 sm:py-24 2xl:py-32">
              <div className="mb-5 rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50 backdrop-blur-sm">
                <svg
                  className="h-10 w-10 text-slate-400 2xl:h-12 2xl:w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-200 2xl:text-2xl">
                Karya tidak ditemukan
              </h3>
              <p className="mt-2 max-w-md text-center text-sm text-slate-400 sm:text-base 2xl:mt-3 2xl:text-lg">
                Maaf, kami tidak menemukan karya yang cocok dengan kata kunci{" "}
                <span className="font-semibold text-slate-300">"{search}"</span>
                . Coba gunakan istilah lain.
              </p>
            </div>
          )}
        </div>

        {!showAll && filteredProjects.length > INITIAL_COUNT && (
          <div className="mt-8 flex justify-center sm:mt-10 2xl:mt-14">
            <OutlineButton onClick={() => setShowAll(true)}>
              Lihat Lebih Banyak
            </OutlineButton>
          </div>
        )}
      </div>
    </section>
  );
}

export default KaryaProjectSection;
