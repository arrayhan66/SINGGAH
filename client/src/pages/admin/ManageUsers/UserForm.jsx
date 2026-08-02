import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, UserPen, UserPlus } from "lucide-react"
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
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getUserByUsername, addUser, updateUser } = useUsers()

  const isEditMode = Boolean(slug)
  const existing = isEditMode ? getUserByUsername(slug) : null

  const [formData, setFormData] = useState(() => {
    if (!existing) return emptyForm
    return {
      name: existing.name || "",
      username: existing.username || "",
      email: existing.email || "",
      avatar: existing.avatar || "",
      role: existing.role || "Mahasiswa",
      status: existing.status || "Aktif",
      tipe: existing.tipe || "mahasiswa",
      is_verified: existing.is_verified ?? false,
      password: "",
    }
  })

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handlePublish() {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Nama dan email wajib diisi")
      return
    }

    if (isEditMode && existing) {
      updateUser(existing.id, formData)
    } else if (!isEditMode) {
      addUser({
        ...formData,
        created_at: new Date().toISOString(),
        projectCount: 0,
      })
    }

    navigate("/users")
  }

  return (
    <AdminLayout>
      <AdminHeroBackground fullWidth>
        <div className="px-4 md:px-6 lg:px-8 pt-6 pb-10 md:pt-8">
          <button
            onClick={() => navigate("/users")}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Kembali ke Kelola User
          </button>

          <div className="mt-6 flex items-center gap-[clamp(0.75rem,0.5rem+1vw,1rem)] min-w-0">
            <div className="flex h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
              {isEditMode ? (
                <UserPen className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300" />
              ) : (
                <UserPlus className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] font-black text-white sm:text-3xl">
                {isEditMode ? "Edit " : "Tambah "}
                <span className="text-cyan-300">User</span>
              </h1>
              <p className="mt-1 max-w-xl text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400">
                {isEditMode
                  ? "Perbarui informasi akun pengguna SINGGAH."
                  : "Lengkapi data untuk membuat akun pengguna baru di SINGGAH."}
              </p>
            </div>
          </div>
        </div>
      </AdminHeroBackground>

      <div className="px-4 md:px-6 lg:px-8 pb-12 md:pb-16">
        <div className="mt-6 grid grid-cols-1 items-start gap-6 min-[1000px]:grid-cols-[1fr_340px]">
          <AdminUserFormMain
            formData={formData}
            updateField={updateField}
            onPublish={handlePublish}
            isEditMode={isEditMode}
          />
          <div className="flex flex-col gap-6">
            <AdminUserFormSidebar
              formData={formData}
              updateField={updateField}
            />
            <div className="border-t border-white/[0.06] pt-6 min-[1000px]:hidden">
              <button
                type="button"
                onClick={handlePublish}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
              >
                {isEditMode ? "Simpan Perubahan" : "Tambah User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default UserForm
