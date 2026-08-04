import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useWalkStore, EYE } from "../hooks/useWalk"
import { getWalls, portals } from "../rooms/museumLayout"
import { resolveCollision, resolveObjectCollision } from "../utils/collision"
import { getObjectColliders } from "../utils/objectColliders"

const SPEED = 6
const DRAG_THRESHOLD = 6

function findAction(object) {
  let node = object
  while (node) {
    if (node.userData?.action) return node.userData.action
    node = node.parent
  }
  return null
}

function LookControls({ bounds, onSelectProject }) {
  const { camera, gl, scene } = useThree()
  const keysRef = useRef({})
  const wallsRef = useRef(getWalls())
  const portalsRef = useRef(portals)
  const collidersRef = useRef(getObjectColliders())
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

  const handleAction = (action, point) => {
    if (action.type === "floor") {
      useWalkStore.getState().setTarget(point)
    } else if (action.type === "walk") {
      useWalkStore.getState().setTarget(action.point)
    } else if (action.type === "project") {
      onSelectProject(action.project)
    } else if (action.type === "teleport") {
      useWalkStore.setState({ position: action.point.clone(), yaw: action.yaw, target: null })
    }
  }

  const checkPortalCross = (prev, next) => {
    for (const p of portalsRef.current) {
      if (p.axis === "x") {
        if (prev.z >= p.from && prev.z <= p.to && next.z >= p.from && next.z <= p.to) {
          const a = prev.x - p.at
          const b = next.x - p.at
          if (a * b <= 0 && Math.abs(next.x - p.at) < 1.6) {
            return { point: new THREE.Vector3(p.target[0], 0, p.target[1]), yaw: p.yaw }
          }
        }
      } else {
        if (prev.x >= p.from && prev.x <= p.to && next.x >= p.from && next.x <= p.to) {
          const a = prev.z - p.at
          const b = next.z - p.at
          if (a * b <= 0 && Math.abs(next.z - p.at) < 1.6) {
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
    useWalkStore.setState({ position: tp.point, yaw: tp.yaw, target: null })
    return { position: tp.point, teleported: true }
  }

  const resolveAll = (pos) =>
    resolveObjectCollision(resolveCollision(pos, wallsRef.current), collidersRef.current)

  useEffect(() => {
    const el = gl.domElement

    const onPointerDown = (e) => {
      if (e.button !== 0) return
      dragRef.current.active = true
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
      dragRef.current.startX = e.clientX
      dragRef.current.startY = e.clientY
      useWalkStore.getState().setDragMoved(false)
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
        raycaster.current.setFromCamera(mouse.current, camera)
        const hits = raycaster.current.intersectObjects(scene.children, true)
        const action = hits.length ? findAction(hits[0].object) : null
        document.body.style.cursor = action ? "pointer" : "default"
      }
    }

    const onPointerUp = (e) => {
      if (e.button !== 0) return
      dragRef.current.active = false
      if (useWalkStore.getState().dragMoved) return
      raycaster.current.setFromCamera(mouse.current, camera)
      const hits = raycaster.current.intersectObjects(scene.children, true)
      const hit = hits.find((h) => findAction(h.object))
      if (!hit) return
      handleAction(findAction(hit.object), hit.point)
    }

    const onKeyDown = (e) => {
      keysRef.current[e.code] = true
    }
    const onKeyUp = (e) => {
      keysRef.current[e.code] = false
    }

    el.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, delta) => {
    const store = useWalkStore.getState()
    const keys = keysRef.current
    const pos = store.position.clone()

    const forwardPressed = keys.KeyW || keys.ArrowUp
    const backPressed = keys.KeyS || keys.ArrowDown
    const rightPressed = keys.KeyD || keys.ArrowRight
    const leftPressed = keys.KeyA || keys.ArrowLeft

    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, store.yaw, 0))
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0))

    if (forwardPressed || backPressed || rightPressed || leftPressed) {
      if (store.target) useWalkStore.setState({ target: null })
      if (forwardPressed) pos.add(forward.clone().multiplyScalar(SPEED * delta))
      if (backPressed) pos.sub(forward.clone().multiplyScalar(SPEED * delta))
      if (rightPressed) pos.add(right.clone().multiplyScalar(SPEED * delta))
      if (leftPressed) pos.sub(right.clone().multiplyScalar(SPEED * delta))
      const tp1 = applyTeleport(store.position, pos)
      let resolved = tp1.position
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
        const step = Math.min(dist, SPEED * delta)
        const move = dir.clone().normalize().multiplyScalar(step)
        const next = store.position.clone().add(move)
        const tp = applyTeleport(store.position, next)
        const resolved = tp.position
        resolved.x = THREE.MathUtils.clamp(resolved.x, bounds.minX, bounds.maxX)
        resolved.z = THREE.MathUtils.clamp(resolved.z, bounds.minZ, bounds.maxZ)

        const moved = resolved.distanceTo(store.position)
        if (tp.teleported) {
          useWalkStore.setState({ position: resolved })
        } else if (moved < 0.004) {
          stuckRef.current += delta
          if (stuckRef.current > 0.6) {
            stuckRef.current = 0
            useWalkStore.setState({ target: null })
          }
        } else {
          stuckRef.current = 0
        }

        const setState = {}
        if (!tp.teleported) setState.position = resolved
        if (moved >= 0.01 && !dragRef.current.active && !tp.teleported) {
          const desiredYaw = Math.atan2(-move.x, -move.z)
          let yaw = store.yaw
          let diff = desiredYaw - yaw
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          yaw += diff * Math.min(1, delta * 6)
          setState.yaw = yaw
        }
        useWalkStore.setState(setState)
      }
    }

    const cur = useWalkStore.getState()
    camera.position.set(cur.position.x, EYE, cur.position.z)
    euler.current.set(cur.pitch, cur.yaw, 0)
    camera.quaternion.setFromEuler(euler.current)
  })

  return null
}

export default LookControls
