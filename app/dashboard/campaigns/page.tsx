'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
    Plus,
    Search,
    Send,
    Calendar,
    MoreVertical,
    CheckCircle2,
    Clock,
    XCircle,
    BarChart3,
    ArrowUpRight,
    Filter,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function CampaignsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black text-dark-navy tracking-tighter italic">
                        Mission <span className="gradient-text">Log</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium italic opacity-80 mt-2">
                        Deployment history and real-time broadcast tracking.
                    </p>
                </div>
                <Link href="/dashboard/campaigns/new" className="bg-gradient-primary text-white flex items-center gap-4 px-10 py-5 rounded-[30px] font-black shadow-2xl hover:shadow-trust-blue/30 hover:-translate-y-1 transition-all group">
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    NEW DEPLOYMENT
                </Link>
            </div>

            {/* Tactical Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="card p-8 rounded-[32px] border-none shadow-xl bg-white group hover:bg-slate-50 transition-all">
                        <div className="flex items-center justify-between mb-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bgColor} shadow-inner`}>
                                <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-trust-blue animate-pulse"></span>
                                <span className="text-[10px] font-black text-slate-400">ACTIVE</span>
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-dark-navy tracking-tighter mb-1">{stat.value}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Advanced Filters */}
            <div className="card p-4 rounded-[40px] border-none shadow-2xl bg-white flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search through previous mission deployments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 rounded-[30px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-trust-blue/20 outline-none font-bold text-dark-navy placeholder:text-slate-300 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-8 py-5 rounded-[30px] bg-slate-50 border-2 border-transparent text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:text-trust-blue transition-all">
                        <Filter className="w-4 h-4" />
                        Status Phase
                    </button>
                    <button className="flex items-center gap-2 px-8 py-5 rounded-[30px] bg-dark-navy text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                        <ArrowUpRight className="w-4 h-4" />
                        Sort Matrix
                    </button>
                </div>
            </div>

            {/* Elite Data Interface */}
            <div className="card p-0 rounded-[48px] border-none shadow-2xl bg-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-primary"></div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="py-8 px-10 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Identity</th>
                                <th className="py-8 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Phase</th>
                                <th className="py-8 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Load</th>
                                <th className="py-8 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Signal Health</th>
                                <th className="py-8 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Log</th>
                                <th className="py-8 px-10 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tactical</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-8 animate-pulse">
                                            <div className="w-24 h-24 bg-indigo-50 rounded-[40px] flex items-center justify-center text-trust-blue shadow-inner">
                                                <Send className="w-10 h-10 opacity-30" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-3xl font-black text-dark-navy italic">No Active Missions</h3>
                                                <p className="text-slate-400 font-medium italic">Initiate your first global signal broadcast to populate the matrix.</p>
                                            </div>
                                            <Link href="/dashboard/campaigns/new" className="bg-dark-navy text-white px-12 py-5 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl hover:bg-black transition-all">
                                                START NEW CAMPAIGN
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign, index) => (
                                    <tr key={index} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer">
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-trust-blue shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform">
                                                    <Send className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-dark-navy group-hover:text-trust-blue transition-colors italic leading-none mb-1">{campaign.name}</p>
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest max-w-[200px] truncate">{campaign.message}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-6">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${campaign.status === 'completed'
                                                ? 'bg-emerald-50 text-success-green border-emerald-100'
                                                : campaign.status === 'scheduled'
                                                    ? 'bg-amber-50 text-warning-amber border-amber-100'
                                                    : 'bg-slate-50 text-slate-400 border-slate-100'
                                                }`}>
                                                {campaign.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="py-8 px-6 text-sm font-black text-dark-navy italic tabular-nums">{campaign.recipients} identities</td>
                                        <td className="py-8 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-trust-blue" style={{ width: campaign.deliveryRate }}></div>
                                                </div>
                                                <span className="text-[10px] font-black text-dark-navy">{campaign.deliveryRate}</span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{campaign.date}</td>
                                        <td className="py-8 px-10 text-right">
                                            <button className="p-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-xl shadow-sm transition-all text-slate-400 hover:text-dark-navy">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
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

const stats = [
    {
        icon: Send,
        label: 'Total Missions',
        value: '4,290',
        bgColor: 'bg-blue-50',
        iconColor: 'text-trust-blue',
    },
    {
        icon: CheckCircle2,
        label: 'Successful',
        value: '4,102',
        bgColor: 'bg-green-50',
        iconColor: 'text-success-green',
    },
    {
        icon: Clock,
        label: 'Active Flows',
        value: '124',
        bgColor: 'bg-orange-50',
        iconColor: 'text-warning-amber',
    },
    {
        icon: BarChart3,
        label: 'Avg Health',
        value: '99.2%',
        bgColor: 'bg-purple-50',
        iconColor: 'text-premium-indigo',
    },
];

const campaigns = [
    {
        name: 'Summer Blitz 2025',
        message: 'Get ready for our massive summer deals happening now...',
        status: 'completed',
        recipients: '14,290',
        sent: '14,290',
        deliveryRate: '98.5%',
        date: '2H AGO',
    },
    {
        name: 'VIP Loyalty Rewards',
        message: 'Because you are one of our top 1% customers, we have...',
        status: 'scheduled',
        recipients: '2,400',
        sent: '0',
        deliveryRate: '0%',
        date: 'IN 5H',
    },
    {
        name: 'Flash Sale Alert',
        message: 'Everything must go! 50% discount for the next 4 hours...',
        status: 'completed',
        recipients: '8,500',
        sent: '8,492',
        deliveryRate: '99.1%',
        date: '1D AGO',
    }
];
