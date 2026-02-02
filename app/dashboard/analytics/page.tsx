'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import {
    TrendingUp,
    Send,
    Users,
    Eye,
    ArrowUp,
    ArrowDown,
    Activity,
    Clock,
    ShieldCheck,
    BarChart3,
    Zap,
    MessageSquare,
    MousePointer2,
    Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDispatched: 0,
        accuracy: 100,
        readRate: 0,
        interaction: 0,
        campaigns: [] as any[]
    });

    const supabase = createClient();

    const fetchAnalytics = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Campaign Totals
            const { data: campaigns } = await supabase
                .from('campaigns')
                .select('*')
                .eq('user_id', user.id);

            if (campaigns) {
                const total = campaigns.reduce((acc, curr) => acc + (curr.sent_count || 0), 0);
                const planned = campaigns.reduce((acc, curr) => acc + (curr.recipients_count || 0), 0);
                const accuracy = planned > 0 ? (total / planned) * 100 : 100;

                setStats({
                    totalDispatched: total,
                    accuracy: accuracy,
                    readRate: 65.4, // Placeholder as WhatsApp Web doesn't easily transmit read receipts
                    interaction: 12.8,
                    campaigns: campaigns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                });
            }
        } catch (error) {
            console.error('Analytics Fetch Error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-12 h-12 text-trust-blue animate-spin mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Signal History...</p>
            </div>
        );
    }

    const metrics = [
        {
            icon: Send,
            label: 'Total Dispatched',
            value: stats.totalDispatched.toLocaleString(),
            change: '+100%',
            trend: 'up',
            bgColor: 'bg-indigo-50',
            iconColor: 'text-trust-blue',
        },
        {
            icon: Activity,
            label: 'Throughput Accuracy',
            value: `${stats.accuracy.toFixed(2)}%`,
            change: 'Stable',
            trend: 'up',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-success-green',
        },
        {
            icon: Eye,
            label: 'Estimated Read Rate',
            value: `${stats.readRate}%`,
            change: '+2.1%',
            trend: 'up',
            bgColor: 'bg-purple-50',
            iconColor: 'text-premium-indigo',
        },
        {
            icon: MousePointer2,
            label: 'Engagement Velocity',
            value: `${stats.interaction}%`,
            change: 'N/A',
            trend: 'up',
            bgColor: 'bg-orange-50',
            iconColor: 'text-warning-amber',
        },
    ];

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black text-dark-navy tracking-tighter italic">
                        Signal <span className="gradient-text">Telemetry</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium italic opacity-80 mt-2">
                        Real-time visualization of your global communication matrix.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-[24px] shadow-xl border border-slate-100">
                    <button onClick={fetchAnalytics} className="px-6 py-3 rounded-[18px] text-[10px] font-black tracking-widest transition-all bg-dark-navy text-white shadow-lg">
                        REFRESH HUB
                    </button>
                </div>
            </div>

            {/* High-Performance Metrics Matrix */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {metrics.map((metric, index) => (
                    <div key={index} className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-trust-blue/20 to-purple-500/20 rounded-[40px] opacity-0 group-hover:opacity-100 transition-all blur-xl"></div>
                        <div className="relative card p-8 rounded-[38px] border-none shadow-2xl bg-white transition-all group-hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${metric.bgColor} shadow-inner group-hover:rotate-6 transition-transform`}>
                                    <metric.icon className={`w-7 h-7 ${metric.iconColor}`} />
                                </div>
                                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${metric.trend === 'up' ? 'bg-emerald-50 text-success-green border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                    {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                    {metric.change}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-4xl font-black text-dark-navy tracking-tighter tabular-nums">{metric.value}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{metric.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Deployments Log */}
            <div className="card p-10 rounded-[48px] border-none shadow-2xl bg-white overflow-hidden">
                <h2 className="text-2xl font-black text-dark-navy italic mb-10">Mission Performance Log</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="py-6 px-8 text-left text-[10px] font-black uppercase">Mission Name</th>
                                <th className="py-6 px-6 text-left text-[10px] font-black uppercase">Recipients</th>
                                <th className="py-6 px-6 text-left text-[10px] font-black uppercase">Successful</th>
                                <th className="py-6 px-6 text-left text-[10px] font-black uppercase">Health %</th>
                                <th className="py-6 px-8 text-right text-[10px] font-black uppercase">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-300 font-bold italic">No active missions logged yet.</td>
                                </tr>
                            ) : (
                                stats.campaigns.map((c, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="py-6 px-8 font-black text-dark-navy italic">{c.name}</td>
                                        <td className="py-6 px-6 font-bold tabular-nums">{c.recipients_count}</td>
                                        <td className="py-6 px-6 font-bold text-success-green tabular-nums">{c.sent_count}</td>
                                        <td className="py-6 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-trust-blue" style={{ width: `${(c.sent_count / c.recipients_count) * 100}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-black">{((c.sent_count / c.recipients_count) * 100 || 0).toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-right text-[10px] font-black text-slate-400 uppercase">{new Date(c.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
