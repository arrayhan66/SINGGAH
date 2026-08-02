import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useState, useRef } from "react"
import { NodeSelection } from "@tiptap/pm/state"
import "../../../../styles/tiptap.css"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import AdminBeritaToolbar from "./AdminBeritaToolbar"
import FileHandler from "@tiptap/extension-file-handler"

import {
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  Trash2,
  Type,
} from "lucide-react"

// Resizable & Caption Image Extension with Node Selection & NodeView (WordPress / Word Style)
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) => element.style.width || element.getAttribute("width") || "100%",
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return {
            style: `width: ${attributes.width}; max-width: 100%; height: auto; display: block; margin: 1rem auto; border-radius: 8px;`,
          }
        },
      },
      caption: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-caption") || "",
        renderHTML: (attributes) => {
          if (!attributes.caption) return {}
          return {
            "data-caption": attributes.caption,
            title: attributes.caption,
          }
        },
      },
    }
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement("div")
      dom.className = "my-4 text-center group cursor-pointer relative"
      
      const wrapper = document.createElement("div")
      wrapper.className = "inline-block relative max-w-full"
      wrapper.style.width = node.attrs.width || "100%"

      const img = document.createElement("img")
      img.src = node.attrs.src
      img.style.width = "100%"
      img.style.height = "auto"
      img.style.display = "block"
      img.style.borderRadius = "8px"
      img.className = "transition-all shadow-md group-hover:ring-2 group-hover:ring-cyan-400"
      wrapper.appendChild(img)
      dom.appendChild(wrapper)

      const captionEl = document.createElement("figcaption")
      captionEl.className = "text-xs text-slate-500 italic mt-1.5"
      captionEl.textContent = node.attrs.caption || ""
      captionEl.style.display = node.attrs.caption ? "block" : "none"
      dom.appendChild(captionEl)

      dom.addEventListener("click", (e) => {
        e.stopPropagation()
        if (typeof getPos === "function") {
          const { view } = editor
          const { state } = view
          const tr = state.tr.setSelection(NodeSelection.create(state.doc, getPos()))
          view.dispatch(tr)
        }
      })

      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type.name !== "image") return false
          img.src = updatedNode.attrs.src
          wrapper.style.width = updatedNode.attrs.width || "100%"
          if (updatedNode.attrs.caption) {
            captionEl.textContent = updatedNode.attrs.caption
            captionEl.style.display = "block"
          } else {
            captionEl.textContent = ""
            captionEl.style.display = "none"
          }
          return true
        },
      }
    }
  },
})

function AdminBeritaEditorMain({ formData, updateField }) {
  const titleRef = useRef(null)
  const [linkPopover, setLinkPopover] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [selectedImageAttrs, setSelectedImageAttrs] = useState(null)
  const [selectedImagePos, setSelectedImagePos] = useState(null)
  const [imageCaptionInput, setImageCaptionInput] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      HorizontalRule,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Mulai menulis artikel berita. Ketik paragraf, lalu klik ikon gambar di toolbar untuk menyisipkan foto/galeri di antara paragraf...",
      }),
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif",
        ],
        onDrop(editor, files, pos) {
          files.forEach((file) => {
            const url = URL.createObjectURL(file)
            editor
              .chain()
              .insertContentAt(pos, {
                type: "image",
                attrs: { src: url, alt: file.name, width: "100%", caption: "" },
              })
              .run()
          })
        },
        onPaste(editor, files) {
          files.forEach((file) => {
            const url = URL.createObjectURL(file)
            editor
              .chain()
              .focus()
              .setImage({ src: url, alt: file.name, width: "100%", caption: "" })
              .run()
          })
        },
      }),
    ],
    content: formData.contentText,
    onUpdate({ editor }) {
      updateField("contentText", editor.getHTML())
      checkSelectedImage(editor)
    },
    onSelectionUpdate({ editor }) {
      checkSelectedImage(editor)
    },
  })

  function checkSelectedImage(ed) {
    const { selection } = ed.state
    if (selection instanceof NodeSelection && selection.node.type.name === "image") {
      const attrs = selection.node.attrs
      setSelectedImageAttrs(attrs)
      setSelectedImagePos(selection.from)
      setImageCaptionInput(attrs.caption || "")
    } else {
      setSelectedImageAttrs(null)
      setSelectedImagePos(null)
      setImageCaptionInput("")
    }
  }

  function autoResizeTitle() {
    const el = titleRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    autoResizeTitle()
  }, [formData.title])

  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== formData.contentText) {
      editor.commands.setContent(formData.contentText || "", false)
    }
  }, [formData.contentText, editor])

  function insertImage() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (event) => {
      const file = event.target.files?.[0]
      if (!file) return
      const imageUrl = URL.createObjectURL(file)
      editor
        ?.chain()
        .focus()
        .setImage({ src: imageUrl, alt: file.name, width: "100%", caption: file.name })
        .run()
    }
    input.click()
  }

  function insertLink() {
    setLinkUrl(editor?.getAttributes("link").href || "")
    setLinkPopover(true)
  }

  function applyLink() {
    const url = linkUrl.trim()
    if (!url) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run()
    }
    setLinkPopover(false)
    setLinkUrl("")
  }

  function setImageSize(widthValue) {
    if (!editor) return
    const widthStr = typeof widthValue === "number" ? `${widthValue}%` : widthValue
    if (selectedImagePos !== null) {
      editor
        .chain()
        .focus()
        .setNodeSelection(selectedImagePos)
        .updateAttributes("image", { width: widthStr })
        .run()
    } else {
      editor
        .chain()
        .focus()
        .updateAttributes("image", { width: widthStr })
        .run()
    }
    const { selection } = editor.state
    if (selection instanceof NodeSelection && selection.node.type.name === "image") {
      setSelectedImageAttrs(selection.node.attrs)
    } else if (selectedImagePos !== null) {
      const node = editor.state.doc.nodeAt(selectedImagePos)
      if (node && node.type.name === "image") {
        setSelectedImageAttrs(node.attrs)
      }
    }
  }

  function saveImageCaption() {
    if (!editor) return
    if (selectedImagePos !== null) {
      editor
        .chain()
        .focus()
        .setNodeSelection(selectedImagePos)
        .updateAttributes("image", { caption: imageCaptionInput })
        .run()
    } else {
      editor
        .chain()
        .focus()
        .updateAttributes("image", { caption: imageCaptionInput })
        .run()
    }
    const { selection } = editor.state
    if (selection instanceof NodeSelection && selection.node.type.name === "image") {
      setSelectedImageAttrs(selection.node.attrs)
    }
  }

  function removeSelectedImage() {
    if (!editor) return
    if (selectedImagePos !== null) {
      editor.chain().focus().setNodeSelection(selectedImagePos).deleteSelection().run()
    } else {
      editor.chain().focus().deleteSelection().run()
    }
    setSelectedImageAttrs(null)
    setSelectedImagePos(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title Input */}
      <textarea
        ref={titleRef}
        rows={1}
        value={formData.title}
        onChange={(e) => {
          const title = e.target.value
          updateField("title", title)
          if (!formData.slug) {
            const slug = title
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, "")
              .replace(/[\s_]+/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-+|-+$/g, "")
            updateField("slug", slug)
          }
          autoResizeTitle()
        }}
        placeholder="Judul Berita / Artikel..."
        className="w-full resize-none overflow-hidden bg-transparent text-2xl md:text-3xl font-bold text-white placeholder:text-slate-600 focus:outline-none"
      />

      {/* Event Name */}
      <input
        type="text"
        value={formData.event}
        onChange={(e) => updateField("event", e.target.value)}
        placeholder="Nama event / kegiatan (Contoh: Lomba Inovasi Mahasiswa)"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
      />

      {/* Short Description */}
      <textarea
        value={formData.desc}
        onChange={(e) => updateField("desc", e.target.value)}
        rows={2}
        placeholder="Ringkasan / deskripsi singkat berita..."
        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
      />

      {/* Rich Text Editor Card (Word / WordPress Style with Inline Image Resizing & Caption) */}
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl">
        <AdminBeritaToolbar
          editor={editor}
          insertImage={insertImage}
          insertLink={insertLink}
        />

        {/* Floating Image Resizer & Caption Bar (Level Dewa NodeSelection when image is clicked) */}
        {selectedImageAttrs && (
          <div className="flex flex-col gap-2.5 bg-slate-900 px-4 py-3 border-b border-slate-700 text-xs text-cyan-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold flex items-center gap-1.5 text-white">
                <ImageIcon size={14} className="text-cyan-400" />
                Pengaturan Foto Terpilih (Resize & Drag / Slider):
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setImageSize("30%")}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    selectedImageAttrs.width === "30%" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  30%
                </button>
                <button
                  type="button"
                  onClick={() => setImageSize("50%")}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    selectedImageAttrs.width === "50%" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setImageSize("75%")}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    selectedImageAttrs.width === "75%" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => setImageSize("100%")}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    !selectedImageAttrs.width || selectedImageAttrs.width === "100%" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  title="Hapus Foto"
                  className="ml-2 rounded p-1.5 bg-red-600/80 hover:bg-red-600 text-white transition cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Slider for smooth drag/resize width */}
            <div className="flex items-center gap-3 pt-1 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 shrink-0">Geser Ukuran Lebar:</span>
              <input
                type="range"
                min="20"
                max="100"
                value={parseInt(selectedImageAttrs.width || "100", 10)}
                onChange={(e) => setImageSize(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] text-cyan-300 font-mono shrink-0 w-10 text-right">
                {selectedImageAttrs.width || "100%"}
              </span>
            </div>

            {/* Caption / Title Input for Photo */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <Type size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={imageCaptionInput}
                onChange={(e) => setImageCaptionInput(e.target.value)}
                placeholder="Tulis judul / keterangan foto (caption)..."
                className="w-full bg-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    saveImageCaption()
                  }
                }}
              />
              <button
                type="button"
                onClick={saveImageCaption}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700 transition shrink-0 cursor-pointer"
              >
                Simpan Caption
              </button>
            </div>
          </div>
        )}

        <div className="overflow-auto relative min-h-[450px]">
          <EditorContent editor={editor} />

          {linkPopover && (
            <div className="absolute top-16 inset-x-2 z-50 flex flex-col items-stretch gap-2 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl backdrop-blur-md sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
                <LinkIcon size={15} className="text-cyan-400 shrink-0" />
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none sm:w-64"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyLink()
                    if (e.key === "Escape") setLinkPopover(false)
                  }}
                />
              </div>
              <button
                type="button"
                onClick={applyLink}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-700 transition-colors shadow-md"
              >
                <Check size={14} />
                Terapkan
              </button>
              <button
                type="button"
                onClick={() => setLinkPopover(false)}
                className="rounded-lg px-2 py-2 text-xs text-slate-400 hover:text-white transition"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminBeritaEditorMain
