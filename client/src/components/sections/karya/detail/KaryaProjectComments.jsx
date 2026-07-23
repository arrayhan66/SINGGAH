import { MessageCircle, Send, UserCheck } from "lucide-react";
import GlassCard from "../../../ui/GlassCard";

function KaryaProjectComments({
  comments,
  isLoggedIn,
  newComment,
  setNewComment,
  handleAuthRedirect,
  handleAddComment,
  formatDate,
}) {
  return (
    <GlassCard className="mt-8 p-5 sm:p-10 2xl:mt-10 2xl:p-12">
      <h3 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl 2xl:text-2xl">
        <MessageCircle size={20} className="2xl:size-6" />
        Komentar ({comments.length})
      </h3>

      {!isLoggedIn ? (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-slate-300">
            Silakan login terlebih dahulu untuk bergabung dalam diskusi.
          </p>
          <button
            onClick={handleAuthRedirect}
            className="shrink-0 rounded-lg bg-cyan-400 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 cursor-pointer"
          >
            Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleAddComment} className="mt-4">
          <div className="flex flex-col gap-3">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis tanggapan atau diskusimu di sini..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none shadow-sm 2xl:text-base"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 cursor-pointer"
              >
                <Send size={14} />
                Kirim Komentar
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-3 2xl:gap-4">
        {comments.length > 0 ? (
          comments.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 sm:p-4 text-slate-200"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 2xl:h-10 2xl:w-10">
                <UserCheck size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">
                    {item.author}
                  </p>
                  {item.createdAt && (
                    <span className="shrink-0 text-[10px] sm:text-xs text-slate-400">
                      {formatDate(item.createdAt)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-300">
                  {item.text}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-xs sm:text-sm text-slate-400 py-4">
            Belum ada komentar.
          </p>
        )}
      </div>
    </GlassCard>
  );
}

export default KaryaProjectComments;
