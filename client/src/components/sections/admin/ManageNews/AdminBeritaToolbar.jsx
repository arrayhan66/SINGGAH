import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
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
  Type,
} from "lucide-react"

const HEADING_OPTIONS = [
  { label: "Normal", value: 0 },
  { label: "Heading 1", value: 1 },
  { label: "Heading 2", value: 2 },
  { label: "Heading 3", value: 3 },
]

function ToolbarButton({ onClick, active, children, title, disabled }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick?.()
      }}
      title={title}
      disabled={disabled}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
        disabled
          ? "bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed opacity-50"
          : active
            ? "bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400/40 cursor-pointer"
            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarSelect({ value, options, onChange, title, icon: Icon }) {
  return (
    <div className="relative" title={title}>
      <select
        value={value}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-2 pr-6 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:border-cyan-400 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
      {Icon && (
        <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={12} />
        </div>
      )}
    </div>
  )
}

function AdminBeritaToolbar({ editor, insertImage, insertLink }) {
  if (!editor) return null

  const currentHeading = (() => {
    for (let i = 1; i <= 3; i++) {
      if (editor.isActive("heading", { level: i })) return String(i)
    }
    return "0"
  })()

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50 p-3">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo2 size={17} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo2 size={17} />
      </ToolbarButton>

      <div className="h-5 w-[1px] bg-slate-300 mx-1" />

      {/* Heading Dropdown — works like Word */}
      <ToolbarSelect
        title="Format Heading / Paragraf"
        icon={Type}
        value={currentHeading}
        options={HEADING_OPTIONS}
        onChange={(val) => {
          const level = Number(val)
          if (level === 0) {
            editor.chain().focus().setParagraph().run()
          } else {
            editor.chain().focus().toggleHeading({ level }).run()
          }
        }}
      />

      <div className="h-5 w-[1px] bg-slate-300 mx-1" />

      {/* Inline formatting */}
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

      {/* List */}
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

      {/* Alignment */}
      <ToolbarButton
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => {
          if (editor.isActive({ textAlign: "left" })) {
            editor.chain().focus().unsetTextAlign().run()
          } else {
            editor.chain().focus().setTextAlign("left").run()
          }
        }}
        title="Rata Kiri"
      >
        <AlignLeft size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => {
          if (editor.isActive({ textAlign: "center" })) {
            editor.chain().focus().unsetTextAlign().run()
          } else {
            editor.chain().focus().setTextAlign("center").run()
          }
        }}
        title="Rata Tengah"
      >
        <AlignCenter size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => {
          if (editor.isActive({ textAlign: "right" })) {
            editor.chain().focus().unsetTextAlign().run()
          } else {
            editor.chain().focus().setTextAlign("right").run()
          }
        }}
        title="Rata Kanan"
      >
        <AlignRight size={17} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => {
          if (editor.isActive({ textAlign: "justify" })) {
            editor.chain().focus().unsetTextAlign().run()
          } else {
            editor.chain().focus().setTextAlign("justify").run()
          }
        }}
        title="Rata Kiri-Kanan (Justify)"
      >
        <AlignJustify size={17} />
      </ToolbarButton>

      <div className="h-5 w-[1px] bg-slate-300 mx-1" />

      {/* Block & Insert */}
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
    </div>
  )
}

export default AdminBeritaToolbar
