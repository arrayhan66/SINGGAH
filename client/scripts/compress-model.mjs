import { NodeIO } from "@gltf-transform/core"
import { KHRONOS_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions"
import { simplify, meshopt } from "@gltf-transform/functions"
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer"
import { readFile } from "node:fs/promises"

const INPUT = process.argv[2]
const OUTPUT = process.argv[3]
const RATIO = Number(process.argv[4] || "0.05")
const ERROR = Number(process.argv[5] || "0.01")

await MeshoptDecoder.ready
await MeshoptEncoder.ready
await MeshoptSimplifier.ready
MeshoptEncoder.useExperimentalFeatures = true

const io = new NodeIO()
io.registerExtensions([...KHRONOS_EXTENSIONS, EXTMeshoptCompression])
io.registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder })

const doc = await io.read(INPUT)

await doc.transform(simplify({ ratio: RATIO, error: ERROR, simplifier: MeshoptSimplifier }))
await doc.transform(meshopt({ level: "high", encoder: MeshoptEncoder, decoder: MeshoptDecoder }))
await doc.transform(meshopt({ level: "high", encoder: MeshoptEncoder, decoder: MeshoptDecoder }))

await io.write(OUTPUT, doc)

const out = await readFile(OUTPUT)
console.log(`Wrote ${OUTPUT}: ${(out.length / 1024 / 1024).toFixed(2)} MB`)
