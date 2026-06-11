import * as THREE from 'three'

export function flatDirectionFromYaw(yaw: number): THREE.Vector3 {
  return new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw))
}

export function flatRightFromYaw(yaw: number): THREE.Vector3 {
  return new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))
}

export function normalizeXZ(v: THREE.Vector3): THREE.Vector3 {
  const out = v.clone()
  out.y = 0
  return out.lengthSq() > 0 ? out.normalize() : out
}
