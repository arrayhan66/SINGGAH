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

function ToolbarButton({ onClick, active, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
        active
          ? "bg-cyan-500 text-white"
          : "bg-white text-slate-700 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  )
}

function AdminBeritaToolbar({ editor, insertImage, insertLink }) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-300 bg-slate-100 p-3">
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify size={18} />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={insertLink}>
        <LinkIcon size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={insertImage}>
        <ImageIcon size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
      >
        <Eraser size={18} />
      </ToolbarButton>
    </div>
  )
}

export default AdminBeritaToolbar
