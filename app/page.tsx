// This directive tells Next.js that this component runs on the client-side
// It's needed because we're using browser-specific features like 3D graphics
'use client';

// Import required components
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Sky } from '@react-three/drei';
import { Model as PottedPlant } from './components/PottedPlant';
import { Cube } from './components/Cube';
import SnowField from './components/SnowField';

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
      <Canvas camera={{ position: [5, 5, 5] }} style={{ background: '#0a0f1a' }}>
        
        {/* 
          LIGHTING SETUP
          We use multiple light sources to create depth and visual interest
        */}
        
        {/* Ambient light provides soft, overall illumination without direction */}
        <ambientLight intensity={0.3} color={"#cfe8ff"} />
        
        {/* Directional light simulates sunlight - comes from one direction */}
        <directionalLight 
          position={[10, 10, 5]}  // Position in 3D space [x, y, z]
          intensity={0.8}         // Slightly softer light for winter mood
          color={"#eaf4ff"}      // Cool temperature light
          castShadow              // Enable this light to cast shadows
        />
        
        {/* Point light radiates in all directions from a single point */}
        <pointLight 
          position={[-10, -10, -5]}  // Positioned opposite to main light
          intensity={0.3}            // Dimmer than main light
          color="#cfe8ff"            // Cool white fill light
        />
        
        {/* Spot light creates a cone of light, like a flashlight */}
        <spotLight
          position={[0, 10, 0]}  // Directly above the scene
          angle={0.3}            // Width of the light cone
          penumbra={1}           // Softness of light edges (0 = sharp, 1 = very soft)
          intensity={0.25}       // Gentle fill light
          color={"#e6f2ff"}
          castShadow             // Enable shadow casting
        />

        {/* Atmospheric effects for a snowy day */}
        {/* Fog makes distant objects fade, adding depth and a cold ambience */}
        <fog attach="fog" args={["#0a0f1a", 10, 60]} />

        {/* Sky adds a hemisphere skybox; turbidity and rayleigh tune the look */}
        <Sky distance={450000} turbidity={8} rayleigh={2} mieCoefficient={0.004} mieDirectionalG={0.6} inclination={0.52} azimuth={0.25} />
        
        {/* 
          3D OBJECTS
          These are our interactive 3D elements in the scene
        */}
        
        {/* Static orange cube positioned at the origin (0, 0, 0) */}
        <Cube />
        
        {/* Interactive potted plant that can be clicked to teleport */}
        <PottedPlant scale={10} />

        {/* Snowfall particle system that fills a large area around the origin */}
        <SnowField count={2000} areaSize={80} height={50} fallSpeed={2.5} size={0.6} />
        
        {/* 
          SCENE HELPERS
          Visual aids that help users understand the 3D space
        */}
        
        {/* Grid floor provides spatial reference and depth perception */}
        <Grid 
          args={[20, 20]}           // Grid dimensions: 20x20 units
          position={[0, -1, 0]}     // Positioned 1 unit below origin
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
        />
      </Canvas>
    </div>
  );
}
