import { useState } from "react"
import { Plus, X } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function UploadTechnology({ value, onChange }) {
  const [inputValue, setInputValue] = useState("")

  function handleAdd() {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (value.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("")
      return
    }
    onChange([...value, trimmed])
    setInputValue("")
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  function handleRemove(tag) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <GlassCard className="p-5 md:p-6">
      <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
        Teknologi yang Digunakan
      </h2>
      <p className="mt-1 text-xs md:text-sm text-slate-400">
        Tambahkan tools, bahasa, atau komponen yang dipakai. Contoh: Arduino,
        ESP32, Python.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik teknologi lalu Enter"
          className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/20 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {value.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs md:text-sm text-cyan-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="text-cyan-300 hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

export default UploadTechnology
