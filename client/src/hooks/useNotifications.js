import { useState, useEffect, useCallback, useRef } from "react"
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
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
  const intervalRef = useRef(null)

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) setIsLoading(true)
      const result = await getNotifications(pageNum, 10)
      const items = result.items || []
      if (pageNum === 1) {
        setNotifications(items)
      } else {
        setNotifications((prev) => [...prev, ...items])
      }
      const unread = items.filter((n) => !n.is_read).length
      if (pageNum === 1) setUnreadCount(unread)
      setHasMore(pageNum < (result.pagination?.totalPages || 1))
    } catch {
      // silent fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const all = await getNotifications(1, 100)
      const unread = (all.items || []).filter((n) => !n.is_read).length
      setUnreadCount(unread)
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
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }, [])

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setPage(1)
        fetchNotifications(1)
      }
      return !prev
    })
  }, [fetchNotifications])

  const closePanel = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    fetchNotifications(1)
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [fetchNotifications, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    hasMore,
    isLoadingMore,
    togglePanel,
    closePanel,
    loadMore,
    handleMarkAsRead,
    handleMarkAllAsRead,
  }
}
