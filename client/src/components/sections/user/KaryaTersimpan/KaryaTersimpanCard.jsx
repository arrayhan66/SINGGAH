function KaryaTersimpanCard({ item }) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
          {item.category}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900 line-clamp-2">
        {item.title}
      </h3>

      <p className="mt-2 text-sm text-slate-500 line-clamp-2">
        {item.description}
      </p>

      <div className="mt-auto pt-4">
        <p className="text-xs text-slate-400">{item.author}</p>
      </div>

      <button className="mt-4 w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-blue-700">
        Lihat Karya
      </button>
    </div>
  )
}

export default KaryaTersimpanCard
