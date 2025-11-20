"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Text3D, Environment, MeshWobbleMaterial, Sparkles, Center } from '@react-three/drei'
import { Suspense } from 'react'

function FloatingBox({ position }: { position: [number, number, number] }) {
  return (
    <Float
      speed={2}
      rotationIntensity={1}
      floatIntensity={2}
    >
      <mesh position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <MeshWobbleMaterial
          factor={0.5}
          speed={1}
          color="#6366f1"
          wireframe={false}
        />
      </mesh>
    </Float>
  )
}

function FloatingSphere({ position }: { position: [number, number, number] }) {
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.5}
      floatIntensity={1.5}
    >
      <mesh position={position}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

function FloatingTorus({ position }: { position: [number, number, number] }) {
  return (
    <Float
      speed={2.5}
      rotationIntensity={1.5}
      floatIntensity={2.5}
    >
      <mesh position={position} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.6, 0.2, 16, 100]} />
        <meshStandardMaterial
          color="#ec4899"
          metalness={0.7}
          roughness={0.1}
        />
      </mesh>
    </Float>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
      
      <FloatingBox position={[-3, 2, 0]} />
      <FloatingSphere position={[3, 1, -2]} />
      <FloatingTorus position={[0, -1, -1]} />
      <FloatingBox position={[4, -2, -3]} />
      <FloatingSphere position={[-4, -1, -2]} />
      
      <Sparkles
        count={100}
        scale={10}
        size={2}
        speed={0.4}
        color="#ffffff"
      />
      
      <Center>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.8}
          height={0.2}
          curveSegments={12}
          position={[0, 0, 0]}
        >
          EduApp
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
        </Text3D>
      </Center>
      
      <Environment preset="sunset" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export default function Scene3D() {
  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
