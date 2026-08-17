import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import api from "../services/api"
import { normalizeMedia, formatBytes, getFileCategory } from "../utils/mediaHelpers"

export default function useMediaLibrary() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [copiedId, setCopiedId] = useState(null)
  const [view, setView] = useState("list")
  const [previewItem, setPreviewItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [notification, setNotification] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterPos, setFilterPos] = useState(null)

  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)
  const filterBtnRef = useRef(null)
  const filterPanelRef = useRef(null)

  const fetchMedia = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true)
    try {
      const res = await api.get("/media")
      const items = res.data.data || []
      setMedia(items.map(normalizeMedia))
    } catch (err) {
      console.error("Failed to fetch media:", err)
      setMedia([])
    } finally {
      if (showSkeleton) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  useEffect(() => {
    function handleClickOutside(e) {
      const inButton =
        filterBtnRef.current && filterBtnRef.current.contains(e.target)
      const inPanel =
        filterPanelRef.current && filterPanelRef.current.contains(e.target)
      if (!inButton && !inPanel) {
        setFilterOpen(false)
      }
    }
    function handleClose() {
      setFilterOpen(false)
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("scroll", handleClose, true)
      window.addEventListener("resize", handleClose)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        window.removeEventListener("scroll", handleClose, true)
        window.removeEventListener("resize", handleClose)
      }
    }
  }, [filterOpen])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setPreviewItem(null)
        setDeleteTarget(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  function toggleTypeFilter() {
    if (!filterOpen && filterBtnRef.current) {
      const rect = filterBtnRef.current.getBoundingClientRect()
      setFilterPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      })
    }
    setFilterOpen((v) => !v)
  }

  function showNotif(msg, type = "success") {
    setNotification({ msg, type })
  }

  async function uploadFiles(fileArray) {
    if (fileArray.length === 0) return

    const formData = new FormData()
    fileArray.forEach((file) => formData.append("files", file))

    setUploading(true)
    try {
      const res = await api.post("/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const uploaded = res.data.data
      if (Array.isArray(uploaded) && uploaded.length > 0) {
        setMedia((prev) => [...uploaded.map(normalizeMedia), ...prev])
      } else {
        await fetchMedia(false)
      }
      showNotif(`${fileArray.length} file berhasil diupload`)
    } catch (err) {
      console.error("Failed to upload media:", err)
      showNotif(
        err?.response?.data?.message || "Gagal mengupload file",
        "error",
      )
    } finally {
      setUploading(false)
    }
  }

  function addFiles(files) {
    uploadFiles(Array.from(files))
  }

  function handleFileSelect(e) {
    const files = e.target.files
    if (files?.length) {
      addFiles(files)
    }
    e.target.value = ""
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDragEnter(e) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer?.types?.includes("Files")) {
      setIsDragging(true)
    }
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    const files = e.dataTransfer?.files
    if (files?.length) {
      addFiles(files)
    }
  }

  const handleDelete = useCallback(
    (id) => {
      setDeleteTarget(media.find((m) => m.id === id))
    },
    [media],
  )

  function confirmDelete(id) {
    api
      .delete(`/media/${id}`)
      .then(() => {
        showNotif("File berhasil dihapus")
        return fetchMedia(false)
      })
      .catch((err) => {
        console.error("Failed to delete media:", err)
        showNotif(
          err?.response?.data?.message || "Gagal menghapus file",
          "error",
        )
      })
      .finally(() => {
        setDeleteTarget(null)
      })
  }

  function handleCopyUrl(item) {
    navigator.clipboard.writeText(item.url)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
    showNotif("URL berhasil disalin")
  }

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return media.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(s)
      const matchType =
        typeFilter === "all" || getFileCategory(m.type) === typeFilter
      return matchSearch && matchType
    })
  }, [media, search, typeFilter])

  const totalSize = useMemo(() => {
    const total = media.reduce((acc, m) => acc + (m.rawBytes || 0), 0)
    return formatBytes(total)
  }, [media])

  const stats = useMemo(
    () => ({
      total: media.length,
      images: media.filter((m) => m.type?.startsWith("image/")).length,
      videos: media.filter((m) => m.type?.startsWith("video/")).length,
      documents: media.filter(
        (m) =>
          m.type &&
          !m.type.startsWith("image/") &&
          !m.type.startsWith("video/"),
      ).length,
    }),
    [media],
  )

  const typeCounts = useMemo(
    () => ({
      all: media.length,
      image: stats.images,
      video: stats.videos,
      document: stats.documents,
    }),
    [media, stats],
  )

  return {
    media,
    loading,
    uploading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    copiedId,
    view,
    setView,
    previewItem,
    setPreviewItem,
    deleteTarget,
    setDeleteTarget,
    isDragging,
    notification,
    setNotification,
    filterOpen,
    setFilterOpen,
    filterPos,
    fileInputRef,
    filterBtnRef,
    filterPanelRef,
    filtered,
    totalSize,
    stats,
    typeCounts,
    fetchMedia,
    toggleTypeFilter,
    showNotif,
    uploadFiles,
    handleFileSelect,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDelete,
    confirmDelete,
    handleCopyUrl,
  }
}
