'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import {
    User,
    Bell,
    CreditCard,
    Shield,
    Smartphone,
    Crown,
    Zap,
    ShieldCheck,
    Fingerprint,
    Lock,
    Globe,
    Cpu,
    CheckCircle2
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black text-dark-navy tracking-tighter italic">
                        Control <span className="gradient-text">Parameters</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium italic opacity-80 mt-2">
                        Configure your global identity and architectural preferences.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-12">
                {/* Tactical Sidebar Tabs */}
                <div className="lg:col-span-1 space-y-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center justify-between p-6 rounded-[28px] transition-all group ${activeTab === tab.id
                                ? 'bg-dark-navy text-white shadow-2xl shadow-indigo-200 -translate-x-2'
                                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-dark-navy border border-slate-100 shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-trust-blue' : 'group-hover:text-trust-blue'} transition-colors`} />
                                <span className="font-black text-xs uppercase tracking-widest">{tab.label}</span>
                            </div>
                            {activeTab === tab.id && <Zap className="w-4 h-4 fill-white" />}
                        </button>
                    ))}
                </div>

                {/* Tactical Content Area */}
                <div className="lg:col-span-3">
                    <div className="card border-none shadow-2xl p-10 md:p-14 rounded-[48px] bg-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-[80px]"></div>

                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'billing' && <BillingSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                        {activeTab === 'whatsapp' && <WhatsAppSettings />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileSettings() {
    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-gradient-primary rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl rotate-3">
                    JD
                </div>
                <div>
                    <h2 className="text-3xl font-black text-dark-navy italic">Identity Matrix</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Core user credentials</p>
                </div>
            </div>

            <form className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                    <input type="text" placeholder="e.g., Jordan Doe" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-dark-navy focus:bg-white focus:border-trust-blue/20 outline-none transition-all italic" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Signal (Email)</label>
                    <input type="email" placeholder="jordan@neural-link.com" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-dark-navy focus:bg-white focus:border-trust-blue/20 outline-none transition-all italic" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Regional Code</label>
                    <input type="text" placeholder="Dubai, UAE (UTC+04)" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-dark-navy focus:bg-white focus:border-trust-blue/20 outline-none transition-all italic" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Device ID</label>
                    <input type="text" readOnly value="XN-9021-ALPHA" className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-400 outline-none italic cursor-not-allowed" />
                </div>
                <div className="md:col-span-2 pt-6">
                    <button className="bg-dark-navy text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all">Submit Modifications</button>
                </div>
            </form>
        </div>
    );
}

function NotificationSettings() {
    return (
        <div className="space-y-12 animate-fade-in">
            <h2 className="text-3xl font-black text-dark-navy italic mb-10">Neural Alerts</h2>
            <div className="space-y-4">
                {notifications.map((notification, index) => (
                    <div key={index} className="flex items-center justify-between p-8 bg-slate-50/50 border border-slate-100 rounded-[32px] hover:bg-white hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-trust-blue group-hover:text-white transition-all">
                                <Bell className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-dark-navy italic mb-1">{notification.title}</h3>
                                <p className="text-xs font-medium text-slate-400 italic">{notification.description}</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={notification.enabled} />
                            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-trust-blue"></div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BillingSettings() {
    return (
        <div className="space-y-10 animate-fade-in">
            <h2 className="text-3xl font-black text-dark-navy italic mb-10">Resource Allocation</h2>

            <div className="relative group p-1 bg-gradient-to-r from-trust-blue to-purple-600 rounded-[40px] shadow-2xl shadow-indigo-200 overflow-hidden">
                <div className="absolute inset-0 bg-dark-navy opacity-90 backdrop-blur-3xl rounded-[38px]"></div>
                <div className="relative p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trust-blue text-white text-[10px] font-black uppercase tracking-widest">
                            <Crown className="w-3 h-3 fill-white" />
                            Premium Node Active
                        </div>
                        <h3 className="text-4xl font-black text-white italic">Enterprise Pro</h3>
                        <p className="text-slate-400 font-medium italic">Unlimited signals across all global nodes.</p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-5xl font-black text-white tracking-tighter tabular-nums">$29<span className="text-xl text-slate-500 font-medium">/mo</span></p>
                        <p className="text-[10px] font-black text-success-green uppercase tracking-widest mt-2">NEXUS BILLING ACTIVE</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all">
                    <CreditCard className="w-10 h-10 text-slate-300 mb-6 group-hover:text-trust-blue transition-colors" />
                    <h4 className="font-black text-dark-navy italic mb-2">Signal Pipeline</h4>
                    <p className="text-xs text-slate-400 font-medium italic mb-6">Mastercard ending in **** 8420</p>
                    <button className="text-[10px] font-black text-trust-blue uppercase tracking-widest hover:underline">Revise Payment Vector</button>
                </div>
                <div className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all">
                    <Globe className="w-10 h-10 text-slate-300 mb-6 group-hover:text-trust-blue transition-colors" />
                    <h4 className="font-black text-dark-navy italic mb-2">Ledger Logs</h4>
                    <p className="text-xs text-slate-400 font-medium italic mb-6">Last payment: FEB 01, 2025</p>
                    <button className="text-[10px] font-black text-trust-blue uppercase tracking-widest hover:underline">Download Invoices</button>
                </div>
            </div>
        </div>
    );
}

function SecuritySettings() {
    return (
        <div className="space-y-12 animate-fade-in">
            <h2 className="text-3xl font-black text-dark-navy italic mb-10">Security Perimeter</h2>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-3 text-xl font-black text-dark-navy italic">
                            <Lock className="w-5 h-5 text-trust-blue" />
                            Passkey Rotation
                        </h3>
                        <form className="space-y-4">
                            <input type="password" placeholder="Current Secret" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-dark-navy focus:bg-white focus:border-trust-blue/20 outline-none transition-all italic" />
                            <input type="password" placeholder="New Neural Key" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-dark-navy focus:bg-white focus:border-trust-blue/20 outline-none transition-all italic" />
                            <input type="password" placeholder="Verify Neural Key" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-dark-navy focus:bg-white focus:border-trust-blue/20 outline-none transition-all italic" />
                            <button className="w-full bg-dark-navy text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-xl transition-all">Update Perimeter Key</button>
                        </form>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-6">
                        <h3 className="flex items-center gap-3 text-xl font-black text-dark-navy italic">
                            <ShieldCheck className="w-5 h-5 text-success-green" />
                            Biometric Sync
                        </h3>
                        <div className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-1">
                                    <p className="font-black text-dark-navy">Multi-Factor Protocol</p>
                                    <p className="text-xs text-slate-400 italic">Level 2 redundancy active.</p>
                                </div>
                                <div className="w-12 h-12 bg-success-green/10 text-success-green rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>
                            <button className="w-full bg-white text-dark-navy border-2 border-slate-100 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Configuration Mode</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WhatsAppSettings() {
    return (
        <div className="space-y-10 animate-fade-in">
            <h2 className="text-3xl font-black text-dark-navy italic mb-10">Architectural Hub</h2>

            <div className="p-12 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[48px] text-center group hover:bg-white hover:border-trust-blue/20 transition-all">
                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform">
                    <Cpu className="w-12 h-12 text-slate-200 group-hover:text-trust-blue transition-colors" />
                </div>
                <h3 className="text-4xl font-black text-dark-navy italic mb-4">No Active Hub</h3>
                <p className="text-lg text-slate-400 font-medium italic mb-10 max-w-sm mx-auto">Your signal hub is currently offline. Connect a device to begin architectural deployment.</p>
                <Link href="/dashboard/whatsapp-connect" className="bg-gradient-primary text-white px-14 py-6 rounded-3xl font-black text-xl shadow-2xl hover:-translate-y-2 transition-all inline-block">INITIALIZE HUB</Link>
            </div>
        </div>
    );
}

const tabs = [
    { id: 'profile', label: 'Identity', icon: User },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'billing', label: 'Resource', icon: CreditCard },
    { id: 'security', label: 'Perimeter', icon: Shield },
    { id: 'whatsapp', label: 'Architechture', icon: Smartphone },
];

const notifications = [
    {
        title: 'Dispatch Success Pulsing',
        description: 'Receive real-time haptic feedback on successful broadcasts.',
        enabled: true,
    },
    {
        title: 'Neural Node Disconnect',
        description: 'Immediate alert protocol if a device loses sync.',
        enabled: true,
    },
    {
        title: 'Low Resource Warning',
        description: 'Strategic alert when message allocation drops below 10%.',
        enabled: false,
    },
    {
        title: 'Tactical Weekly Report',
        description: 'Deep-dive analytical summary of global signal performance.',
        enabled: true,
    },
];
