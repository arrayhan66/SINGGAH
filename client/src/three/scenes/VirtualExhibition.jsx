import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import GalleryLights from "../components/GalleryLights"
import Museum from "../rooms/Museum"
import LookControls from "../controls/LookControls"
import WalkTargetMarker from "../components/WalkTargetMarker"
import FloorHoverMarker from "../components/FloorHoverMarker"
import { useWalkStore, loadHallReturn, clearHallReturn, resetToHallSpawn } from "../hooks/useWalk"
import { useHallMusicStore } from "../hooks/useHallMusic"
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
  const location = useLocation()

  // "Mulai Eksplorasi" di Beranda menandai masuk hall sebagai sesi baru.
  // Flag-nya dibaca saat render (bukan di dalam effect) karena AreaLabel
  // menimpa URL dengan navigate(..., { replace: true }) di frame pertama,
  // yang ikut menghapus location.state.
  const [freshHall] = useState(() => location.state?.freshHall === true)
  // Sekali saja: hallData di-refetch beberapa saat setelah masuk, dan efek
  // di bawah ikut jalan lagi saat itu — pengunjung tak boleh ditarik balik
  // ke spawn setelah sudah mulai berjalan.
  const freshHallRef = useRef(freshHall)

  // The music box beside the TV must already be glowing and playing the moment
  // the visitor is in the hall. Held to a mount-level effect so a room change
  // that re-runs the spawn effect below does not restart the track; it also
  // stops the music again once the canvas goes away (leaving the hall or
  // opening a project), so it never plays over the rest of the site.
  useEffect(() => {
    useHallMusicStore.getState().enterHall()
    return () => useHallMusicStore.getState().leaveHall()
  }, [])

  useEffect(() => {
    // Mulai eksplorasi dari Beranda: selalu buka di titik awal di depan
    // hologram, bukan melanjutkan posisi terakhir dari kunjungan sebelumnya.
    if (freshHallRef.current) {
      freshHallRef.current = false
      resetToHallSpawn()
      return
    }

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
    // hallData re-runs this after the (possibly async) layout rebuild so a
    // deep-link into a brand-new category still resolves to its room.
  }, [categorySlug, hallData])

  useReadySignal(onReady)

  return (
    <>
      <GalleryLights />
      <Museum hallData={hallData} />
      <LookControls bounds={MUSEUM.bounds} onSelectProject={onSelectProject} />
      <WalkTargetMarker />
      <FloorHoverMarker />
      <AreaLabel onArea={onArea} />
    </>
  )
}

export default VirtualExhibition
