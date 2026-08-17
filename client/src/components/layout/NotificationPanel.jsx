import NotificationDropdown from "./NotificationDropdown";

export default function NotificationPanel({
  isOpen,
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
  return (
    <div
      className={`fixed left-3 right-3 top-20 z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-white/10 bg-brand-dark/95 backdrop-blur-xl shadow-2xl lg:hidden transition-all duration-300 ${
        isOpen
          ? "opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="overflow-hidden">
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
}
