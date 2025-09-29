// A simple loader component for the office desk GLB model
// This uses useGLTF from @react-three/drei to load the model from the public folder
// and renders it in the scene. Comments explain each step for beginners.

import React, { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'

// Component that renders the office desk 3D model
// It accepts group props so you can position/rotate/scale the whole model
export default function OfficeDesk(props: React.ComponentProps<'group'>) {
  // Load the GLB file from the public directory
  const gltf = useGLTF('/Computer Desk.glb') as unknown as GLTF

  // Create a chrome material for the entire desk
  const chromeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#C0C0C0',        // Bright silver color
      metalness: 0.8,          // Metallic but not fully
      roughness: 0.1,          // Slightly rough for realistic chrome
      envMapIntensity: 1.5,     // Strong reflections
      emissive: '#000000',     // No emissive glow
      emissiveIntensity: 0.0,   // No emissive
      toneMapped: true,        // Use tone mapping for realistic look
    })
  }, [])

  // After loading, enable shadows and apply textures to all meshes inside the model
  useEffect(() => {
    const scene = gltf.scene as THREE.Object3D
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
        // Replace all materials with chrome
        mesh.material = chromeMaterial
      }
    })
  }, [gltf, chromeMaterial])

  return (
    // group lets us move/scale the entire model easily using props
    <group {...props} dispose={null}>
      {/* primitive renders the loaded GLTF scene directly */}
      <primitive object={gltf.scene} />
    </group>
  )
}

// Preload so the model is cached before first render
useGLTF.preload('/Computer Desk.glb')


