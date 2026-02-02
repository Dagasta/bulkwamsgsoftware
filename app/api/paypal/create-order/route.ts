import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { planId, amount } = await req.json();

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const environment = process.env.PAYPAL_MODE || (process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');
        const endpoint = environment === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        console.log(`[PayPal API] Mode: ${environment}, Endpoint: ${endpoint}`);

        // PayPal API details
        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error('[PayPal API] Missing credentials in environment');
            return NextResponse.json({ error: 'System Error: PayPal credentials not configured on server' }, { status: 500 });
        }

        // 1. Get Access Token
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const tokenResponse = await fetch(`${endpoint}/v1/oauth2/token`, {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;

        if (!access_token) {
            console.error('[PayPal Debug] Token Error:', tokenData);
            return NextResponse.json({ error: 'Token Error', details: tokenData }, { status: 500 });
        }

        // JUST FOR DEBUG - Remove after
        // return NextResponse.json({ debug_token: access_token });

        // 2. Create Order
        const formattedAmount = parseFloat(amount || '10.00').toFixed(2);
        console.log(`[PayPal API] Creating order for ${formattedAmount} USD`);

        const orderResponse = await fetch(`${endpoint}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        items: [
                            {
                                name: `BulkWaMsg Pro Plan - ${planId}`,
                                quantity: '1',
                                unit_amount: {
                                    currency_code: 'USD',
                                    value: formattedAmount,
                                },
                            },
                        ],
                        amount: {
                            currency_code: 'USD',
                            value: formattedAmount,
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: formattedAmount,
                                },
                            },
                        },
                        description: `BulkWaMsg Pro Plan - ${planId}`,
                    },
                ],
            }),
        });

        const order = await orderResponse.json();

        if (!orderResponse.ok) {
            console.error('PayPal Order Request Failed:', order);
        }

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('PayPal Order Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
