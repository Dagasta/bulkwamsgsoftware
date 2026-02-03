'use client';

import { useState, useEffect } from 'react';
import { Check, Zap, Shield, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const plans = [
    {
        id: 'pro-monthly',
        name: 'Pro Monthly',
        price: '10',
        features: [
            'Unlimited WhatsApp Messages',
            'HD Media Attachments',
            'Priority Message Queue',
            'Safety Delay Protocols',
            '24/7 Premium Support',
            'Campaign Analytics'
        ],
        popular: true,
        gradient: 'from-trust-blue to-premium-indigo'
    },
    {
        id: 'pro-yearly',
        name: 'Pro Yearly',
        price: '120',
        features: [
            'Everything in Monthly',
            'Elite Priority Queue',
            'Multiple Device Support',
            'Custom Sender Name',
            'White-label Reports',
            'Dedicated Account Manager'
        ],
        popular: false,
        gradient: 'from-dark-navy to-slate-900'
    }
];

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();

        if (searchParams.get('success')) {
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 3000);
        }
    }, [supabase, searchParams, router]);

    return (
        <div className="min-h-screen bg-soft-gray pb-20">
            <div className="container-custom py-20 px-4">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-trust-blue/10 text-trust-blue text-sm font-black uppercase tracking-widest">
                        <Crown className="w-4 h-4" />
                        Exclusive Pro Access
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-dark-navy tracking-tight">
                        Power Up Your <span className="gradient-text">Marketing</span>
                    </h1>
                    <p className="text-xl text-slate-gray font-medium">
                        Unlock the full potential of BulkWaMsg and start reaching thousands of customers instantly.
                        Pay once, dominate forever.
                    </p>
                </div>

                {success && (
                    <div className="fixed inset-0 bg-dark-navy/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                        <div className="bg-white rounded-[40px] p-12 max-w-md w-full text-center shadow-2xl animate-scale-up">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-success-green">
                                <Check className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-dark-navy mb-4 italic">Payment Secured!</h2>
                            <p className="text-slate-gray mb-8 font-medium italic">Welcome to the Pro family. Redirecting you to your powerhouse...</p>
                            <Loader2 className="w-8 h-8 text-trust-blue animate-spin mx-auto" />
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative rounded-[48px] p-1 bg-gradient-to-br ${plan.gradient} shadow-2xl transition-transform hover:scale-[1.02] duration-500`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-warm text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-xl">
                                    Most Popular
                                </div>
                            )}

                            <div className="bg-white rounded-[44px] h-full p-10 md:p-14 flex flex-col">
                                <div className="mb-10">
                                    <h3 className="text-2xl font-black text-dark-navy mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-dark-navy">${plan.price}</span>
                                        <span className="text-slate-400 font-bold">{plan.id.includes('monthly') ? '/mo' : '/yr'}</span>
                                    </div>
                                </div>

                                <ul className="space-y-5 mb-12 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-4 text-slate-600 font-medium">
                                            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-trust-blue shrink-0">
                                                <Check className="w-4 h-4 stroke-[3px]" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {!user ? (
                                    <Link
                                        href="/login?redirect=/pricing"
                                        className="w-full bg-dark-navy text-white py-4 rounded-full font-black text-center hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3"
                                    >
                                        LOGIN TO SUBSCRIBE
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            setLoading(plan.id);
                                            try {
                                                const priceId = plan.id === 'pro-monthly'
                                                    ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
                                                    : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

                                                const response = await fetch('/api/stripe/checkout', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ priceId }),
                                                });
                                                const { url, error } = await response.json();
                                                if (url) {
                                                    window.location.href = url;
                                                } else {
                                                    alert(error || 'Failed to start checkout');
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Connection failed');
                                            } finally {
                                                setLoading(null);
                                            }
                                        }}
                                        disabled={loading !== null}
                                        className="w-full bg-trust-blue text-white py-4 rounded-full font-black text-center hover:bg-premium-indigo transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading === plan.id ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                PROCESSING...
                                            </>
                                        ) : (
                                            <>
                                                UPGRADE NOW
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                )}

                                <p className="text-center mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Shield className="w-3 h-3" />
                                    Secure SSL Encrypted Payment
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Zap, title: 'Instant Activation', desc: 'No waiting time. Get Pro features immediately after checkout.' },
                        { icon: Shield, title: 'No Hidden Fees', desc: 'Transparent pricing. Pay once and enjoy all listed features.' },
                        { icon: ArrowRight, title: 'Trusted Globally', desc: 'Join 5,000+ businesses scaling their reach with BulkWaMsg.' }
                    ].map((item, i) => (
                        <div key={i} className="text-center p-8">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-trust-blue">
                                <item.icon className="w-7 h-7" />
                            </div>
                            <h4 className="text-xl font-black text-dark-navy mb-3">{item.title}</h4>
                            <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
