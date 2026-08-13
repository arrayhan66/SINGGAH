require("dotenv").config()
const { User, Category, Project, ProjectMember, ProjectTechnology, ProjectImage } = require("../models")
const sequelize = require("../config/database")

const categoriesData = [
  {
    name: "Website",
    slug: "website",
    description: "Aplikasi web modern berbasis React, Laravel, MERN dan teknologi terbaru.",
    icon: "globe",
    color: "#3b82f6",
    sort_order: 1,
    is_active: true,
  },
  {
    name: "Mobile App",
    slug: "mobile-app",
    description: "Android dan iOS menggunakan Flutter maupun React Native.",
    icon: "smartphone",
    color: "#a78bfa",
    sort_order: 2,
    is_active: true,
  },
  {
    name: "IoT",
    slug: "iot",
    description: "Internet of Things, Smart Device, Embedded System dan Automation.",
    icon: "cpu",
    color: "#06b6d4",
    sort_order: 3,
    is_active: true,
  },
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "Machine Learning, Computer Vision, Deep Learning dan NLP.",
    icon: "brain",
    color: "#ec4899",
    sort_order: 4,
    is_active: true,
  },
  {
    name: "Data Science",
    slug: "data-science",
    description: "Analisis data, dashboard interaktif, visualisasi dan Big Data.",
    icon: "database",
    color: "#34d399",
    sort_order: 5,
    is_active: true,
  },
  {
    name: "Cyber Security",
    slug: "cyber-security",
    description: "Keamanan jaringan, penetration testing dan digital forensics.",
    icon: "shield-check",
    color: "#fbbf24",
    sort_order: 6,
    is_active: true,
  },
  {
    name: "UI/UX Design",
    slug: "ui-ux-design",
    description: "Desain antarmuka dan pengalaman pengguna yang fungsional dan estetis.",
    icon: "layout",
    color: "#fb7185",
    sort_order: 7,
    is_active: true,
  },
  {
    name: "Game Development",
    slug: "game-development",
    description: "Pengembangan game 2D/3D, game engine, dan realitas virtual.",
    icon: "gamepad-2",
    color: "#a855f7",
    sort_order: 8,
    is_active: true,
  },
]

async function seed() {
  try {
    await sequelize.authenticate()
    console.log("Database connected for seeding...")

    // Ensure tables exist and alter to match models
    await sequelize.sync({ alter: true })

    // 1. Create or find Users
    const [dosenUser] = await User.findOrCreate({
      where: { email: "dosen.pameran@poliban.ac.id" },
      defaults: {
        name: "Dr. Ir. H. Budi Santoso, M.Kom.",
        username: "budi_dosen",
        password: "$2b$10$YourHashedPasswordHerePlaceholderForTest12345",
        tipe: "dosen",
        role: "admin",
        is_verified: true,
        status: "active",
      },
    })

    const [mhsUser] = await User.findOrCreate({
      where: { email: "mahasiswa.pameran@poliban.ac.id" },
      defaults: {
        name: "Ahmad Fauzan",
        username: "ahmad_mhs",
        password: "$2b$10$YourHashedPasswordHerePlaceholderForTest12345",
        tipe: "mahasiswa",
        role: "user",
        is_verified: true,
        status: "active",
      },
    })

    console.log("Users seeded.")

    // 2. Create Categories
    const categoryMap = {}
    for (const catData of categoriesData) {
      const [cat] = await Category.findOrCreate({
        where: { slug: catData.slug },
        defaults: catData,
      })
      // Update fields if already exists
      cat.name = catData.name
      cat.description = catData.description
      cat.icon = catData.icon
      cat.color = catData.color
      cat.sort_order = catData.sort_order
      cat.is_active = catData.is_active
      await cat.save()

      categoryMap[catData.slug] = cat.id
    }
    console.log("Categories seeded.")

    // 3. Create Sample Published Projects per Category
    let projectCount = 0
    for (const catData of categoriesData) {
      const catId = categoryMap[catData.slug]

      // Create 2 student projects + 1 dosen project per category
      const samples = [
        {
          title: `${catData.name} Inovatif Mahasiswa A`,
          slug: `${catData.slug}-inovatif-mhs-a`,
          description: `Deskripsi lengkap karya mahasiswa di bidang ${catData.name}. Menggunakan teknologi modern untuk solusi nyata di masyarakat.`,
          abstract: "Abstraksi penelitian dan pembuatan aplikasi...",
          year: 2026,
          status: "published",
          user_id: mhsUser.id,
          category_id: catId,
          thumbnail: "https://placehold.co/800x500/0f172a/38bdf8?text=" + encodeURIComponent(catData.name + " Mhs"),
          technologies: ["React", "Node.js", "TailwindCSS"],
          members: [{ name: "Ahmad Fauzan", role: "Lead Developer" }],
        },
        {
          title: `${catData.name} Riset Unggulan Dosen`,
          slug: `${catData.slug}-riset-dosen`,
          description: `Penelitian mendalam dan pengembangan sistem ${catData.name} oleh tim dosen dan peneliti kampus.`,
          abstract: "Abstraksi riset mendalam...",
          year: 2026,
          status: "published",
          user_id: dosenUser.id,
          category_id: catId,
          thumbnail: "https://placehold.co/800x500/0f172a/38bdf8?text=" + encodeURIComponent(catData.name + " Dosen"),
          technologies: ["Python", "TensorFlow", "Docker"],
          members: [{ name: "Dr. Ir. H. Budi Santoso, M.Kom.", role: "Principal Investigator" }],
        },
      ]

      for (const sample of samples) {
        const technologies = sample.technologies
        const members = sample.members
        delete sample.technologies
        delete sample.members

        const [proj, created] = await Project.findOrCreate({
          where: { slug: sample.slug },
          defaults: sample,
        })

        if (!created) {
          Object.assign(proj, sample)
          await proj.save()
        } else {
          for (const techName of technologies) {
            await ProjectTechnology.create({ project_id: proj.id, name: techName })
          }
          for (const m of members) {
            await ProjectMember.create({ project_id: proj.id, name: m.name, role: m.role })
          }
        }
        projectCount++
      }
    }

    console.log(`Successfully seeded ${projectCount} published projects across ${categoriesData.length} categories!`)
    process.exit(0)
  } catch (error) {
    console.error("Seeding error:", error)
    process.exit(1)
  }
}

seed()
