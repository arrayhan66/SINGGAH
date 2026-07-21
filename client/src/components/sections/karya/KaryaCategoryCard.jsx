import GlassCard from "../../ui/GlassCard"

function KaryaCategoryCard({ item, onClick }) {
  const Icon = item.icon

  return (
    <GlassCard hover className="group p-6 sm:p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-xl transition group-hover:scale-110 sm:h-20 sm:w-20">
        <Icon size={36} />
      </div>

      <h3 className="mt-6 text-xl font-bold text-white sm:mt-8 sm:text-2xl">
        {item.title}
      </h3>

      <p className="mt-4 leading-7 text-slate-300">{item.desc}</p>

      <button
        onClick={onClick}
        className="mt-8 cursor-pointer rounded-xl border border-cyan-400/30 px-5 py-3 text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
      >
        Lihat Karya
      </button>
    </GlassCard>
  )
}

export default KaryaCategoryCard
