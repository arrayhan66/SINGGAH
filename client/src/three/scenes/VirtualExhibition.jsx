import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import GalleryLights from "../components/GalleryLights"
import Museum from "../rooms/Museum"
import LookControls from "../controls/LookControls"
import { useWalkStore } from "../hooks/useWalk"
import { MUSEUM, findRoom } from "../rooms/museumLayout"

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

function VirtualExhibition({ onArea, onSelectProject }) {
  useEffect(() => {
    useWalkStore.getState().reset(MUSEUM.spawn.position, MUSEUM.spawn.yaw)
  }, [])

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
