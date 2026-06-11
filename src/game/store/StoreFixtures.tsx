import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import { fridgeFrostTexture } from '@/utils/textures'
import { FIXTURES, type Fixture } from './layout'

const SHELF_COLOR = '#d6d3d1'
const FRAME_COLOR = '#52525b'
const FRIDGE_FRAME = '#cbd5e1'

function fixtureHeight(fixture: Fixture): number {
  return Math.max(...fixture.levels) + 0.45
}

function Boards({ fixture }: { fixture: Fixture }) {
  const halfLen = fixture.length / 2
  const halfDepth = fixture.depth / 2
  return (
    <>
      {fixture.levels.map((level) => (
        <group key={level} position={[0, level - 0.18, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[fixture.length, 0.1, fixture.depth]} />
            <meshStandardMaterial color={SHELF_COLOR} />
          </mesh>
          <CuboidCollider args={[halfLen, 0.05, halfDepth]} />
          {/* Front lip so items don't roll off */}
          <mesh position={[0, 0.08, halfDepth - 0.03]}>
            <boxGeometry args={[fixture.length, 0.08, 0.04]} />
            <meshStandardMaterial color={FRAME_COLOR} />
          </mesh>
          {fixture.sides === 'double' && (
            <mesh position={[0, 0.08, -(halfDepth - 0.03)]}>
              <boxGeometry args={[fixture.length, 0.08, 0.04]} />
              <meshStandardMaterial color={FRAME_COLOR} />
            </mesh>
          )}
        </group>
      ))}
    </>
  )
}

function EndCapsAndSpine({ fixture }: { fixture: Fixture }) {
  const h = fixtureHeight(fixture)
  const halfLen = fixture.length / 2
  const halfDepth = fixture.depth / 2
  return (
    <>
      {/* End caps */}
      {[-halfLen, halfLen].map((x) => (
        <mesh key={x} position={[x, h / 2, 0]} castShadow>
          <boxGeometry args={[0.08, h, fixture.depth]} />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>
      ))}
      {fixture.sides === 'double' ? (
        // Central spine divider
        <mesh position={[0, h / 2, 0]} castShadow>
          <boxGeometry args={[fixture.length, h, 0.08]} />
          <meshStandardMaterial color="#a8a29e" />
        </mesh>
      ) : (
        // Back panel
        <mesh position={[0, h / 2, -halfDepth]} castShadow receiveShadow>
          <boxGeometry args={[fixture.length, h, 0.08]} />
          <meshStandardMaterial color="#a8a29e" />
        </mesh>
      )}
    </>
  )
}

function FridgeShell({ fixture }: { fixture: Fixture }) {
  const frost = useMemo(() => fridgeFrostTexture(), [])
  const h = fixtureHeight(fixture)
  const halfLen = fixture.length / 2
  const halfDepth = fixture.depth / 2
  return (
    <>
      {/* Back glow panel (cold interior) */}
      <mesh position={[0, h / 2, -halfDepth + 0.05]}>
        <boxGeometry args={[fixture.length, h, 0.06]} />
        <meshStandardMaterial
          color="#bae6fd"
          emissive="#7dd3fc"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Frame */}
      {[-halfLen, halfLen].map((x) => (
        <mesh key={x} position={[x, h / 2, 0]} castShadow>
          <boxGeometry args={[0.16, h, fixture.depth]} />
          <meshStandardMaterial color={FRIDGE_FRAME} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {/* Top + bottom */}
      <mesh position={[0, h, 0]} castShadow>
        <boxGeometry args={[fixture.length + 0.1, 0.2, fixture.depth + 0.1]} />
        <meshStandardMaterial color={FRIDGE_FRAME} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[fixture.length, 0.1, fixture.depth]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Glass doors (front), split into panels with mullions */}
      {Array.from({ length: 3 }, (_, i) => {
        const panelW = fixture.length / 3
        const x = -halfLen + panelW * (i + 0.5)
        return (
          <group key={i}>
            <mesh position={[x, h / 2, halfDepth]}>
              <boxGeometry args={[panelW - 0.1, h - 0.4, 0.04]} />
              <meshStandardMaterial
                map={frost}
                color="#e0f2fe"
                transparent
                opacity={0.32}
                roughness={0.1}
                metalness={0.1}
              />
            </mesh>
            {/* Mullion */}
            <mesh position={[x - panelW / 2, h / 2, halfDepth + 0.02]}>
              <boxGeometry args={[0.06, h - 0.3, 0.06]} />
              <meshStandardMaterial color={FRIDGE_FRAME} />
            </mesh>
          </group>
        )
      })}
      {/* Cool interior light */}
      <pointLight
        position={[0, h - 0.4, 0]}
        intensity={6}
        distance={6}
        color="#bae6fd"
      />
    </>
  )
}

function FixtureSign({ fixture }: { fixture: Fixture }) {
  if (!fixture.sign) return null
  const h = fixtureHeight(fixture)
  const halfDepth = fixture.depth / 2
  return (
    <group position={[0, h + 0.55, halfDepth + 0.02]}>
      <mesh>
        <boxGeometry args={[Math.min(fixture.length, 5), 0.7, 0.1]} />
        <meshStandardMaterial
          color={fixture.signColor ?? '#1f2937'}
          emissive={fixture.signColor ?? '#1f2937'}
          emissiveIntensity={0.35}
        />
      </mesh>
      <Text
        position={[0, 0, 0.08]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#0f172a"
      >
        {fixture.sign}
      </Text>
    </group>
  )
}

function FixtureView({ fixture }: { fixture: Fixture }) {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[fixture.position[0], 0, fixture.position[1]]}
      rotation={[0, fixture.rotationY, 0]}
    >
      <Boards fixture={fixture} />
      {fixture.kind === 'fridge' ? (
        <FridgeShell fixture={fixture} />
      ) : (
        <EndCapsAndSpine fixture={fixture} />
      )}
      <FixtureSign fixture={fixture} />
    </RigidBody>
  )
}

export function StoreFixtures() {
  return (
    <>
      {FIXTURES.map((fixture) => (
        <FixtureView key={fixture.id} fixture={fixture} />
      ))}
    </>
  )
}
