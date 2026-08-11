import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useWalkStore, EYE } from "../hooks/useWalk"
import { useTransitionStore } from "../hooks/useTransition"
import { getWalls, portals, findRoom, resolveHeight } from "../rooms/museumLayout"
import { resolveCollision, resolveObjectCollision, resolveAABBs } from "../utils/collision"
import { getObjectColliders } from "../utils/objectColliders"
import { getCollidableAABBs } from "../utils/sceneColliders"

const SPEED = 6
const DRAG_THRESHOLD = 6
const TELEPORT_RANGE = 4

function findAction(object) {
  let node = object
  while (node) {
    if (node.userData?.action) return node.userData.action
    node = node.parent
  }
  return null
}

function withinRange(point, range) {
  const from = useWalkStore.getState().position
  const dx = point.x - from.x
  const dz = point.z - from.z
  return Math.hypot(dx, dz) <= range
}

function LookControls({ bounds, onSelectProject }) {
  const { camera, gl, scene } = useThree()
  const keysRef = useRef({})
  const wallsRef = useRef(getWalls())
  const portalsRef = useRef(portals)
  const dragRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
  })
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"))
  const stuckRef = useRef(0)
  const lastCast = useRef(0)
  const modelCollidersRef = useRef([])
  const modelColliderBuilt = useRef(false)

  const handleAction = (action, point) => {
    if (action.type === "floor") {
      useWalkStore.getState().setTarget(point)
    } else if (action.type === "walk") {
      useWalkStore.getState().setTarget(action.point)
    } else if (action.type === "project") {
      onSelectProject(action.project)
    } else if (action.type === "teleport") {
      teleportTo(action.point, action.yaw)
    }
  }

  const teleportTo = (point, yaw) => {
    const room = findRoom(point.x, point.z)
    const message =
      room?.id === "hall"
        ? "MEMPERSIAPKAN VIRTUAL HALL"
        : `MEMASUKI ${room.label.split(" — ")[0]}`
    useTransitionStore.getState().start(message)
    const rh = resolveHeight(point.x, point.z, 0)
    point.y = rh.height
    useWalkStore.setState({ position: point.clone(), yaw, target: null, level: rh.level })
  }

  const checkPortalCross = (prev, next) => {
    for (const p of portalsRef.current) {
      if (p.axis === "x") {
        if (next.z >= p.from && next.z <= p.to) {
          const a = prev.x - p.at
          const b = next.x - p.at
          const crossed = a * b <= 0 && Math.abs(b) < 1.6
          const captured = Math.abs(b) < 1.6 && Math.abs(b) < Math.abs(a)
          if (crossed || captured) {
            return { point: new THREE.Vector3(p.target[0], 0, p.target[1]), yaw: p.yaw }
          }
        }
      } else {
        if (next.x >= p.from && next.x <= p.to) {
          const a = prev.z - p.at
          const b = next.z - p.at
          const crossed = a * b <= 0 && Math.abs(b) < 1.6
          const captured = Math.abs(b) < 1.6 && Math.abs(b) < Math.abs(a)
          if (crossed || captured) {
            return { point: new THREE.Vector3(p.target[0], 0, p.target[1]), yaw: p.yaw }
          }
        }
      }
    }
    return null
  }

  const applyTeleport = (prev, rawNext) => {
    const tp = checkPortalCross(prev, rawNext)
    if (!tp) return { position: resolveAll(rawNext), teleported: false }
    teleportTo(tp.point, tp.yaw)
    return { position: tp.point, teleported: true }
  }

  // Anti-tunneling: split a frame's movement into small substeps and resolve
  // collision after each one, so a big frame step can never skip over a wall.
  const MOVE_SUBSTEP = 0.25
  const moveWithCollision = (from, move) => {
    const total = move.length()
    if (total <= 0.0001) return { position: from.clone(), teleported: false }
    const steps = Math.max(1, Math.ceil(total / MOVE_SUBSTEP))
    const dir = move.clone().normalize()
    let pos = from.clone()
    for (let i = 0; i < steps; i++) {
      const stepLen = Math.min(MOVE_SUBSTEP, total - i * MOVE_SUBSTEP)
      const next = pos.clone().addScaledVector(dir, stepLen)
      const res = applyTeleport(pos, next)
      if (res.teleported) return res
      pos = res.position
    }
    return { position: pos, teleported: false }
  }

  const resolveAll = (pos) => {
    let p = resolveCollision(pos, wallsRef.current)
    p = resolveObjectCollision(p, getObjectColliders(), useWalkStore.getState().level)
    p = resolveAABBs(p, modelCollidersRef.current)
    p = resolveCollision(p, wallsRef.current)
    const rh = resolveHeight(p.x, p.z, useWalkStore.getState().level)
    p.y = rh.height
    useWalkStore.setState({ level: rh.level })
    return p
  }

  useEffect(() => {
    const el = gl.domElement

    const onPointerDown = (e) => {
      if (e.button !== 0 || !e.isPrimary) return
      dragRef.current.active = true
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
      dragRef.current.startX = e.clientX
      dragRef.current.startY = e.clientY
      useWalkStore.getState().setDragMoved(false)
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        /* pointer already released */
      }
      e.preventDefault()
    }

    const onPointerMove = (e) => {
      const elRect = el.getBoundingClientRect()
      mouse.current.x = ((e.clientX - elRect.left) / elRect.width) * 2 - 1
      mouse.current.y = -((e.clientY - elRect.top) / elRect.height) * 2 + 1

      if (dragRef.current.active) {
        const dx = e.clientX - dragRef.current.lastX
        const dy = e.clientY - dragRef.current.lastY
        dragRef.current.lastX = e.clientX
        dragRef.current.lastY = e.clientY
        useWalkStore.getState().look(dx, dy)
        const moved =
          Math.hypot(
            e.clientX - dragRef.current.startX,
            e.clientY - dragRef.current.startY,
          ) > DRAG_THRESHOLD
        useWalkStore.getState().setDragMoved(moved)
      } else {
        // Hover raycasts are expensive on a scene this dense — throttle them
        // so a fast mouse sweep only samples a few times per frame.
        const now = performance.now()
        if (now - lastCast.current < 80) return
        lastCast.current = now
        raycaster.current.setFromCamera(mouse.current, camera)
        const hits = raycaster.current.intersectObjects(scene.children, true)
        const action = hits.length ? findAction(hits[0].object) : null
        const actionable =
          action && action.type !== "teleport"
            ? action
            : action && withinRange(hits[0].point, TELEPORT_RANGE)
              ? action
              : null
        document.body.style.cursor = actionable ? "pointer" : "default"
      }
    }

    const onPointerUp = (e) => {
      if (e.button !== 0) return
      dragRef.current.active = false
      if (useTransitionStore.getState().active || useTransitionStore.getState().loading) return
      if (useWalkStore.getState().dragMoved) return
      raycaster.current.setFromCamera(mouse.current, camera)
      const hits = raycaster.current.intersectObjects(scene.children, true)
      const hit = hits.find((h) => findAction(h.object))
      if (!hit) return
      const action = findAction(hit.object)
      if (action.type === "teleport" && !withinRange(hit.point, TELEPORT_RANGE)) return
      handleAction(action, hit.point)
    }

    const onPointerCancel = () => {
      dragRef.current.active = false
    }

    const onKeyDown = (e) => {
      keysRef.current[e.code] = true
    }
    const onKeyUp = (e) => {
      keysRef.current[e.code] = false
    }

    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointermove", onPointerMove)
    el.addEventListener("pointerup", onPointerUp)
    el.addEventListener("pointercancel", onPointerCancel)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerup", onPointerUp)
      el.removeEventListener("pointercancel", onPointerCancel)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((state, delta) => {
    // Build the model collider cache once the scene is fully mounted, then
    // rebuild once more shortly after (catches late-mounted props / textures).
    if (!modelColliderBuilt.current) {
      modelCollidersRef.current = getCollidableAABBs(scene)
      modelColliderBuilt.current = 1
    } else if (modelColliderBuilt.current === 1 && state.clock.elapsedTime > 1.5) {
      modelCollidersRef.current = getCollidableAABBs(scene)
      modelColliderBuilt.current = 2
    }

    if (useTransitionStore.getState().active || useTransitionStore.getState().loading) {
      if (useWalkStore.getState().target) useWalkStore.setState({ target: null })
      const cur = useWalkStore.getState()
      camera.position.set(cur.position.x, cur.position.y + EYE, cur.position.z)
      euler.current.set(cur.pitch, cur.yaw, 0)
      camera.quaternion.setFromEuler(euler.current)
      return
    }

    const store = useWalkStore.getState()
    const keys = keysRef.current
    const dt = Math.min(delta, 0.05)

    const forwardPressed = keys.KeyW || keys.ArrowUp
    const backPressed = keys.KeyS || keys.ArrowDown
    const rightPressed = keys.KeyD || keys.ArrowRight
    const leftPressed = keys.KeyA || keys.ArrowLeft

    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, store.yaw, 0))
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0))

    if (forwardPressed || backPressed || rightPressed || leftPressed) {
      if (store.target) useWalkStore.setState({ target: null })
      const move = new THREE.Vector3()
      if (forwardPressed) move.addScaledVector(forward, SPEED * dt)
      if (backPressed) move.addScaledVector(forward, -SPEED * dt)
      if (rightPressed) move.addScaledVector(right, SPEED * dt)
      if (leftPressed) move.addScaledVector(right, -SPEED * dt)
      const res = moveWithCollision(store.position, move)
      const resolved = res.position
      resolved.x = THREE.MathUtils.clamp(resolved.x, bounds.minX, bounds.maxX)
      resolved.z = THREE.MathUtils.clamp(resolved.z, bounds.minZ, bounds.maxZ)
      useWalkStore.setState({ position: resolved })
    } else if (store.target) {
      const dir = new THREE.Vector3().subVectors(store.target, store.position)
      dir.y = 0
      const dist = dir.length()
      if (dist < 0.4) {
        useWalkStore.setState({ target: null })
        const { onArrive } = useWalkStore.getState()
        if (onArrive) {
          useWalkStore.setState({ onArrive: null })
          onArrive()
        }
      } else {
        const step = Math.min(dist, SPEED * dt)
        const move = dir.clone().normalize().multiplyScalar(step)
        const res = moveWithCollision(store.position, move)
        const resolved = res.position
        resolved.x = THREE.MathUtils.clamp(resolved.x, bounds.minX, bounds.maxX)
        resolved.z = THREE.MathUtils.clamp(resolved.z, bounds.minZ, bounds.maxZ)

        const moved = resolved.distanceTo(store.position)
        if (res.teleported) {
          useWalkStore.setState({ position: resolved })
        } else if (moved < 0.004) {
          stuckRef.current += dt
          if (stuckRef.current > 0.6) {
            stuckRef.current = 0
            useWalkStore.setState({ target: null })
          }
        } else {
          stuckRef.current = 0
        }

        const setState = {}
        if (!res.teleported) setState.position = resolved
        if (moved >= 0.01 && !dragRef.current.active && !res.teleported) {
          const desiredYaw = Math.atan2(-move.x, -move.z)
          let yaw = store.yaw
          let diff = desiredYaw - yaw
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          yaw += diff * Math.min(1, dt * 6)
          setState.yaw = yaw
        }
        useWalkStore.setState(setState)
      }
    }

    const cur = useWalkStore.getState()
    camera.position.set(cur.position.x, cur.position.y + EYE, cur.position.z)
    euler.current.set(cur.pitch, cur.yaw, 0)
    camera.quaternion.setFromEuler(euler.current)
  })

  return null
}

export default LookControls
