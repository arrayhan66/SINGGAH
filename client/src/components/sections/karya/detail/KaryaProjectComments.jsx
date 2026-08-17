import { useRef, useState } from "react"
import {
  MessageCircle,
  Send,
  CornerDownRight,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react"
import GlassCard from "../../../ui/GlassCard"
import EmojiPicker from "../../../ui/EmojiPicker"
import api from "../../../../services/api"

function getInitial(name) {
  return (name || "?").charAt(0).toUpperCase()
}

function Avatar({ name, isAdmin, size = "md" }) {
  const sizeCls =
    size === "sm"
      ? "h-8 w-8 text-[11px]"
      : "h-10 w-10 text-sm sm:h-11 sm:w-11 sm:text-base"

  return (
    <div
      className={`${sizeCls} flex shrink-0 select-none items-center justify-center rounded-full border font-bold shadow-md ${
        isAdmin
          ? "border-amber-400/50 bg-gradient-to-br from-amber-500/40 to-orange-600/30 text-amber-200"
          : "border-cyan-400/40 bg-gradient-to-br from-cyan-500/40 to-blue-600/30 text-cyan-100"
      }`}
    >
      {getInitial(name)}
    </div>
  )
}

function CommentAvatar({ user: author }) {
  return <Avatar name={author?.name} isAdmin={author?.role === "admin"} />
}

function MentionText({ text }) {
  const parts = String(text || "").split(/(@[\w.-]+)/g)
  return (
    <>
      {parts.map((part, i) =>
        /^@[\w.-]+$/.test(part) ? (
          <span key={i} className="font-semibold text-cyan-300">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function isEdited(item) {
  if (!item?.created_at || !item?.updated_at) return false
  return new Date(item.updated_at).getTime() - new Date(item.created_at).getTime() > 1000
}

function EditForm({ initialValue, onSubmit, onCancel, placeholder, busy }) {
  const [value, setValue] = useState(initialValue)
  const editRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim() || busy) return
    onSubmit(value.trim())
  }

  function insertEmojiIntoEdit(emoji) {
    const el = editRef.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    setValue((prev) => prev.slice(0, start) + emoji + prev.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2.5">
      <textarea
        ref={editRef}
        rows={2}
        value={value}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-cyan-400/40 bg-white/5 p-3 text-sm text-white placeholder-slate-500 transition focus:border-cyan-400/70 focus:outline-none focus:ring-4 focus:ring-cyan-400/10"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <EmojiPicker onSelect={insertEmojiIntoEdit} closeOnSelect={false} direction="down" />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={busy || !value.trim()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={13} />
            {busy ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X size={13} />
            Batal
          </button>
        </div>
      </div>
    </form>
  )
}

function DeleteConfirm({ label, onConfirm, onCancel, busy }) {
  return (
    <div className="mt-2.5 inline-flex flex-wrap items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2">
      <span className="text-xs font-medium text-rose-200">{label}</span>
      <button
        onClick={onConfirm}
        disabled={busy}
        className="cursor-pointer rounded-lg bg-rose-500 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Menghapus..." : "Hapus"}
      </button>
      <button
        onClick={onCancel}
        disabled={busy}
        className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Batal
      </button>
    </div>
  )
}

function ReplyItem({
  reply,
  currentUserId,
  isAdmin,
  isLoggedIn,
  formatDate,
  onEdit,
  onDelete,
  onReply,
}) {
  const author = reply.User || {}
  const canModify = isAdmin || reply.user_id === currentUserId

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleEdit(text) {
    setBusy(true)
    try {
      await onEdit(reply.id, text)
      setEditing(false)
    } catch (err) {
      console.error("Failed to update reply:", err)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await onDelete(reply.id)
    } catch (err) {
      console.error("Failed to delete reply:", err)
      setConfirmDelete(false)
      setBusy(false)
    }
  }

  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      <Avatar name={author.name} isAdmin={author.role === "admin"} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2">
            <p className="text-xs font-semibold leading-none text-white sm:text-sm">{author.name || "Anonim"}</p>
            {author.role === "admin" && (
              <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                Admin
              </span>
            )}
            {isEdited(reply) && <span className="text-[10px] italic text-slate-500">(diedit)</span>}
            <span className="text-[10px] text-slate-500 sm:text-[11px]">· {formatDate(reply.created_at)}</span>
          </div>
          {author.username && (
            <span className="mt-0.5 text-[10px] font-medium leading-none text-cyan-300/70">@{author.username}</span>
          )}
        </div>

        {editing ? (
          <EditForm
            initialValue={reply.text}
            busy={busy}
            placeholder="Perbarui balasanmu..."
            onSubmit={handleEdit}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <p className="mt-1 text-xs leading-relaxed text-slate-300 break-words sm:text-sm">
            <MentionText text={reply.text} />
          </p>
        )}

        {!editing && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <button
              onClick={() => onReply(author)}
              title={isLoggedIn ? `Balas ${author.name || "user"}` : "Login untuk membalas"}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                isLoggedIn
                  ? "text-cyan-300/90 hover:bg-cyan-500/10 hover:text-cyan-300"
                  : "cursor-not-allowed text-slate-600"
              }`}
            >
              <CornerDownRight size={11} />
              Balas
            </button>
            {canModify && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-white/5 hover:text-cyan-300"
              >
                <Pencil size={11} />
                Edit
              </button>
            )}
            {canModify && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash2 size={11} />
                Hapus
              </button>
            )}
          </div>
        )}

        {confirmDelete && (
          <DeleteConfirm
            label="Hapus balasan ini?"
            busy={busy}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </div>
    </div>
  )
}

function ReplyForm({ replyRef, replyText, setReplyText, insertEmojiIntoReply, handleReplySubmit, setShowReply, setReplyText: setRT, busy }) {
  return (
    <form onSubmit={handleReplySubmit} className="mt-3">
      <div className="flex items-start gap-2.5">
        <Avatar name={null} size="sm" />
        <div className="flex-1">
          <textarea
            ref={replyRef}
            rows={2}
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Tulis balasanmu..."
            className="w-full resize-y rounded-xl border border-white/15 bg-white/5 p-2.5 text-xs text-white placeholder-slate-500 transition focus:border-cyan-400/60 focus:outline-none focus:ring-4 focus:ring-cyan-400/10 sm:text-sm"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <EmojiPicker onSelect={insertEmojiIntoReply} closeOnSelect={false} direction="down" />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setRT("")
                  setShowReply(false)
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={13} />
                Batal
              </button>
              <button
                type="submit"
                disabled={busy || !replyText.trim()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={13} />
                {busy ? "Mengirim..." : "Kirim Balasan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

function CommentItem({
  comment,
  currentUserId,
  isAdmin,
  isLoggedIn,
  formatDate,
  onAddReply,
  onEditComment,
  onDeleteComment,
  onEditReply,
  onDeleteReply,
}) {
  const author = comment.User || {}
  const replies = Array.isArray(comment.replies) ? comment.replies : []
  const canModify = isAdmin || comment.user_id === currentUserId

  const [showReply, setShowReply] = useState(false)
  const [replyingToIndex, setReplyingToIndex] = useState(null)
  const [replyText, setReplyText] = useState("")
  const replyRef = useRef(null)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  function insertEmojiIntoReply(emoji) {
    const el = replyRef.current
    const start = el?.selectionStart ?? replyText.length
    const end = el?.selectionEnd ?? replyText.length
    setReplyText((prev) => prev.slice(0, start) + emoji + prev.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  async function handleReplySubmit(e) {
    e.preventDefault()
    if (!replyText.trim() || busy) return
    setBusy(true)
    try {
      await onAddReply(comment.id, replyText.trim())
      setReplyText("")
      setShowReply(false)
      setReplyingToIndex(null)
    } catch (err) {
      console.error("Failed to add reply:", err)
    } finally {
      setBusy(false)
    }
  }

  async function handleEdit(text) {
    setBusy(true)
    try {
      await onEditComment(comment.id, text)
      setEditing(false)
    } catch (err) {
      console.error("Failed to update comment:", err)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await onDeleteComment(comment.id)
    } catch (err) {
      console.error("Failed to delete comment:", err)
      setConfirmDelete(false)
      setBusy(false)
    }
  }

  async function handleEditReply(replyId, text) {
    await onEditReply(comment.id, replyId, text)
  }

  async function handleDeleteReply(replyId) {
    await onDeleteReply(comment.id, replyId)
  }

  function startReplyWithMention(targetUser, replyIndex) {
    if (!isLoggedIn) return
    const tag = `@${targetUser?.username || targetUser?.name || "user"} `
    setReplyText((prev) => tag + prev.replace(/^@[\w.-]+\s*/, ""))
    setShowReply(true)
    setReplyingToIndex(replyIndex)
    requestAnimationFrame(() => {
      const el = replyRef.current
      el?.focus()
      const pos = el?.value.length ?? 0
      el?.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-white/15 sm:p-4">
      <div className="flex items-start gap-3">
        <CommentAvatar user={author} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2">
              <p className="text-sm font-semibold leading-none text-white">{author.name || "Anonim"}</p>
              {author.role === "admin" && (
                <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Admin
                </span>
              )}
              {isEdited(comment) && <span className="text-[10px] italic text-slate-500">(diedit)</span>}
              <span className="text-[10px] text-slate-500 sm:text-[11px]">· {formatDate(comment.created_at)}</span>
            </div>
            {author.username && (
              <span className="mt-0.5 text-[10px] font-medium leading-none text-cyan-300/70">@{author.username}</span>
            )}
          </div>

          {editing ? (
            <EditForm
              initialValue={comment.text}
              busy={busy}
              placeholder="Perbarui komentarmu..."
              onSubmit={handleEdit}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300 break-words">
              <MentionText text={comment.text} />
            </p>
          )}

          {!editing && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <button
                onClick={() => {
                  if (!isLoggedIn) return
                  if (showReply && replyingToIndex === null) {
                    setShowReply(false)
                  } else {
                    startReplyWithMention(author, null)
                  }
                }}
                title={isLoggedIn ? "Balas komentar ini" : "Login untuk membalas"}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                  isLoggedIn
                    ? "text-cyan-300/90 hover:bg-cyan-500/10 hover:text-cyan-300"
                    : "cursor-not-allowed text-slate-600"
                }`}
              >
                <CornerDownRight size={12} />
                Balas
              </button>
              {canModify && (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-white/5 hover:text-cyan-300"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              )}
              {canModify && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <Trash2 size={12} />
                  Hapus
                </button>
              )}
            </div>
          )}

          {confirmDelete && (
            <DeleteConfirm
              label="Hapus komentar ini?"
              busy={busy}
              onConfirm={handleDelete}
              onCancel={() => setConfirmDelete(false)}
            />
          )}

          {showReply && replyingToIndex === null && (
            <ReplyForm
              replyRef={replyRef}
              replyText={replyText}
              setReplyText={setReplyText}
              insertEmojiIntoReply={insertEmojiIntoReply}
              handleReplySubmit={handleReplySubmit}
              setShowReply={setShowReply}
              busy={busy}
            />
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-3 space-y-3 border-l-2 border-cyan-400/15 pl-3 sm:mt-4 sm:pl-5">
          {replies.map((reply, idx) => (
            <div key={reply.id}>
              <ReplyItem
                reply={reply}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                isLoggedIn={isLoggedIn}
                formatDate={formatDate}
                onReply={(author) => startReplyWithMention(author, idx)}
                onEdit={handleEditReply}
                onDelete={handleDeleteReply}
              />
              {showReply && replyingToIndex === idx && (
                <ReplyForm
                  replyRef={replyRef}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  insertEmojiIntoReply={insertEmojiIntoReply}
                  handleReplySubmit={handleReplySubmit}
                  setShowReply={setShowReply}
                  busy={busy}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function KaryaProjectComments({
  comments,
  setComments,
  projectSlug,
  isLoggedIn,
  user,
  handleAuthRedirect,
  formatDate,
}) {
  const [newComment, setNewComment] = useState("")
  const [posting, setPosting] = useState(false)
  const commentRef = useRef(null)

  const currentUserId = user?.id
  const isAdmin = user?.role === "admin"
  const authorShape = {
    id: currentUserId,
    name: user?.name || "Anonim",
    username: user?.username,
    role: user?.role,
  }

  function insertEmojiIntoComment(emoji) {
    const el = commentRef.current
    const start = el?.selectionStart ?? newComment.length
    const end = el?.selectionEnd ?? newComment.length
    setNewComment((prev) => prev.slice(0, start) + emoji + prev.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  function requireAuth() {
    if (isLoggedIn) return true
    handleAuthRedirect()
    return false
  }

  async function handleAddComment(e) {
    e.preventDefault()
    if (!requireAuth()) return
    const text = newComment.trim()
    if (!text || posting) return
    setPosting(true)
    try {
      const res = await api.post(`/projects/${projectSlug}/comments`, { text })
      const created = res.data.data
      setComments((prev) => [{ ...created, User: authorShape, replies: [] }, ...prev])
      setNewComment("")
    } catch (err) {
      console.error("Failed to add comment:", err)
    } finally {
      setPosting(false)
    }
  }

  async function addReply(commentId, text) {
    if (!requireAuth()) return
    const res = await api.post(
      `/projects/${projectSlug}/comments/${commentId}/replies`,
      { text },
    )
    const created = res.data.data
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies || []), { ...created, User: authorShape }] }
          : c,
      ),
    )
  }

  async function editComment(commentId, text) {
    const res = await api.put(`/projects/${projectSlug}/comments/${commentId}`, { text })
    const updated = res.data.data
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, text: updated.text, updated_at: updated.updated_at }
          : c,
      ),
    )
  }

  async function editReply(commentId, replyId, text) {
    const res = await api.put(
      `/projects/${projectSlug}/comments/${commentId}/replies/${replyId}`,
      { text },
    )
    const updated = res.data.data
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: (c.replies || []).map((r) =>
                r.id === replyId
                  ? { ...r, text: updated.text, updated_at: updated.updated_at }
                  : r,
              ),
            }
          : c,
      ),
    )
  }

  async function deleteComment(commentId) {
    await api.delete(`/projects/${projectSlug}/comments/${commentId}`)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  async function deleteReply(commentId, replyId) {
    await api.delete(
      `/projects/${projectSlug}/comments/${commentId}/replies/${replyId}`,
    )
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: (c.replies || []).filter((r) => r.id !== replyId) }
          : c,
      ),
    )
  }

  return (
    <GlassCard id="komentar" className="mt-8 p-4 sm:p-8 lg:p-10 2xl:mt-10 2xl:p-12">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl 2xl:text-2xl">
          <MessageCircle size={20} className="2xl:size-6" />
          Komentar
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 sm:text-sm">
            {comments.reduce(
              (total, c) => total + 1 + (c.replies?.length || 0),
              0,
            )}
          </span>
        </h3>
      </div>

      {isLoggedIn ? (
        <form onSubmit={handleAddComment} className="mt-5">
          <div className="flex items-start gap-3">
            <Avatar name={user?.name} isAdmin={isAdmin} />
            <div className="min-w-0 flex-1">
              <textarea
                ref={commentRef}
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis tanggapan atau diskusimu di sini..."
                className="w-full resize-y rounded-2xl border border-white/15 bg-white/5 p-3.5 text-sm text-white placeholder-slate-500 transition focus:border-cyan-400/60 focus:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-cyan-400/10 2xl:text-base"
              />
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
                <EmojiPicker onSelect={insertEmojiIntoComment} showLabel closeOnSelect={false} direction="down" />
                <button
                  type="submit"
                  disabled={posting || !newComment.trim()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                  <Send size={14} />
                  {posting ? "Mengirim..." : "Kirim Komentar"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/5 to-transparent p-4 text-center sm:flex-row sm:text-left sm:p-5">
          <p className="text-xs text-slate-300 sm:text-sm">
            Silakan login terlebih dahulu untuk menulis komentar dan membalas diskusi.
          </p>
          <button
            onClick={handleAuthRedirect}
            className="shrink-0 cursor-pointer rounded-xl bg-cyan-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 sm:text-sm"
          >
            Login untuk Berkomentar
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 2xl:mt-8 2xl:gap-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              isLoggedIn={isLoggedIn}
              formatDate={formatDate}
              onAddReply={addReply}
              onEditComment={editComment}
              onDeleteComment={deleteComment}
              onEditReply={editReply}
              onDeleteReply={deleteReply}
            />
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
            <MessageCircle size={28} className="text-slate-600" />
            <p className="text-xs text-slate-400 sm:text-sm">Belum ada komentar.</p>
            <p className="text-[11px] text-slate-500">
              Jadilah yang pertama memulai diskusi!
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

export default KaryaProjectComments
