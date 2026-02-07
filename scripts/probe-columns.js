const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    const env = {};
    lines.forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            env[key] = value;
        }
    });
    return env;
}

async function probeColumns() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Probing Columns ---');

    const columns = ['id', 'whatsapp_session', 'whatsapp_status', 'whatsapp_qr', 'whatsapp_linked', 'whatsapp_lock_id', 'whatsapp_lock_at'];

    for (const col of columns) {
        const { error } = await supabase.from('profiles').select(col).limit(1);
        if (error) {
            console.log(`- ${col}: MISSING (${error.message})`);
        } else {
            console.log(`- ${col}: EXISTS`);
        }
    }
}

probeColumns();
