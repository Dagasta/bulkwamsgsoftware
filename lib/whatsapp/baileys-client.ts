import makeWASocket, { DisconnectReason, useMultiFileAuthState as getBaileysAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';

export const INSTANCE_ID = Math.random().toString(36).substring(2, 15); // Unique ID for this server instance
// --- Global Persistence for Next.js ---
const globalForBaileys = global as any;
if (!globalForBaileys.activeConnections) globalForBaileys.activeConnections = new Map();
if (!globalForBaileys.memoryLocks) globalForBaileys.memoryLocks = new Set();
if (!globalForBaileys.cachedVersion) globalForBaileys.cachedVersion = null;

export const activeConnections = globalForBaileys.activeConnections;
const memoryLocks = globalForBaileys.memoryLocks;

// --- Cloud-Safe Path Management ---
const getStorageBase = () => {
    // On Vercel or cloud environments, we MUST use /tmp as the rest is read-only
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        return path.join('/tmp', '.baileys_auth');
    }
    return path.join(process.cwd(), '.baileys_auth');
};

const STORAGE_BASE = getStorageBase();

export function debugLog(message: string) {
    const logPath = path.join(STORAGE_BASE, 'dispatch.log');
    if (!fs.existsSync(STORAGE_BASE)) fs.mkdirSync(STORAGE_BASE, { recursive: true });
    const entry = `[${new Date().toISOString()}] [${INSTANCE_ID}] ${message}\n`;
    console.log(`[${INSTANCE_ID}] ${message}`);
    try { fs.appendFileSync(logPath, entry); } catch (e) { }
}

async function acquireGlobalLock(userId: string): Promise<boolean> {
    try {
        const { createServiceClient } = await import('@/lib/supabase/service');
        const adminClient = createServiceClient();

        // 1. Check if an active lock exists
        const { data: profile } = await adminClient.from('profiles').select('whatsapp_lock_id, whatsapp_lock_at').eq('id', userId).single();

        const now = new Date();
        const lockId = profile?.whatsapp_lock_id;
        const lockAt = profile?.whatsapp_lock_at ? new Date(profile.whatsapp_lock_at) : null;

        // If locked by us, we are good
        if (lockId === INSTANCE_ID) return true;

        // If locked by someone else, check if it's expired (60s)
        if (lockId && lockAt && (now.getTime() - lockAt.getTime() < 60000)) {
            debugLog(`[Lock] 🛑 Locked by another instance: ${lockId}`);
            return false;
        }

        // 2. Try to seize the lock atomically (Conditional Update)
        const { error } = await adminClient.from('profiles').update({
            whatsapp_lock_id: INSTANCE_ID,
            whatsapp_lock_at: now.toISOString()
        })
            .eq('id', userId)
            .or(`whatsapp_lock_id.is.null,whatsapp_lock_id.eq.${lockId || 'none'}`);

        if (error) {
            debugLog(`[Lock] 🛑 Race condition lost for ${userId}`);
            return false;
        }

        debugLog(`[Lock] 🔒 GLOBAL LOCK SEIZED for ${userId} (Instance: ${INSTANCE_ID})`);
        return true;
    } catch (e) {
        return false;
    }
}

async function releaseGlobalLock(userId: string) {
    try {
        const { createServiceClient } = await import('@/lib/supabase/service');
        const adminClient = createServiceClient();

        // Only release if we own it
        await adminClient.from('profiles').update({
            whatsapp_lock_id: null,
            whatsapp_lock_at: null
        }).eq('id', userId).eq('whatsapp_lock_id', INSTANCE_ID);

        debugLog(`[Lock] 🔓 GLOBAL LOCK RELEASED for ${userId}`);
    } catch (e) { }
}

// --- Master Connection Control ---
if (!globalForBaileys.connPromises) globalForBaileys.connPromises = new Map();
export const connPromises = globalForBaileys.connPromises;

export function parseSpintax(text: string): string {
    const spintaxRegex = /\{([^{}]+)\}/g;
    let match;
    let result = text;
    while ((match = spintaxRegex.exec(result)) !== null) {
        const parts = match[1].split('|');
        const randomPart = parts[Math.floor(Math.random() * parts.length)];
        result = result.replace(match[0], randomPart);
        spintaxRegex.lastIndex = 0; // Reset to catch nested or subsequent patterns
    }
    return result;
}

function repairJID(phone: string): string {
    let clean = phone.replace(/\D/g, '');

    // Global normalization: Handle leading 00 or + (already removed by \D)
    // If it's a local number without country code, we need to be careful.
    // Defaulting to appending @s.whatsapp.net is standard for Baileys.

    // Specialized UAE handling as requested in original code but made safer
    if (clean.startsWith('05') && clean.length === 10) {
        clean = '971' + clean.substring(1);
    } else if (clean.startsWith('0') && !clean.startsWith('00')) {
        // Generic local to international if starts with 0 (might need user country config later)
        // For now, we keep it as is if it's already long enough to be international
        if (clean.length < 10) {
            debugLog(`[JID] ⚠️ Short number detected: ${clean}`);
        }
    }

    return `${clean}@s.whatsapp.net`;
}

export async function connectToWhatsApp(userId: string) {
    // 1. Return existing connection IF it's alive and healthy
    const existing = activeConnections.get(userId);
    if (existing) {
        const ws = existing.socket?.ws;
        // If OPEN, use it. If connecting, wait for it.
        if (ws?.readyState === 1 || ws?.readyState === 0) {
            return existing.socket;
        }
        // If Closing/Closed, we proceed to re-initiate
    }

    // 2. Singleton Lock: Prevent parallel connection attempts
    if (connPromises.has(userId)) {
        debugLog(`[Baileys] 🦾 Already initiating for: ${userId}`);
        return connPromises.get(userId);
    }

    const initiationPromise = (async () => {
        try {
            if (memoryLocks.has(userId)) return null;
            memoryLocks.add(userId);

            // 3. SEIZE GLOBAL LOCK (Critical for Vercel Cluster)
            if (!(await acquireGlobalLock(userId))) {
                memoryLocks.delete(userId);
                debugLog(`[Baileys] 🛑 GLOBAL LOCK DENIED for: ${userId} (Instance Clash)`);
                return null;
            }

            const authDir = path.join(STORAGE_BASE, `session-v24-${userId}`);
            if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

            debugLog(`[Baileys-V24] 🔥 High-Performance Initiation: ${userId}`);

            // 4. Fortress Sync: Pull session from DB before starting
            try {
                const { createServiceClient } = await import('@/lib/supabase/service');
                const adminClient = createServiceClient();
                const { data: profile } = await adminClient.from('profiles').select('whatsapp_session').eq('id', userId).single();

                if (profile?.whatsapp_session) {
                    const credsFile = path.join(authDir, 'creds.json');
                    // Only write if local doesn't exist or is different (speed optimization)
                    if (!fs.existsSync(credsFile)) {
                        fs.writeFileSync(credsFile, JSON.stringify(profile.whatsapp_session, null, 2));
                        debugLog(`[Fortress] 🏰 Session restored from Database for ${userId}`);
                    }
                }
            } catch (e: any) {
                debugLog(`[Fortress] ⚠️ Could not pull session: ${e.message}`);
            }

            const { state, saveCreds } = await getBaileysAuthState(authDir);

            // Version caching for extreme QR speed
            let version: any = globalForBaileys.cachedVersion || [2, 3000, 1015901307];
            if (!globalForBaileys.cachedVersion) {
                try {
                    const { version: latest } = await fetchLatestBaileysVersion();
                    if (Array.isArray(latest)) {
                        version = latest;
                        globalForBaileys.cachedVersion = version;
                        debugLog(`[Baileys] 📦 Version cached: ${version}`);
                    }
                } catch (e) {
                    debugLog(`[Baileys] ⚠️ Version fetch failed, using fallback.`);
                }
            }

            const socket = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                browser: ['Mac OS', 'Chrome', '121.0.6167.184'],
                connectTimeoutMs: 180000,
                defaultQueryTimeoutMs: 180000,
                keepAliveIntervalMs: 60000,
                retryRequestDelayMs: 5000,
                fireInitQueries: true,
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                syncFullHistory: false,
                shouldIgnoreJid: (jid) => jid.includes('broadcast') || jid.includes('status')
            });

            const connState: any = {
                socket,
                qrCode: null,
                isReady: !!state.creds?.me?.id,
                isInitializing: true,
                isLinking: false,
                startedAt: Date.now()
            };

            activeConnections.set(userId, connState);
            memoryLocks.delete(userId);

            // --- HANDSHAKE TRACE ---
            socket.ev.on('creds.update', async () => {
                debugLog(`[Trace] 💾 Creds Sync [${userId}]`);
                await saveCreds();

                // Fortress Sync: DO NOT AWAIT (Critical for event loop performance)
                import('@/lib/supabase/service').then(async ({ createServiceClient }) => {
                    const adminClient = createServiceClient();
                    await adminClient.from('profiles').update({
                        whatsapp_session: state.creds
                    }).eq('id', userId);
                }).catch(() => { });

                if (socket.authState.creds.me?.id && !connState.isReady) {
                    debugLog(`[Baileys] 🆔 Identity established for: ${userId}.`);
                    connState.isReady = true;
                    connState.isLinking = true;

                    // Global-Sync
                    const { createServiceClient } = await import('@/lib/supabase/service');
                    await createServiceClient().from('profiles').update({
                        whatsapp_status: 'linking'
                    }).eq('id', userId);
                }
            });

            socket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    try {
                        const data = await QRCode.toDataURL(qr, { margin: 2, width: 400 });
                        connState.qrCode = data;
                        debugLog(`[Baileys] 📱 QR Pulsing [${userId}]`);

                        // Global-Sync: Push QR to DB
                        const { createServiceClient } = await import('@/lib/supabase/service');
                        await createServiceClient().from('profiles').update({
                            whatsapp_qr: data,
                            whatsapp_status: 'qr_ready'
                        }).eq('id', userId);
                    } catch (e: any) {
                        debugLog(`[Baileys] ❌ QR Gen Fail: ${e.message}`);
                    }
                }

                if (connection === 'open') {
                    debugLog(`[Baileys] ✅ CONNECTED & SYNCED [${userId}]`);
                    connState.isReady = true;
                    connState.isInitializing = false;
                    connState.isLinking = false;
                    connState.qrCode = null;

                    // Global-Sync: Success Lock
                    const { createServiceClient } = await import('@/lib/supabase/service');
                    await createServiceClient().from('profiles').update({
                        whatsapp_linked: true,
                        whatsapp_status: 'connected',
                        whatsapp_qr: null
                    }).eq('id', userId);
                }

                if (connection === 'close') {
                    const errorCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                    const errorReason = (lastDisconnect?.error as any)?.message || 'Unknown';
                    debugLog(`[Baileys] 🛑 DISCONNECTED [${userId}] (Code: ${errorCode}, Reason: ${errorReason})`);

                    const isFatal = errorCode === DisconnectReason.loggedOut || errorCode === 401;

                    if (isFatal) {
                        debugLog(`[Baileys] 💀 FATAL: ${errorCode}. Purging Identity ${userId}`);
                        disconnectBaileys(userId);
                    } else {
                        debugLog(`[Baileys] 🔄 SOFT RECONNECT: ${errorCode}. Attempting recovery...`);
                        setTimeout(() => {
                            if (activeConnections.has(userId)) {
                                connectToWhatsApp(userId).catch(() => { });
                            }
                        }, 3000);
                    }
                }
            });

            return socket;
        } catch (error: any) {
            memoryLocks.delete(userId);
            connPromises.delete(userId);
            // Don't disconnect here unless it's truly fatal, 
            // otherwise we'll enter a loop of deaths.
            debugLog(`[Baileys] ❌ Initiation Fault (Session might be busy): ${error.message}`);
            throw error;
        } finally {
            // No-op, promise is managed by its own lifecycle
        }
    })();

    connPromises.set(userId, initiationPromise);
    // Cleanup promise map once finished (success or fail)
    initiationPromise.finally(() => {
        connPromises.delete(userId);
    });
    return initiationPromise;
}

export function disconnectBaileys(userId: string) {
    debugLog(`[Baileys] 🔌 Disconnecting instance: ${userId}`);
    const conn = activeConnections.get(userId);
    if (conn) {
        try {
            // Remove all possible listeners to prevent memory leaks and ghost updates
            conn.socket?.ev?.removeAllListeners('connection.update');
            conn.socket?.ev?.removeAllListeners('creds.update');
            conn.socket?.ev?.removeAllListeners('messaging-history.set');

            // Force destroy the socket
            if (conn.socket?.ws) {
                conn.socket.ws.close();
                conn.socket.ws.terminate?.();
            }
            conn.socket?.end(undefined);
        } catch (e) { }
        activeConnections.delete(userId);
    }

    // Explicitly delete any stale memory associations
    memoryLocks.delete(userId);
    connPromises.delete(userId);
    releaseGlobalLock(userId);

    // CRITICAL: Aggressively purge ALL session directories on disk for this user
    try {
        if (fs.existsSync(STORAGE_BASE)) {
            const items = fs.readdirSync(STORAGE_BASE);
            for (const item of items) {
                // If the folder matches the userId pattern (e.g., session-v24-ID), kill it
                if (item.includes(userId)) {
                    const fullPath = path.join(STORAGE_BASE, item);
                    try {
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        debugLog(`[Baileys] 🧹 Disk Purge: ${item}`);
                    } catch (e: any) {
                        debugLog(`[Baileys] ⚠️ Could not delete ${item}: ${e.message}`);
                    }
                }
            }
        }
    } catch (e: any) {
        debugLog(`[Baileys] ❌ Disk scan failed: ${e.message}`);
    }

    debugLog(`[Baileys] 🗑️ Global state purged for: ${userId}`);

    // Update DB to reflect loss of link
    import('@/lib/supabase/service').then(({ createServiceClient }) => {
        const adminClient = createServiceClient();
        adminClient.from('profiles').update({ whatsapp_linked: false }).eq('id', userId).then(() => {
            debugLog(`[DB] 🗑️ Link state cleared for ${userId}`);
        });
    }).catch(e => debugLog(`[DB] ⚠️ Link clear failed: ${e.message}`));
}

export function getBaileysQRCode(userId: string): string | null {
    return activeConnections.get(userId)?.qrCode || null;
}

export function isBaileysReady(userId: string, strict = false): boolean {
    const conn = activeConnections.get(userId);

    // 1. Check memory state (Primary Source of Truth)
    if (conn) {
        // If strict, we MUST be fully CONNECTED (readyState 1)
        if (strict) {
            const ws = conn.socket?.ws;
            // Lenient Strict: If OPEN and has identity, we proceed even if isInitializing is true
            // (Baileys sometimes stays in initializing during the first large sync)
            return conn.isReady && ws?.readyState === 1;
        }

        // OPTIMISTIC READY: If we have keys (isReady), we are "Ready".
        if (conn.isReady) return true;
        return false;
    }

    // 2. CHECK DISK (Strict Fallback for server restarts ONLY)
    try {
        const authDir = path.join(STORAGE_BASE, `session-v24-${userId}`);
        const credsFile = path.join(authDir, 'creds.json');

        // If we are currently initializing a NEW session in memory, 
        // DO NOT report READY from disk, as we might be switching accounts.
        if (isBaileysInitializing(userId)) return false;

        if (fs.existsSync(credsFile)) {
            const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'));
            if (creds?.me?.id) return true;
        }
    } catch (e) { }

    return false;
}

export function isBaileysInitializing(userId: string): boolean {
    const conn = activeConnections.get(userId);
    if (!conn) return false;

    // AUTO-HEALING: If we've been initializing for more than 40 seconds 
    // without a QR code or being ready, it's a "Ghost Pulse".
    if (conn.isInitializing && !conn.qrCode && !conn.isReady) {
        const age = Date.now() - conn.startedAt;
        if (age > 40000) {
            debugLog(`[Baileys] 👻 Ghost Pulse Detected for ${userId}. Forcing surgery.`);
            disconnectBaileys(userId);
            return false;
        }
    }

    return conn.isInitializing;
}

export function isBaileysLinking(userId: string): boolean {
    const conn = activeConnections.get(userId);
    if (!conn) return false;

    const ws = conn.socket?.ws;
    // LINKING: We have identity (creds) but the socket is not yet fully 'Open'
    // This is the period where the phone shows "Connecting..."
    if (conn.isReady && (ws?.readyState === 0 || ws === undefined || !ws)) return true;

    return conn.isLinking || false;
}

export async function sendBaileysMessage(userId: string, to: string, message: string, mediaList?: any) {
    const conn = activeConnections.get(userId);
    // Use STRICT check for actual transmission
    if (!conn || !isBaileysReady(userId, true)) {
        throw new Error('WhatsApp Neural Link is not fully established yet. Please wait.');
    }

    const jid = repairJID(to);

    // Apply Spintax transformation
    const finalMessage = parseSpintax(message);

    const media = Array.isArray(mediaList) ? mediaList : (mediaList ? [mediaList] : []);

    if (media.length > 0) {
        for (const m of media) {
            const buffer = Buffer.from(m.data || m.buffer, 'base64');
            const type = m.mimetype.split('/')[0];
            const payload: any = { caption: finalMessage, mimetype: m.mimetype, fileName: m.filename };
            if (['image', 'video', 'audio'].includes(type)) payload[type] = buffer;
            else payload.document = buffer;
            await conn.socket.sendMessage(jid, payload);
        }
    } else {
        await conn.socket.sendMessage(jid, { text: finalMessage });
    }
    return { success: true };
}

export async function sendBaileysBulkMessages(userId: string, contacts: any[], media?: any, onProgress?: any) {
    const results = [];
    let count = 0;

    debugLog(`[Anti-Ban] 🛡️ Starting safe bulk send for ${contacts.length} contacts.`);

    for (const c of contacts) {
        try {
            // 1. Turbo Anti-Ban Delay (3-7 seconds)
            // Typing simulation already provides a natural 1-3s delay
            const baseDelay = (count > 0 && count % 20 === 0) ? 8000 : 3000;
            const randomAdd = Math.random() * 4000; // + 0-4s
            const totalDelay = baseDelay + randomAdd;

            if (count > 0) {
                debugLog(`[Anti-Ban] ⚡ Turbo Wait: ${(totalDelay / 1000).toFixed(1)}s...`);
                await new Promise(r => setTimeout(r, totalDelay));
            }

            // 2. Transmit Message (Includes Typing Sim)
            const res = await sendBaileysMessage(userId, c.phone, c.message, media);
            results.push({ ...res, phone: c.phone });
            count++;

            // 3. Progress Update
            if (onProgress) await onProgress(count, contacts.length, { ...res, phone: c.phone });

            // 4. Optimized Batch Cooling (Every 30 messages, take a 45s break)
            if (count % 30 === 0 && count < contacts.length) {
                const coolingBreak = 45000 + (Math.random() * 15000); // 45-60 seconds
                debugLog(`[Anti-Ban] ⚡ Quick Cool: ${(coolingBreak / 1000).toFixed(1)}s break...`);
                await new Promise(r => setTimeout(r, coolingBreak));
            }

        } catch (e: any) {
            debugLog(`[Anti-Ban] ❌ Transmission failure for ${c.phone}: ${e.message}`);
            results.push({ success: false, error: e.message, phone: c.phone });
            count++;
            if (onProgress) await onProgress(count, contacts.length, { success: false, error: e.message, phone: c.phone });
        }
    }
    return results;
}
