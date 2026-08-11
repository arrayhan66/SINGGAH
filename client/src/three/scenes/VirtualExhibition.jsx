import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import GalleryLights from "../components/GalleryLights"
import Museum from "../rooms/Museum"
import LookControls from "../controls/LookControls"
import { useWalkStore } from "../hooks/useWalk"
import { MUSEUM, findRoom } from "../rooms/museumLayout"

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
  useFrame(() => {
    const p = useWalkStore.getState().position
    const room = findRoom(p.x, p.z)
    if (room.label !== last.current) {
      last.current = room.label
      onArea(room.label)
    }
  })
  return null
}

function VirtualExhibition({ onArea, onSelectProject, onReady }) {
  useEffect(() => {
    useWalkStore.getState().reset(MUSEUM.spawn.position, MUSEUM.spawn.yaw)
  }, [])

  useReadySignal(onReady)

  return (
    <>
      <GalleryLights />
      <Museum />
      <LookControls bounds={MUSEUM.bounds} onSelectProject={onSelectProject} />
      <AreaLabel onArea={onArea} />
    </>
  )
}

export default VirtualExhibition
