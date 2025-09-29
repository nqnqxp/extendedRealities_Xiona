// A simple snowy ground plane for our winter scene
// This component renders a large white plane with a subtle roughness
// and receives shadows from lights and objects above it.

import React from 'react'

// We accept any mesh props so beginners can position/rotate/scale this like other meshes
export default function SnowGround(props: React.ComponentProps<'mesh'>) {
  return (
    // mesh is the basic renderable object in Three.js
    // We rotate the plane so it lies flat on the XZ plane (like the ground)
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow {...props}>
      {/* planeGeometry makes a flat 2D surface. args = [width, height, widthSegments, heightSegments] */}
      <planeGeometry args={[600, 600, 1, 1]} />
      {/* meshStandardMaterial reacts to scene lighting. Add a gentle emissive so bloom can catch it.
          toneMapped={false} keeps whites bright under postprocessing. */}
      <meshStandardMaterial 
        color="#f0f4f8" 
        emissive="#ffffff" 
        emissiveIntensity={0.4}
        roughness={0.95} 
        metalness={0} 
        fog 
        toneMapped={false}
      />
    </mesh>
  )
}


