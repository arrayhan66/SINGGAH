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
        className={`notification-bell h-6 w-6 min-[350px]:h-8 min-[350px]:w-8 sm:h-9 sm:w-9 ${
          unreadCount > 0 ? "has-unread" : ""
        }`}
        aria-label="Notifikasi"
      >
        <Bell
          size={18}
          fill="currentColor"
          fillOpacity={0.12}
          className="notification-bell-icon w-3 h-3 min-[350px]:w-3.5 min-[350px]:h-3.5 sm:w-4 sm:h-4"
        />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <div
        className={`hidden lg:block absolute left-1/2 -translate-x-1/2 top-full mt-3 w-80 max-h-[70vh] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-brand-dark/95 shadow-2xl backdrop-blur-xl transition-all duration-200 sm:w-96 max-w-[calc(100vw-1.5rem)] ${
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
