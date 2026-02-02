import makeWASocket, { DisconnectReason, useMultiFileAuthState as getBaileysAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';

// Store active connections
const activeConnections = new Map<string, {
    socket: any;
    qrCode: string | null;
    isReady: boolean;
    isInitializing: boolean;
    lastError: string | null;
}>();

// Cache version to avoid repeated network requests
let cachedVersion: [number, number, number] | null = null;

// Locks to prevent multiple simultaneous initializations
const initializationLocks = new Set<string>();

export async function connectToWhatsApp(userId: string) {
    // Check if already initializing or connected
    if (activeConnections.has(userId)) {
        const existing = activeConnections.get(userId)!;

        // If ready or initializing (including waiting for scan with QR code), keep it
        if (existing.isReady || existing.isInitializing || existing.qrCode) {
            if (existing.isReady) {
                console.log(`[Baileys] User ${userId} already connected`);
            } else if (existing.qrCode) {
                console.log(`[Baileys] User ${userId} waiting for QR scan...`);
            } else {
                console.log(`[Baileys] User ${userId} already initializing...`);
            }
            return existing.socket;
        }

        // If it's in the map but not ready or initializing and has no QR, it's a dead or failed connection
        // We clean it up and start a fresh one.
        console.log(`[Baileys] Cleaning up failed/dead connection for user ${userId}`);
        try {
            existing.socket.ev.removeAllListeners('connection.update');
            existing.socket.ev.removeAllListeners('creds.update');
            existing.socket.end();
        } catch (e) { }
        activeConnections.delete(userId);
    }

    // Check lock
    if (initializationLocks.has(userId)) {
        console.log(`[Baileys] Initialization lock active for user ${userId}, skipping`);
        return null;
    }

    initializationLocks.add(userId);
    console.log(`[Baileys] 🚀 Initializing WhatsApp for user: ${userId}`);

    try {
        // Create auth directory
        const authDir = path.join(process.cwd(), '.baileys_auth', `session-${userId}`);
        if (!fs.existsSync(authDir)) {
            console.log(`[Baileys] Creating auth directory: ${authDir}`);
            fs.mkdirSync(authDir, { recursive: true });
        }

        // Get latest Baileys version with timeout
        console.log(`[Baileys] Fetching latest version...`);
        let version: [number, number, number] = [2, 3000, 1015901307];

        if (cachedVersion) {
            version = cachedVersion;
            console.log(`[Baileys] Using cached version v${version.join('.')}`);
        } else {
            try {
                const versionPromise = fetchLatestBaileysVersion();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Fetch version timeout')), 5000)
                );
                const result = await Promise.race([versionPromise, timeoutPromise]) as any;
                version = result.version;
                cachedVersion = version;
                console.log(`[Baileys] Using freshly fetched version v${version.join('.')}`);
            } catch (vError) {
                console.warn(`[Baileys] ⚠️ Failed to fetch version or timeout, using fallback: ${vError}`);
                // Don't cache the fallback just in case it's a transient network error
            }
        }

        // Load auth state
        console.log(`[Baileys] Loading auth state...`);
        const { state, saveCreds } = await getBaileysAuthState(authDir);

        // Create socket
        console.log(`[Baileys] Creating socket...`);
        const socket = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            retryRequestDelayMs: 10000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            generateHighQualityLinkPreview: false,
        });

        // Initialize connection state
        const connectionState = {
            socket,
            qrCode: null as string | null,
            isReady: false,
            isInitializing: true,
            lastError: null as string | null
        };

        activeConnections.set(userId, connectionState);
        initializationLocks.delete(userId);

        // Handle connection updates
        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log(`[Baileys Update] 🎫 QR received for ${userId}`);
                try {
                    const qrCodeData = await QRCode.toDataURL(qr, {
                        errorCorrectionLevel: 'M',
                        margin: 1,
                        width: 400
                    });
                    connectionState.qrCode = qrCodeData;
                    connectionState.isInitializing = false;
                    connectionState.lastError = null;
                    console.log(`[Baileys Update] ✅ QR stored for ${userId}`);
                } catch (error) {
                    console.error(`[Baileys Update] ❌ QR error for ${userId}:`, error);
                }
            }

            if (connection === 'open') {
                console.log(`[Baileys Update] 🚀 Connected for ${userId}`);
                connectionState.isReady = true;
                connectionState.qrCode = null;
                connectionState.isInitializing = false;
                connectionState.lastError = null;
            }

            if (connection === 'close') {
                const error = lastDisconnect?.error as Boom;
                const errorCode = error?.output?.statusCode;
                const errorMessage = error?.message || 'Unknown error';

                console.log(`[Baileys Update] ⚠️ Closed for ${userId}. Code: ${errorCode}, Msg: ${errorMessage}`);

                connectionState.isReady = false;
                connectionState.isInitializing = false;
                connectionState.lastError = `Disconnected: ${errorMessage} (Code: ${errorCode})`;
                connectionState.qrCode = null; // Clear QR on close

                // If it's a conflict or other common issue, we'll keep it in the map 
                // but marked as not ready. The next user poll will eventually 
                // trigger cleanup and restart if enough time has passed.

                if (errorCode === DisconnectReason.loggedOut) {
                    console.log(`[Baileys] Logged out, clearing session for user ${userId}`);
                    activeConnections.delete(userId);
                    const authDir = path.join(process.cwd(), '.baileys_auth', `session-${userId}`);
                    if (fs.existsSync(authDir)) {
                        fs.rmSync(authDir, { recursive: true, force: true });
                    }
                } else if (errorCode === DisconnectReason.connectionClosed || errorCode === DisconnectReason.connectionLost || errorCode === DisconnectReason.connectionReplaced) {
                    // For these transient errors, we keep the connection in the map but mark it as not ready.
                    // The system will attempt to re-initialize it on the next request.
                    console.log(`[Baileys] Connection closed/lost/replaced for ${userId}. Will attempt to re-initialize.`);
                } else {
                    // For other errors, we remove it to force a full re-initialization.
                    console.log(`[Baileys] Removing connection for ${userId} due to unhandled disconnect reason.`);
                    activeConnections.delete(userId);
                }
            }
        });

        socket.ev.on('creds.update', saveCreds);

        console.log(`[Baileys] Initialization request completed for user: ${userId}`);
        return socket;
    } catch (error) {
        initializationLocks.delete(userId);
        console.error(`[Baileys] ❌ Failed to initialize for user ${userId}: ${error}`);
        activeConnections.delete(userId);
        throw error;
    }
}

export function getBaileysQRCode(userId: string): string | null {
    const connection = activeConnections.get(userId);
    return connection?.qrCode || null;
}

export function isBaileysReady(userId: string): boolean {
    const connection = activeConnections.get(userId);
    return connection?.isReady || false;
}

export function isBaileysInitializing(userId: string): boolean {
    const connection = activeConnections.get(userId);
    return connection?.isInitializing || false;
}

// Spintax helper: converts "{Hi|Hello|Hey} there!" to "Hi there!", "Hello there!", etc.
function resolveSpintax(text: string): string {
    return text.replace(/{([^{}]+)}/g, (match, options) => {
        const choices = options.split('|');
        return choices[Math.floor(Math.random() * choices.length)];
    });
}

export async function sendBaileysMessage(
    userId: string,
    to: string,
    message: string,
    mediaList?: Array<{ url?: string, buffer?: Buffer, mimetype?: string, filename?: string }> | { url?: string, buffer?: Buffer, mimetype?: string, filename?: string }
) {
    const connection = activeConnections.get(userId);

    if (!connection || !connection.socket || !connection.isReady) {
        throw new Error('WhatsApp is not connected. Please scan QR code first.');
    }

    try {
        // Resolve spintax in message
        const resolvedMessage = resolveSpintax(message);

        // Format phone number
        const formattedNumber = to.replace(/\D/g, '');
        const jid = `${formattedNumber}@s.whatsapp.net`;

        // Normalize mediaList to an array
        const normalizedMediaList = Array.isArray(mediaList) ? mediaList : (mediaList ? [mediaList] : []);

        if (normalizedMediaList.length > 0) {
            for (let i = 0; i < normalizedMediaList.length; i++) {
                const media = normalizedMediaList[i];
                // Determine if it's an image or a general document
                const isImage = media.mimetype?.startsWith('image/');
                const isVideo = media.mimetype?.startsWith('video/');
                const isAudio = media.mimetype?.startsWith('audio/');

                // Attach caption ONLY to the first media message
                let content: any = { caption: i === 0 ? resolvedMessage : '' };

                if (isImage) {
                    content.image = media.buffer || { url: media.url };
                } else if (isVideo) {
                    content.video = media.buffer || { url: media.url };
                } else if (isAudio) {
                    content.audio = media.buffer || { url: media.url };
                    content.mimetype = media.mimetype;
                } else {
                    content.document = media.buffer || { url: media.url };
                    content.mimetype = media.mimetype || 'application/octet-stream';
                    content.fileName = media.filename || 'document';
                }

                await connection.socket.sendMessage(jid, content);

                // Small delay between media items if there are multiple
                if (normalizedMediaList.length > 1 && i < normalizedMediaList.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } else {
            // Send text message
            await connection.socket.sendMessage(jid, { text: resolvedMessage });
        }

        console.log(`[Baileys] ✅ Message(s) sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error(`[Baileys] ❌ Error sending message:`, error);
        throw error;
    }
}

export async function sendBaileysBulkMessages(
    userId: string,
    contacts: Array<{ phone: string; message: string }>,
    mediaList?: Array<{ url?: string, buffer?: Buffer, mimetype?: string, filename?: string }> | { url?: string, buffer?: Buffer, mimetype?: string, filename?: string }
) {
    const connection = activeConnections.get(userId);

    if (!connection || !connection.socket || !connection.isReady) {
        throw new Error('WhatsApp is not connected. Please scan QR code first.');
    }

    const results = [];
    let count = 0;

    for (const contact of contacts) {
        try {
            await sendBaileysMessage(userId, contact.phone, contact.message, mediaList);
            results.push({ phone: contact.phone, success: true });
            count++;

            // Anti-Spam: Dynamic Delay
            // Base delay 3-7 seconds
            let delay = 3000 + Math.random() * 4000;

            // Larger delay every 10 messages (10-20 seconds)
            if (count % 10 === 0) {
                console.log(`[Baileys] Anti-Spam: Cooldown active after 10 messages...`);
                delay += 10000 + Math.random() * 10000;
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
            results.push({ phone: contact.phone, success: false, error: String(error) });
        }
    }

    return results;
}

export function disconnectBaileys(userId: string) {
    const connection = activeConnections.get(userId);
    if (connection?.socket) {
        try {
            connection.socket.ev.removeAllListeners('connection.update');
            connection.socket.ev.removeAllListeners('creds.update');
            connection.socket.end(undefined);
        } catch (e) { }
    }
    activeConnections.delete(userId);
    initializationLocks.delete(userId);
    console.log(`[Baileys] Disconnected user: ${userId}`);
}
