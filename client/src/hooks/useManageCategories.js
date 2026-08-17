import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import api from "../services/api"
import { slugify } from "../utils/categoryHelpers"

const INITIAL_VISIBLE = 9

export const stateTabs = [
  { value: "all", label: "Semua" },
  { value: "used", label: "Berisi Project" },
  { value: "empty", label: "Kosong" },
]

export default function useManageCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState(null)
  const [notification, setNotification] = useState(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories")
      const items = res.data.data.items || res.data.data || []
      setCategories(items)
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    function handleClickOutside(e) {
      const inButton = buttonRef.current && buttonRef.current.contains(e.target)
      const inPanel = panelRef.current && panelRef.current.contains(e.target)
      if (!inButton && !inPanel) {
        setIsOpen(false)
      }
    }
    function handleClose() {
      setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("scroll", handleClose, true)
      window.addEventListener("resize", handleClose)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        window.removeEventListener("scroll", handleClose, true)
        window.removeEventListener("resize", handleClose)
      }
    }
  }, [isOpen])

  const filterKey = `${search}|${stateFilter}`
  const [activeFilter, setActiveFilter] = useState(filterKey)
  if (filterKey !== activeFilter) {
    setActiveFilter(filterKey)
    setShowAll(false)
  }

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return categories.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(s)
      const matchState =
        stateFilter === "all" ||
        (stateFilter === "used" ? c.projectCount > 0 : c.projectCount === 0)
      return matchSearch && matchState
    })
  }, [categories, search, stateFilter])

  const stateCounts = useMemo(() => ({
    all: categories.length,
    used: categories.filter((c) => c.projectCount > 0).length,
    empty: categories.filter((c) => c.projectCount === 0).length,
  }), [categories])

  const visibleCategories = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE)

  function notify(message, type) {
    setNotification({ message, type })
  }

  function toggleDropdown() {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      })
    }
    setIsOpen((v) => !v)
  }

  function handleOpenAdd() {
    setEditing(null)
    setFormName("")
    setFormDesc("")
    setShowForm(true)
  }

  function handleOpenEdit(cat) {
    setEditing(cat)
    setFormName(cat.name)
    setFormDesc(cat.description || "")
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditing(null)
    setFormName("")
    setFormDesc("")
  }

  async function handleSave() {
    if (!formName.trim()) return
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, {
          name: formName.trim(),
          description: formDesc.trim(),
        })
        notify("Kategori berhasil diperbarui", "success")
      } else {
        await api.post("/categories", {
          name: formName.trim(),
          slug: slugify(formName.trim()),
          description: formDesc.trim(),
        })
        notify("Kategori berhasil ditambahkan", "success")
      }
      await fetchCategories()
      handleCloseForm()
    } catch (err) {
      const message = err.response?.data?.message || "Gagal menyimpan kategori"
      notify(message, "error")
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await api.delete(`/categories/${deleteTarget.id}`)
      notify("Kategori berhasil dihapus", "success")
      await fetchCategories()
    } catch (err) {
      const message = err.response?.data?.message || "Gagal menghapus kategori"
      notify(message, "error")
    }
    setDeleteTarget(null)
  }

  return {
    categories,
    loading,
    search,
    setSearch,
    stateFilter,
    setStateFilter,
    showForm,
    setShowForm,
    editing,
    formName,
    setFormName,
    formDesc,
    setFormDesc,
    showAll,
    setShowAll,
    deleteTarget,
    setDeleteTarget,
    isOpen,
    setIsOpen,
    dropdownPos,
    notification,
    setNotification,
    buttonRef,
    panelRef,
    filtered,
    stateCounts,
    visibleCategories,
    fetchCategories,
    notify,
    toggleDropdown,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseForm,
    handleSave,
    handleConfirmDelete,
  }
}
