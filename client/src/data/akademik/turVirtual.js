export const tourScenes = [
  {
    id: "lobby",
    name: "Lobby Elektro",
    label: "Lobby",
    category: "Area Publik",
    floor: "Lantai 1",
    panorama: "/panorama/lobby.jpg",
    description:
      "Titik awal perjalanan. Lobby menghubungkan area publik dengan koridor utama, Laboratorium Elektronika, dan Laboratorium Komputer.",
    highlights: ["Meja resepsionis", "Papan informasi", "Area tunggu"],
    initialView: { yaw: 0, pitch: -0.02, fov: 1.35 },
    map: { x: 50, y: 82 },
    hotspots: [
      { to: "koridor", label: "Koridor Utama", yaw: 0, pitch: -0.02 },
      { to: "lab-elektronika", label: "Lab Elektronika", yaw: -1.13, pitch: -0.02 },
      { to: "lab-komputer", label: "Lab Komputer", yaw: 1.13, pitch: -0.02 },
    ],
    points: [
      {
        label: "Meja Resepsionis",
        description:
          "Pusat informasi pengunjung, administrasi surat, dan pengarahan menuju ruangan jurusan.",
        yaw: 0.28,
        pitch: -0.18,
      },
      {
        label: "Papan Informasi",
        description:
          "Memuat jadwal kegiatan, pengumuman akademik, dan informasi layanan jurusan.",
        yaw: -0.62,
        pitch: 0.08,
      },
    ],
  },
  {
    id: "koridor",
    name: "Koridor Utama",
    label: "Koridor",
    category: "Area Publik",
    floor: "Lantai 1",
    panorama: "/panorama/koridor.jpg",
    description:
      "Jalur penghubung utama gedung. Dari koridor ini pengunjung dapat menuju ruang kelas, ruang dosen, kantor jurusan, dan laboratorium.",
    highlights: ["Papan pengumuman", "Loker mahasiswa", "Area sirkulasi"],
    initialView: { yaw: 0, pitch: -0.02, fov: 1.4 },
    map: { x: 50, y: 52 },
    hotspots: [
      { to: "lobby", label: "Lobby", yaw: -2.64, pitch: -0.03 },
      { to: "ruang-kelas", label: "Ruang Kelas", yaw: -1.07, pitch: -0.03 },
      { to: "kantor-jurusan", label: "Kantor Jurusan", yaw: 0, pitch: -0.03 },
      { to: "ruang-dosen", label: "Ruang Dosen", yaw: 1.07, pitch: -0.03 },
      { to: "lab-elektronika", label: "Lab Elektronika", yaw: 2.64, pitch: -0.03 },
    ],
    points: [
      {
        label: "Papan Pengumuman",
        description:
          "Berisi jadwal kuliah, jadwal penggunaan laboratorium, dan pengumuman kegiatan mahasiswa.",
        yaw: 0.32,
        pitch: 0.06,
      },
    ],
  },
  {
    id: "lab-elektronika",
    name: "Laboratorium Elektronika",
    label: "Lab Elektronika",
    category: "Laboratorium",
    floor: "Lantai 1",
    panorama: "/panorama/lab-elektronika.jpg",
    description:
      "Laboratorium praktikum rangkaian elektronika, pengukuran, dan perawatan perangkat. Dilengkapi meja kerja serta lemari peralatan.",
    highlights: ["Meja praktikum", "Alat ukur", "Lemari komponen"],
    initialView: { yaw: 0, pitch: -0.02, fov: 1.35 },
    map: { x: 20, y: 62 },
    hotspots: [
      { to: "koridor", label: "Kembali ke Koridor", yaw: 0.94, pitch: -0.03 },
    ],
    points: [
      {
        label: "Meja Praktikum",
        description:
          "Enam stasiun kerja untuk praktikum rangkaian, pengukuran, dan troubleshooting perangkat elektronika.",
        yaw: -0.52,
        pitch: -0.18,
      },
      {
        label: "Lemari Peralatan",
        description:
          "Penyimpanan osiloskop, multimeter, catu daya, dan komponen elektronika praktikum.",
        yaw: 0.92,
        pitch: 0.02,
      },
    ],
  },
  {
    id: "lab-komputer",
    name: "Laboratorium Komputer",
    label: "Lab Komputer",
    category: "Laboratorium",
    floor: "Lantai 1",
    panorama: "/panorama/lab-komputer.jpg",
    description:
      "Ruang praktikum pemrograman, jaringan, dan rekayasa perangkat lunak dengan susunan komputer yang mendukung kerja kolaboratif.",
    highlights: ["Workstation", "Jaringan lab", "Proyektor"],
    initialView: { yaw: 0, pitch: -0.02, fov: 1.35 },
    map: { x: 80, y: 62 },
    hotspots: [
      { to: "lobby", label: "Kembali ke Lobby", yaw: 0.94, pitch: -0.03 },
    ],
    points: [
      {
        label: "Workstation",
        description:
          "Komputer praktikum yang digunakan untuk mata kuliah pemrograman, basis data, dan simulasi sistem.",
        yaw: 0.34,
        pitch: -0.18,
      },
      {
        label: "Rak Jaringan",
        description:
          "Perangkat switch dan pengkabelan untuk praktikum jaringan komputer.",
        yaw: -1.18,
        pitch: 0.02,
      },
    ],
  },
  {
    id: "ruang-kelas",
    name: "Ruang Kelas E-201",
    label: "Ruang Kelas",
    category: "Ruang Kelas",
    floor: "Lantai 2",
    panorama: "/panorama/ruang-kelas.jpg",
    description:
      "Ruang kuliah dengan kapasitas sedang. Dilengkapi papan tulis, proyektor, dan meja yang dapat ditata ulang untuk diskusi kelompok.",
    highlights: ["Kapasitas 36 orang", "Proyektor", "Papan tulis"],
    initialView: { yaw: 0, pitch: -0.02, fov: 1.35 },
    map: { x: 22, y: 36 },
    hotspots: [
      { to: "koridor", label: "Kembali ke Koridor", yaw: 0.94, pitch: -0.03 },
    ],
    points: [
      {
        label: "Papan Tulis",
        description:
          "Area presentasi dosen serta papan kolaborasi untuk diskusi dan tugas kelompok.",
        yaw: -0.42,
        pitch: 0.1,
      },
      {
        label: "Proyektor",
        description:
          "Proyektor terpasang untuk presentasi materi, demonstrasi, dan pemutaran media pembelajaran.",
        yaw: 0.42,
        pitch: 0.24,
      },
    ],
  },
  {
    id: "ruang-dosen",
    name: "Ruang Dosen",
    label: "Ruang Dosen",
    category: "Ruang Dosen",
    floor: "Lantai 2",
    panorama: "/panorama/ruang-dosen.jpg",
    description:
      "Ruang kerja dosen untuk bimbingan akademik, konsultasi, dan penyusunan bahan ajar. Setiap meja dilengkapi area kerja pribadi.",
    highlights: ["Meja dosen", "Rak buku", "Ruang konsultasi"],
    initialView: { yaw: 0, pitch: -0.02, fov: 1.35 },
    map: { x: 78, y: 36 },
    hotspots: [
      { to: "koridor", label: "Kembali ke Koridor", yaw: 0.94, pitch: -0.03 },
    ],
    points: [
      {
        label: "Meja Dosen",
        description:
          "Area kerja untuk bimbingan mahasiswa, konsultasi akademik, dan penyusunan materi perkuliahan.",
        yaw: 0.04,
        pitch: -0.16,
      },
      {
        label: "Rak Buku",
        description:
          "Koleksi buku referensi, modul, dan dokumen akademik jurusan.",
        yaw: -1.02,
        pitch: 0.02,
      },
    ],
  },
  {
    id: "kantor-jurusan",
    name: "Kantor Jurusan",
    label: "Kantor Jurusan",
    category: "Administrasi",
    floor: "Lantai 1",
    panorama: "/panorama/kantor-jurusan.jpg",
    description:
      "Pusat layanan administrasi Jurusan Teknik Elektro. Pengunjung dapat mengurus surat keterangan, legalisasi, dan informasi akademik.",
    highlights: ["Loket layanan", "Arsip akademik", "Ruang tunggu"],
    initialView: { yaw: 0, pitch: -0.02, fov: 1.35 },
    map: { x: 50, y: 18 },
    hotspots: [
      { to: "koridor", label: "Kembali ke Koridor", yaw: 0.94, pitch: -0.03 },
    ],
    points: [
      {
        label: "Loket Layanan",
        description:
          "Layanan administrasi akademik, surat menyurat, dan informasi program studi.",
        yaw: 0.04,
        pitch: -0.18,
      },
      {
        label: "Arsip Akademik",
        description:
          "Penyimpanan dokumen akademik dan arsip administrasi jurusan.",
        yaw: 1.02,
        pitch: 0.02,
      },
    ],
  },
]

export const tourSceneMap = Object.fromEntries(
  tourScenes.map((scene) => [scene.id, scene]),
)

export const tourCategories = [
  "Semua",
  "Area Publik",
  "Laboratorium",
  "Ruang Kelas",
  "Ruang Dosen",
  "Administrasi",
]
