'use client';

// This directive tells Next.js that this component runs on the client-side
// It's needed because we're using browser-specific features like 3D graphics

// Import required components
import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Stars } from '@react-three/drei';
import { EffectComposer, Pixelation, Bloom } from '@react-three/postprocessing';
import SnowField from './components/SnowField';
import SnowGround from './components/SnowGround';
import RetroPC from './components/RetroPC';
import WoodDesk from './components/WoodDesk';
import BooksMagazines from './components/BooksMagazines';
import OfficeChair from './components/OfficeChair';
import VictorianLamp from './components/VictorianLamp';

// Debug component to log camera position
function CameraDebugger() {
  const { camera } = useThree()
  
  useEffect(() => {
    const logPosition = () => {
      console.log('Camera Position:', {
        x: camera.position.x.toFixed(2),
        y: camera.position.y.toFixed(2), 
        z: camera.position.z.toFixed(2)
      })
    }
    
    // Log position every 2 seconds
    const interval = setInterval(logPosition, 2000)
    
    return () => clearInterval(interval)
  }, [camera])
  
  return null
}

// Main homepage component that renders our 3D scene
export default function Home() {
  // AUDIO REACTIVITY STATE
  // We continuously measure the audio level (0 to 1) and map it to visuals
  const [audioLevel, setAudioLevel] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Derived visual parameters based on the measured audio level
  // Using base + range * level keeps visuals stable when quiet and reactive when loud
  const reactiveFallSpeed = 2.6 + 3.0 * audioLevel   // faster snow when louder
  const reactiveSnowSize = 0.8 + 0.5 * audioLevel    // larger flakes with volume
  const reactiveBloom = 1.75 + 0.9 * audioLevel      // stronger glow when louder

  // Keep references so we can start/stop playback and cleanup WebAudio properly
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const rafRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)

  // Initialize the audio graph once (without autoplaying). We will start/pause via button.
  useEffect(() => {
    // No-op on server
    if (typeof window === 'undefined') return

    // Create the HTMLAudioElement that plays our track from the public folder
    // NOTE: File lives in /public so we reference it by "/filename.ext"
    const audio = new Audio("/Time After Time (Instrumental).mp3")
    audio.loop = true // loop for continuous reactivity
    audio.crossOrigin = 'anonymous' // allow connecting to WebAudio graph
    audioElRef.current = audio

    // Prepare WebAudio context and analyzer but don't start playback yet
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const src = ctx.createMediaElementSource(audio)
    const analyzer = ctx.createAnalyser()
    analyzer.fftSize = 1024 // resolution of the analysis
    analyzer.smoothingTimeConstant = 0.8 // smooths rapid changes
    // Allocate an ArrayBuffer explicitly to satisfy stricter typing
    const dataBuffer = new ArrayBuffer(analyzer.frequencyBinCount)
    const data = new Uint8Array(dataBuffer)

    // Wire the graph: audio element -> analyzer -> speakers
    src.connect(analyzer)
    analyzer.connect(ctx.destination)

    // Save refs for later use and cleanup
    audioCtxRef.current = ctx
    sourceRef.current = src
    analyzerRef.current = analyzer
    dataArrayRef.current = data
    isInitializedRef.current = true

    // Frame loop that computes a normalized loudness [0..1]
    const tick = () => {
      const analyzerNode = analyzerRef.current
      const array = dataArrayRef.current
      if (!analyzerNode || !array) return
      // Cast to satisfy TypeScript lib typing differences across versions
      // Call with relaxed typing to satisfy differing DOM lib versions
      (analyzerNode as unknown as { getByteFrequencyData: (arr: Uint8Array) => void })
        .getByteFrequencyData(array as unknown as Uint8Array)
      let sum = 0
      for (let i = 0; i < array.length; i++) sum += array[i]
      const avg = sum / array.length // 0..255
      const level = Math.min(1, Math.max(0, avg / 255))
      // Smooth with a little inertia for nicer visuals
      setAudioLevel(prev => prev * 0.85 + level * 0.15)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    // Cleanup all nodes and animation frame when the component unmounts
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      try {
        audio.pause()
      } catch {}
      try {
        audioCtxRef.current?.close()
      } catch {}
      audioElRef.current = null
      audioCtxRef.current = null
      sourceRef.current = null
      analyzerRef.current = null
      dataArrayRef.current = null
      isInitializedRef.current = false
    }
  }, [])

  // Simple play/pause button handler. Must be triggered by user gesture due to browser policies.
  const onTogglePlay = async () => {
    if (!isInitializedRef.current || !audioElRef.current || !audioCtxRef.current) return
    const ctx = audioCtxRef.current
    const audio = audioElRef.current
    // Browsers often require resuming the context on user gesture
    if (ctx.state === 'suspended') await ctx.resume()
    if (audio.paused) {
      await audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  return (
    // Container div that takes up the full viewport (100% width and height)
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Simple UI to start/stop audio so visuals can react to the track */}
      <button className="uiButton uiFont" onClick={onTogglePlay}>
        {/* The button toggles playback state, label is generic for simplicity */}
        lock in
      </button>
      {/* 
        Canvas is the main React Three Fiber component that creates a 3D scene
        It sets up WebGL context and handles rendering
        camera prop sets the initial camera position [x, y, z]
      */}
      <Canvas camera={{ position: [-10.25, 7.40, 6.05] }} style={{ background: '#0b1220' }} shadows>
        
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

        {/* DESK SETUP - All models arranged in the center */}
        
        {/* Main wood desk in the center */}
        <WoodDesk position={[0, -1, 0]} scale={0.08} rotation={[0, Math.PI, 0]} />
        
        {/* Retro PC on the desk */}
        <RetroPC position={[7.5, 2.4, -6.7]} scale={4.2} rotation={[0, Math.PI, 0]} />
        
        {/* Books and magazines on the desk */}
        <BooksMagazines position={[-0.03, 2.3, -2.8]} scale={0.12} rotation={[0, Math.PI/30, 0]} />
        
        {/* Office chair behind the desk */}
        <OfficeChair position={[-2.0, -1, -0.6]} scale={0.04} rotation={[0, Math.PI/2, 0]} />
        
        {/* Victorian desk lamp on the desk to the right of the PC */}
        <VictorianLamp position={[0.4, 2.4, 2.1]} scale={4.0} rotation={[0, Math.PI*1.1, 0]} isLit={isPlaying} />

        {/* Heavier snowfall with round, soft-edged flakes over a wide area.
            We drive fallSpeed and size from the audio level for reactivity. */}
        <SnowField 
          count={6000} 
          areaSize={240} 
          height={90} 
          fallSpeed={reactiveFallSpeed} 
          size={reactiveSnowSize} 
        />
        
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
        
        {/* Debug component to log camera position */}
        <CameraDebugger />
        
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
          {/* Bloom intensity responds to audio for a gentle pulsing glow */}
          <Bloom intensity={reactiveBloom} luminanceThreshold={0.05} luminanceSmoothing={0.2} mipmapBlur />
          <Pixelation granularity={6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
