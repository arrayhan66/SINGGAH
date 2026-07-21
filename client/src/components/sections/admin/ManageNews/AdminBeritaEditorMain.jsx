import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect } from "react"
import "../../../../styles/tiptap.css"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import AdminBeritaToolbar from "./AdminBeritaToolbar"
import FileHandler from "@tiptap/extension-file-handler"

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eraser,
} from "lucide-react"

function AdminBeritaEditorMain({ formData, updateField }) {
  const editor = useEditor({
    extensions: [
      StarterKit,

      Underline,

      Image.configure({
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
        placeholder: "Mulai menulis artikel...",
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
                attrs: {
                  src: url,
                },
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
              .setImage({
                src: url,
              })
              .run()
          })
        },
      }),
    ],

    content: formData.contentText,

    onUpdate({ editor }) {
      updateField("contentText", editor.getHTML())
    },
  })

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
        .setImage({
          src: imageUrl,
          alt: file.name,
        })
        .run()
    }

    input.click()
  }

  function insertLink() {
    const url = window.prompt("Masukkan link")

    if (!url) return

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
      })
      .run()
  }

  return (
    <div className="flex flex-col gap-5">
      <input
        type="text"
        value={formData.title}
        onChange={(e) => updateField("title", e.target.value)}
        placeholder="Tambahkan judul"
        className="w-full bg-transparent text-2xl md:text-3xl font-bold text-white placeholder:text-slate-600 focus:outline-none"
      />

      <input
        type="text"
        value={formData.event}
        onChange={(e) => updateField("event", e.target.value)}
        placeholder="Nama event / kegiatan"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cyan-300 placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
      />

      <textarea
        value={formData.desc}
        onChange={(e) => updateField("desc", e.target.value)}
        rows={2}
        placeholder="Deskripsi singkat..."
        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
      />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-200 shadow-2xl">
        {/* Toolbar */}
        <AdminBeritaToolbar
          editor={editor}
          insertImage={insertImage}
          insertLink={insertLink}
        />

        {/* Editor */}
        <div className="overflow-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default AdminBeritaEditorMain
