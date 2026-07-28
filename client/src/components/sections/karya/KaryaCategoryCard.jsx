import GlassCard from "../../ui/GlassCard";

function KaryaCategoryCard({ item, onClick }) {
  const { icon: Icon, title, desc, projectCount } = item;

  const hasProjectCount = typeof projectCount === "number";

  return (
    <GlassCard
      hover
      className="group flex h-full flex-col !cursor-default p-6 sm:p-8 2xl:p-10 3xl:p-12 4xl:p-14"
    >
      {/* Header Card */}
      <div className="flex items-start justify-between">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-xl transition group-hover:scale-110 sm:h-20 sm:w-20 2xl:h-24 2xl:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32">
          <Icon size={36} className="sm:size-9 2xl:size-11 3xl:size-12 4xl:size-14" />
        </div>

        {hasProjectCount && (
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300 sm:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl">
            {projectCount} Karya
          </span>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="mt-6 text-xl font-bold text-white sm:mt-8 sm:text-2xl 2xl:mt-10 2xl:text-3xl 3xl:mt-12 3xl:text-4xl 4xl:mt-14 4xl:text-5xl">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-slate-300 2xl:mt-5 2xl:text-lg 2xl:leading-8 3xl:mt-6 3xl:text-xl 3xl:leading-9 4xl:mt-7 4xl:text-2xl 4xl:leading-10">
        {desc}
      </p>

      {/* Button */}
      <div className="mt-auto pt-8 2xl:pt-10 3xl:pt-12 4xl:pt-14">
        <button
          onClick={onClick}
          className="cursor-pointer rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition-colors duration-300 hover:bg-slate-200 2xl:px-6 2xl:py-4 2xl:text-lg 3xl:px-8 3xl:py-5 3xl:text-xl 4xl:px-10 4xl:py-6 4xl:text-2xl"
        >
          Lihat Karya
        </button>
      </div>
    </GlassCard>
  );
}

export default KaryaCategoryCard;
