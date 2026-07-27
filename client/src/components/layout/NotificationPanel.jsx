import { CheckCheck, BellOff } from "lucide-react"
import {
  formatRelativeTime,
  notifIcon,
  notifBg,
  notifText,
} from "../../utils/notificationHelpers"

export default function NotificationPanel({
  unreadCount,
  isOpen,
  notifications,
  hasMore,
  isLoadingMore,
  onMarkAllRead,
  onLoadMore,
  onClickNotif,
}) {
  return (
    <div
      className={`absolute left-0 top-full z-50 w-full px-3 min-[350px]:px-5 md:px-8 lg:hidden transition-all duration-300 ${
        isOpen
          ? "mt-2 opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-2"
      }`}
    >
      <div className="mx-auto max-w-[1700px] overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Notifikasi</h3>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex cursor-pointer items-center gap-1 text-xs text-cyan-400 transition hover:text-cyan-300"
            >
              <CheckCheck size={14} />
              Tandai semua dibaca
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
              <BellOff size={24} />
              <p className="text-sm">Belum ada notifikasi</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => onClickNotif(notif)}
                className={`flex w-full cursor-pointer gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 ${
                  !notif.is_read ? "bg-cyan-400/5" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${notifBg(notif.type)}`}
                >
                  <span className={notifText(notif.type)}>
                    {notifIcon(notif.type)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm leading-snug ${
                      !notif.is_read
                        ? "font-medium text-white"
                        : "text-slate-300"
                    }`}
                  >
                    {notif.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                    {notif.message}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-600">
                    {formatRelativeTime(notif.created_at)}
                  </p>
                </div>
                {!notif.is_read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                )}
              </button>
            ))
          )}
        </div>

        {hasMore && (
          <div className="border-t border-white/10 px-4 py-2.5">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-full cursor-pointer text-center text-xs text-cyan-400 transition hover:text-cyan-300 disabled:opacity-50"
            >
              {isLoadingMore ? "Memuat..." : "Muat lebih banyak"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
