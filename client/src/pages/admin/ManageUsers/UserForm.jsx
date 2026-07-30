import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import AdminLayout from "../../../layouts/AdminLayout"
import { useUsers } from "../../../context/UserContext"
import AdminHeroBackground from "../../../components/ui/AdminHeroBackground"
import AdminUserFormMain from "../../../components/sections/admin/ManageUsers/AdminUserFormMain"
import AdminUserFormSidebar from "../../../components/sections/admin/ManageUsers/AdminUserFormSidebar"

const emptyForm = {
  name: "",
  username: "",
  email: "",
  avatar: "",
  role: "Mahasiswa",
  status: "Aktif",
  tipe: "mahasiswa",
  is_verified: false,
  password: "",
}

function UserForm() {
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
          tipe: existing.tipe || "mahasiswa",
          is_verified: existing.is_verified ?? false,
          password: "",
        })
      }
    }
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
        created_at: new Date().toISOString(),
        projectCount: 0,
      })
    }

    navigate("/admin/users")
  }

  return (
    <AdminLayout>
      <AdminHeroBackground>
        <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 transition-colors hover:text-cyan-300"
          >
            <ArrowLeft size={16} />
            Kembali ke Kelola User
          </button>

          <h1 className="mt-4 text-xl font-bold text-white md:text-2xl">
            {isEditMode ? "Edit User" : "Tambah User Baru"}
          </h1>
        </div>
      </AdminHeroBackground>

      <div className="px-4 md:px-6 lg:px-8">
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
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

export default UserForm
