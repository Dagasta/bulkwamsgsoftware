'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppSupport() {
    const phoneNumber = '971503953988';
    const message = encodeURIComponent('Hello BulkWaMsg! I want to experience the Unbreakable WhatsApp Engine. 🚀');

    return (
        <a
            href={`https://wa.me/${phoneNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[200] group flex items-center gap-3"
            title="Chat with Support"
        >
            <div className="bg-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 pointer-events-none whitespace-nowrap">
                <p className="text-dark-navy font-bold text-sm">Need Help? Chat now! ✨</p>
            </div>
            <div className="w-16 h-16 bg-[#25D366] rounded-2xl flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all animate-bounce-slow">
                <MessageCircle className="w-8 h-8 text-white fill-white" />
            </div>
        </a>
    );
}

// Add this to your globals.css or keep it here if using a framework that supports it
// .animate-bounce-slow {
//   animation: bounce-slow 3s infinite;
// }
// @keyframes bounce-slow {
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-10px); }
// }
