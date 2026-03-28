// index.js — handy registry
import { BuildingKind } from './Building.js';
import { TreeKind } from './Tree.js';

export const KINDS = [BuildingKind, TreeKind]; // 50/50 like original
export const kindsByName = Object.fromEntries(KINDS.map(k => [k.name, k]));

export function detectKind(obj) {
    // Preferred method
    const name = obj.userData?.zlowKind;
    if (name && kindsByName[name]) {
        return kindsByName[name];
    }

    // fallback if needed
    if (obj.userData?.isBuilding) {
        return kindsByName.building;
    }

    return kindsByName.tree;
}