const queue = []
let started = false

function idle(fn) {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(fn, { timeout: 3000 })
  } else {
    setTimeout(fn, 500)
  }
}

export function prefetch(...loaders) {
  queue.push(...loaders)
  if (started) return
  started = true
  idle(() => {
    queue.forEach((l) => l().catch(() => {}))
  })
}