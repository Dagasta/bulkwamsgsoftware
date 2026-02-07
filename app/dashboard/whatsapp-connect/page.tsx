'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { QrCode, CheckCircle2, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function WhatsAppConnectPage() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('Connecting...');
    const [initTimer, setInitTimer] = useState(0);

    useEffect(() => {
        let timer: any;
        if (isLoading && !qrCode && !isReady) {
            timer = setInterval(() => setInitTimer(prev => prev + 1), 1000);
        } else {
            setInitTimer(0);
        }
        return () => clearInterval(timer);
    }, [isLoading, qrCode, isReady]);

    const checkStatus = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch('/api/whatsapp/status', {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (data.message) setStatusMessage(data.message);
            if (data.ready) {
                setIsReady(true);
                setQrCode(null);
                setIsLoading(false);
            } else if (data.linking) {
                setStatusMessage('Linking device... Please wait.');
                setIsLoading(true);
                setQrCode(null);
                setIsReady(false);
            } else if (data.qrCode) {
                setQrCode(data.qrCode);
                setIsReady(false);
                setIsLoading(false);
            } else {
                setIsLoading(!data.qrCode);
                setIsReady(false);
            }
        } catch (err) {
            console.error('Status check error:', err);
            setError('Failed to connect to WhatsApp service');
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 1000); // Ultra-fast 1s polling for instant feedback
        return () => clearInterval(interval);
    }, [checkStatus]);

    const handleReset = async () => {
        if (!confirm('Are you sure you want to reset the WhatsApp connection?')) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/whatsapp/reset', { method: 'POST' });
            if (response.ok) checkStatus();
            else setError('Failed to reset session');
        } catch (err) {
            setError('An error occurred while resetting');
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-5xl font-black text-dark-navy tracking-tighter italic">
                    Neural <span className="gradient-text">Sync</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed italic">
                    Bridge your device with the BulkWaMsg neural network. Scan the secure QR code to begin high-speed dispatch.
                </p>
            </div>

            {/* Main Interactive Card */}
            <div className="bg-white rounded-[48px] shadow-2xl p-10 md:p-16 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-primary"></div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-trust-blue opacity-5 rounded-full blur-[100px] group-hover:opacity-10 transition-opacity"></div>

                {isLoading && !qrCode && !isReady && (
                    <div className="text-center py-20 animate-pulse">
                        <div className="relative w-24 h-24 mx-auto mb-10">
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-50 shadow-inner"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-trust-blue animate-spin"></div>
                            <Loader2 className="absolute inset-0 w-10 h-10 text-trust-blue m-auto opacity-40" />
                        </div>
                        <h3 className="text-3xl font-black text-dark-navy mb-4 tracking-tight">Initializing Pulse...</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mb-8 italic">{statusMessage}</p>

                        {initTimer > 15 && (
                            <div className="mb-10 p-6 bg-amber-50 rounded-[30px] border border-amber-100 animate-fade-in">
                                <p className="text-amber-700 text-sm font-bold italic mb-4">Handshake is taking longer than expected...</p>
                                <button
                                    onClick={handleReset}
                                    className="bg-amber-500 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-600 transition-all"
                                >
                                    Force Fresh Link
                                </button>
                            </div>
                        )}

                        <div className="pt-10 border-t border-slate-50">
                            <button
                                onClick={handleReset}
                                className="inline-flex items-center gap-2 px-10 py-4 bg-slate-50 text-slate-400 rounded-[20px] hover:bg-red-50 hover:text-red-500 transition-all font-black text-xs uppercase tracking-widest border border-slate-100 hover:border-red-100"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Force Network Reset
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 text-red-500 shadow-inner">
                            <QrCode className="w-12 h-12" />
                        </div>
                        <h3 className="text-4xl font-black text-dark-navy mb-4 tracking-tight italics">Sync Fault Detected</h3>
                        <p className="text-slate-500 font-medium mb-12 max-w-md mx-auto">{error}</p>
                        <div className="flex flex-wrap gap-6 justify-center">
                            <button
                                onClick={checkStatus}
                                className="bg-gradient-primary text-white px-12 py-5 rounded-[24px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg"
                            >
                                Re-Establish Link
                            </button>
                            <button
                                onClick={handleReset}
                                className="bg-slate-50 text-slate-400 px-12 py-5 rounded-[24px] hover:bg-slate-100 transition-all font-black text-lg border border-slate-100"
                            >
                                Full System Reset
                            </button>
                        </div>
                    </div>
                )}

                {isReady && (
                    <div className="text-center py-20 animate-scale-up">
                        <div className="w-28 h-28 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto mb-12 text-success-green animate-bounce shadow-inner">
                            <CheckCircle2 className="w-14 h-14" />
                        </div>
                        <h3 className="text-5xl font-black text-dark-navy mb-4 tracking-tighter">Sync Successful</h3>
                        <p className="text-xl text-slate-500 mb-12 max-w-lg mx-auto italic font-medium">
                            Your device is now integrated with the BulkWaMsg backbone. High-volume dispatch protocols are active.
                        </p>
                        <Link
                            href="/dashboard/campaigns/new"
                            className="bg-dark-navy text-white inline-flex items-center gap-4 px-14 py-6 text-xl font-black rounded-[30px] shadow-2xl hover:bg-black hover:shadow-trust-blue/20 hover:-translate-y-2 transition-all"
                        >
                            Launch First Blast
                            <ArrowLeft className="w-6 h-6 rotate-180" />
                        </Link>
                    </div>
                )}

                {qrCode && !isReady && (
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-trust-blue/10 text-trust-blue font-black text-[10px] uppercase tracking-widest mb-6">
                                <span className="w-2 h-2 rounded-full bg-trust-blue animate-ping"></span>
                                Secure QR Protocol Active
                            </div>
                            <h3 className="text-4xl font-black text-dark-navy mb-6 tracking-tight">Scan to Activate</h3>
                            <div className="space-y-6 text-slate-500 font-medium italic mb-10">
                                <p className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-dark-navy font-black not-italic border border-slate-100">1</span>
                                    Open WhatsApp on your linked phone
                                </p>
                                <p className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-dark-navy font-black not-italic border border-slate-100">2</span>
                                    Navigate to Settings → Linked Devices
                                </p>
                                <p className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-dark-navy font-black not-italic border border-slate-100">3</span>
                                    Scan the code on the right with your camera
                                </p>
                            </div>

                            <div className="p-8 bg-indigo-50/50 rounded-[32px] border border-indigo-100/50">
                                <div className="flex items-center gap-3 text-trust-blue mb-4">
                                    <RefreshCw className="w-5 h-5 animate-spin-slow" />
                                    <span className="font-black text-xs uppercase tracking-widest">Auto-refreshing...</span>
                                </div>
                                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                                    Our secure hand-shake happens every 30 seconds. If the code expires, it will automatically regenerate.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-8">
                            <div className="p-1.5 rounded-[44px] bg-gradient-primary shadow-2xl relative">
                                <div className="absolute -inset-4 bg-gradient-primary blur-2xl opacity-10"></div>
                                <div className="bg-white p-6 rounded-[38px] relative">
                                    <Image
                                        src={qrCode}
                                        alt="WhatsApp QR Code"
                                        width={320}
                                        height={320}
                                        className="w-72 h-72 md:w-80 md:h-80"
                                        unoptimized
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleReset}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-50 text-slate-500 rounded-[20px] hover:bg-trust-blue hover:text-white hover:shadow-xl transition-all font-black text-xs uppercase tracking-widest border border-slate-100"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh QR Code
                            </button>

                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Encrypted Handshake Protocol v2.1</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Elite Features Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: 'Neural Encryption', desc: 'Enterprise-grade end-to-end encryption for every broadcast.', icon: QrCode },
                    { title: 'Global Throughput', desc: 'Optimized for high-volume delivery across 180+ countries.', icon: CheckCircle2 },
                    { title: 'Persistent Sync', desc: 'Maintain connection integrity even when you are offline.', icon: RefreshCw }
                ].map((feature, i) => (
                    <div key={i} className="card p-8 rounded-[32px] border-none shadow-xl hover:shadow-2xl transition-all group">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-trust-blue group-hover:text-white transition-all shadow-inner">
                            <feature.icon className="w-7 h-7" />
                        </div>
                        <h4 className="text-xl font-black text-dark-navy mb-2 tracking-tight italic">{feature.title}</h4>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
