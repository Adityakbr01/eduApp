"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, MeshWobbleMaterial, Sparkles, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import Link from 'next/link'
import ROUTES from '@/lib/CONSTANTS/ROUTES'

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
      <pointLight position={[10, -10, 5]} intensity={0.3} color="#ec4899" />
      
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
      
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export default function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 75 }}
          className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <div className="text-center space-y-8 px-4">
          <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            EduApp
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Experience Education in 3D - Interactive Learning Platform
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <Link 
              href={ROUTES.AUTH.REGISTER_NEW_STUDENT}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Join as Student
            </Link>
            <Link 
              href={ROUTES.AUTH.REGISTER_NEW_INSTRUCTOR}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Join as Instructor
            </Link>
          </div>

          <div className="mt-16 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-200">Quick Access</h2>
            <div className="flex flex-wrap gap-3 justify-center text-sm">
              <Link 
                href={ROUTES.AUTH.REGISTER_NEW_SUPPORT}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all"
              >
                Support Team
              </Link>
              <Link 
                href={ROUTES.AUTH.REGISTER_NEW_MANAGER}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all"
              >
                Manager Access
              </Link>
              <Link 
                href={ROUTES.DASHBOARD.ADMIN}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
