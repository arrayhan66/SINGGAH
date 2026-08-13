import { readFile } from "node:fs/promises"
globalThis.self = globalThis
globalThis.window = globalThis
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { MeshoptDecoder } from "three-stdlib"

const loader = new GLTFLoader()
const decoder = typeof MeshoptDecoder === "function" ? MeshoptDecoder() : MeshoptDecoder
await decoder.ready
loader.setMeshoptDecoder(decoder)

const buf = await readFile(process.argv[2])
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)

loader.parse(
  ab,
  "",
  (gltf) => {
    let meshes = 0
    let tris = 0
    let materials = 0
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        meshes++
        const g = o.geometry
        tris += g.index ? g.index.count / 3 : g.attributes.position.count / 3
        if (o.material) materials++
      }
    })
    console.log("PARSE OK")
    console.log("meshes:", meshes, "tris:", Math.round(tris), "materials:", materials)
    const textures = gltf.parser.json.images?.map((i) => i.uri || "buffer") ?? []
    console.log("images:", textures.length)
  },
  (err) => {
    console.error("PARSE FAILED:", err?.message || err)
    process.exit(1)
  }
)
