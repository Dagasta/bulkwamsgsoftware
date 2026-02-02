'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Search,
    Upload,
    Download,
    MoreVertical,
    Users as UsersIcon,
    Filter,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    Copy,
    Trash2,
    Edit3,
    Loader2,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ContactsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [contacts, setContacts] = useState<any[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        segments: 0
    });

    const supabase = createClient();

    const fetchContacts = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch real contacts
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setContacts(data);
                setStats({
                    total: data.length,
                    active: data.filter(c => c.status === 'active').length,
                    segments: new Set(data.flatMap(c => c.tags || [])).size
                });
            }
        } catch (error) {
            console.error('Fetch Contacts Error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // Export Functionality
    const handleExport = () => {
        if (contacts.length === 0) return;

        const headers = ['Name', 'Phone', 'Tags', 'Status', 'Date Added'];
        const csvContent = [
            headers.join(','),
            ...contacts.map(c => [
                `"${c.name || 'Unknown'}"`,
                `"${c.phone}"`,
                `"${(c.tags || []).join('|')}"`,
                `"${c.status}"`,
                `"${new Date(c.created_at).toLocaleDateString()}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `bulkwamsg_contacts_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredContacts = contacts.filter(c =>
        (c.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.phone.includes(searchQuery))
    );

    // CSV Import Functionality
    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const newContacts = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const [name, phone, tagsStr] = line.split(',').map(s => s.replace(/^"|"$/g, '').trim());
                if (phone) {
                    newContacts.push({
                        name: name || 'Imported User',
                        phone: phone.replace(/\D/g, ''),
                        tags: tagsStr ? tagsStr.split('|') : ['IMPORTED']
                    });
                }
            }

            if (newContacts.length > 0) {
                try {
                    setIsLoading(true);
                    const response = await fetch('/api/contacts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contacts: newContacts })
                    });
                    if (response.ok) fetchContacts();
                } catch (err) {
                    console.error('Import failed:', err);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Ultra-Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black text-dark-navy tracking-tighter italic">
                        Contact <span className="gradient-text">Vault</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium italic opacity-80 mt-2">
                        Your audience is your most valuable asset. Manage it with precision.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImportCSV}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button className="flex items-center gap-3 bg-white border-2 border-slate-100 px-6 py-3.5 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-50 hover:border-trust-blue/20 transition-all shadow-sm">
                            <Upload className="w-5 h-5" />
                            IMPORT CSV
                        </button>
                    </div>
                    <button onClick={fetchContacts} className="flex items-center gap-3 bg-white border-2 border-slate-100 px-6 py-3.5 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-50 hover:border-trust-blue/20 transition-all shadow-sm">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        SYNC DATABASE
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-3 bg-white border-2 border-slate-100 px-6 py-3.5 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-50 hover:border-trust-blue/20 transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                        EXPORT EXCEL/CSV
                    </button>
                </div>
            </div>

            {/* Tactical Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="card p-8 rounded-[32px] border-none shadow-xl bg-white group hover:bg-slate-50 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 text-trust-blue shadow-inner">
                            <UsersIcon className="w-7 h-7" />
                        </div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">LIVE COUNT</div>
                    </div>
                    <h3 className="text-4xl font-black text-dark-navy tracking-tighter mb-1">{stats.total}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-60">Total Identities</p>
                </div>
                <div className="card p-8 rounded-[32px] border-none shadow-xl bg-white group hover:bg-slate-50 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 text-success-green shadow-inner">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">REAL-TIME</div>
                    </div>
                    <h3 className="text-4xl font-black text-dark-navy tracking-tighter mb-1">{stats.active}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-60">Active Signal Nodes</p>
                </div>
                <div className="card p-8 rounded-[32px] border-none shadow-xl bg-white group hover:bg-slate-50 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-50 text-premium-indigo shadow-inner">
                            <Filter className="w-7 h-7" />
                        </div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">SEGMENTATION</div>
                    </div>
                    <h3 className="text-4xl font-black text-dark-navy tracking-tighter mb-1">{stats.segments}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-60">Unique Matrix Segments</p>
                </div>
            </div>

            {/* Advanced Filtration Bar */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-trust-blue/10 to-premium-indigo/10 rounded-[42px] blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                <div className="relative card p-4 rounded-[40px] border-none shadow-2xl bg-white flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Scan through your signals & identities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 rounded-[30px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-trust-blue/20 outline-none font-bold text-dark-navy placeholder:text-slate-300 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Elite Data Interface */}
            <div className="card p-0 rounded-[48px] border-none shadow-2xl bg-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-primary"></div>

                {isLoading ? (
                    <div className="py-40 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-trust-blue animate-spin mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Accessing Vault Matrix...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="py-8 px-10 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity</th>
                                    <th className="py-8 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Signal Node</th>
                                    <th className="py-8 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tags & Matrix</th>
                                    <th className="py-8 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reputation</th>
                                    <th className="py-8 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logged</th>
                                    <th className="py-8 px-10 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tactical</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-32 text-center text-slate-300 font-bold italic">No identities found. Import or add new leads to begin.</td>
                                    </tr>
                                ) : (
                                    filteredContacts.map((contact, index) => (
                                        <tr key={index} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                                            <td className="py-6 px-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-trust-blue text-sm shadow-sm">
                                                        {(contact.name || 'U').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-dark-navy italic">{contact.name || 'Anonymous Signal'}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {contact.id.split('-')[0]}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6 text-sm font-black text-dark-navy tabular-nums italic">{contact.phone}</td>
                                            <td className="py-6 px-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {(contact.tags || []).length > 0 ? (
                                                        contact.tags.map((tag: string, tagIndex: number) => (
                                                            <span key={tagIndex} className="bg-white border-2 border-indigo-50 text-trust-blue px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                                {tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] font-black text-slate-300 italic">No Tags</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-6 px-6">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${contact.status === 'active'
                                                    ? 'bg-emerald-50 text-success-green border border-emerald-100'
                                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${contact.status === 'active' ? 'bg-success-green animate-pulse' : 'bg-slate-300'}`}></div>
                                                    {contact.status}
                                                </span>
                                            </td>
                                            <td className="py-6 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{new Date(contact.created_at).toLocaleDateString()}</td>
                                            <td className="py-6 px-10 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-3 bg-white border border-slate-100 hover:bg-indigo-50 hover:text-trust-blue rounded-xl shadow-sm transition-all"><Edit3 className="w-4 h-4" /></button>
                                                    <button className="p-3 bg-white border border-slate-100 hover:bg-red-50 hover:text-red-500 rounded-xl shadow-sm transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
