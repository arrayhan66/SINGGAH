import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { useState } from "react"

function AdBlockView({ node, updateAttributes, selected }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(node.attrs.title || "")
  const [content, setContent] = useState(node.attrs.content || "")
  const [url, setUrl] = useState(node.attrs.url || "")

  function save() {
    updateAttributes({ title, content, url })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="my-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-700">
          <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Iklan
          </span>
          Edit Mode
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul iklan / promo..."
          className="mb-2 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        <textarea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Deskripsi / teks iklan..."
          className="mb-2 w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://link-iklan.com (opsional)"
          className="mb-3 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition cursor-pointer"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`my-4 cursor-pointer rounded-xl border-2 border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 transition-all hover:border-amber-400 hover:shadow-md ${
        selected ? "ring-2 ring-amber-400" : ""
      }`}
      onClick={() => {
        setTitle(node.attrs.title)
        setContent(node.attrs.content)
        setUrl(node.attrs.url)
        setEditing(true)
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Iklan
        </span>
        {node.attrs.title && (
          <span className="text-sm font-bold text-amber-800">
            {node.attrs.title}
          </span>
        )}
      </div>
      {node.attrs.content && (
        <p className="text-sm text-amber-700 leading-relaxed">
          {node.attrs.content}
        </p>
      )}
      {node.attrs.url && (
        <p className="mt-1.5 text-xs text-amber-500 truncate">
          {node.attrs.url}
        </p>
      )}
      <p className="mt-2 text-[10px] text-amber-400 italic">
        Klik untuk mengedit blok iklan ini
      </p>
    </div>
  )
}

const AdBlock = Node.create({
  name: "adBlock",

  group: "block",

  atom: true,

  draggable: true,

  selectable: true,

  addAttributes() {
    return {
      title: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-ad-title") || "",
        renderHTML: (attrs) =>
          attrs.title ? { "data-ad-title": attrs.title } : {},
      },
      content: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-ad-content") || "",
        renderHTML: (attrs) =>
          attrs.content ? { "data-ad-content": attrs.content } : {},
      },
      url: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-ad-url") || "",
        renderHTML: (attrs) =>
          attrs.url ? { "data-ad-url": attrs.url } : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="ad-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "ad-block" }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AdBlockView)
  },

  addCommands() {
    return {
      insertAdBlock:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: "adBlock",
            attrs: {
              title: attrs.title || "IKLAN",
              content: attrs.content || "Tulis teks promosi/iklan di sini...",
              url: attrs.url || "",
            },
          })
        },
    }
  },
})

export default AdBlock
