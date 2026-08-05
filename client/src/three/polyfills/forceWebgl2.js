function patchGetContext(proto) {
  if (!proto || proto.__singgahWebgl2Patched) return
  const original = proto.getContext
  if (typeof original !== "function") return
  Object.defineProperty(proto, "__singgahWebgl2Patched", { value: true })
  proto.getContext = function (type, ...args) {
    if (type === "webgl") {
      const ctx2 = original.call(this, "webgl2", ...args)
      if (ctx2) return ctx2
    }
    return original.call(this, type, ...args)
  }
}

patchGetContext(HTMLCanvasElement.prototype)
patchGetContext(OffscreenCanvas && OffscreenCanvas.prototype)
