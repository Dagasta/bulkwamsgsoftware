import { NextResponse } from 'next/server';
import { connectToWhatsApp, getBaileysQRCode, isBaileysReady, isBaileysInitializing, isBaileysLinking } from '@/lib/whatsapp/baileys-client';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        // Get authenticated user (optional for QR code display)
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log(`[Baileys Status] 🛑 Unauthorized access attempt`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;
        console.log(`[Baileys Status] 📨 User: ${userId}`);

        // Initialize Baileys WhatsApp client for this user IF NOT already in memory.
        const { getBaileysQRCode, isBaileysReady, isBaileysInitializing, isBaileysLinking, connectToWhatsApp } = await import('@/lib/whatsapp/baileys-client');

        let linking = isBaileysLinking(userId);
        let initializing = isBaileysInitializing(userId);
        let memoryReady = isBaileysReady(userId);
        let qrCode = getBaileysQRCode(userId);

        // --- THE PERMANENT TRUTH (V43 - GLOBAL SYNC) ---
        const { data: profile } = await supabase.from('profiles').select('whatsapp_linked, whatsapp_status, whatsapp_qr, whatsapp_lock_id').eq('id', userId).single();
        const dbReady = profile?.whatsapp_linked || false;
        const dbStatus = profile?.whatsapp_status || 'idle';
        const dbQR = profile?.whatsapp_qr;
        const lockId = profile?.whatsapp_lock_id;

        // HYBRID READY: Success if memory says so OR DB says so.
        let ready = memoryReady || dbReady || dbStatus === 'connected';

        // HYBRID QR: Use DB QR if memory is empty (Cluster Sync)
        if (!qrCode && dbQR) qrCode = dbQR;

        // HYBRID STATE
        if (dbStatus === 'linking') linking = true;
        if (dbStatus === 'initializing') initializing = true;

        // --- THE CONNECTION BRIDGE ---
        const { activeConnections, connPromises, INSTANCE_ID } = await import('@/lib/whatsapp/baileys-client');
        const isSocketAlive = activeConnections.has(userId);
        const isInitiating = connPromises.has(userId);

        // LOCK PROTECTION: If someone else holds the lock, do NOT trigger
        const isLockedByOthers = lockId && lockId !== INSTANCE_ID;

        // TRIGGER LOGIC:
        const shouldTrigger = !isLockedByOthers && (
            (ready && !isSocketAlive && !isInitiating) ||
            (!ready && !initializing && !qrCode && !isInitiating)
        );

        if (shouldTrigger) {
            console.log(`[Baileys Status] 🌉 Neural Pulse Triggered for ${userId} (Global Mode)`);
            connectToWhatsApp(userId).catch(err => {
                console.error(`[Baileys Status] ❌ Bridge failed:`, err);
            });

            // SMALL BOOTSTRAP DELAY: Minimal delay to allow memory set
            await new Promise(r => setTimeout(r, 800));

            // Re-check state after delay
            const freshQR = getBaileysQRCode(userId);
            if (freshQR) qrCode = freshQR;

            if (!ready) initializing = true;
        }

        console.log(`[Baileys Status] 📊 User ${userId} - DB Ready: ${dbReady}, Socket: ${isSocketAlive}, DB QR: ${!!dbQR}, DB Status: ${dbStatus}`);

        return NextResponse.json({
            qrCode,
            ready, // Hybrid Truth (Memory + DB)
            isSocketAlive,
            memoryReady,
            dbReady,
            initializing: initializing || (ready && !isSocketAlive),
            linking,
            timestamp: Date.now(),
            isSyncing: ready && (!isSocketAlive),
            dbStatus, // New for diagnostics
            message: ready
                ? (isSocketAlive ? 'WhatsApp is connected' : 'Neural Link Active (Syncing...)')
                : linking
                    ? 'Authenticated! Finalizing Neural Link...'
                    : qrCode
                        ? 'Scan QR code to connect'
                        : initializing
                            ? 'Initializing WhatsApp...'
                            : 'Starting connection...'
        });
    } catch (error) {
        console.error('[Baileys Status] ❌ API error:', error);
        return NextResponse.json(
            { error: 'Failed to get WhatsApp status', details: String(error) },
            { status: 500 }
        );
    }
}
