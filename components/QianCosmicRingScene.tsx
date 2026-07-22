"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const COUNT = 64;
const RADIUS = 4.2;
const CARD_W = 0.62;
const CARD_H = 0.93;

function SignCard({
  index,
  angle,
  texture,
  highlighted,
}: {
  index: number;
  angle: number;
  texture: THREE.Texture;
  highlighted: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const x = Math.sin(angle) * RADIUS;
  const z = Math.cos(angle) * RADIUS;

  // 高亮的签，缩放和微微前移都用插值过渡，不是瞬间跳变——三签亮起
  // 的时候，看起来是"从环里浮出来"，不是"突然变大"。
  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = highlighted ? 1.7 : 1;
    meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.08;
    meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.08;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    const targetOpacity = highlighted ? 1 : 0.72;
    mat.opacity += (targetOpacity - mat.opacity) * 0.08;
  });

  return (
    <mesh ref={meshRef} position={[x, 0, z]} rotation={[0, angle, 0]} key={index}>
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshBasicMaterial map={texture} transparent opacity={0.72} toneMapped={false} />
    </mesh>
  );
}

// 中央灵犀核心——不用完整的后期处理Bloom管线（会显著增加包体积和
// 渲染开销），用"实心亮点 + 两层半透明叠加的大球"模拟辉光，配合
// additive 混合模式，视觉上足够接近发光效果，成本低很多。
function LingxiCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.6) * 0.12;
    if (coreRef.current) coreRef.current.scale.setScalar(pulse);
    if (glowRef.current) glowRef.current.scale.setScalar(pulse * 1.15);
  });

  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color="#8CD2FF" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshBasicMaterial color="#C79CFF" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </mesh>
    </group>
  );
}

function RotatingRing({ highlightIndexes, paused }: { highlightIndexes: number[]; paused: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const urls = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => `/images/qian/${String(i).padStart(2, "0")}.jpg`),
    []
  );
  const textures = useTexture(urls);
  const highlightSet = useMemo(() => new Set(highlightIndexes), [highlightIndexes]);

  useFrame((_, delta) => {
    if (!groupRef.current || paused) return;
    groupRef.current.rotation.y += delta * 0.055;
  });

  return (
    <group ref={groupRef}>
      <LingxiCore />
      {Array.from({ length: COUNT }).map((_, i) => {
        const angle = (i / COUNT) * Math.PI * 2;
        const tex = Array.isArray(textures) ? textures[i] : textures;
        return <SignCard key={i} index={i} angle={angle} texture={tex} highlighted={highlightSet.has(i)} />;
      })}
    </group>
  );
}

export default function QianCosmicRingScene({
  highlightIndexes,
  paused,
}: {
  highlightIndexes?: number[];
  paused?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 1.1, 8.5], fov: 42 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <RotatingRing highlightIndexes={highlightIndexes ?? []} paused={!!paused} />
    </Canvas>
  );
}
