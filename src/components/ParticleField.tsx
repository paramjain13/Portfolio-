import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'

const COUNT = 2200
const VOLT = new THREE.Color('#22D3EE')
const INK = new THREE.Color('#EDEDE6')

/** Soft round sprite texture for points. */
function useDotTexture() {
  return useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.4, 'rgba(255,255,255,0.8)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])
}

function Points({ animate }: { animate: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)
  const texture = useDotTexture()

  // Precomputed stable layout: positions, per-point seeds, colors (~4% volt).
  const { base, seeds, colors } = useMemo(() => {
    const base = new Float32Array(COUNT * 3)
    const seeds = new Float32Array(COUNT * 2)
    const colors = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      // Loose constellation spread, denser toward center.
      const r = Math.pow(Math.random(), 0.6)
      const theta = Math.random() * Math.PI * 2
      base[i * 3] = Math.cos(theta) * r * 9
      base[i * 3 + 1] = Math.sin(theta) * r * 5.5
      base[i * 3 + 2] = (Math.random() - 0.5) * 4
      seeds[i * 2] = Math.random() * Math.PI * 2
      seeds[i * 2 + 1] = 0.2 + Math.random() * 0.6
      const c = Math.random() < 0.04 ? VOLT : INK
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { base, seeds, colors }
  }, [])

  const displacement = useRef(new Float32Array(COUNT * 3))
  const mouseWorld = useRef(new THREE.Vector3(9999, 9999, 0))

  useFrame((state) => {
    const points = pointsRef.current
    if (!points) return
    const geo = points.geometry
    const pos = geo.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    const t = state.clock.elapsedTime

    // Cursor world position on the z=0 plane.
    const v = state.viewport
    mouseWorld.current.set(
      (state.pointer.x * v.width) / 2,
      (state.pointer.y * v.height) / 2,
      0,
    )
    // ~180px sphere of influence converted to world units.
    const radius = (180 / window.innerWidth) * v.width
    const r2 = radius * radius

    // Camera parallax +/- 0.02 rad.
    state.camera.rotation.y += (state.pointer.x * 0.02 - state.camera.rotation.y) * 0.05
    state.camera.rotation.x += (-state.pointer.y * 0.02 - state.camera.rotation.x) * 0.05

    const disp = displacement.current
    const mx = mouseWorld.current.x
    const my = mouseWorld.current.y

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      const i2 = i * 2
      let dx = 0
      let dy = 0
      if (animate) {
        // Slow curl-like drift (sine flow field).
        const ph = seeds[i2]
        const sp = seeds[i2 + 1]
        dx = Math.sin(t * sp + ph + base[i3 + 1] * 0.35) * 0.35
        dy = Math.cos(t * sp * 0.8 + ph + base[i3] * 0.35) * 0.35

        // Cursor repulsion with eased falloff; displacement decays (lerp 0.95).
        const ddx = base[i3] + disp[i3] - mx
        const ddy = base[i3 + 1] + disp[i3 + 1] - my
        const dist2 = ddx * ddx + ddy * ddy
        if (dist2 < r2 && dist2 > 0.0001) {
          const dist = Math.sqrt(dist2)
          const force = (1 - dist / radius) ** 2 * 0.09
          disp[i3] += (ddx / dist) * force
          disp[i3 + 1] += (ddy / dist) * force
        }
        disp[i3] *= 0.95
        disp[i3 + 1] *= 0.95
        disp[i3 + 2] *= 0.95
      }
      arr[i3] = base[i3] + dx + disp[i3]
      arr[i3 + 1] = base[i3 + 1] + dy + disp[i3 + 1]
      arr[i3 + 2] = base[i3 + 2] + disp[i3 + 2]
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[base.slice(), 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        map={texture}
        vertexColors
        transparent
        opacity={0.4}
        alphaTest={0.01}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

interface ParticleFieldProps {
  /** Pause the render loop when the hero leaves the viewport. */
  active: boolean
  /** Reduced-motion: render a static constellation. */
  animate: boolean
  scaleRef?: RefObject<HTMLDivElement | null>
}

export default function ParticleField({ active, animate, scaleRef }: ParticleFieldProps) {
  return (
    <div ref={scaleRef} className="absolute inset-0">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Points animate={animate} />
      </Canvas>
    </div>
  )
}
