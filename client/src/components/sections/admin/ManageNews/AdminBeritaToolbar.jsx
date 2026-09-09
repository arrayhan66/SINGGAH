import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
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
  LetterText,
  AlignVerticalJustifyStart,
} from "lucide-react"

const FONT_SIZE_OPTIONS = [
  { label: "Normal", value: "" },
  { label: "Kecil (18)", value: "18px" },
  { label: "Sedang (20)", value: "20px" },
  { label: "Besar (24)", value: "24px" },
  { label: "Sangat Besar (28)", value: "28px" },
  { label: "Jumbo (34)", value: "34px" },
]

const FONT_FAMILY_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Times New Roman", value: "Georgia, 'Times New Roman', serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { label: "Courier", value: "'Courier New', monospace" },
]

const LINE_HEIGHT_OPTIONS = [
  { label: "Otomatis", value: "normal" },
  { label: "1", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "1.75", value: "1.75" },
  { label: "2", value: "2" },
  { label: "2.5", value: "2.5" },
  { label: "3", value: "3" },
]

const PARAGRAPH_SPACING_OPTIONS = [
  { label: "Standar", value: "" },
  { label: "Rapat", value: "0.25rem" },
  { label: "Normal", value: "0.6rem" },
  { label: "Sedang", value: "1rem" },
  { label: "Lebar", value: "1.5rem" },
  { label: "Ekstra Lebar", value: "2rem" },
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
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all sm:h-9 sm:w-9 sm:rounded-lg ${
disabled
              ? "bg-slate-800/50 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50"
              : active
                ? "bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400/40 cursor-pointer"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 cursor-pointer"
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarSelect({ value, options, onChange, title, icon: Icon }) {
  return (
    <div className="relative w-full sm:w-auto" title={title}>
      <select
        value={value}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full cursor-pointer appearance-none rounded-lg border border-slate-700 bg-slate-800 px-2 pr-6 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 focus:border-cyan-400 focus:outline-none sm:h-9 sm:w-auto"
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

  const currentFontSize = editor.getAttributes("textStyle").fontSize || ""

  const currentFontFamily = editor.getAttributes("textStyle").fontFamily || ""

  const currentLineHeight = editor.getAttributes("paragraph").lineHeight || "normal"

  const currentParagraphSpacing = editor.getAttributes("paragraph").marginBottom || ""

  return (
    <div className="editor-toolbar flex flex-wrap items-center gap-1 border-b border-slate-700 bg-slate-900 p-2 sm:gap-x-2 sm:gap-y-2 sm:p-3">
      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
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
      </div>

      {/* Font Size Dropdown — inline, hanya teks yang dipilih */}
      <div className="flex flex-wrap items-center gap-1 sm:border-l sm:border-slate-600 sm:pl-2">
      <ToolbarSelect
        title="Ukuran Huruf (hanya teks terpilih)"
        icon={Type}
        value={currentFontSize}
        options={FONT_SIZE_OPTIONS}
        onChange={(val) => {
          if (!val) {
            editor.chain().focus().unsetFontSize().run()
          } else {
            editor.chain().focus().setFontSize(val).run()
          }
        }}
      />

      {/* Font Family Dropdown — hanya teks terpilih */}
      <ToolbarSelect
        title="Tipe Font (hanya teks terpilih)"
        icon={LetterText}
        value={currentFontFamily}
        options={FONT_FAMILY_OPTIONS}
        onChange={(val) => {
          if (!val) {
            editor.chain().focus().unsetFontFamily().run()
          } else {
            editor.chain().focus().setFontFamily(val).run()
          }
        }}
      />

      {/* Line Spacing Dropdown */}
      <ToolbarSelect
        title="Spasi Baris (Line Height)"
        icon={AlignVerticalJustifyStart}
        value={currentLineHeight}
        options={LINE_HEIGHT_OPTIONS}
        onChange={(val) => {
          if (!val || val === "normal") {
            editor.chain().focus().unsetLineHeight().run()
          } else {
            editor.chain().focus().setLineHeight(val).run()
          }
        }}
      />

      {/* Paragraph Spacing Dropdown */}
      <ToolbarSelect
        title="Spasi Antar Paragraf"
        icon={AlignVerticalJustifyStart}
        value={currentParagraphSpacing}
        options={PARAGRAPH_SPACING_OPTIONS}
        onChange={(val) => {
          if (!val) {
            editor.chain().focus().unsetParagraphSpacing().run()
          } else {
            editor.chain().focus().setParagraphSpacing(val).run()
          }
        }}
      />

      </div>

      {/* Inline formatting */}
      <div className="flex flex-wrap items-center gap-1 sm:border-l sm:border-slate-600 sm:pl-2">
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
      </div>

      {/* Alignment */}
      <div className="flex flex-wrap items-center gap-1 sm:border-l sm:border-slate-600 sm:pl-2">
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
      </div>

      {/* Block & Insert */}
      <div className="flex items-center gap-1 sm:border-l sm:border-slate-600 sm:pl-2">
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
    </div>
  )
}

export default AdminBeritaToolbar
