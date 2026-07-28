import { forwardRef } from "react";
import { Bell, CheckCheck, BellOff } from "lucide-react";
import {
  formatRelativeTime,
  notifIcon,
  notifBg,
  notifText,
} from "../../utils/notificationHelpers";

const NotificationBell = forwardRef(function NotificationBell(
  {
    unreadCount,
    isOpen,
    notifications,
    hasMore,
    isLoadingMore,
    onToggle,
    onMarkAllRead,
    onLoadMore,
    onClickNotif,
  },
  ref,
) {
  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
        aria-label="Notifikasi"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <div
        className={`hidden lg:block absolute left-1/2 -translate-x-1/2 top-full mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 shadow-2xl backdrop-blur-xl transition-all duration-200 sm:w-96 max-w-[calc(100vw-1.5rem)] ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
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

        <div className="max-h-80 overflow-y-auto">
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
  );
});

export default NotificationBell;
