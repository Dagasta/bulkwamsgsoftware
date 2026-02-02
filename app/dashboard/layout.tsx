import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-soft-gray">
            <Sidebar />
            <div className="ml-72 transition-all duration-300">
                <main className="p-8 max-w-[1600px] mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
