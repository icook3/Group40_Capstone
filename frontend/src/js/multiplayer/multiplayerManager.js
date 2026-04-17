import { GameClient } from "./gameClient.js";
import { AvatarMovement } from "../avatarMovement.js";
import { decodeSessionJoin, decodeWorldState, decodeSessionEnd } from "./gameDecoder.js";
import { multiplayerConstants } from "./multiplayerConstants.js";
import { constants } from "../constants.js";

const { serverMSG } = multiplayerConstants;

const RIDER_INPUT_INTERVAL_MS = 200; // 5hz
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
            players.forEach(p => {
                this.playerInfo.set(p.player_id, p);
            });
        }

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

        console.log(`[Multiplayer] Joined as slot ${playerSlot}, ${playerCount} players, ${durationSeconds}s`);

        const otherPlayerCount = this.playerInfo.size - 1; // exclude local
        const spacing = 1;
        const totalWidth = (otherPlayerCount - 1) * spacing;
        const startX = -(totalWidth / 2);

        // Offset so nobody lands on -0.5 where local rider is
        const LOCAL_RIDER_X = -0.5;

        let index = 0;
        this.playerInfo.forEach((info, player_id) => {
            if (player_id === this.localPlayerId) return;

            let spawnX = startX + (index * spacing);

            // Nudge if too close to local rider
            if (Math.abs(spawnX - LOCAL_RIDER_X) < 0.4) {
                spawnX += spacing;
            }

            index++;

            const avatar = new AvatarMovement(`mp-player-${player_id}`, {
                position: { x: spawnX, y: 1, z: -5 },
                isPacer: false,
                scene: window.__zlowSceneInstance?.scene
            });

            // Apply their customization
            if (info.player_data) {
                avatar.creator.loadOtherData(JSON.stringify(info.player_data));
            }

            this.otherPlayers.set(player_id, {
                avatar,
                player_id,
                display_name: info.display_name,
                slot: null,
                lastSeen: Date.now(),
                disconnected: false,
                speed: 0
            });
        });

        // Start sending rider input
        this.startRiderInputLoop();

        // Init HUD
        this.initHUD();
    }

    onWorldState(view) {
        const { riders } = decodeWorldState(view);

        const localRider = window.__zlowSceneInstance?.scene?.getObjectByName('rider');
        const localZ = localRider?.position.z ?? 0;
        const localX = localRider?.position.x ?? 0;

        // Find local rider's protocol position
        riders.forEach(rider => {
            if (rider.playerSlot === this.playerSlot) {
                this.localProtocolY = rider.y;
                this.localProtocolX = rider.x;
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

            // Z is relative to local rider — how far ahead or behind
            const threeZ = localZ + (rider.y - this.localProtocolY);

            // X uses the local rider's curve offset plus their lane difference
            // This keeps other players on the same curve as the local track
            const laneOffset = (rider.x - this.localProtocolX) / 10;
            const threeX = localX + laneOffset;

            const threeY = 1;

            const avatarEntity = playerEntry.avatar?.creator?.avatarEntity;
            if (avatarEntity) {
                avatarEntity.position.set(threeX, threeY, threeZ);
            }

            playerEntry.avatar?.setSpeed(rider.speed / 10);
        });

        // Check for disconnected players
        this.otherPlayers.forEach((playerEntry) => {
            if (!seenSlots.has(playerEntry.slot) && playerEntry.slot !== null) {
                const timeSinceLastSeen = Date.now() - playerEntry.lastSeen;
                if (timeSinceLastSeen > 3000) {
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
            const speed  = Math.round(constants.riderState.speed * 10);
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
        this.otherPlayers.forEach(playerEntry => {
            if (!playerEntry.disconnected) {
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

    initHUD() {
        const existing = document.getElementById('mp-hud');
        if (existing) existing.remove();

        const hud = document.createElement('div');
        hud.id = 'mp-hud';
        hud.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(53, 72, 79, 0.85);
            border-radius: 14px;
            padding: 12px 16px;
            font-family: "Nunito", sans-serif;
            font-size: 0.8rem;
            font-weight: 600;
            color: #e0e0e0;
            z-index: 1000;
            min-width: 160px;
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

        // Sort riders by y position descending (furthest ahead first)
        const sorted = [...riders].sort((a, b) => b.y - a.y);

        sorted.forEach((rider, index) => {
            const isLocal = rider.playerSlot === this.playerSlot;
            const playerEntry = isLocal ? null : this.findPlayerEntryBySlot(rider.playerSlot);

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
                ${disconnected ? '<span style="color:#f09595;font-size:0.7rem;">Left</span>' : ''}
                ${isLocal ? '<span style="color:rgba(224,224,224,0.4);font-size:0.7rem;">You</span>' : ''}
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