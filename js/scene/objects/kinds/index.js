// index.js — handy registry
import { BuildingKind } from './Building.js';
import { TreeKind } from './Tree.js';

export const KINDS = [BuildingKind, TreeKind]; // 50/50 like original
export const kindsByName = Object.fromEntries(KINDS.map(k => [k.name, k]));
