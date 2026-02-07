import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendBaileysBulkMessages, debugLog } from '@/lib/whatsapp/baileys-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    debugLog('[Worker] Signal Pulse heartbeat received.');
    try {
        // USE SERVICE ROLE: Secure and bypasses RLS for batch jobs
        const supabase = createServiceClient();
        debugLog('[Worker] Running on Secure Service Client.');

        // 1. Fetch campaigns that are 'scheduled' (time passed) OR 'queued' (manual)
        const nowISO = new Date().toISOString();

        debugLog(`[Worker] Scanning for high-priority signals...`);

        // Try 'queued' first (Manual)
        let { data: campaigns, error: fetchError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('status', 'queued')
            .order('created_at', { ascending: true })
            .limit(1);

        // If no queued, try expired scheduled
        if (!campaigns || campaigns.length === 0) {
            const { data: schedCampaigns, error: schedError } = await supabase
                .from('campaigns')
                .select('*')
                .eq('status', 'scheduled')
                .lte('scheduled_at', nowISO)
                .order('scheduled_at', { ascending: true })
                .limit(1);

            campaigns = schedCampaigns;
            fetchError = schedError;
        }

        if (fetchError) {
            debugLog(`[Worker] Scan Error: ${fetchError.message}`);
            throw fetchError;
        }

        if (!campaigns || campaigns.length === 0) {
            return NextResponse.json({ message: 'No campaigns due for processing' });
        }

        const campaign = campaigns[0];
        debugLog(`[Worker] 🎯 Target Lock: ${campaign.name} (ID: ${campaign.id})`);

        // 2. Mark as 'sending' to lock it
        const { data: updatedData, error: lockError } = await supabase
            .from('campaigns')
            .update({
                status: 'sending',
                updated_at: nowISO
            })
            .eq('id', campaign.id)
            .in('status', ['scheduled', 'queued'])
            .select();

        if (lockError || !updatedData || updatedData.length === 0) {
            debugLog(`[Worker] ⚠️ Mission interference detected (ID: ${campaign.id}).`);
            return NextResponse.json({ message: 'Campaign already being processed' });
        }

        // 3. Prepare messages
        const { data: messageTemplates, error: msgError } = await supabase
            .from('messages')
            .select('phone, message')
            .eq('campaign_id', campaign.id);

        if (msgError || !messageTemplates || messageTemplates.length === 0) {
            await supabase.from('campaigns').update({
                status: 'failed',
                error_log: 'No recipient messages found in matrix.',
                updated_at: new Date().toISOString()
            }).eq('id', campaign.id);
            return NextResponse.json({ error: 'No recipient messages found' }, { status: 400 });
        }

        // 4. Ensure WhatsApp is connected (STRICT MODE)
        const { connectToWhatsApp, isBaileysReady } = await import('@/lib/whatsapp/baileys-client');
        if (!isBaileysReady(campaign.user_id, true)) {
            debugLog(`[Worker] Neural Link offline or connecting. Synchronizing...`);
            // Trigger connection
            await connectToWhatsApp(campaign.user_id);

            let retries = 0;
            // Wait up to 30s for the socket to be fully OPEN
            while (!isBaileysReady(campaign.user_id, true) && retries < 30) {
                if (retries % 5 === 0) await connectToWhatsApp(campaign.user_id);
                await new Promise(r => setTimeout(r, 1000));
                retries++;
            }
        }

        if (!isBaileysReady(campaign.user_id, true)) {
            throw new Error('WhatsApp Neural Link failed to stabilize (Timeout).');
        }

        // 5. Execute Bulk Send
        try {
            const results = await sendBaileysBulkMessages(
                campaign.user_id,
                messageTemplates,
                campaign.media,
                async (count: number, total: number, result: any) => {
                    // Sync individual message via RPC
                    await supabase.rpc('update_message_telemetry', {
                        target_campaign_id: campaign.id,
                        target_phone: result.phone,
                        new_status: result.success ? 'sent' : 'failed',
                        new_error: result.success ? null : (result.error || 'Unknown Error')
                    });

                    // Sync campaign progress via RPC
                    await supabase.rpc('update_mission_telemetry', {
                        target_campaign_id: campaign.id,
                        new_sent_count: count,
                        new_status: 'sending'
                    });
                }
            );

            // 6. Finalize via RPC
            const finalSuccessfulCount = results.filter((r: any) => r.success).length;
            await supabase.rpc('update_mission_telemetry', {
                target_campaign_id: campaign.id,
                new_sent_count: finalSuccessfulCount,
                new_status: 'completed'
            });

            debugLog(`[Worker] ✅ Mission accomplished for ${campaign.id}.`);

            return NextResponse.json({
                success: true,
                campaignId: campaign.id,
                successful: finalSuccessfulCount
            });
        } catch (sendError: any) {
            debugLog(`[Worker] Transmission Error: ${sendError.message}`);
            const isConnectionIssue = sendError.message.includes('not fully established') || sendError.message.includes('Disconnected');

            await supabase.rpc('update_mission_telemetry', {
                target_campaign_id: campaign.id,
                new_sent_count: campaign.sent_count || 0,
                new_status: isConnectionIssue ? 'queued' : 'failed'
            });

            await supabase.from('campaigns').update({
                error_log: `Transmission Error: ${sendError.message}`
            }).eq('id', campaign.id);

            throw sendError;
        }

    } catch (error: any) {
        debugLog(`[Worker] Critical Failure: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
