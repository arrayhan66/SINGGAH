import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useNavigate, useParams } from "react-router-dom"
import GalleryLights from "../components/GalleryLights"
import Museum from "../rooms/Museum"
import LookControls from "../controls/LookControls"
import { useWalkStore, loadHallReturn, clearHallReturn } from "../hooks/useWalk"
import { MUSEUM, findRoom, rooms } from "../rooms/museumLayout"

function useReadySignal(onReady) {
  const sent = useRef(false)
  useFrame(() => {
    if (!sent.current) {
      sent.current = true
      onReady?.()
    }
  })
}

function AreaLabel({ onArea }) {
  const last = useRef("")
  const navigate = useNavigate()
  useFrame(() => {
    const p = useWalkStore.getState().position
    const room = findRoom(p.x, p.z)
    if (room.label !== last.current) {
      last.current = room.label
      onArea(room.label)
      if (room.id === "hall") {
        navigate("/hall", { replace: true })
      } else {
        navigate(`/hall/${room.id}`, { replace: true })
      }
    }
  })
  return null
}

function VirtualExhibition({ onArea, onSelectProject, onReady, hallData }) {
  const { categorySlug } = useParams()

  useEffect(() => {
    // Returning from a project detail page: drop the player back exactly where
    // they were (same room, same spot) instead of the default spawn.
    const snap = loadHallReturn()
    if (snap) {
      useWalkStore.getState().reset([snap.x, snap.y, snap.z], snap.yaw)
      useWalkStore.setState({ pitch: snap.pitch, level: snap.level })
      clearHallReturn()
      return
    }

    // Only reset when the player is NOT already in the target area. The portal
    // system teleports the player into the room before AreaLabel changes the
    // URL, so skipping the reset here avoids yanking them back to a spawn (and
    // dropping an upper-floor player to the ground) on room entry/exit.
    const p = useWalkStore.getState().position
    const currentRoom = findRoom(p.x, p.z)
    if (categorySlug) {
      const room = rooms.find((r) => r.id === categorySlug)
      if (room && currentRoom.id === room.id) return
      if (room) {
        const cx = (room.x[0] + room.x[1]) / 2
        const spawnZ = room.z[0] + 3
        useWalkStore.getState().reset([cx, 0, spawnZ], Math.PI)
      } else {
        useWalkStore.getState().reset(MUSEUM.spawn.position, MUSEUM.spawn.yaw)
      }
    } else {
      if (currentRoom.id === "hall") return
      useWalkStore.getState().reset(MUSEUM.spawn.position, MUSEUM.spawn.yaw)
    }
  }, [categorySlug])

  useReadySignal(onReady)

  return (
    <>
      <GalleryLights />
      <Museum hallData={hallData} />
      <LookControls bounds={MUSEUM.bounds} onSelectProject={onSelectProject} />
      <AreaLabel onArea={onArea} />
    </>
  )
}

export default VirtualExhibition
