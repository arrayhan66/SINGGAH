import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import AdminLayout from "../../../../layouts/AdminLayout"
import { useUsers } from "../../../../context/UserContext"
import AdminUserFormMain from "../../../../components/sections/admin/ManageUsers/AdminUserFormMain"
import AdminUserFormSidebar from "../../../../components/sections/admin/ManageUsers/AdminUserFormSidebar"
import Toast from "../../../../components/ui/Toast"

const emptyForm = {
  name: "",
  username: "",
  email: "",
  avatar: "",
  tipe: "umum",
  nim_nip: "",
  identitas_photo: "",
  role: "user",
  status: "Aktif",
  is_verified: true,
}

function AdminUserForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getUserByUsername, addUser, updateUser } = useUsers()

  const isEditMode = Boolean(slug)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (isEditMode) {
      const existing = getUserByUsername(slug)
      if (existing) {
        setFormData({
          name: existing.name || "",
          username: existing.username || "",
          email: existing.email || "",
          avatar: existing.avatar || "",
          tipe: existing.tipe || "umum",
          nim_nip: existing.nim_nip || "",
          identitas_photo: existing.identitas_photo || "",
          role: existing.role || "user",
          status: existing.status || "Aktif",
          is_verified: existing.is_verified,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  function updateField(field, value) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "role" && value === "admin") {
        next.tipe = "umum"
      }
      return next
    })
  }

  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)

  function notifyError(message) {
    setNotification({ type: "error", message })
  }

  async function handlePublish() {
    if (!formData.name.trim() || !formData.email.trim()) {
      notifyError("Nama dan email wajib diisi")
      return
    }

    setSaving(true)

    try {
      if (isEditMode) {
        const existing = getUserByUsername(slug)
        if (!existing) {
          notifyError("User tidak ditemukan di daftar. Muat ulang halaman lalu coba lagi.")
          setSaving(false)
          return
        }
        await updateUser(existing.id, formData)
      } else {
        await addUser({
          ...formData,
          joinedAt: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          projectCount: 0,
        })
      }
      navigate("/users")
    } catch (err) {
      setSaving(false)
      notifyError(
        err.response?.data?.message ||
          "Gagal menyimpan user. Silakan coba lagi.",
      )
    }
  }

  return (
    <AdminLayout>
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onDone={() => setNotification(null)}
        />
      )}
      <div className="px-6 pt-6 pb-10 md:px-10 md:pt-8">
        <button
          onClick={() => navigate("/users")}
          className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Kelola User
        </button>

        <h1 className="mt-4 text-[clamp(1.125rem,1rem+0.75vw,1.25rem)] md:text-2xl font-bold text-white">
          {isEditMode ? "Edit User" : "Tambah User Baru"}
        </h1>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <AdminUserFormMain
            formData={formData}
            updateField={updateField}
            onPublish={handlePublish}
            isEditMode={isEditMode}
            saving={saving}
          />
          <AdminUserFormSidebar
            formData={formData}
            updateField={updateField}
            onPublish={handlePublish}
            isEditMode={isEditMode}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminUserForm
