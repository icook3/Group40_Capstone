// js/scene/objects/kinds/index.js
import { BuildingKind } from './Building.js';
import { TreeKind } from './Tree.js';
export const KINDS = [BuildingKind, TreeKind]; // 50/50 like original

// Build lookup table by both class name and friendly aliases
const byClassName = Object.fromEntries(KINDS.map(k => [k.name, k]));
const aliasByName = {
  building: BuildingKind,
  tree: TreeKind,
  Building: BuildingKind,
  Tree: TreeKind,
};

export const kindsByName = { ...byClassName, ...aliasByName };

// Detect what kind an element is (used when recycling/spawning)
export function detectKind(el) {
  const name = el.getAttribute('zlow-kind');
  if (name) {
    const key = String(name).trim();
    const hit = kindsByName[key] || kindsByName[key.toLowerCase()];
    if (hit) return hit;
  }

  // Fallback to geometry heuristic (rare once zlow-kind is set)
  const geom = el.getAttribute('geometry');
  const primitive = typeof geom === 'object' ? geom?.primitive : String(geom || '');
  const isBuilding = primitive === 'box' || primitive.includes('primitive: box');
  return isBuilding ? BuildingKind : TreeKind;
}
