import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import AdminLayout from "../../../../layouts/AdminLayout"
import { useUsers } from "../../../../context/UserContext"
import AdminUserFormMain from "../../../../components/sections/admin/ManageUsers/AdminUserFormMain"
import AdminUserFormSidebar from "../../../../components/sections/admin/ManageUsers/AdminUserFormSidebar"

const emptyForm = {
  name: "",
  username: "",
  email: "",
  avatar: "",
  role: "Mahasiswa",
  status: "Aktif",
}

function AdminUserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getUserById, addUser, updateUser } = useUsers()

  const isEditMode = Boolean(id)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (isEditMode) {
      const existing = getUserById(id)
      if (existing) {
        setFormData({
          name: existing.name || "",
          username: existing.username || "",
          email: existing.email || "",
          avatar: existing.avatar || "",
          role: existing.role || "Mahasiswa",
          status: existing.status || "Aktif",
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handlePublish() {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Nama dan email wajib diisi")
      return
    }

    if (isEditMode) {
      updateUser(Number(id), formData)
    } else {
      addUser({
        ...formData,
        joinedAt: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        projectCount: 0,
      })
    }

    navigate("/admin/users")
  }

  return (
    <AdminLayout>
      <div className="px-6 py-8 md:px-10 md:py-10">
        <button
          onClick={() => navigate("/admin/users")}
          className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Kelola User
        </button>

        <h1 className="mt-4 text-xl md:text-2xl font-bold text-white">
          {isEditMode ? "Edit User" : "Tambah User Baru"}
        </h1>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <AdminUserFormMain formData={formData} updateField={updateField} />
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
