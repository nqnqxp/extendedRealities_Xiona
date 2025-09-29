// A simple loader component for the wood desk GLB model
// This uses useGLTF from @react-three/drei to load the model from the public folder
// and renders it in the scene. Comments explain each step for beginners.

import React, { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'

// Component that renders the wood desk 3D model
// It accepts group props so you can position/rotate/scale the whole model
export default function WoodDesk(props: React.ComponentProps<'group'>) {
  // Load the GLB file from the public directory
  const gltf = useGLTF('/wood_desk_table_interior_1.glb') as unknown as GLTF

  // After loading, enable shadows on all meshes inside the model
  useEffect(() => {
    const scene = gltf.scene as THREE.Object3D
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
  }, [gltf])

  return (
    // group lets us move/scale the entire model easily using props
    <group {...props} dispose={null}>
      {/* primitive renders the loaded GLTF scene directly */}
      <primitive object={gltf.scene} />
    </group>
  )
}

// Preload so the model is cached before first render
useGLTF.preload('/wood_desk_table_interior_1.glb')
