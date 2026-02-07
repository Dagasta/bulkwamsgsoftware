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

        // --- THE PERMANENT TRUTH (V42) ---
        const { data: profile } = await supabase.from('profiles').select('whatsapp_linked').eq('id', userId).single();
        const dbReady = profile?.whatsapp_linked || false;

        // HYBRID READY: Success if memory says so OR DB says so.
        // This makes the initial scan result INSTANT.
        const ready = memoryReady || dbReady;

        // --- THE CONNECTION BRIDGE (V41) ---
        const { activeConnections, connPromises } = await import('@/lib/whatsapp/baileys-client');
        const isSocketAlive = activeConnections.has(userId);
        const isInitiating = connPromises.has(userId);

        // TRIGGER LOGIC:
        // 1. If DB says linked but memory is cold -> Wakeup
        // 2. If NOT linked AND not initializing AND no QR -> Start Handshake
        const shouldTrigger = (ready && !isSocketAlive && !isInitiating) ||
            (!ready && !initializing && !qrCode && !isInitiating);

        if (shouldTrigger) {
            console.log(`[Baileys Status] 🌉 Neural Pulse Triggered for ${userId} (Ready: ${ready})`);
            connectToWhatsApp(userId).catch(err => {
                console.error(`[Baileys Status] ❌ Bridge failed:`, err);
            });
            if (!ready) initializing = true; // Optimistically show initializing state
        }

        console.log(`[Baileys Status] 📊 User ${userId} - DB Ready: ${dbReady}, Socket: ${isSocketAlive}`);

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
