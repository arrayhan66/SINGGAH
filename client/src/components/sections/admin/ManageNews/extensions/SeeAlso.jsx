import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { useState } from "react"

function SeeAlsoView({ node, updateAttributes, selected }) {
  const [editing, setEditing] = useState(false)
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(node.attrs.items || "[]")
    } catch {
      return []
    }
  })
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newImage, setNewImage] = useState("")

  function addItem() {
    if (!newTitle.trim()) return
    setItems([
      ...items,
      {
        title: newTitle.trim(),
        url: newUrl.trim(),
        image: newImage.trim(),
      },
    ])
    setNewTitle("")
    setNewUrl("")
    setNewImage("")
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index))
  }

  function moveItem(from, to) {
    if (to < 0 || to >= items.length) return
    const updated = [...items]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setItems(updated)
  }

  function save() {
    updateAttributes({ items: JSON.stringify(items) })
    setEditing(false)
  }

  const parsedItems = (() => {
    try {
      return JSON.parse(node.attrs.items || "[]")
    } catch {
      return []
    }
  })()

  if (editing) {
    return (
      <div className="my-5 rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
            Baca Juga
          </span>
          <span className="text-xs font-semibold text-amber-700">
            Mode Edit
          </span>
        </div>

        <div className="mb-4 space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-amber-200 bg-white p-3 shadow-sm"
            >
              <span className="mt-0.5 shrink-0 text-[11px] font-bold text-amber-400">
                {index + 1}.
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                  {item.title}
                </p>
                {item.url && (
                  <p className="mt-0.5 text-[11px] text-cyan-600 truncate">
                    {item.url}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, index - 1)}
                  disabled={index === 0}
                  className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition"
                >
                  &#9650;
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, index + 1)}
                  disabled={index === items.length - 1}
                  className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition"
                >
                  &#9660;
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] text-red-500 hover:bg-red-100 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="py-3 text-center text-xs text-amber-400 italic">
              Belum ada rekomendasi. Tambahkan artikel di bawah.
            </p>
          )}
        </div>

        <div className="mb-4 space-y-2 rounded-xl border border-amber-200 bg-white p-4">
          <p className="mb-1 text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Tambah Artikel
          </p>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Judul artikel yang direkomendasikan *"
            className="w-full rounded-lg border border-amber-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addItem()
              }
            }}
          />
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://... (tautan ke artikel)"
            className="w-full rounded-lg border border-amber-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            type="url"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="URL gambar thumbnail (opsional)"
            className="w-full rounded-lg border border-amber-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="button"
            onClick={addItem}
            className="w-full rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-100 transition cursor-pointer"
          >
            + Tambah ke Daftar
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-white hover:bg-amber-600 transition cursor-pointer shadow-sm"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`my-5 cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
        selected
          ? "border-amber-400 shadow-lg shadow-amber-200/50"
          : "border-amber-200 hover:border-amber-300 hover:shadow-md"
      }`}
      onClick={() => {
        setItems(parsedItems)
        setEditing(true)
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
        <span className="text-sm font-black uppercase tracking-widest text-white">
          Baca Juga
        </span>
        <div className="h-px flex-1 bg-white/30" />
        <span className="text-[10px] text-white/80 italic">
          Klik untuk mengedit
        </span>
      </div>

      {/* Items */}
      {parsedItems.length > 0 ? (
        <div className="grid gap-0 divide-y divide-amber-100 bg-white">
          {parsedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-amber-50/50"
            >
              {item.image ? (
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-amber-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-500">
                  {index + 1}
                </div>
              )}
              <div className="min-w-0 flex-1 py-0.5">
                <p className="text-sm font-bold leading-snug text-slate-800 line-clamp-2">
                  {item.title}
                </p>
                {item.url && (
                  <p className="mt-0.5 text-[11px] text-cyan-600 truncate">
                    {item.url}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white px-5 py-6 text-center">
          <p className="text-xs text-amber-400 italic">
            Klik untuk menambahkan rekomendasi &quot;Baca Juga&quot;...
          </p>
        </div>
      )}
    </div>
  )
}

const SeeAlso = Node.create({
  name: "seeAlso",

  group: "block",

  atom: true,

  draggable: true,

  selectable: true,

  addAttributes() {
    return {
      items: {
        default: "[]",
        parseHTML: (el) => el.getAttribute("data-see-also-items") || "[]",
        renderHTML: (attrs) =>
          attrs.items && attrs.items !== "[]"
            ? { "data-see-also-items": attrs.items }
            : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="see-also"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "see-also" }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SeeAlsoView)
  },

  addCommands() {
    return {
      insertSeeAlso:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: "seeAlso",
            attrs: { items: JSON.stringify(attrs.items || []) },
          })
        },
    }
  },
})

export default SeeAlso
