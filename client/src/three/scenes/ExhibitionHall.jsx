import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Ground from "../components/Ground";
import Lights from "../components/Lights";
import Lobby from "../scenes/Lobby";
import Walls from "../components/Wall";
import Booth from "../components/Booth";

function ExhibitionHall() {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 15, 20],
        fov: 45,
      }}
    >
      <color attach="background" args={["#02111f"]} />

      <Lights />

      <Ground />

      <Lobby />

      <Walls />

      <Booth position={[-18,0,-12]} title="Website" color="#2563EB"/>

      <Booth position={[18,0,-12]} title="AI" color="#06B6D4"/>

      <Booth position={[-18,0,12]} title="IoT" color="#3B82F6"/>

      <Booth position={[18,0,12]} title="Cyber" color="#0EA5E9"/>

      <OrbitControls
        enablePan={false}
        maxPolarAngle={1.4}
      />
    </Canvas>
  );
}

export default ExhibitionHall;