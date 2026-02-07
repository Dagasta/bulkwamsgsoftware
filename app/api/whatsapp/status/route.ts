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
        let ready = isBaileysReady(userId);
        let qrCode = getBaileysQRCode(userId);

        // --- THE CONNECTION BRIDGE (V24) ---
        // If we are ready (on disk) OR if everything is idle, trigger a connection.
        // This ensures the socket is ALIVE if we are linked.
        const { activeConnections, connPromises } = await import('@/lib/whatsapp/baileys-client');
        const isSocketAlive = activeConnections.has(userId);
        const isInitiating = connPromises.has(userId);

        if (!isSocketAlive && !isInitiating && (ready || (!qrCode && !initializing))) {
            console.log(`[Baileys Status] 🌉 Bridge Trigger: Activating engine for ${userId}`);
            connectToWhatsApp(userId).catch(err => {
                console.error(`[Baileys Status] ❌ Bridge error:`, err);
            });
            if (!ready) initializing = true;
        }

        console.log(`[Baileys Status] 📊 User ${userId} - Ready: ${ready}, QR: ${!!qrCode}, Init: ${initializing}`);

        return NextResponse.json({
            qrCode,
            ready,
            initializing,
            linking,
            timestamp: Date.now(),
            message: ready
                ? 'WhatsApp is connected'
                : linking
                    ? 'Linking device... Please wait.'
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
