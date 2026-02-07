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

async function checkProfilesSchema() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Checking Profiles Schema ---');
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample Row (Keys):', Object.keys(data[0]).join(', '));

        // Specifically check for our columns
        const needed = ['whatsapp_session', 'whatsapp_status', 'whatsapp_qr', 'whatsapp_linked', 'whatsapp_lock_id', 'whatsapp_lock_at'];
        const missing = needed.filter(c => !Object.keys(data[0]).includes(c));
        if (missing.length > 0) {
            console.log('Missing Columns:', missing);
        } else {
            console.log('✅ All stability columns present.');
        }
    } else {
        console.log('No rows found in profiles table.');
    }
}

checkProfilesSchema();
