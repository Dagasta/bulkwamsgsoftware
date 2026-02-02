import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { MessageSquare, Users, Send, TrendingUp, Clock, CheckCircle2, BarChart3, ArrowRight, Zap, Crown, Shield } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Dashboard - BulkWaMsg',
    description: 'Manage your WhatsApp campaigns and contacts',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user plan status
    let userPlan = 'free';
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single();

        userPlan = profile?.plan || 'free';
        if (user.email === 'owner@bulkwamsg.com') userPlan = 'pro';
    }

    // Fetch actual signal totals for the header
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

    const { count: contactCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

    const totalSent = (campaigns?.reduce((acc, c) => acc + (c.sent_count || 0), 0) || 0);
    const totalSignals = totalSent.toLocaleString();

    // Map stats dynamically
    const dynamicStats = [
        {
            icon: Send,
            label: 'Total Dispatched',
            value: totalSignals,
            change: '+100%',
            changeBg: 'bg-emerald-50',
            changeColor: 'text-success-green',
            changeBorder: 'border-emerald-100',
            bgColor: 'bg-indigo-50',
            iconColor: 'text-trust-blue',
        },
        {
            icon: Users,
            label: 'Total Leads',
            value: (contactCount || 0).toLocaleString(),
            change: 'Stable',
            changeBg: 'bg-slate-50',
            changeColor: 'text-slate-400',
            changeBorder: 'border-slate-100',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-success-green',
        },
        {
            icon: TrendingUp,
            label: 'Account Health',
            value: '99.8%',
            change: 'Elite',
            changeBg: 'bg-indigo-50',
            changeColor: 'text-premium-indigo',
            changeBorder: 'border-indigo-100',
            bgColor: 'bg-purple-50',
            iconColor: 'text-premium-indigo',
        },
        {
            icon: MessageSquare,
            label: 'Active missions',
            value: (campaigns?.length || 0).toString(),
            change: 'Sync Active',
            changeBg: 'bg-amber-50',
            changeColor: 'text-warning-amber',
            changeBorder: 'border-amber-100',
            bgColor: 'bg-orange-50',
            iconColor: 'text-warning-amber',
        },
    ];

    const mappedCampaigns = (campaigns || []).slice(0, 5).map(c => ({
        name: c.name,
        recipients: c.recipients_count.toLocaleString(),
        deliveryRate: `${((c.sent_count / (c.recipients_count || 1)) * 100).toFixed(0)}%`,
        date: new Date(c.created_at).toLocaleDateString(),
        status: c.status,
    }));

    return (
        <div className="space-y-12 pb-20 animate-fade-in text-pretty">
            {/* Ultra-Premium Hero Header */}
            <div className="relative group p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[48px] shadow-2xl overflow-hidden transition-all hover:scale-[1.01] duration-500">
                <div className="absolute inset-0 bg-white/90 backdrop-blur-3xl rounded-[46px]"></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10 p-10 md:p-14 overflow-hidden rounded-[46px]">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] opacity-40"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-100 rounded-full blur-[80px] opacity-40"></div>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-trust-blue/10 text-trust-blue text-xs font-black uppercase tracking-widest border border-trust-blue/10">
                            <Zap className="w-4 h-4 fill-trust-blue" />
                            Live Network Status: Optimal
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-dark-navy tracking-tighter leading-none">
                            Hello, <span className="gradient-text">{user?.user_metadata?.name?.split(' ')[0] || 'Commander'}</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed italic">
                            Your marketing engine is primed. <span className="text-dark-navy font-black">{totalSignals}</span> signals successfully dispatched this month.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 shrink-0">
                        {userPlan === 'free' ? (
                            <Link href="/pricing" className="flex items-center justify-between gap-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 rounded-3xl hover:shadow-2xl transition-all shadow-xl group/btn transform hover:-translate-y-1">
                                <div className="flex items-center gap-4">
                                    <Crown className="w-5 h-5 text-warning-amber fill-warning-amber" />
                                    <span className="text-sm font-black uppercase tracking-widest">Upgrade to PRO</span>
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/50 group-hover/btn:translate-x-1 transition-all" />
                            </Link>
                        ) : (
                            <Link href="/dashboard/whatsapp-connect" className="flex items-center justify-between gap-6 bg-dark-navy text-white px-8 py-5 rounded-3xl hover:bg-black transition-all shadow-xl group/btn">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-success-green animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
                                    <span className="text-sm font-black uppercase tracking-widest">Neural Link</span>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-500 group-hover/btn:translate-x-1 transition-all" />
                            </Link>
                        )}
                        <div className="flex items-center gap-3 px-8 py-4 rounded-3xl border-2 border-slate-100 bg-white/50 backdrop-blur-sm">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Plan:</span>
                            <span className="text-sm font-black text-dark-navy italic bg-indigo-50 px-3 py-1 rounded-full text-trust-blue border border-indigo-100 uppercase">
                                {userPlan === 'free' ? 'LIMITED ACCESS' : 'PRO ENTERPRISE'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {userPlan === 'free' && (
                <div className="bg-amber-50 border-2 border-amber-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-warning-amber">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-dark-navy tracking-tight">System Notice: Restricted Access Mode</h3>
                            <p className="text-slate-500 font-medium">You are currently using the limited version. Bulk sending is restricted to 10 messages.</p>
                        </div>
                    </div>
                    <Link href="/pricing" className="bg-dark-navy text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
                        Unlock Pro Access
                    </Link>
                </div>
            )}

            {/* Cinematic Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {dynamicStats.map((stat, index) => (
                    <div key={index} className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-200 to-slate-100 rounded-[38px] opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                        <div className="relative card border-none shadow-xl bg-white p-8 rounded-[36px] transition-all group-hover:bg-slate-50">
                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bgColor} shadow-inner transition-transform group-hover:rotate-12`}>
                                    <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.changeBg} ${stat.changeColor} border ${stat.changeBorder} shadow-sm`}>
                                    {stat.change}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                <h3 className="text-4xl font-black text-dark-navy tracking-tighter tabular-nums">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-10">
                {/* Tactical Control Area */}
                <div className="lg:col-span-3 space-y-10">
                    <div className="card border-none shadow-2xl p-10 rounded-[48px] bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-3xl font-black text-dark-navy tracking-tight italic">Tactical Actions</h2>
                            <div className="px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Control Panel</div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {quickActions.map((action, index) => (
                                <Link
                                    key={index}
                                    href={action.href}
                                    className="relative flex flex-col gap-6 p-8 rounded-[40px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-trust-blue/20 transition-all group overflow-hidden"
                                >
                                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-trust-blue opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:bg-gradient-primary group-hover:text-white transition-all group-hover:scale-110">
                                        <action.icon className="w-8 h-8 text-trust-blue group-hover:text-white transition-all" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-dark-navy mb-2 group-hover:text-trust-blue transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="text-sm font-bold text-slate-400 leading-relaxed italic opacity-80">
                                            {action.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="card border-none shadow-2xl bg-dark-navy text-white p-12 rounded-[48px] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-trust-blue to-purple-600 opacity-20 blur-[150px] group-hover:opacity-30 transition-opacity"></div>
                        <h2 className="text-3xl font-black mb-10 relative z-10 italic">Evolution Playbook</h2>
                        <div className="grid md:grid-cols-3 gap-10 relative z-10">
                            {gettingStarted.map((step, index) => (
                                <div key={index} className="space-y-6 group/step">
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-xl font-black border border-white/20 group-hover/step:bg-white group-hover/step:text-dark-navy transition-all rotate-3">
                                        {index + 1}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black italic">{step.title}</h3>
                                        <p className="text-sm font-medium text-slate-400 leading-relaxed italic opacity-80">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Real-time Telemetry feed */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="card border-none shadow-2xl p-10 rounded-[48px] bg-white h-full flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-black text-dark-navy tracking-tight italic">Dispatch Log</h2>
                            <Link href="/dashboard/campaigns" className="text-[10px] font-black text-trust-blue bg-indigo-50 px-5 py-2.5 rounded-full hover:bg-trust-blue hover:text-white transition-all uppercase tracking-widest border border-indigo-100">
                                VIEW ALL
                            </Link>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {mappedCampaigns.length > 0 ? mappedCampaigns.map((campaign, index) => (
                                <div key={index} className="flex items-center gap-5 p-5 bg-slate-50 rounded-[32px] border border-slate-100 transition-all hover:bg-white hover:shadow-xl cursor-pointer group">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${campaign.status === 'completed' ? 'bg-emerald-50 text-success-green' :
                                        campaign.status === 'scheduled' ? 'bg-amber-50 text-warning-amber' :
                                            'bg-indigo-50 text-trust-blue'
                                        }`}>
                                        {campaign.status === 'completed' ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-dark-navy mb-1 group-hover:text-trust-blue transition-colors truncate italic">{campaign.name}</h3>
                                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span>{campaign.recipients} Leads</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span>{campaign.deliveryRate} Health</span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-300 uppercase shrink-0 italic">{campaign.date}</div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                                        <TrendingUp className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 italic">No signals detected yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const quickActions = [
    {
        icon: Send,
        title: 'New Blast',
        description: 'Launch a high-speed bulk campaign now.',
        href: '/dashboard/campaigns/new',
    },
    {
        icon: Users,
        title: 'Contact Vault',
        description: 'Organize and segment your target audience.',
        href: '/dashboard/contacts',
    },
    {
        icon: BarChart3,
        title: 'Performance',
        description: 'Deep-dive into your broadcast metrics.',
        href: '/dashboard/analytics',
    },
];

const gettingStarted = [
    {
        title: 'Sync Device',
        description: 'Link your WhatsApp using our secure QR protocol.',
    },
    {
        title: 'Prime Leads',
        description: 'Upload your contacts and apply smart filters.',
    },
    {
        title: 'Global Blast',
        description: 'Compose with Spintax and launch safely.',
    },
];

