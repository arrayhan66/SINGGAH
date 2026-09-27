require("dotenv").config({ quiet: true })

const {
  sequelize,
  Project,
  ProjectImage,
  ProjectMember,
  ProjectDocument,
  ProjectTechnology,
  ProjectVideo,
  ProjectLink,
  ProjectLike,
  ProjectView,
  Bookmark,
  Comment,
} = require("../models")

// Kosakata lorem ipsum klasik (Cicero "de finibus bonorum et malorum" +
// variasinya yang biasa dipakai generator placeholder). Sebuah judul dianggap
// dummy hanya kalau SEMAA kata judalnya dari daftar ini -- filter "mengandung
// kata kunci" terlalu longgar dan akan ikut mencuri karya asli (mis. "Game
// Minecraft Berbasis Website" tidak punya unsur lorem sama sekali).
const LOREM = new Set(
  `lorem ipsum dolor sit amet consectetur adipisci adipiscing elit aliqua
   aliquam aliquip ante aptent arcu augue bibendum class commodo condimentum
   congue convallis cras curabitur curae cursus dapibus diam dictum dictumst
   dignissim dis donec dui duis egestas eget eleifend elementum enim erat eros
   est et etiam eu euismod facilisi facilisis fames faucibus felis fermentum
   feugiat fringilla fusce gravida habitant habitasse hac hendrerit hymenaeos
   iaculis id imperdiet in inceptos integer interdum justo lacinia lacus
   laoreet lectus leo libero ligula litora lobortis luctus maecenas magna
   magnis malesuada massa mattis mauris metus mi molestie mollis montes morbi
   mus nam nascetur natoque nec neque netus nibh nisi nisl non nostra nostrud
   nulla nullam nunc odio orci ornare parturient pellentesque penatibus per
   pharetra phasellus placerat platea porta porttitor posuere potenti
   praesent pretium primis proin pulvinar purus quam quis quisque rhoncus
   ridiculus risus rutrum sagittis sapien scelerisque sem sed semper senectus
   sociis sodales sollicitudin suscipit suspendisse taciti tellus tempor
   tempus tincidunt torquent tortor tristique turpis ullamcorper ultrices
   ultricies urna ut varius vehicula vel velit venenatis vestibulum vitae
   vivamus viverra volutpat vulputate consequat excepteur cillum sint culpa
   cupidatat exercitation ullamco laboris reprehenderit irure aute unde
   eligendi dolorem recusandae necessitatibus saepe eveniet voluptates
   repudiandae consequuntur nesciunt perferendis deleniti earum hic tenetur
   sapiente delectus reiciendis voluptatibus maiores dolorum asperiores
   repellat ex et ea ad tempor eiusmod labore minim veniam voluptate fugiat
   incididunt do ipsum`
    .split(/\s+/)
    .filter(Boolean),
)

// Skor kemiripan lorem: berapa bagian kata judul yang berasal dari kosakata di
// atas. Judul dianggap dummy kalau >= DUMMY_RATIO dan punya minimal 2 kata
// lorem. 【SENGaja TIDAK】 memakai filter "mengandung kata kunci" karena terlalu
// longgar: karya asli seperti "Game Minecraft Berbasis Website" atau
// "Program Studi PJJ Sistem Informasi ..." ikut kena. Semua karya asli di DB
// ini punya 0 kata lorem, jadi batas 60% aman.
const DUMMY_RATIO = 0.6
const DUMMY_MIN_TOKENS = 2

function scoreTitle(title) {
  const tokens = String(title || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
  if (tokens.length === 0) return { tokens: 0, lorem: 0, ratio: 0 }
  const lorem = tokens.filter((t) => LOREM.has(t)).length
  return { tokens: tokens.length, lorem, ratio: lorem / tokens.length }
}

function isDummyTitle(title) {
  const s = scoreTitle(title)
  return s.lorem >= DUMMY_MIN_TOKENS && s.ratio >= DUMMY_RATIO
}


const CHILDREN = [
  ProjectImage,
  ProjectMember,
  ProjectDocument,
  ProjectTechnology,
  ProjectVideo,
  ProjectLink,
  ProjectLike,
  ProjectView,
  Bookmark,
  Comment,
]

const APPLY = process.argv.includes("--apply")

;(async () => {
  const projects = await Project.findAll({ order: [["id", "ASC"]] })
  const dummy = projects.filter((p) => isDummyTitle(p.title))
  const maybe = projects.filter(
    (p) => !isDummyTitle(p.title) && scoreTitle(p.title).lorem > 0,
  )
  const ids = dummy.map((p) => p.id)

  console.log(`Mode: ${APPLY ? "APPLY (hapus permanen)" : "DRY-RUN (tidak ada perubahan)"}`)
  console.log(`Total karya: ${projects.length} | terdeteksi dummy: ${ids.length}\n`)

  for (const M of CHILDREN) {
    const n = await M.count({ where: { project_id: ids } })
    if (n) console.log(`  ${M.name}: ${n}`)
  }
  console.log("")

  console.log("Daftar yang akan dihapus:")
  dummy.forEach((p) => {
    const d = new Date(p.created_at).toISOString().slice(0, 10)
    console.log(`  ${String(p.id).padStart(7)} [${p.status}] ${p.title} (${d})`)
  })
  console.log("")

  if (maybe.length) {
    console.log("TIDAK dihapus (ada kata lorem tapi campur kata asli) - periksa manual:")
    maybe.forEach((p) => {
      const s = scoreTitle(p.title)
      console.log(
        `  ${String(p.id).padStart(7)} [${p.status}] ${p.title} (lorem ${s.lorem}/${s.tokens})`,
      )
    })
    console.log("")
  }

  if (!APPLY) {
    console.log("Jalankan ulang dengan --apply untuk benar-benar menghapus.")
    await sequelize.close()
    process.exit(0)
  }

  await sequelize.transaction(async (t) => {
    for (const M of CHILDREN) {
      await M.destroy({ where: { project_id: ids }, transaction: t })
    }
    await Project.destroy({ where: { id: ids }, transaction: t })
  })

  console.log(`Selesai: ${ids.length} karya dummy dihapus.`)

  try {
    require("../services/projectService").invalidateProjectListCaches()
    console.log("Cache karya dibersihkan.")
  } catch (err) {
    console.log(`Cache tidak bisa dibersihkan dari script: ${err.message}`)
  }

  await sequelize.close()
  // Redis (cache) tetap menahan event loop, jadi keluar paksa setelah DB
  // sudah ditutup supaya script tidak menggantung.
  process.exit(0)
})().catch((err) => {
  console.error("ERR", err)
  process.exit(1)
})
