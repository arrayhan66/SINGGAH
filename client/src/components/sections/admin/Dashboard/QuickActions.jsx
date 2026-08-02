import { useNavigate } from "react-router-dom"
import { Plus, FileText, UserPlus, Image, ArrowRight } from "lucide-react"

const actions = [
  { label: "Tambah Project", icon: Plus, to: "/projects/tambah", color: "text-cyan-400", glow: "shadow-cyan-500/20" },
  { label: "Tulis Berita", icon: FileText, to: "/berita/tambah", color: "text-pink-400", glow: "shadow-pink-500/20" },
  { label: "Tambah User", icon: UserPlus, to: "/users/tambah", color: "text-emerald-400", glow: "shadow-emerald-500/20" },
  { label: "Upload Media", icon: Image, to: "/media", color: "text-violet-400", glow: "shadow-violet-500/20" },
]

function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.to}
            onClick={() => navigate(action.to)}
            className="group flex cursor-pointer flex-col items-center gap-2.5 rounded-[18px] border border-white/[0.06] bg-[#0E2745] p-5 shadow-[0_12px_28px_rgba(0,0,0,.18)] transition-all duration-250 hover:-translate-y-[3px] hover:border-white/[0.12] hover:bg-[#123255] hover:shadow-[0_12px_30px_rgba(0,0,0,.25)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#123255] transition-colors group-hover:bg-[#163B61]">
              <Icon size={22} className={`${action.color} transition-transform duration-200 group-hover:scale-110`} />
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300 md:text-sm">
              {action.label}
              <ArrowRight size={13} className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0" />
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default QuickActions
