import { forwardRef } from "react";
import { Bell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = forwardRef(function NotificationBell(
  {
    unreadCount,
    isOpen,
    notifications,
    hasMore,
    isLoadingMore,
    isSelectionMode,
    selectedIds,
    isBulkLoading,
    onToggle,
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
  },
  ref,
) {
  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 min-[350px]:h-9 min-[350px]:w-9 sm:h-10 sm:w-10"
        aria-label="Notifikasi"
      >
        <Bell size={18} className="w-3.5 h-3.5 min-[350px]:w-4 min-[350px]:h-4 sm:w-[18px] sm:h-[18px]" />
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
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          isBulkLoading={isBulkLoading}
          onMarkAllRead={onMarkAllRead}
          onLoadMore={onLoadMore}
          onClickNotif={onClickNotif}
          onDeleteNotif={onDeleteNotif}
          onMarkUnread={onMarkUnread}
          onEnterSelection={onEnterSelection}
          onExitSelection={onExitSelection}
          onToggleSelect={onToggleSelect}
          onSelectAll={onSelectAll}
          onBulkAction={onBulkAction}
          onRequestDeleteAll={onRequestDeleteAll}
        />
      </div>
    </div>
  );
});

export default NotificationBell;
