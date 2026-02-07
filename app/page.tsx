import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageSquare, Users, Calendar, BarChart3, Shield, Zap, CheckCircle2, Star, Send, Upload } from 'lucide-react';
import Footer from '@/components/ui/Footer';
import WhatsAppSupport from '@/components/ui/WhatsAppSupport';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Premium Navigation */}
            <nav className="glass sticky top-0 z-[100] border-b border-slate-100">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                <MessageSquare className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-black text-dark-navy tracking-tighter">BulkWaMsg</span>
                        </div>

                        <div className="hidden md:flex items-center gap-10">
                            <Link href="/features" className="text-sm font-bold text-slate-gray hover:text-trust-blue transition-all">Features</Link>
                            <Link href="/pricing" className="text-sm font-bold text-slate-gray hover:text-trust-blue transition-all">Pricing</Link>
                            <Link href="/help" className="text-sm font-bold text-slate-gray hover:text-trust-blue transition-all">Support</Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-bold text-dark-navy px-6 py-2.5 hover:bg-slate-50 rounded-xl transition-all">Sign In</Link>
                            <Link href="/signup" className="btn-primary shadow-xl shadow-trust-blue/20">
                                Get PRO Access
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - The "WOW" Factor */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_top_right,#EEF2FF_0%,transparent_50%),radial-gradient(circle_at_bottom_left,#F5F3FF_0%,transparent_50%)]"></div>
                <div className="absolute top-40 right-10 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl animate-pulse"></div>

                <div className="container-custom">
                    <div className="text-center max-w-4xl mx-auto space-y-10">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest animate-fade-in shadow-sm">
                            <Zap className="w-4 h-4 text-warning-amber fill-warning-amber" />
                            <span>v2.0 Now Live - Safer & Faster</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-dark-navy leading-[1.05] tracking-tight animate-slide-up">
                            Own The Niche. <br />
                            <span className="gradient-text underline decoration-indigo-500/20 underline-offset-8">Crush The Limits.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-gray leading-relaxed max-w-2xl mx-auto font-medium opacity-90 italic">
                            The world&apos;s only <span className="text-trust-blue font-black uppercase tracking-widest">Unstoppable</span> WhatsApp engine. Powered by Ghost-AI Anti-Ban, Fortress Stability, and Hyper-Growth analytics.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6 animate-slide-up delay-100">
                            <Link href="/signup" className="btn-primary px-10 py-5 text-xl flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95">
                                Start Campaigning Now
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                            <Link href="/demo" className="bg-white text-dark-navy border-2 border-slate-100 px-10 py-5 text-xl rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md">
                                Watch Live Demo
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div className="pt-12 flex flex-col items-center gap-6 animate-fade-in delay-200">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-slate-100">
                                        <div className="w-full h-full bg-gradient-primary opacity-20"></div>
                                    </div>
                                ))}
                                <div className="w-12 h-12 rounded-full border-4 border-white bg-dark-navy text-white text-[10px] flex items-center justify-center font-bold">+10k</div>
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                Trusted by market leaders globally
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Preview Section */}
            <section className="container-custom pb-32">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-primary rounded-[40px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-4 md:p-8 relative overflow-hidden">
                        <div className="bg-slate-50 rounded-[32px] p-6 md:p-12 border border-slate-100 shadow-inner">
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-dark-navy">Campaign Growth</h3>
                                            <p className="text-sm font-bold text-slate-400">Real-time performance metrics</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Sent', val: '1.2M', color: 'text-trust-blue' },
                                            { label: 'Read', val: '98%', color: 'text-success-green' },
                                            { label: 'Bounced', val: '0.2%', color: 'text-error-red' },
                                            { label: 'Score', val: 'Elite', color: 'text-premium-indigo' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                                                <p className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-48 bg-white/50 rounded-3xl border border-slate-50 border-dashed flex items-center justify-center">
                                        <p className="text-slate-300 font-bold italic tracking-tighter">Live Chart Analytics visualization...</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-dark-navy text-white rounded-[32px] p-8 h-full shadow-2xl">
                                        <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <Shield className="w-6 h-6 text-success-green" />
                                            Safety Protocol
                                        </h4>
                                        <div className="space-y-4">
                                            {[
                                                'Dynamic Spintax Support',
                                                'Variable Send Delays',
                                                'Account Health Guard',
                                                'Auto-Rotate Content'
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                                                    <CheckCircle2 className="w-5 h-5 text-success-green" />
                                                    <span className="text-sm font-medium opacity-80">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-8 py-4 bg-trust-blue rounded-2xl font-bold text-sm hover:bg-trust-blue/90 transition-all">
                                            Enhanced Mode Active
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Masterpiece */}
            <section className="bg-slate-50 py-32">
                <div className="container-custom">
                    <div className="text-center mb-24 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black text-dark-navy mb-6 tracking-tight">The Arsenal of <br /> <span className="gradient-text">Success</span></h2>
                        <p className="text-xl text-slate-gray font-medium">Tools built for scale, speed, and absolute reliability.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-gradient-primary group-hover:scale-110 transition-all shadow-inner">
                                    <feature.icon className="w-8 h-8 text-trust-blue group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black text-dark-navy mb-4">{feature.title}</h3>
                                <p className="text-slate-gray leading-relaxed font-medium mb-8">{feature.description}</p>
                                <div className="h-1 w-12 bg-slate-100 rounded-full group-hover:w-full group-hover:bg-trust-blue transition-all duration-500"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="container-custom py-32">
                <div className="bg-dark-navy rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-trust-blue rounded-full blur-[120px] opacity-20"></div>

                    <div className="relative z-10 space-y-10">
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">Ready for Hyper-Growth?</h2>
                        <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto">
                            Join 10,000+ top marketers using BulkWaMsg to dominate their niche. No hidden fees. Start today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                            <Link href="/signup" className="bg-white text-dark-navy px-12 py-6 rounded-3xl font-black text-2xl hover:bg-slate-100 transition-all shadow-2xl hover:scale-105 active:scale-95">
                                Get PRO Access
                            </Link>
                            <Link href="/pricing" className="border-2 border-white/20 text-white px-12 py-6 rounded-3xl font-black text-2xl hover:bg-white/5 transition-all">
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
            <WhatsAppSupport />
        </main>
    );
}

const features = [
    {
        icon: Send,
        title: 'Sonic Broadcast',
        description: 'Send thousands of messages in seconds. Optimized architecture ensures 100% delivery rate with ultra-low latency.',
    },
    {
        icon: Shield,
        title: 'Ghost AI (Unban-able)',
        description: 'Our proprietary neural mimicry disguises your bot as a human. We don&apos;t just avoid bans—we make you invisible to the WhatsApp algorithm.',
    },
    {
        icon: Zap,
        title: 'Iron-Clad Persistence',
        description: 'Scan once, dominate forever. Our Fortress Storage tech ensures your connection stays alive through server reboots and network storms.',
    },
    {
        icon: Calendar,
        title: 'Ruthless Scheduling',
        description: 'Set it. Forget it. Conquer. Schedule campaigns weeks in advance. Our engine fires messages with sniper-precision even while you sleep.',
    },
    {
        icon: BarChart3,
        title: 'Predator Analytics',
        description: 'Deep-dive into read rates, engagement, and ROI. Don&apos;t just send messages—extract every dollar of value from your audience.',
    },
    {
        icon: Upload,
        title: 'HD Multi-Media',
        description: 'Attach 4K images, documents, and videos. Your media is delivered in high-definition brilliance without any compression.',
    },
];
