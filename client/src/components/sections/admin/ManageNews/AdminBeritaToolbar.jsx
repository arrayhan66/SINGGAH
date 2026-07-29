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

function ToolbarButton({ onClick, active, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-all ${
        active
          ? "bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400/40"
          : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
      }`}
    >
      {children}
    </button>
  )
}

function AdminBeritaToolbar({ editor, insertImage, insertLink }) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50 p-3">
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
        <Undo2 size={17} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
        <Redo2 size={17} />
      </ToolbarButton>

      <div className="h-5 w-[1px] bg-slate-300 mx-1" />

      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Tebal (Bold)"
      >
        <Bold size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Miring (Italic)"
      >
        <Italic size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Garis Bawah (Underline)"
      >
        <UnderlineIcon size={17} />
      </ToolbarButton>

      <div className="h-5 w-[1px] bg-slate-300 mx-1" />

      <ToolbarButton
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <Heading1 size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <Heading3 size={17} />
      </ToolbarButton>

      <div className="h-5 w-[1px] bg-slate-300 mx-1" />

      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <ListOrdered size={17} />
      </ToolbarButton>

      <div className="h-5 w-[1px] bg-slate-300 mx-1" />

      <ToolbarButton
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="Rata Kiri"
      >
        <AlignLeft size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="Rata Tengah"
      >
        <AlignCenter size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="Rata Kanan"
      >
        <AlignRight size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        title="Rata Kiri-Kanan (Justify)"
      >
        <AlignJustify size={17} />
      </ToolbarButton>

      <div className="h-5 w-[1px] bg-slate-300 mx-1" />

      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Kutipan"
      >
        <Quote size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("link")}
        onClick={insertLink}
        title="Sisipkan Link"
      >
        <LinkIcon size={17} />
      </ToolbarButton>

      <ToolbarButton onClick={insertImage} title="Sisipkan Foto / Galeri Foto">
        <ImageIcon size={17} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Garis Pemisah"
      >
        <Minus size={17} />
      </ToolbarButton>

      <div className="h-5 w-[1px] bg-slate-300 mx-1" />

      <ToolbarButton
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        title="Hapus Format"
      >
        <Eraser size={17} />
      </ToolbarButton>
    </div>
  )
}

export default AdminBeritaToolbar
