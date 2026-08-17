import { useState, useEffect, useRef } from "react"
import api from "../services/api"
import { tabs, DEFAULT_SETTINGS } from "../utils/settingsHelpers"

export default function useSettings() {
  const [activeTab, setActiveTab] = useState("general")
  const [animDir, setAnimDir] = useState("right")
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)
  const menuButtonRef = useRef(null)
  const menuRef = useRef(null)
  const rafRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)

  useEffect(() => {
    let cancelled = false
    api
      .get("/settings")
      .then((res) => {
        if (cancelled) return
        const data = res.data.data || {}
        setForm((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...data }))
      })
      .catch((err) => {
        console.error("Failed to load settings:", err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function getNavbarBottom() {
    const main = document.querySelector("main")
    if (main) {
      const pt = parseFloat(window.getComputedStyle(main).paddingTop)
      if (!Number.isNaN(pt)) return pt
    }
    const header = document.querySelector("header")
    return header ? header.getBoundingClientRect().bottom : 0
  }

  function applyMenuPosition() {
    const btn = menuButtonRef.current
    const panel = menuRef.current
    if (!btn || !panel) return
    const rect = btn.getBoundingClientRect()
    const navbarBottom = getNavbarBottom()

    if (rect.bottom <= navbarBottom) {
      setMenuOpen(false)
      return
    }

    panel.style.top = `${rect.bottom + 6}px`
    panel.style.left = `${rect.left}px`
    panel.style.width = `${rect.width}px`
  }

  function handleScrollReposition() {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      applyMenuPosition()
    })
  }

  useEffect(() => {
    function handleClickOutside(e) {
      const inButton =
        menuButtonRef.current && menuButtonRef.current.contains(e.target)
      const inMenu =
        menuRef.current && menuRef.current.contains(e.target)
      if (!inButton && !inMenu) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    function handleClose() {
      setMenuOpen(false)
    }
    window.addEventListener("scroll", handleScrollReposition, {
      capture: true,
      passive: true,
    })
    window.addEventListener("resize", handleClose)
    return () => {
      window.removeEventListener("scroll", handleScrollReposition, {
        capture: true,
        passive: true,
      })
      window.removeEventListener("resize", handleClose)
    }
  }, [menuOpen])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    api
      .put("/settings", form)
      .then(() => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to save settings:", err)
        setSaveError("Gagal menyimpan pengaturan. Coba lagi.")
      })
      .finally(() => setSaving(false))
  }

  function switchTab(id) {
    if (id === activeTab) return
    const oldIdx = tabs.findIndex((t) => t.id === activeTab)
    const newIdx = tabs.findIndex((t) => t.id === id)
    setAnimDir(newIdx > oldIdx ? "right" : "left")
    setActiveTab(id)
  }

  function toggleMenu() {
    if (!menuOpen && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      })
    }
    setMenuOpen((v) => !v)
  }

  function selectTabFromMenu(id) {
    switchTab(id)
    setMenuOpen(false)
  }

  const active = tabs.find((t) => t.id === activeTab)

  return {
    activeTab,
    animDir,
    form,
    loading,
    saving,
    saveError,
    saved,
    menuButtonRef,
    menuRef,
    menuOpen,
    menuPos,
    active,
    handleChange,
    handleSave,
    switchTab,
    toggleMenu,
    selectTabFromMenu,
  }
}
