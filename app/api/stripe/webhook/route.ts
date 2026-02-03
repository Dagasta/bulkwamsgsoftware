import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
    } catch (error: any) {
        console.error(`Webhook signature verification failed: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const supabase = createClient();

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
            console.log(`[Stripe Webhook] Payment completed for user: ${userId}`);

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    plan: 'pro',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (updateError) {
                console.error('[Stripe Webhook] Supabase update error:', updateError);
            } else {
                console.log('[Stripe Webhook] Profile successfully upgraded to PRO');
            }
        }
    }

    return NextResponse.json({ received: true });
}
