// A reusable snowfall particle system for React Three Fiber scenes
// This component renders many small white particles that fall down continuously
// and loop back to the top, creating an infinite snowfall effect.
// It is written for beginners, with detailed comments explaining each step.

'use client'

import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// Define the props our SnowField will accept.
// - count: how many snow particles to render
// - areaSize: diameter of the circular area where snow appears (wider spreads flakes)
// - height: how tall the snowfall volume is
// - fallSpeed: how fast particles fall per second
// - size: visual size of each particle in pixels
export type SnowFieldProps = {
  count?: number
  areaSize?: number
  height?: number
  fallSpeed?: number
  size?: number
} & React.ComponentProps<'group'>

export function SnowField({
  count = 1500,
  areaSize = 40,
  height = 30,
  fallSpeed = 2,
  size = 1.5,
  ...groupProps
}: SnowFieldProps) {
  // pointsRef will let us directly manipulate the Points object every frame
  const pointsRef = useRef<THREE.Points>(null)

  // Create a small circular sprite texture in memory for soft-edged round flakes
  // We draw a white circle that fades to transparent at the edges using a radial gradient
  const spriteTexture = useMemo(() => {
    // Create an offscreen canvas (this will not appear in the webpage)
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const context = canvas.getContext('2d')!

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const radius = canvas.width / 2

    // Radial gradient: opaque center -> transparent edge
    const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius)
    gradient.addColorStop(0.0, 'rgba(255,255,255,1.0)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.85)')
    gradient.addColorStop(1.0, 'rgba(255,255,255,0.0)')

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = gradient
    context.beginPath()
    context.arc(cx, cy, radius, 0, Math.PI * 2)
    context.fill()

    // Convert to a Three.js texture
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    return texture
  }, [])

  // We create the initial positions for all particles once using useMemo
  // This avoids recalculating positions on every render for performance
  const positions = useMemo(() => {
    // Each vertex has 3 numbers (x, y, z), so we need count * 3 entries
    const positionsArray = new Float32Array(count * 3)

    // Helper to get a random number between min and max
    const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min
    // We'll distribute particles in a CIRCLE instead of a square to avoid sharp edges
    // radius is half of areaSize (areaSize represents the diameter)
    const radius = areaSize / 2

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      //test
      // Sample a random point uniformly inside a circle using polar coordinates
      // Use sqrt for radius to achieve uniform density across the circle
      const theta = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * radius
      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r

      positionsArray[i3 + 0] = x // x
      // Random Y between 0 (ground) and height (top of snowfall volume)
      positionsArray[i3 + 1] = randomBetween(0, height) // y
      positionsArray[i3 + 2] = z // z
    }
    return positionsArray
  }, [count, areaSize, height])

  // useFrame runs on every animation frame (~60 times per second)
  // We use it to move particles downward and loop them back to the top
  useFrame((_, delta) => {
    // delta is the elapsed time (in seconds) since the last frame
    const points = pointsRef.current
    if (!points) return

    // Access the underlying buffer attribute that stores vertex positions
    const positionAttr = points.geometry.getAttribute('position') as THREE.BufferAttribute
    const array = positionAttr.array as Float32Array

    for (let i = 0; i < array.length; i += 3) {
      // array[i + 0] is x, array[i + 1] is y, array[i + 2] is z
      // Move the particle downward based on fallSpeed and elapsed time
      array[i + 1] -= fallSpeed * delta

      // If the particle falls below y = 0 (ground), place it back at top
      if (array[i + 1] < 0) {
        array[i + 1] = height
        // Re-sample a new random X/Z within the circular area for a natural spread
        const theta = Math.random() * Math.PI * 2
        const radius = areaSize / 2
        const r = Math.sqrt(Math.random()) * radius
        array[i + 0] = Math.cos(theta) * r
        array[i + 2] = Math.sin(theta) * r
      }
    }

    // Tell Three.js that the position buffer has changed and needs an update
    positionAttr.needsUpdate = true
  })

  // Ensure snow renders on top of other geometry and is never skipped by culling
  useEffect(() => {
    if (pointsRef.current) {
      // Render last so particles stay bright and visible
      pointsRef.current.renderOrder = 999
    }
  }, [])

  return (
    // A group lets us position/rotate/scale the entire snowfall system
    <group {...groupProps}>
      {/* Points is a special mesh that renders many small vertices efficiently */}
      <points ref={pointsRef} frustumCulled={false}>
        {/* BufferGeometry holds all vertex data (positions, colors, etc.) */}
        <bufferGeometry>
          {/* position attribute is where we store the x/y/z for each particle */}
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>

        {/* PointsMaterial defines how each vertex (particle) looks */}
        <pointsMaterial
          color={0xffffff}              // Pure white snow
          size={size}                   // Pixel size for each particle
          sizeAttenuation               // Particles get smaller when further away (adds depth)
          map={spriteTexture}           // Use our circular soft-edged sprite
          alphaTest={0.01}              // Discard fully transparent pixels (keeps edges soft)
          transparent                   // Enable alpha blending
          opacity={0.95}                // Gentle transparency for softness
          depthWrite={false}            // Do not write depth to avoid artifacts
          depthTest={true}              // Respect scene depth so objects occlude snow
          blending={THREE.NormalBlending} // Natural blending so occlusion works
          fog={false}                   // Keep flakes bright; visual fade already occurs
          toneMapped={false}            // Prevent tone mapping from dimming whites
        />
      </points>
    </group>
  )
}

export default SnowField


