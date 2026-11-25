import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Sparkles, RoundedBox, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { Fragrance } from '../lib/data';

function makeLabelTexture(name: string, family: string) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 400;
  const x = c.getContext('2d')!;
  x.fillStyle = '#f5efe6'; x.fillRect(0, 0, 512, 400);
  x.strokeStyle = '#c6a15b'; x.lineWidth = 3; x.strokeRect(18, 18, 476, 364);
  x.strokeStyle = 'rgba(198,161,91,.45)'; x.lineWidth = 1; x.strokeRect(28, 28, 456, 344);
  x.textAlign = 'center'; x.fillStyle = '#0a0908';
  x.font = '600 44px Georgia, serif'; x.fillText('AUREVIA', 256, 118);
  x.fillStyle = '#c6a15b'; x.fillRect(206, 140, 100, 2);
  x.fillStyle = '#0a0908'; x.font = 'italic 34px Georgia, serif';
  x.fillText(name, 256, 205);
  x.font = '20px Georgia, serif'; x.fillStyle = '#6b5d43';
  x.fillText(family.toUpperCase(), 256, 248);
  x.font = '17px Georgia, serif'; x.fillText('EAU DE PARFUM · PARIS', 256, 315);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function PerfumeBottle({ fragrance, capOpen = false, scrollRef, interactive = false, reduced = false }: {
  fragrance: Fragrance; capOpen?: boolean; scrollRef?: React.MutableRefObject<number>; interactive?: boolean; reduced?: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const cap = useRef<THREE.Group>(null!);
  const label = useMemo(() => makeLabelTexture(fragrance.name, fragrance.family), [fragrance]);
  const targetCapY = capOpen ? 2.55 : 1.62;

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const scroll = scrollRef?.current ?? 0;
    if (!interactive) {
      const targetY = scroll * Math.PI * 1.4 + state.pointer.x * 0.45 + (reduced ? 0 : Math.sin(t * 0.35) * 0.08);
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 2.2, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -state.pointer.y * 0.12, 2.2, delta);
    }
    group.current.position.y = reduced ? -0.55 : -0.55 + Math.sin(t * 0.9) * 0.06;
    if (cap.current) {
      cap.current.position.y = THREE.MathUtils.damp(cap.current.position.y, targetCapY, 4, delta);
      cap.current.rotation.z = THREE.MathUtils.damp(cap.current.rotation.z, capOpen ? 0.28 : 0, 4, delta);
      cap.current.position.x = THREE.MathUtils.damp(cap.current.position.x, capOpen ? 0.55 : 0, 4, delta);
    }
  });

  return (
    <group ref={group} position={[0, -0.55, 0]} scale={0.92}>
      {/* Liquid — opaque so it renders inside the transmission pass of the glass */}
      <RoundedBox args={[1.34, 1.78, 0.42]} radius={0.07} smoothness={4} position={[0, 0, 0]}>
        <meshPhysicalMaterial color={fragrance.liquid} roughness={0.28} metalness={0} clearcoat={1} clearcoatRoughness={0.2} emissive={fragrance.liquidDeep} emissiveIntensity={0.4} envMapIntensity={0.9} />
      </RoundedBox>
      {/* Glass body */}
      <RoundedBox args={[1.55, 2.05, 0.58]} radius={0.09} smoothness={4} position={[0, 0.05, 0]}>
        <meshPhysicalMaterial color="#ffffff" metalness={0} roughness={0.05} transmission={1} thickness={0.35} ior={1.5} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={1.5} specularIntensity={1} />
      </RoundedBox>
      {/* Thick glass base */}
      <RoundedBox args={[1.48, 0.2, 0.52]} radius={0.05} smoothness={4} position={[0, -0.9, 0]}>
        <meshStandardMaterial color={fragrance.liquidDeep} roughness={0.3} metalness={0.55} envMapIntensity={1.2} />
      </RoundedBox>
      {/* Shoulder + neck */}
      <mesh position={[0, 1.16, 0]}>
        <cylinderGeometry args={[0.27, 0.55, 0.26, 32]} />
        <meshPhysicalMaterial color="#cdb488" roughness={0.18} metalness={0.25} clearcoat={1} envMapIntensity={0.9} />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 32]} />
        <meshStandardMaterial color="#c6a15b" metalness={1} roughness={0.22} envMapIntensity={1.8} />
      </mesh>
      {/* Spray stem (revealed when cap lifts) */}
      <mesh position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.22, 20]} />
        <meshStandardMaterial color="#e8c87a" metalness={1} roughness={0.15} />
      </mesh>
      {/* Cap */}
      <group ref={cap} position={[0, 1.62, 0]}>
        <RoundedBox args={[0.74, 0.88, 0.64]} radius={0.06} smoothness={4} position={[0, 0.32, 0]}>
          <meshStandardMaterial color={fragrance.cap} metalness={0.95} roughness={0.24} envMapIntensity={2} />
        </RoundedBox>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.78, 0.07, 0.68]} />
          <meshStandardMaterial color="#c6a15b" metalness={1} roughness={0.18} envMapIntensity={2} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.4]} />
          <meshStandardMaterial color="#c6a15b" metalness={1} roughness={0.2} />
        </mesh>
      </group>
      {/* Label */}
      <mesh position={[0, 0.05, 0.30]}>
        <planeGeometry args={[1.0, 0.78]} />
        <meshStandardMaterial map={label} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Gold plinth disc */}
      <mesh position={[0, -1.06, 0]}>
        <cylinderGeometry args={[1.05, 1.12, 0.07, 56]} />
        <meshStandardMaterial color="#8a6a33" metalness={1} roughness={0.32} envMapIntensity={1.4} />
      </mesh>
    </group>
  );
}

function CameraRig({ zoom }: { zoom: number }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    const dir = camera.position.clone().normalize();
    const target = dir.multiplyScalar(THREE.MathUtils.clamp(7.6 - zoom, 4, 8.6));
    camera.position.lerp(target, 1 - Math.exp(-3 * delta));
  });
  return null;
}

function Lights() {
  return (<>
    <ambientLight intensity={0.35} />
    <spotLight position={[5, 7, 5]} angle={0.45} penumbra={1} intensity={2.2} color="#ffe9c4" castShadow />
    <spotLight position={[-6, 4, -3]} angle={0.6} penumbra={1} intensity={1.1} color="#c6a15b" />
    <pointLight position={[0, 1, 4]} intensity={0.7} color="#fff4de" />
  </>);
}

export function BottleCanvas({ fragrance, mode = 'hero', capOpen = false, autoRotate = true, zoom = 1 }: {
  fragrance: Fragrance; mode?: 'hero' | 'interactive'; capOpen?: boolean; autoRotate?: boolean; zoom?: number;
}) {
  const scrollRef = useRef(0);
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (mode !== 'hero') return;
    const onScroll = () => { scrollRef.current = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 1.2)); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mode]);

  return (
    <Canvas
      dpr={[1, 1.75]} camera={{ position: [0, 0.55, 6.7], fov: 38 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-label={`Interactive 3D model of AUREVIA ${fragrance.name} perfume bottle`}
    >
      <Suspense fallback={null}>
        <Lights />
        <Float speed={reduced ? 0 : 1.4} rotationIntensity={reduced ? 0 : 0.25} floatIntensity={reduced ? 0 : 0.7}>
          <PerfumeBottle fragrance={fragrance} capOpen={capOpen} scrollRef={scrollRef} interactive={mode === 'interactive'} reduced={reduced} />
        </Float>
        <Sparkles count={70} scale={[6, 5, 3]} position={[0, 0.5, -1]} size={3} speed={reduced ? 0 : 0.35} color="#e8c87a" opacity={0.65} />
        <ContactShadows position={[0, -1.62, 0]} opacity={0.55} scale={7} blur={2.6} far={3} color="#000000" />
        <Environment preset="city" />
        {mode === 'interactive' && <>
          <OrbitControls enablePan={false} autoRotate={autoRotate && !reduced} autoRotateSpeed={1.4} minDistance={4} maxDistance={8.6} minPolarAngle={0.5} maxPolarAngle={2.1} makeDefault />
          <CameraRig zoom={zoom} />
        </>}
      </Suspense>
    </Canvas>
  );
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}
