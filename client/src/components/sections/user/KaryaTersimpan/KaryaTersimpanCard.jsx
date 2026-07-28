function KaryaTersimpanCard({ item }) {
  return (
    <div className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 min-[320px]:p-3.5 sm:p-4 md:p-5 lg:rounded-2xl lg:p-6 xl:p-7 3xl:p-8 4xl:p-10">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 min-[320px]:px-2.5 sm:px-3 sm:py-1 sm:text-xs md:text-xs lg:text-sm 3xl:px-4 3xl:py-1.5 3xl:text-sm 4xl:px-5 4xl:py-2 4xl:text-base">
          {item.category}
        </span>
      </div>

      <h3 className="mt-2.5 text-sm font-bold text-slate-900 line-clamp-2 sm:mt-3 sm:text-base md:text-base md:mt-3.5 lg:text-lg xl:text-xl 3xl:text-2xl 4xl:text-3xl">
        {item.title}
      </h3>

      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 line-clamp-2 sm:text-xs sm:mt-2 md:text-sm lg:text-sm 3xl:text-base 4xl:text-lg">
        {item.description}
      </p>

      <div className="mt-auto pt-2.5 sm:pt-3 md:pt-4 3xl:pt-5">
        <p className="text-[10px] text-slate-400 sm:text-[11px] md:text-xs lg:text-xs 3xl:text-sm 4xl:text-base">
          {item.author}
        </p>
      </div>

      <button className="mt-2.5 w-full cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-semibold text-white transition-colors duration-300 hover:bg-blue-700 sm:mt-3 sm:rounded-xl sm:px-3.5 sm:py-2 sm:text-xs md:text-xs md:py-2.5 lg:text-sm 3xl:mt-4 3xl:px-5 3xl:py-3 3xl:text-base 4xl:px-6 4xl:py-3.5 4xl:text-lg">
        Lihat Karya
      </button>
    </div>
  )
}

export default KaryaTersimpanCard
