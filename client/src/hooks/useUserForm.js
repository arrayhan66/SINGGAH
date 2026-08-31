import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useUsers } from "../context/UserContext"

const emptyForm = {
  name: "",
  username: "",
  email: "",
  avatar: "",
  role: "user",
  status: "Aktif",
  tipe: "umum",
  nim_nip: "",
  identitas_photo: "",
  is_verified: false,
  password: "",
}

function toForm(found) {
  return {
    name: found.name || "",
    username: found.username || "",
    email: found.email || "",
    avatar: found.avatar || "",
    role: found.role === "admin" ? "admin" : "user",
    status: found.status || "Aktif",
    tipe: found.tipe || "umum",
    nim_nip: found.nim_nip || "",
    identitas_photo: found.identitas_photo || "",
    is_verified: found.is_verified ?? false,
    password: "",
  }
}

export default function useUserForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getUserByUsername, addUser, updateUser, fetchUserByUsername } = useUsers()

  const isEditMode = Boolean(slug)
  const existing = isEditMode ? getUserByUsername(slug) : null

  const [formData, setFormData] = useState(() => {
    if (!existing) return emptyForm
    return toForm(existing)
  })

  const [saving, setSaving] = useState(false)
  const [loadedUser, setLoadedUser] = useState(null)
  const [error, setError] = useState("")
  const initedFor = useRef(null)

  useEffect(() => {
    if (!isEditMode) return
    let cancelled = false

    const fill = (found) => {
      if (cancelled || !found) return
      const key = String(found.id)
      if (initedFor.current === key) return
      initedFor.current = key
      setLoadedUser(found)
      setFormData(toForm(found))
    }

    if (existing) fill(existing)
    else fetchUserByUsername(slug).then(fill)

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, slug, existing])

  const editTarget = existing ? { id: existing.id } : loadedUser

  function updateField(field, value) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "role" && value === "admin") {
        next.tipe = "umum"
      }
      return next
    })
  }

  async function handlePublish() {
    setError("")

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Nama dan email wajib diisi")
      return
    }

    if (!isEditMode && !formData.username.trim()) {
      setError("Username wajib diisi")
      return
    }

    setSaving(true)

    try {
      if (isEditMode && editTarget) {
        await updateUser(editTarget.id, formData)
      } else if (!isEditMode) {
        await addUser({
          ...formData,
          created_at: new Date().toISOString(),
          projectCount: 0,
        })
      } else {
        setSaving(false)
        setError("User tidak ditemukan di daftar. Muat ulang halaman lalu coba lagi.")
        return
      }
      navigate("/users")
    } catch (err) {
      setSaving(false)
      setError(err.response?.data?.message || "Gagal menyimpan user. Silakan coba lagi.")
    }
  }

  function goBack() {
    navigate("/users")
  }

  return {
    slug,
    formData,
    updateField,
    handlePublish,
    isEditMode,
    saving,
    error,
    clearError: () => setError(""),
    goBack,
  }
}
