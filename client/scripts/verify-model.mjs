import { NodeIO } from "@gltf-transform/core"
import { KHRONOS_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions"
import { MeshoptDecoder } from "meshoptimizer"

await MeshoptDecoder.ready
const io = new NodeIO()
io.registerExtensions([...KHRONOS_EXTENSIONS, EXTMeshoptCompression])
io.registerDependencies({ "meshopt.decoder": MeshoptDecoder })

const doc = await io.read(process.argv[2])
const root = doc.getRoot()
console.log("used:", root.listExtensionsUsed().join(","))
console.log("required:", root.listExtensionsRequired().join(","))
for (const mesh of root.listMeshes()) {
  const prim = mesh.listPrimitives()[0]
  console.log("mesh:", mesh.getName(), "verts:", prim.getAttribute("POSITION").getCount(), "tris:", prim.getIndices().getCount() / 3)
}
console.log("textures:", root.listTextures().map((t) => t.getSize().join("x")).join(","))
