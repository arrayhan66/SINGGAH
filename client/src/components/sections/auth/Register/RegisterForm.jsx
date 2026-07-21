import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  User,
  Mail,
  Lock,
  EyeOff,
  Eye,
  ArrowLeft,
  CreditCard,
  ImagePlus,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import logo from "../../../../assets/icons/logo.png"

function RegisterForm() {
  const navigate = useNavigate()

  // State UI
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userRole, setUserRole] = useState("mahasiswa") // 'mahasiswa' atau 'dosen'

  // State form
  const [formData, setFormData] = useState({
    nama: "",
    nomorInduk: "", // Akan jadi NIM atau NIP tergantung userRole
    email: "",
    password: "",
    confirmPassword: "",
  })

  // State untuk file
  const [fotoProfil, setFotoProfil] = useState(null)
  const [fotoBukti, setFotoBukti] = useState(null) // KTM atau Kartu Pegawai

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e, setFileState) => {
    if (e.target.files && e.target.files[0]) {
      setFileState(e.target.files[0])
    }
  }

  const handleRegister = (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert("Kata sandi dan konfirmasi tidak cocok!")
      return
    }

    if (!fotoProfil || !fotoBukti) {
      alert("Harap unggah Foto Profil dan Dokumen Bukti (KTM/Kartu Pegawai)!")
      return
    }

    setIsLoading(true)

    // Simulasi loading register (nantinya ini panggil API backend pakai FormData)
    setTimeout(() => {
      setIsLoading(false)
      navigate("/verify-code")
    }, 1500)
  }

  return (
    <div className="custom-scrollbar flex w-full flex-col justify-center overflow-y-auto p-4 min-[350px]:p-8 sm:p-12 lg:w-1/2 lg:px-16 lg:py-10">
      {/* Header Mobile */}
      <div className="mb-5 flex items-center justify-between min-[350px]:mb-8 lg:hidden">
        <Link
          to="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90 min-[350px]:gap-3"
        >
          <img
            src={logo}
            alt="Logo SINGGAH"
            className="h-8 w-8 min-[350px]:h-10 min-[350px]:w-10"
          />
          <span className="text-xl font-black tracking-wide text-white min-[350px]:text-2xl">
            SINGGAH
          </span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-[11px] text-slate-400 transition hover:text-cyan-300 min-[350px]:text-sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden min-[400px]:inline">Kembali</span>
        </Link>
      </div>

      {/* Judul Form */}
      <div className="text-center">
        <h2 className="text-lg font-bold leading-tight text-white min-[300px]:text-2xl min-[350px]:text-3xl sm:text-4xl">
          Buat <span className="text-cyan-300">Akun</span>
        </h2>
        <p className="mt-2 text-xs text-slate-400 min-[300px]:text-sm min-[350px]:text-base">
          Daftar sebagai Mahasiswa atau Dosen TI Poliban.
        </p>
      </div>

      {/* Form Register */}
      <form
        onSubmit={handleRegister}
        className="mt-6 space-y-4 min-[350px]:mt-8 min-[350px]:space-y-5"
      >
        {/* Pilihan Role (Mahasiswa / Dosen) */}
        <div className="flex gap-4">
          <label
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${userRole === "mahasiswa" ? "border-cyan-400 bg-cyan-500/20 text-cyan-300" : "border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500"}`}
          >
            <input
              type="radio"
              name="role"
              value="mahasiswa"
              checked={userRole === "mahasiswa"}
              onChange={() => setUserRole("mahasiswa")}
              className="hidden"
            />
            <GraduationCap size={18} />
            Mahasiswa
          </label>
          <label
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${userRole === "dosen" ? "border-cyan-400 bg-cyan-500/20 text-cyan-300" : "border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500"}`}
          >
            <input
              type="radio"
              name="role"
              value="dosen"
              checked={userRole === "dosen"}
              onChange={() => setUserRole("dosen")}
              className="hidden"
            />
            <Briefcase size={18} />
            Dosen
          </label>
        </div>

        {/* Input Nama & Email (Grid 2 Kolom) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[350px]:gap-5">
          <div>
            <label className="mb-2 block text-[11px] font-medium text-slate-300 min-[350px]:text-sm">
              Nama Lengkap
            </label>
            <div className="relative text-cyan-500 focus-within:text-cyan-400">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <User className="h-4 w-4 min-[350px]:h-[18px] min-[350px]:w-[18px]" />
              </div>
              <input
                type="text"
                name="nama"
                required
                value={formData.nama}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-[13px] text-slate-900 placeholder:text-slate-700 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 min-[350px]:py-3 min-[350px]:pl-11 min-[350px]:text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-medium text-slate-300 min-[350px]:text-sm">
              Email Kampus / Aktif
            </label>
            <div className="relative text-cyan-500 focus-within:text-cyan-400">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-4 w-4 min-[350px]:h-[18px] min-[350px]:w-[18px]" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="email@poliban.ac.id"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-[13px] text-slate-900 placeholder:text-slate-700 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 min-[350px]:py-3 min-[350px]:pl-11 min-[350px]:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Input NIM / NIP */}
        <div>
          <label className="mb-2 block text-[11px] font-medium text-slate-300 min-[350px]:text-sm">
            {userRole === "mahasiswa"
              ? "NIM (Nomor Induk Mahasiswa)"
              : "NIP / NIDN"}
          </label>
          <div className="relative text-cyan-500 focus-within:text-cyan-400">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <CreditCard className="h-4 w-4 min-[350px]:h-[18px] min-[350px]:w-[18px]" />
            </div>
            <input
              type="text"
              name="nomorInduk"
              required
              value={formData.nomorInduk}
              onChange={handleChange}
              placeholder={
                userRole === "mahasiswa" ? "Masukkan NIM" : "Masukkan NIP/NIDN"
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-[13px] text-slate-900 placeholder:text-slate-700 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 min-[350px]:py-3 min-[350px]:pl-11 min-[350px]:text-sm"
            />
          </div>
        </div>

        {/* Upload Area (Grid 2 Kolom) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[350px]:gap-5">
          {/* Upload Foto Profil */}
          <div>
            <label className="mb-2 block text-[11px] font-medium text-slate-300 min-[350px]:text-sm">
              Foto Profil
            </label>
            <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-500 bg-slate-800/50 py-3 transition-colors hover:border-cyan-400 hover:bg-cyan-900/20">
              <ImagePlus className="mb-1 text-cyan-400" size={20} />
              <span className="text-[10px] text-slate-300 min-[350px]:text-xs">
                {fotoProfil ? fotoProfil.name : "Pilih Foto"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setFotoProfil)}
                className="hidden"
              />
            </label>
          </div>

          {/* Upload Bukti Identitas */}
          <div>
            <label className="mb-2 block text-[11px] font-medium text-slate-300 min-[350px]:text-sm">
              {userRole === "mahasiswa"
                ? "Foto KTM"
                : "Foto Kartu Pegawai/NIDN"}
            </label>
            <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-500 bg-slate-800/50 py-3 transition-colors hover:border-cyan-400 hover:bg-cyan-900/20">
              <ImagePlus className="mb-1 text-cyan-400" size={20} />
              <span className="text-[10px] text-slate-300 min-[350px]:text-xs">
                {fotoBukti ? fotoBukti.name : "Pilih Dokumen"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setFotoBukti)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Input Password (Grid 2 Kolom) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[350px]:gap-5">
          <div>
            <label className="mb-2 block text-[11px] font-medium text-slate-300 min-[350px]:text-sm">
              Kata Sandi
            </label>
            <div className="relative text-cyan-500 focus-within:text-cyan-400">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-4 w-4 min-[350px]:h-[18px] min-[350px]:w-[18px]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 Karakter"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-[13px] text-slate-900 placeholder:text-slate-600 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 min-[350px]:py-3 min-[350px]:pl-11 min-[350px]:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-slate-600 hover:text-cyan-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-medium text-slate-300 min-[350px]:text-sm">
              Konfirmasi Sandi
            </label>
            <div className="relative text-cyan-500 focus-within:text-cyan-400">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-4 w-4 min-[350px]:h-[18px] min-[350px]:w-[18px]" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi Sandi"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-[13px] text-slate-900 placeholder:text-slate-600 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 min-[350px]:py-3 min-[350px]:pl-11 min-[350px]:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-slate-600 hover:text-cyan-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative mt-2 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-2 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-70 min-[350px]:py-4"
        >
          <span className="flex items-center justify-center gap-2">
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="text-sm tracking-wide min-[350px]:text-base">
                Daftar Sekarang
              </span>
            )}
          </span>
        </button>
      </form>

      {/* Login Link */}
      <p className="mt-4 text-center text-xs text-slate-400 min-[350px]:mt-6 min-[350px]:text-sm lg:mt-6">
        Sudah memiliki akun?
        <Link
          to="/login"
          className="ml-1 font-bold text-cyan-400 transition-colors hover:text-cyan-300"
        >
          Masuk
        </Link>
      </p>
    </div>
  )
}

export default RegisterForm
