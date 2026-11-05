import { mkdir } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const W = 2400
const H = 1200
const HORIZON = H * 0.7
const OUTPUT = path.resolve(import.meta.dirname, "../public/panorama")

const palettes = {
  lobby: { wall: "#e9e0d1", wallDeep: "#d8cbb7", floor: "#b48a63", floorDeep: "#8f6848", accent: "#2f6d5f", ceiling: "#f4eee3" },
  corridor: { wall: "#dfe3df", wallDeep: "#c8cfc9", floor: "#9aa29c", floorDeep: "#737b76", accent: "#3d5a68", ceiling: "#eef0ed" },
  lab: { wall: "#dce6e4", wallDeep: "#bfd0cd", floor: "#8e9a96", floorDeep: "#6b7773", accent: "#2c6f66", ceiling: "#eef3f1" },
  computer: { wall: "#dde3eb", wallDeep: "#c3ccd8", floor: "#8b96a4", floorDeep: "#67717e", accent: "#3b5b7c", ceiling: "#edf0f4" },
  classroom: { wall: "#ece3d2", wallDeep: "#d9cdb7", floor: "#a98563", floorDeep: "#806348", accent: "#8a5b35", ceiling: "#f6f0e5" },
  lecturer: { wall: "#e6dccb", wallDeep: "#d2c3ab", floor: "#9b7757", floorDeep: "#74563d", accent: "#6b4b34", ceiling: "#f3ebdd" },
  office: { wall: "#dfe2d9", wallDeep: "#c6cabf", floor: "#95876f", floorDeep: "#6f6451", accent: "#5c6545", ceiling: "#eff0ea" },
}

function windows(x, y, width, height, count) {
  const gap = width / count
  let svg = `<g>`
  for (let i = 0; i < count; i += 1) {
    const wx = x + gap * i + 8
    svg += `
      <rect x="${wx}" y="${y}" width="${gap - 16}" height="${height}" rx="6" fill="url(#sky)" stroke="#fdfaf3" stroke-width="10" />
      <rect x="${wx + gap * 0.5 - 5}" y="${y}" width="10" height="${height}" fill="#fdfaf3" opacity="0.85" />
      <rect x="${wx}" y="${y + height * 0.5 - 5}" width="${gap - 16}" height="10" fill="#fdfaf3" opacity="0.85" />
    `
  }
  return `${svg}</g>`
}

function doors(exits) {
  return exits
    .map((exit) => {
      const x = exit.x * W
      return `
        <g>
          <rect x="${x - 78}" y="${H * 0.39}" width="156" height="${H * 0.31}" rx="10" fill="#f5efe2" opacity="0.35" />
          <rect x="${x - 66}" y="${H * 0.4}" width="132" height="${H * 0.3}" rx="8" fill="url(#door)" stroke="#efe7d8" stroke-width="8" />
          <rect x="${x - 4}" y="${H * 0.4}" width="8" height="${H * 0.3}" fill="#efe7d8" opacity="0.7" />
          <circle cx="${x + 44}" cy="${H * 0.56}" r="5" fill="#efe7d8" />
          <text x="${x}" y="${H * 0.365}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" letter-spacing="5" fill="#4b514c" opacity="0.7">${exit.label.toUpperCase()}</text>
        </g>
      `
    })
    .join("")
}

function plant(x, y, scale = 1) {
  return `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <ellipse cx="0" cy="10" rx="52" ry="12" fill="#1f2a25" opacity="0.16" />
      <path d="M-26 0 L26 0 L19 74 L-19 74 Z" fill="#b57a55" />
      <path d="M-23 8 L23 8 L20 32 L-20 32 Z" fill="#c98b62" opacity="0.55" />
      <path d="M0 4 C-34 -20 -44 -58 -18 -74 C-4 -50 -6 -20 0 4" fill="#3f6b52" />
      <path d="M0 2 C30 -26 52 -48 22 -78 C6 -52 2 -18 0 2" fill="#4f7d60" />
      <path d="M0 6 C-8 -28 6 -66 30 -84 C28 -48 14 -16 0 6" fill="#35604a" />
      <path d="M0 4 C-30 -4 -58 -24 -50 -52 C-24 -40 -8 -16 0 4" fill="#4a755a" />
    </g>
  `
}

function desk(x, y, width, color = "#8b6547") {
  return `
    <g>
      <ellipse cx="${x + width / 2}" cy="${y + 54}" rx="${width * 0.55}" ry="12" fill="#1f2a25" opacity="0.14" />
      <rect x="${x}" y="${y}" width="${width}" height="16" rx="4" fill="${color}" />
      <rect x="${x}" y="${y}" width="${width}" height="6" rx="3" fill="#c49a74" opacity="0.6" />
      <rect x="${x + 10}" y="${y + 16}" width="10" height="44" fill="#6c4d36" />
      <rect x="${x + width - 20}" y="${y + 16}" width="10" height="44" fill="#6c4d36" />
    </g>
  `
}

function chair(x, y, color = "#44514c") {
  return `
    <g>
      <rect x="${x}" y="${y}" width="54" height="12" rx="5" fill="${color}" />
      <rect x="${x + 4}" y="${y - 46}" width="46" height="46" rx="8" fill="${color}" opacity="0.9" />
      <rect x="${x + 6}" y="${y + 12}" width="7" height="34" fill="#3b4440" />
      <rect x="${x + 41}" y="${y + 12}" width="7" height="34" fill="#3b4440" />
    </g>
  `
}

function computer(x, y, scale = 1) {
  return `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <rect x="0" y="0" width="66" height="42" rx="4" fill="#2d3436" />
      <rect x="5" y="5" width="56" height="32" rx="2" fill="#9fc4c4" />
      <rect x="5" y="5" width="56" height="14" rx="2" fill="#c4dedb" />
      <rect x="26" y="42" width="14" height="10" fill="#3a4244" />
      <rect x="14" y="52" width="38" height="6" rx="3" fill="#3a4244" />
    </g>
  `
}

function cabinet(x, y, width, height, color = "#7c6a52") {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="${color}" />
      <rect x="${x + 8}" y="${y + 10}" width="${width - 16}" height="${height * 0.4}" rx="3" fill="#f0e8d8" opacity="0.18" />
      <rect x="${x + 8}" y="${y + height * 0.52}" width="${width - 16}" height="${height * 0.4}" rx="3" fill="#f0e8d8" opacity="0.18" />
      <rect x="${x + width * 0.46}" y="${y + height * 0.18}" width="${width * 0.08}" height="${height * 0.14}" rx="2" fill="#d7c7ac" opacity="0.7" />
      <rect x="${x + width * 0.46}" y="${y + height * 0.62}" width="${width * 0.08}" height="${height * 0.14}" rx="2" fill="#d7c7ac" opacity="0.7" />
    </g>
  `
}

function tablesRow(x, y, count, gap, width) {
  let svg = ""
  for (let i = 0; i < count; i += 1) {
    svg += desk(x + i * (width + gap), y, width)
    svg += chair(x + i * (width + gap) + width * 0.28, y + 74)
  }
  return svg
}

function furnitureFor(kind, accent) {
  switch (kind) {
    case "lobby":
      return `
        ${windows(W * 0.06, H * 0.36, W * 0.16, H * 0.24, 2)}
        ${windows(W * 0.78, H * 0.36, W * 0.16, H * 0.24, 2)}
        <g>
          <rect x="${W * 0.38}" y="${H * 0.56}" width="${W * 0.24}" height="${H * 0.12}" rx="10" fill="#8f6848" />
          <rect x="${W * 0.38}" y="${H * 0.56}" width="${W * 0.24}" height="14" fill="#c49a74" />
          <rect x="${W * 0.41}" y="${H * 0.60}" width="${W * 0.045}" height="6" rx="3" fill="#efe7d8" opacity="0.7" />
          <rect x="${W * 0.46}" y="${H * 0.60}" width="${W * 0.045}" height="6" rx="3" fill="#efe7d8" opacity="0.7" />
          <rect x="${W * 0.51}" y="${H * 0.60}" width="${W * 0.045}" height="6" rx="3" fill="#efe7d8" opacity="0.7" />
        </g>
        <g>
          <rect x="${W * 0.16}" y="${H * 0.64}" width="${W * 0.13}" height="46" rx="20" fill="${accent}" />
          <rect x="${W * 0.16}" y="${H * 0.60}" width="${W * 0.13}" height="50" rx="18" fill="${accent}" opacity="0.88" />
          <rect x="${W * 0.68}" y="${H * 0.64}" width="${W * 0.13}" height="46" rx="20" fill="${accent}" />
          <rect x="${W * 0.68}" y="${H * 0.60}" width="${W * 0.13}" height="50" rx="18" fill="${accent}" opacity="0.88" />
        </g>
        ${plant(W * 0.08, H * 0.72, 1.6)}
        ${plant(W * 0.9, H * 0.72, 1.5)}
      `
    case "corridor":
      return `
        ${windows(W * 0.12, H * 0.34, W * 0.12, H * 0.26, 2)}
        ${windows(W * 0.76, H * 0.34, W * 0.12, H * 0.26, 2)}
        ${cabinet(W * 0.14, H * 0.55, W * 0.05, H * 0.16, "#5f6f68")}
        ${cabinet(W * 0.81, H * 0.55, W * 0.05, H * 0.16, "#5f6f68")}
        ${plant(W * 0.27, H * 0.73, 1.4)}
        ${plant(W * 0.71, H * 0.73, 1.4)}
        <rect x="${W * 0.3}" y="${H * 0.665}" width="${W * 0.4}" height="18" rx="9" fill="${accent}" opacity="0.35" />
      `
    case "lab":
      return `
        ${windows(W * 0.04, H * 0.35, W * 0.18, H * 0.25, 3)}
        ${windows(W * 0.78, H * 0.35, W * 0.18, H * 0.25, 3)}
        ${tablesRow(W * 0.16, H * 0.60, 3, W * 0.03, W * 0.15)}
        ${computer(W * 0.2, H * 0.54, 1.1)}
        ${computer(W * 0.39, H * 0.54, 1.1)}
        ${computer(W * 0.58, H * 0.54, 1.1)}
        ${cabinet(W * 0.06, H * 0.5, W * 0.05, H * 0.2, "#66756f")}
        ${cabinet(W * 0.89, H * 0.5, W * 0.05, H * 0.2, "#66756f")}
        <rect x="${W * 0.43}" y="${H * 0.78}" width="${W * 0.14}" height="${H * 0.1}" rx="8" fill="#4b5c56" opacity="0.4" />
      `
    case "computer":
      return `
        ${windows(W * 0.06, H * 0.35, W * 0.14, H * 0.24, 2)}
        ${windows(W * 0.8, H * 0.35, W * 0.14, H * 0.24, 2)}
        ${tablesRow(W * 0.12, H * 0.59, 2, W * 0.05, W * 0.22)}
        ${tablesRow(W * 0.55, H * 0.59, 2, W * 0.05, W * 0.22)}
        ${computer(W * 0.18, H * 0.53, 1.3)}
        ${computer(W * 0.41, H * 0.53, 1.3)}
        ${computer(W * 0.61, H * 0.53, 1.3)}
        ${computer(W * 0.84, H * 0.53, 1.3)}
        <rect x="${W * 0.44}" y="${H * 0.79}" width="${W * 0.12}" height="${H * 0.09}" rx="8" fill="#455a6e" opacity="0.35" />
      `
    case "classroom":
      return `
        ${windows(W * 0.04, H * 0.34, W * 0.19, H * 0.26, 3)}
        ${windows(W * 0.77, H * 0.34, W * 0.19, H * 0.26, 3)}
        <g>
          <rect x="${W * 0.33}" y="${H * 0.46}" width="${W * 0.34}" height="${H * 0.16}" rx="8" fill="#f2ecdf" />
          <rect x="${W * 0.33}" y="${H * 0.46}" width="${W * 0.34}" height="10" fill="#cdbfa8" />
          <rect x="${W * 0.36}" y="${H * 0.5}" width="${W * 0.28}" height="5" rx="2" fill="#9aa59c" opacity="0.5" />
          <rect x="${W * 0.36}" y="${H * 0.54}" width="${W * 0.2}" height="5" rx="2" fill="#9aa59c" opacity="0.4" />
        </g>
        ${tablesRow(W * 0.1, H * 0.63, 4, W * 0.06, W * 0.14)}
        ${tablesRow(W * 0.16, H * 0.79, 3, W * 0.1, W * 0.14)}
        <rect x="${W * 0.47}" y="${H * 0.66}" width="${W * 0.06}" height="${H * 0.03}" rx="4" fill="${accent}" opacity="0.3" />
      `
    case "lecturer":
      return `
        ${windows(W * 0.25, H * 0.34, W * 0.18, H * 0.26, 3)}
        ${cabinet(W * 0.06, H * 0.46, W * 0.11, H * 0.24, "#8a6b4c")}
        ${cabinet(W * 0.85, H * 0.46, W * 0.09, H * 0.24, "#8a6b4c")}
        ${desk(W * 0.36, H * 0.62, W * 0.28, "#9b7757")}
        ${computer(W * 0.43, H * 0.54, 1.5)}
        ${chair(W * 0.46, H * 0.69, "#4f463c")}
        ${chair(W * 0.53, H * 0.69, "#4f463c")}
        ${plant(W * 0.78, H * 0.72, 1.5)}
        <g>
          <rect x="${W * 0.37}" y="${H * 0.47}" width="${W * 0.07}" height="${H * 0.08}" rx="4" fill="#efe6d5" stroke="#b9a888" stroke-width="4" />
          <rect x="${W * 0.39}" y="${H * 0.49}" width="${W * 0.03}" height="${H * 0.04}" fill="#a9b8a8" />
        </g>
      `
    case "office":
      return `
        ${windows(W * 0.08, H * 0.35, W * 0.16, H * 0.25, 3)}
        ${windows(W * 0.8, H * 0.35, W * 0.14, H * 0.25, 2)}
        ${desk(W * 0.18, H * 0.62, W * 0.2, "#7f6f58")}
        ${desk(W * 0.62, H * 0.62, W * 0.2, "#7f6f58")}
        ${computer(W * 0.24, H * 0.54, 1.3)}
        ${computer(W * 0.68, H * 0.54, 1.3)}
        ${chair(W * 0.25, H * 0.7, "#4f5a4b")}
        ${chair(W * 0.69, H * 0.7, "#4f5a4b")}
        ${cabinet(W * 0.43, H * 0.46, W * 0.12, H * 0.24, "#68705c")}
        ${plant(W * 0.92, H * 0.73, 1.3)}
      `
    default:
      return ""
  }
}

function buildSvg(room) {
  const p = palettes[room.palette]
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="ceiling" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${p.ceiling}" />
          <stop offset="1" stop-color="${p.wall}" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${p.wall}" />
          <stop offset="1" stop-color="${p.wallDeep}" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${p.floor}" />
          <stop offset="1" stop-color="${p.floorDeep}" />
        </linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#b9d9df" />
          <stop offset="0.65" stop-color="#d9e9e7" />
          <stop offset="1" stop-color="#f2f4ec" />
        </linearGradient>
        <linearGradient id="door" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#6d7d75" />
          <stop offset="1" stop-color="#4f5f58" />
        </linearGradient>
        <radialGradient id="light" cx="0.5" cy="0.3" r="0.75">
          <stop offset="0" stop-color="#fffdf3" stop-opacity="0.5" />
          <stop offset="1" stop-color="#fffdf3" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.72">
          <stop offset="0.55" stop-color="#000000" stop-opacity="0" />
          <stop offset="1" stop-color="#1a1d1a" stop-opacity="0.32" />
        </radialGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="${W}" height="${H * 0.33}" fill="url(#ceiling)" />
      <rect y="${H * 0.33}" width="${W}" height="${H * 0.37}" fill="url(#wall)" />
      <rect y="${HORIZON}" width="${W}" height="${H * 0.3}" fill="url(#floor)" />

      <g opacity="0.35">
        <line x1="0" y1="${H * 0.33}" x2="${W}" y2="${H * 0.33}" stroke="${p.wallDeep}" stroke-width="3" />
        <line x1="0" y1="${HORIZON}" x2="${W}" y2="${HORIZON}" stroke="#5c5a52" stroke-width="2" />
      </g>

      <g opacity="0.18" stroke="${p.floorDeep}" stroke-width="2">
        ${Array.from({ length: 29 }, (_, i) => {
          const bottomX = (i / 28) * W
          const topX = W / 2 + (bottomX - W / 2) * 0.12
          return `<line x1="${topX}" y1="${HORIZON}" x2="${bottomX}" y2="${H}" />`
        }).join("")}
        ${Array.from({ length: 7 }, (_, i) => {
          const t = i / 7
          const y = HORIZON + (H - HORIZON) * t * t
          return `<line x1="0" y1="${y}" x2="${W}" y2="${y}" />`
        }).join("")}
      </g>

      <g opacity="0.2" stroke="${p.wallDeep}" stroke-width="2">
        ${Array.from({ length: 9 }, (_, i) => {
          const x = (i / 8) * W
          return `<line x1="${x}" y1="0" x2="${W / 2 + (x - W / 2) * 0.3}" y2="${H * 0.33}" />`
        }).join("")}
      </g>

      <g opacity="0.6">
        ${Array.from({ length: 7 }, (_, i) => {
          const x = (i + 0.5) * (W / 7)
          return `<rect x="${x - 52}" y="${H * 0.055}" width="104" height="14" rx="7" fill="#fffdf4" opacity="0.85" />
            <ellipse cx="${x}" cy="${H * 0.14}" rx="120" ry="46" fill="#fffdf3" opacity="0.16" />`
        }).join("")}
      </g>

      ${windows(W * 0.01, H * 0.34, W * 0.1, H * 0.25, 1)}
      ${windows(W * 0.89, H * 0.34, W * 0.1, H * 0.25, 1)}

      ${doors(room.exits)}
      ${furnitureFor(room.kind, p.accent)}

      <rect width="${W}" height="${H}" fill="url(#light)" />
      <rect width="${W}" height="${H}" fill="url(#vignette)" />

      <g opacity="0.85">
        <text x="${W / 2}" y="${H * 0.29}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" letter-spacing="9" fill="#4f554f" opacity="0.55">JURUSAN TEKNIK ELEKTRO</text>
        <text x="${W / 2}" y="${H * 0.325}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="700" letter-spacing="2" fill="#3d443f" opacity="0.78">${room.name}</text>
      </g>

      <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.06" />
      <rect x="${W * 0.5 - 1}" y="0" width="2" height="${H}" fill="#000" opacity="0.06" />
    </svg>
  `
}

const rooms = [
  {
    file: "lobby",
    name: "Lobby Elektro",
    kind: "lobby",
    palette: "lobby",
    exits: [
      { x: 0.5, label: "Koridor" },
      { x: 0.32, label: "Lab Elektronika" },
      { x: 0.68, label: "Lab Komputer" },
    ],
  },
  {
    file: "koridor",
    name: "Koridor Utama",
    kind: "corridor",
    palette: "corridor",
    exits: [
      { x: 0.08, label: "Lobby" },
      { x: 0.36, label: "Ruang Kelas" },
      { x: 0.5, label: "Kantor Jurusan" },
      { x: 0.64, label: "Ruang Dosen" },
      { x: 0.92, label: "Lab Elektronika" },
    ],
  },
  {
    file: "lab-elektronika",
    name: "Lab Elektronika",
    kind: "lab",
    palette: "lab",
    exits: [{ x: 0.65, label: "Koridor" }],
  },
  {
    file: "lab-komputer",
    name: "Lab Komputer",
    kind: "computer",
    palette: "computer",
    exits: [{ x: 0.65, label: "Lobby" }],
  },
  {
    file: "ruang-kelas",
    name: "Ruang Kelas E-201",
    kind: "classroom",
    palette: "classroom",
    exits: [{ x: 0.65, label: "Koridor" }],
  },
  {
    file: "ruang-dosen",
    name: "Ruang Dosen",
    kind: "lecturer",
    palette: "lecturer",
    exits: [{ x: 0.65, label: "Koridor" }],
  },
  {
    file: "kantor-jurusan",
    name: "Kantor Jurusan",
    kind: "office",
    palette: "office",
    exits: [{ x: 0.65, label: "Koridor" }],
  },
]

await mkdir(OUTPUT, { recursive: true })

for (const room of rooms) {
  const svg = buildSvg(room)
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUTPUT, `${room.file}.jpg`))
  console.log(`panorama ${room.file}.jpg`)
}
