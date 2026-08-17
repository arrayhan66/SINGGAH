import {
  BellOff,
  Check,
  CheckCheck,
  ListChecks,
  Mail,
  Square,
  SquareCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  formatRelativeTime,
  notifIcon,
  notifBg,
  notifText,
} from "../../utils/notificationHelpers";

const iconBtn =
  "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40";

export default function NotificationDropdown({
  notifications,
  unreadCount,
  hasMore,
  isLoadingMore,
  isSelectionMode,
  selectedIds,
  isBulkLoading,
  onMarkAllRead,
  onLoadMore,
  onClickNotif,
  onDeleteNotif,
  onMarkUnread,
  onEnterSelection,
  onExitSelection,
  onToggleSelect,
  onSelectAll,
  onBulkAction,
  onRequestDeleteAll,
}) {
  const allSelected =
    notifications.length > 0 && selectedIds.length === notifications.length;

  return (
    <>
      {/* HEADER */}
      <div
        className={`flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 ${
          isSelectionMode ? "bg-cyan-400/[0.06]" : "bg-white/[0.02]"
        }`}
      >
        {isSelectionMode ? (
          <>
            <div className="flex min-w-0 items-center gap-2">
              <button
                onClick={onSelectAll}
                disabled={notifications.length === 0}
                className={`${iconBtn} h-7 w-7 text-slate-400 hover:bg-white/5 hover:text-cyan-300`}
                title={allSelected ? "Batalkan semua" : "Pilih semua"}
                aria-label={allSelected ? "Batalkan semua" : "Pilih semua"}
              >
                {allSelected ? (
                  <SquareCheck size={17} className="text-cyan-400" />
                ) : (
                  <Square size={17} />
                )}
              </button>
              <h3 className="truncate text-sm font-semibold text-white">
                {selectedIds.length > 0
                  ? `${selectedIds.length} dipilih`
                  : "Pilih notifikasi"}
              </h3>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                onClick={() => onBulkAction("read")}
                disabled={selectedIds.length === 0 || isBulkLoading}
                className={`${iconBtn} h-7 w-7 text-emerald-400 hover:bg-emerald-400/10`}
                title="Tandai dibaca"
                aria-label="Tandai dibaca"
              >
                <Check size={15} />
              </button>
              <button
                onClick={() => onBulkAction("unread")}
                disabled={selectedIds.length === 0 || isBulkLoading}
                className={`${iconBtn} h-7 w-7 text-amber-400 hover:bg-amber-400/10`}
                title="Tandai belum dibaca"
                aria-label="Tandai belum dibaca"
              >
                <Mail size={15} />
              </button>
              <button
                onClick={() => onBulkAction("delete")}
                disabled={selectedIds.length === 0 || isBulkLoading}
                className={`${iconBtn} h-7 w-7 text-red-400 hover:bg-red-400/10`}
                title="Hapus terpilih"
                aria-label="Hapus terpilih"
              >
                <Trash2 size={15} />
              </button>
              <span className="mx-1 h-4 w-px bg-white/10" />
              <button
                onClick={onExitSelection}
                disabled={isBulkLoading}
                className={`${iconBtn} h-7 w-7 text-slate-400 hover:bg-white/5 hover:text-white`}
                title="Batal"
                aria-label="Batal"
              >
                <X size={15} />
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-white">Notifikasi</h3>
            <div className="flex shrink-0 items-center gap-0.5">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className={`${iconBtn} text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300`}
                  title="Tandai semua dibaca"
                  aria-label="Tandai semua dibaca"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onEnterSelection}
                  className={`${iconBtn} text-slate-400 hover:bg-white/5 hover:text-cyan-300`}
                  title="Pilih notifikasi"
                  aria-label="Pilih notifikasi"
                >
                  <ListChecks size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onRequestDeleteAll}
                  className={`${iconBtn} text-slate-500 hover:bg-red-400/10 hover:text-red-400`}
                  title="Hapus semua notifikasi"
                  aria-label="Hapus semua notifikasi"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* LIST */}
      <div className="max-h-72 overflow-y-auto sm:max-h-80">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-600">
              <BellOff size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                Belum ada notifikasi
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Notifikasi baru akan muncul di sini
              </p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => {
            const isSelected = selectedIds.includes(notif.id);
            return (
              <div
                key={notif.id}
                className={`group flex items-center gap-2 border-b border-white/5 px-3 py-2.5 transition-colors duration-150 ${
                  isSelected
                    ? "bg-cyan-400/10"
                    : !notif.is_read
                      ? "bg-cyan-400/[0.04]"
                      : "hover:bg-white/[0.04]"
                }`}
              >
                {isSelectionMode && (
                  <button
                    onClick={() => onToggleSelect(notif.id)}
                    disabled={isBulkLoading}
                    className={`shrink-0 cursor-pointer rounded-md p-0.5 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? "text-cyan-400"
                        : "text-slate-500 hover:text-cyan-300"
                    }`}
                    aria-label={isSelected ? "Batalkan pilihan" : "Pilih"}
                  >
                    {isSelected ? (
                      <SquareCheck size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                )}

                <button
                  onClick={() =>
                    isSelectionMode
                      ? onToggleSelect(notif.id)
                      : onClickNotif(notif)
                  }
                  disabled={isBulkLoading}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left disabled:cursor-not-allowed"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${notifBg(notif.type)}`}
                  >
                    <span className={notifText(notif.type)}>
                      {notifIcon(notif.type)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[13px] leading-snug ${
                        !notif.is_read
                          ? "font-semibold text-white"
                          : "font-medium text-slate-300"
                      }`}
                    >
                      {notif.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {notif.message}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {formatRelativeTime(notif.created_at)}
                    </p>
                  </div>
                </button>

                {!isSelectionMode && (
                  <div className="flex shrink-0 flex-col items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-200 sm:group-hover:opacity-100">
                    {notif.is_read && (
                      <button
                        onClick={() => onMarkUnread(notif.id)}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-amber-400/10 hover:text-amber-400"
                        title="Tandai belum dibaca"
                        aria-label="Tandai belum dibaca"
                      >
                        <Mail size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteNotif(notif.id)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-red-400/10 hover:text-red-400"
                      title="Hapus notifikasi"
                      aria-label="Hapus notifikasi"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                {!notif.is_read && !isSelectionMode && (
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,.6)]" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      {(hasMore || (!isSelectionMode && notifications.length > 0)) && (
        <div className="border-t border-white/10 px-4 py-2">
          {hasMore ? (
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-full cursor-pointer rounded-lg py-1.5 text-center text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/5 hover:text-cyan-300 disabled:opacity-50"
            >
              {isLoadingMore ? "Memuat..." : "Muat lebih banyak"}
            </button>
          ) : (
            <p className="py-1 text-center text-[11px] text-slate-600">
              Semua notifikasi sudah dimuat
            </p>
          )}
        </div>
      )}
    </>
  );
}
