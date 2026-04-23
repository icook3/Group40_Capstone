import { GameClient } from "./gameClient.js";
import { AvatarMovement } from "../avatarMovement.js";
import { decodeSessionJoin, decodeWorldState, decodeSessionEnd } from "./gameDecoder.js";
import { multiplayerConstants } from "./multiplayerConstants.js";
import { constants } from "../constants.js";

const { serverMSG } = multiplayerConstants;

const RIDER_INPUT_INTERVAL_MS = 50; // 20hz
const HEARTBEAT_INTERVAL_MS = 5000;  // 5 seconds

export class MultiplayerManager {
    constructor({ onSessionEnd } = {}) {
        this.onSessionEnd = onSessionEnd || null;
        this.gameClient = null;
        this.playerSlot = null;
        this.durationSeconds = null;
        this.sessionStartTime = null;

        // Map of slot number -> { avatar: AvatarMovement, player_id, display_name, lastSeen }
        this.otherPlayers = new Map();

        // Map of slot number -> player info from GAME_STARTING
        this.playerInfo = new Map();

        // Local player's last known protocol position
        this.localProtocolY = 0;

        // Timers
        this.riderInputInterval = null;
        this.heartbeatInterval = null;
        this.lastInputSentAt = 0;

        // HUD element reference
        this.hudElement = null;
    }

    async start(payload) {
        const { session_id, session_url, token, players } = payload;

        // Store player info from GAME_STARTING for avatar creation
        if (players) {
            players.forEach((p, index) => {
                this.playerInfo.set(p.player_id, p);
                p.lobbyIndex = index;
            });
        }

        // Build slot map where slot = lobbyIndex + 1
        this.slotToPlayerId = new Map();
        [...this.playerInfo.keys()].forEach((player_id, index) => {
            this.slotToPlayerId.set(index + 1, player_id);
        });

        // Store auth so for own player_id
        const auth = JSON.parse(sessionStorage.getItem('multiplayer_auth'));
        this.localPlayerId = auth?.player_id;

        // Connect to game service
        this.gameClient = new GameClient();
        this.gameClient.on(serverMSG.SESSION_JOIN, (view) => this.onSessionJoin(view));
        this.gameClient.on(serverMSG.WORLD_STATE,  (view) => this.onWorldState(view));
        this.gameClient.on(serverMSG.SESSION_END,  (view) => this.onSessionEnd(view));
        this.gameClient.on('DISCONNECTED', () => this.onDisconnected());

        await this.gameClient.connect(session_url, token);
    }

    onSessionJoin(view) {
        const { playerSlot, playerCount, durationSeconds } = decodeSessionJoin(view);
        this.playerSlot = playerSlot;
        this.gameClient.playerSlot = playerSlot;
        this.durationSeconds = durationSeconds;
        this.sessionStartTime = Date.now();

        // Reposition local rider to their slot
        const totalPlayers = this.playerInfo.size;
        const spacing = 1;
        const localRider = window.__zlowSceneInstance?.scene?.getObjectByName('rider');
        if (localRider) {
            const centerSlot = (totalPlayers + 1) / 2;
            const slotX = (playerSlot - centerSlot) * spacing;
            localRider.position.x = slotX;
            localRider.userData.slotX = slotX; // store for tween use
        }

        const otherPlayerCount = this.playerInfo.size - 1; // exclude local
        const totalWidth = (otherPlayerCount - 1) * spacing;
        const startX = -(totalWidth / 2);

        let index = 0;
        for (const [slot, player_id] of [...this.slotToPlayerId.entries()].sort((a, b) => a[0] - b[0])) {
            if (player_id === this.localPlayerId) continue;
            const info = this.playerInfo.get(player_id);

            const centerSlot = (totalPlayers + 1) / 2;
            const spawnX = (slot - centerSlot) * spacing;

            index++;

            const data = typeof info.player_data === 'string'
                ? JSON.parse(info.player_data)
                : info.player_data;

            const avatar = new AvatarMovement(`mp-player-${player_id}`, {
                position: { x: spawnX, y: 1, z: -5 },
                isPacer: false,
                scene: window.__zlowSceneInstance?.scene,
                loadLocal: false,
                model: data?.model || 'male'
            });

            // Apply their customization
            if (info.player_data) {
                avatar.creator.loadOtherData(JSON.stringify(info.player_data));
            }

            this.otherPlayers.set(player_id, {
                avatar,
                player_id,
                display_name: info.display_name,
                slot: slot,
                lastSeen: Date.now(),
                disconnected: false,
                speed: 0,
                targetX: spawnX,
                targetZ: -5
            });
        }

        // Start sending rider input
        this.startRiderInputLoop();

        // Init HUD
        this.initHUD();
    }

    onWorldState(view) {
        const { riders } = decodeWorldState(view);

        const localRider = window.__zlowSceneInstance?.scene?.getObjectByName('rider');
        const localZ = localRider?.position.z ?? 0;

        // Find local rider's protocol Y only
        riders.forEach(rider => {
            if (rider.playerSlot === this.playerSlot) {
                this.localProtocolY = rider.y;
            }
        });

        const seenSlots = new Set();

        riders.forEach(rider => {
            if (rider.playerSlot === this.playerSlot) return;

            const playerEntry = this.findPlayerBySlot(rider.playerSlot, rider);
            if (!playerEntry) return;

            seenSlots.add(rider.playerSlot);
            playerEntry.lastSeen = Date.now();
            playerEntry.slot = rider.playerSlot;
            playerEntry.speed = rider.speed;
            playerEntry.disconnected = false;

            const zDelta = (rider.y - this.localProtocolY) / 10;
            const targetZ = localZ + zDelta;

            const trackPoint = this.findTrackPointAtZ(targetZ);
            const trackX = trackPoint ? trackPoint.x : 0;

            const totalPlayers = riders.length;
            const spacing = 1;
            const centerSlot = (totalPlayers + 1) / 2;
            const slotOffset = (rider.playerSlot - centerSlot) * spacing;

            const threeX = trackX + slotOffset;

            playerEntry.targetX = threeX;
            playerEntry.targetZ = targetZ;

            // Set speed and power for animations
            playerEntry.avatar?.setSpeed(rider.speed);
            playerEntry.avatar?.setPower(rider.power);
        });

        this.otherPlayers.forEach((playerEntry) => {
            if (!seenSlots.has(playerEntry.slot) && playerEntry.slot !== null) {
                if (Date.now() - playerEntry.lastSeen > 3000) {
                    playerEntry.disconnected = true;
                }
            }
        });

        this.updateHUD(riders);
    }

    onSessionEnd(view) {
        const { reason } = decodeSessionEnd(view);
        this.cleanup();
        this.onSessionEnd?.(reason);
    }

    onDisconnected() {
        this.cleanup();
        this.onSessionEnd?.(null);
    }

    startRiderInputLoop() {
        this.riderInputInterval = setInterval(() => {
            const speed = Math.round(constants.riderState.speed);
            const power  = Math.round(constants.riderState.power || 0);
            const rider  = window.__zlowSceneInstance?.scene?.getObjectByName('rider');
            const x      = Math.round((rider?.position.x ?? 0) * 10);
            const y      = Math.round((rider?.position.z ?? 0) * 10);

            this.gameClient.sendRiderInput(power, speed, x, y);
            this.lastInputSentAt = Date.now();
        }, RIDER_INPUT_INTERVAL_MS);

        // Heartbeat fallback - sends if no input recently
        this.heartbeatInterval = setInterval(() => {
            if (Date.now() - this.lastInputSentAt > HEARTBEAT_INTERVAL_MS) {
                this.gameClient.sendHeartbeat();
            }
        }, HEARTBEAT_INTERVAL_MS);
    }

    update(dt) {
        const zLerpTime = 0.05;
        const xLerpTime = 0.25;
        const zAlpha = Math.min(1, dt / zLerpTime);
        const xAlpha = Math.min(1, dt / xLerpTime);

        this.otherPlayers.forEach(playerEntry => {
            if (!playerEntry.disconnected) {
                const avatarEntity = playerEntry.avatar?.creator?.avatarEntity;
                if (avatarEntity && playerEntry.targetX !== undefined) {
                    avatarEntity.position.x += (playerEntry.targetX - avatarEntity.position.x) * xAlpha;
                    avatarEntity.position.z += (playerEntry.targetZ - avatarEntity.position.z) * zAlpha;
                    avatarEntity.position.y = 1;
                }
                playerEntry.avatar?.update(dt);
            }
        });
    }

    findPlayerBySlot(slot, riderData) {
        // Try to find by existing slot assignment
        for (const [player_id, entry] of this.otherPlayers) {
            if (entry.slot === slot) {
                return entry;
            }
        }

        // Assign slot to first unassigned entry
        for (const [player_id, entry] of this.otherPlayers) {
            if (entry.slot === null) {
                entry.slot = slot;
                return entry;
            }
        }

        return null;
    }

    findTrackPointAtZ(targetZ) {
        const trackPoints = constants.trackPoints;
        if (!trackPoints || trackPoints.length === 0) return null;

        // Find the two track points surrounding targetZ
        let before = null;
        let after = null;

        for (let i = 0; i < trackPoints.length - 1; i++) {
            const a = trackPoints[i];
            const b = trackPoints[i + 1];

            // Track goes in negative Z direction
            if (a.z >= targetZ && b.z <= targetZ) {
                before = a;
                after = b;
                break;
            }
        }

        if (!before || !after) {
            // Fall back to closest
            let closest = trackPoints[0];
            let closestDist = Math.abs(trackPoints[0].z - targetZ);
            for (let i = 1; i < trackPoints.length; i++) {
                const dist = Math.abs(trackPoints[i].z - targetZ);
                if (dist < closestDist) {
                    closestDist = dist;
                    closest = trackPoints[i];
                }
            }
            return closest;
        }

        // Interpolate between before and after based on Z
        const t = (targetZ - before.z) / (after.z - before.z);
        return {
            x: before.x + (after.x - before.x) * t,
            z: targetZ
        };
    }

    initHUD() {
        const existing = document.getElementById('mp-hud');
        if (existing) existing.remove();

        const hud = document.createElement('div');
        hud.id = 'mp-hud';
        hud.style.cssText = `
        position: fixed;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(53, 72, 79, 0.85);
        border-radius: 14px;
        padding: 12px 16px;
        font-family: "Nunito", sans-serif;
        font-size: 0.8rem;
        font-weight: 600;
        color: #e0e0e0;
        z-index: 1000;
        min-width: 180px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    `;

        document.body.appendChild(hud);
        this.hudElement = hud;
    }

    updateHUD(riders) {
        if (!this.hudElement) return;

        this.hudElement.innerHTML = '';

        // Sort riders by y position ascending (furthest ahead first) (heading - direction)
        const sorted = [...riders].sort((a, b) => a.y - b.y);

        const localRiderY = riders.find(r => r.playerSlot === this.playerSlot)?.y ?? 0;

        sorted.forEach((rider, index) => {
            const isLocal = rider.playerSlot === this.playerSlot;
            const playerEntry = isLocal ? null : this.findPlayerEntryBySlot(rider.playerSlot);

            // Calculate relative distance to local rider
            const relativeZ = ((rider.y - localRiderY) / 10).toFixed(0);
            const isAhead = rider.y > localRiderY;
            const distColor = isAhead ? '#4caf82' : '#f09595';
            const distLabel = isAhead ? `+${relativeZ}m` : `${relativeZ}m`;

            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 0;
                ${index < sorted.length - 1 ? 'border-bottom: 1px solid rgba(255,255,255,0.1);' : ''}
            `;

            const disconnected = playerEntry?.disconnected ?? false;
            const displayName = isLocal
                ? (JSON.parse(sessionStorage.getItem('multiplayer_auth'))?.display_name || 'You')
                : (playerEntry?.display_name || `Slot ${rider.playerSlot}`);

            row.innerHTML = `
                <span style="color: rgba(224,224,224,0.4); min-width: 16px;">${index + 1}</span>
                <span style="
                    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
                    background: ${disconnected ? '#f09595' : (isLocal ? '#2da2d8' : '#2d7a4a')};
                "></span>
                <span style="
                    flex: 1;
                    color: ${isLocal ? '#e0f7ef' : (disconnected ? 'rgba(224,224,224,0.4)' : '#e0e0e0')};
                    text-decoration: ${disconnected ? 'line-through' : 'none'};
                ">${displayName}</span>
                <span style="color: ${isLocal ? 'rgba(224,224,224,0.4)' : (disconnected ? 'rgba(224,224,224,0.3)' : distColor)}; font-size: 0.7rem; min-width: 48px; text-align: right;">
                    ${isLocal ? 'You' : (disconnected ? 'Left' : distLabel)}
                </span>
            `;

            this.hudElement.appendChild(row);
        });
    }

    findPlayerEntryBySlot(slot) {
        for (const entry of this.otherPlayers.values()) {
            if (entry.slot === slot) return entry;
        }
        return null;
    }

    cleanup() {
        clearInterval(this.riderInputInterval);
        clearInterval(this.heartbeatInterval);
        this.riderInputInterval = null;
        this.heartbeatInterval = null;

        // Remove other player avatars from scene
        const scene = window.__zlowSceneInstance?.scene;
        this.otherPlayers.forEach(playerEntry => {
            const entity = playerEntry.avatar?.creator?.avatarEntity;
            if (entity && scene) {
                scene.remove(entity);
            }
        });
        this.otherPlayers.clear();

        this.gameClient?.disconnect();
        this.gameClient = null;

        const hud = document.getElementById('mp-hud');
        if (hud) {
            hud.remove();
        }
        this.hudElement = null;

        window.__multiplayerManager = null;
    }
}