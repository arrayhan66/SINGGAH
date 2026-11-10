export const ruanganList = [
  {
    id: "ruang-kelas-e201",
    name: "Ruang Kelas E-201",
    type: "Ruang Kelas",
    floor: "Lantai 2",
    capacity: 36,
    panorama: "/panorama/ruang-kelas.jpg",
    sceneId: "ruang-kelas",
    facilities: ["Proyektor", "Papan tulis", "AC", "Stop kontak meja"],
    description:
      "Ruang kuliah serbaguna dengan tata letak meja yang dapat disesuaikan untuk diskusi kelompok.",
  },
  {
    id: "ruang-kelas-e202",
    name: "Ruang Kelas E-202",
    type: "Ruang Kelas",
    floor: "Lantai 2",
    capacity: 32,
    panorama: "/panorama/ruang-kelas.jpg",
    sceneId: "ruang-kelas",
    facilities: ["Proyektor", "Papan tulis", "AC", "Sound system"],
    description:
      "Ruang kelas untuk perkuliahan teori dengan pencahayaan alami dari sisi koridor.",
  },
  {
    id: "lab-elektronika",
    name: "Lab Elektronika",
    type: "Laboratorium",
    floor: "Lantai 1",
    capacity: 30,
    panorama: "/panorama/lab-elektronika.jpg",
    sceneId: "lab-elektronika",
    facilities: ["Meja praktikum", "Osiloskop", "Catu daya", "Alat ukur"],
    description:
      "Laboratorium praktikum rangkaian elektronika dan pengukuran dengan enam stasiun kerja.",
  },
  {
    id: "lab-komputer",
    name: "Lab Komputer",
    type: "Laboratorium",
    floor: "Lantai 1",
    capacity: 32,
    panorama: "/panorama/lab-komputer.jpg",
    sceneId: "lab-komputer",
    facilities: ["32 workstation", "Jaringan lab", "Proyektor", "AC"],
    description:
      "Laboratorium komputer untuk praktikum pemrograman, basis data, dan simulasi sistem.",
  },
]

export const jadwalMingguan = [
  { id: "s1", roomId: "ruang-kelas-e201", day: 1, start: "08:00", end: "10:00", title: "Sistem Tenaga Listrik", owner: "Dr. Ir. H. Muhammad Arsyad", kind: "Kuliah" },
  { id: "s2", roomId: "ruang-kelas-e201", day: 1, start: "13:00", end: "15:00", title: "Analisis Sistem Tenaga", owner: "Dr. Ir. H. Muhammad Arsyad", kind: "Kuliah" },
  { id: "s3", roomId: "ruang-kelas-e202", day: 2, start: "09:00", end: "11:00", title: "Sistem Telekomunikasi", owner: "Dr. Nurul Hidayati", kind: "Kuliah" },
  { id: "s4", roomId: "lab-komputer", day: 2, start: "13:00", end: "16:00", title: "Praktikum Basis Data", owner: "Dr. Ahmad Fauzi", kind: "Praktikum" },
  { id: "s5", roomId: "lab-elektronika", day: 3, start: "08:00", end: "11:00", title: "Praktikum Elektronika", owner: "Ir. Rudi Hartono", kind: "Praktikum" },
  { id: "s6", roomId: "ruang-kelas-e201", day: 3, start: "13:00", end: "15:00", title: "Kecerdasan Buatan", owner: "Dr. Fitriani", kind: "Kuliah" },
  { id: "s7", roomId: "lab-komputer", day: 4, start: "08:00", end: "11:00", title: "Praktikum Jaringan Komputer", owner: "Iwan Setiawan", kind: "Praktikum" },
  { id: "s8", roomId: "ruang-kelas-e202", day: 4, start: "13:00", end: "15:00", title: "Keamanan Jaringan", owner: "Iwan Setiawan", kind: "Kuliah" },
  { id: "s9", roomId: "lab-elektronika", day: 5, start: "09:00", end: "11:00", title: "Instrumentasi Elektronika", owner: "Ir. Rudi Hartono", kind: "Kuliah" },
  { id: "s10", roomId: "ruang-kelas-e201", day: 5, start: "13:00", end: "15:30", title: "Energi Terbarukan", owner: "Muhammad Rizky", kind: "Kuliah" },
]

export const STATUS_MENUNGGU = "Menunggu persetujuan"
export const STATUS_DISETUJUI = "Disetujui"
export const STATUS_DITOLAK = "Ditolak"

export const jamOperasional = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
]
