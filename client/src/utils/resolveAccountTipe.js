// Tipe akun hanya bisa "mahasiswa" atau "dosen" lewat verifikasi tipe akun.
// "umum" cuma nilai default kolom User.tipe, dan admin ditentukan dari
// User.role -- bukan dari tipe. Jadi akun admin yang masih bertipe "umum"
// tidak boleh ditampilkan sebagai "Umum", karena itu informasi yang menyesatkan.
const VERIFIED_TIPES = new Set(["mahasiswa", "dosen"]);

export function resolveAccountTipe(user) {
  if (user?.role === "admin" && !VERIFIED_TIPES.has(user?.tipe)) {
    return "admin";
  }
  return user?.tipe;
}
