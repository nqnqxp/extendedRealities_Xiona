'use client';

// This directive tells Next.js that this component runs on the client-side
// It's needed because we're using browser-specific features like 3D graphics

// Import required components
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stars } from '@react-three/drei';
import { EffectComposer, Pixelation, Bloom } from '@react-three/postprocessing';
import { Model as PottedPlant } from './components/PottedPlant';
import { Cube } from './components/Cube';
import SnowField from './components/SnowField';
import SnowGround from './components/SnowGround';

// Main homepage component that renders our 3D scene
export default function Home() {
  return (
    // Container div that takes up the full viewport (100% width and height)
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* 
        Canvas is the main React Three Fiber component that creates a 3D scene
        It sets up WebGL context and handles rendering
        camera prop sets the initial camera position [x, y, z]
      */}
      <Canvas camera={{ position: [5, 5, 5] }} style={{ background: '#0b1220' }} shadows>
        
        {/* Night sky background to match fog for seamless blending */}
        <color attach="background" args={["#0b1220"]} />

        {/* 
          LIGHTING SETUP
          We use multiple light sources to create depth and visual interest
        */}
        
        {/* Ambient light provides soft, overall illumination without direction */}
        <ambientLight intensity={0.15} color={"#bcd3ff"} />

        {/* Hemisphere light adds soft sky and ground bounce for fewer harsh shadows */}
        <hemisphereLight args={["#3a5b9a", "#dfe8ff", 0.35]} />
        
        {/* Directional light acts as moonlight in this scene */}
        <directionalLight 
          position={[10, 10, 5]}  // Position in 3D space [x, y, z]
          intensity={0.4}         // Dimmer for night
          color={"#cfe3ff"}      // Cool moonlight
          castShadow              // Enable this light to cast shadows
          shadow-mapSize={[2048, 2048]} // Higher-res shadow map for smoother edges
          shadow-bias={-0.0005}         // Reduce shadow acne (dark speckles)
          shadow-normalBias={0.02}      // Lift shadow from surface to avoid banding
        />
        
        {/* Optional secondary fill for subtle ambient blue tone */}
        <pointLight position={[-10, -10, -5]} intensity={0.15} color="#9bb8ff" />
        
        {/* Spot light acts as a soft overhead fill */}
        <spotLight
          position={[0, 10, 0]}  // Directly above the scene
          angle={0.3}            // Width of the light cone
          penumbra={1}           // Softness of light edges (0 = sharp, 1 = very soft)
          intensity={0.18}       // Gentle fill light
          color={"#cfe0ff"}
          castShadow             // Enable shadow casting
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />

        {/* Atmospheric effects for a snowy day */}
        {/* Night fog for depth. Increase density slightly for night atmosphere */}
        <fogExp2 attach="fog" args={["#0b1220", 0.035]} />

        {/* Night sky: subtle star field instead of bright daytime skybox */}
        <Stars
          radius={200}    // inner radius of the star field sphere
          depth={60}      // how tall the star field spans
          count={3000}    // number of stars
          factor={2}      // star size factor
          saturation={0}  // white stars
          fade            // fade at the edges for softness
          speed={0}       // no rotation for calm night
        />
        
        {/* 
          3D OBJECTS
          These are our interactive 3D elements in the scene
        */}
        
        {/* Snowy ground plane that receives shadows */}
        <SnowGround position={[0, -1, 0]} />

        {/* Static orange cube positioned at the origin (0, 0, 0) */}
        <Cube />
        
        {/* Interactive potted plant that can be clicked to teleport */}
        <PottedPlant scale={10} />

        {/* Heavier snowfall with round, soft-edged flakes over a wide area */}
        <SnowField count={6000} areaSize={240} height={90} fallSpeed={2.6} size={0.8} />
        
        {/* 
          SCENE HELPERS
          Visual aids that help users understand the 3D space
        */}
        
        {/* Grid floor provides spatial reference and depth perception */}
        <Grid 
          args={[20, 20]}           // Grid dimensions: 20x20 units
          position={[0, -1.01, 0]}  // Slightly below the snow to avoid z-fighting
          cellSize={1}              // Each cell is 1x1 unit
          cellThickness={0.25}      // Thinner lines for a subtle snowy ground
          cellColor="#5a6b7a"       // Colder gray-blue for cell lines
          sectionSize={5}           // Major grid lines every 5 cells
          sectionThickness={0.75}   // Slightly thinner section lines
          sectionColor="#8aa3b8"    // Cooler blue for section lines
          fadeDistance={25}         // Grid fades out at this distance
          fadeStrength={1}          // How quickly the fade happens
        />
        
        {/* 
          CAMERA CONTROLS
          OrbitControls allows users to navigate around the 3D scene
          - Left click + drag: Rotate camera around the scene
          - Right click + drag: Pan the camera
          - Scroll wheel: Zoom in and out
        */}
        <OrbitControls 
          enablePan={true}      // Allow panning (moving the camera)
          enableZoom={true}     // Allow zooming in/out
          enableRotate={true}   // Allow rotating around the scene
          maxDistance={16}      // Limit how far you can zoom out (bigger number = further)
          minDistance={3}       // Prevent zooming inside objects
          maxPolarAngle={1.35}  // Prevent looking too low towards the horizon
        />

        {/*
          POST-PROCESSING: PIXELATION EFFECT
          EffectComposer lets us add full-screen effects after the scene is rendered.
          Pixelation makes everything look blocky by lowering the screen resolution.
          Increase granularity for larger pixels; decrease for finer pixels.
        */}
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.75} luminanceThreshold={0.1} luminanceSmoothing={0.14} mipmapBlur />
          <Pixelation granularity={6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
