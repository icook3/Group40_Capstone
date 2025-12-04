// index.js — handy registry
import { BuildingKind } from './Building.js';
import { TreeKind } from './Tree.js';

export const KINDS = [BuildingKind, TreeKind]; // 50/50 like original
export const kindsByName = Object.fromEntries(KINDS.map(k => [k.name, k]));
export function detectKind(el) {
    const name = el.getAttribute('zlow-kind');
    if (name && kindsByName[name]) return kindsByName[name];

    // Fallback to geometry check (shouldn’t be needed once we set zlow-kind):
    const geom = el.getAttribute('geometry');
    const isBuilding = geom && (typeof geom === 'object'
        ? geom.primitive === 'box'
        : String(geom).includes('primitive: box'));
    return isBuilding ? kindsByName.building : kindsByName.tree;
}