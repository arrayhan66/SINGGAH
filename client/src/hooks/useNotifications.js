import { useState, useEffect, useCallback, useRef } from "react"
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  markAsUnread,
  deleteNotification,
  deleteAllNotifications,
  bulkUpdateNotifications,
  bulkDeleteNotifications,
} from "../services/notificationService"

const POLL_INTERVAL = 30000

export default function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const intervalRef = useRef(null)

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) setIsLoading(true)
      const result = await getNotifications(pageNum, 4)
      const items = result.items || []
      if (pageNum === 1) {
        setNotifications(items)
        setUnreadCount(
          result.unreadCount ??
            items.filter((n) => !n.is_read).length,
        )
      } else {
        setNotifications((prev) => [...prev, ...items])
      }
      setHasMore(pageNum < (result.pagination?.totalPages || 1))
    } catch {
      // silent fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const all = await getNotifications(1, 1)
      setUnreadCount(all.unreadCount ?? 0)
    } catch {
      // silent fail
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    const nextPage = page + 1
    await fetchNotifications(nextPage)
    setPage(nextPage)
    setIsLoadingMore(false)
  }, [page, isLoadingMore, hasMore, fetchNotifications])

  const handleMarkAsRead = useCallback(async (id) => {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const handleMarkAsUnread = useCallback(async (id) => {
    await markAsUnread(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
    )
    setUnreadCount((prev) => prev + 1)
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }, [])

  const handleDeleteNotification = useCallback(async (id) => {
    await deleteNotification(id)
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id)
      if (target && !target.is_read) {
        setUnreadCount((u) => Math.max(0, u - 1))
      }
      return prev.filter((n) => n.id !== id)
    })
    setSelectedIds((prev) => prev.filter((nid) => nid !== id))
  }, [])

  const handleDeleteAll = useCallback(async () => {
    await deleteAllNotifications()
    setNotifications([])
    setUnreadCount(0)
    setConfirmDeleteAll(false)
    setIsSelectionMode(false)
    setSelectedIds([])
  }, [])

  const enterSelectionMode = useCallback(() => {
    setSelectedIds([])
    setIsSelectionMode(true)
  }, [])

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false)
    setSelectedIds([])
  }, [])

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id],
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === notifications.length
        ? []
        : notifications.map((n) => n.id),
    )
  }, [notifications])

  const handleBulkAction = useCallback(
    async (action) => {
      if (selectedIds.length === 0) return
      setIsBulkLoading(true)
      try {
        if (action === "delete") {
          await bulkDeleteNotifications(selectedIds)
          setNotifications((prev) =>
            prev.filter((n) => !selectedIds.includes(n.id)),
          )
        } else {
          const isRead = action === "read"
          await bulkUpdateNotifications(selectedIds, action)
          setNotifications((prev) =>
            prev.map((n) =>
              selectedIds.includes(n.id) ? { ...n, is_read: isRead } : n,
            ),
          )
        }
        fetchUnreadCount()
        setSelectedIds([])
        setIsSelectionMode(false)
      } catch {
        // silent fail
      } finally {
        setIsBulkLoading(false)
      }
    },
    [selectedIds, fetchUnreadCount],
  )

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setPage(1)
        fetchNotifications(1)
      }
      return !prev
    })
  }, [fetchNotifications])

  const closePanel = useCallback(() => {
    setIsOpen(false)
    exitSelectionMode()
  }, [exitSelectionMode])

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      fetchNotifications(1)
    }, 0)
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL)
    return () => {
      clearTimeout(initialTimer)
      clearInterval(intervalRef.current)
    }
  }, [fetchNotifications, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    hasMore,
    isLoadingMore,
    isSelectionMode,
    selectedIds,
    isBulkLoading,
    confirmDeleteAll,
    setConfirmDeleteAll,
    togglePanel,
    closePanel,
    loadMore,
    handleMarkAsRead,
    handleMarkAsUnread,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleDeleteAll,
    enterSelectionMode,
    exitSelectionMode,
    handleToggleSelect,
    handleSelectAll,
    handleBulkAction,
  }
}
