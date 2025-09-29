// A simple loader component for the Victorian desk lamp GLB model
// This uses useGLTF from @react-three/drei to load the model from the public folder
// and renders it in the scene. Comments explain each step for beginners.

import React, { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'

// Component that renders the Victorian desk lamp 3D model
// It accepts group props so you can position/rotate/scale the whole model
export default function VictorianLamp(props: React.ComponentProps<'group'> & { isLit?: boolean }) {
  const { isLit = false, ...groupProps } = props
  // Load the GLB file from the public directory
  const gltf = useGLTF('/office_desk_lamp.glb') as unknown as GLTF

  // After loading, enable shadows and control bulb emissive based on isLit state
  useEffect(() => {
    const scene = gltf.scene as THREE.Object3D
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if ((mesh as any).isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
        
        // Find the bulb material and control its emissive properties
        const material = (mesh.material as unknown) as THREE.Material | THREE.Material[]
        const materials = Array.isArray(material) ? material : [material]
        materials.forEach((mat) => {
          if (!mat) return
          // If this looks like a bulb (check name or other properties), control its emissive
          if ((mat as any).name?.toLowerCase().includes('bulb') || 
              (mat as any).name?.toLowerCase().includes('light') ||
              (mat as any).name?.toLowerCase().includes('lamp')) {
            if (isLit) {
              (mat as any).emissive.setHex(0xFFE4B5)
              (mat as any).emissiveIntensity = 0.3
            } else {
              (mat as any).emissive.setHex(0x000000)
              (mat as any).emissiveIntensity = 0
            }
          }
        })
      }
    })
  }, [gltf, isLit])

  return (
    // group lets us move/scale the entire model easily using props
    <group {...groupProps} dispose={null}>
      {/* primitive renders the loaded GLTF scene directly */}
      <primitive object={gltf.scene} />
      
      {/* Light bulb that can be turned on/off */}
      {isLit && (
        <pointLight
          position={[0, 0.5, 0]}  // Position at the top of the lamp
          intensity={2.0}
          color="#FFE4B5"  // Warm yellow light
          distance={10}
          decay={2}
        />
      )}
    </group>
  )
}

// Preload so the model is cached before first render
useGLTF.preload('/office_desk_lamp.glb')
