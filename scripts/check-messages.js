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

async function checkMessages() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Checking Messages ---');
    const { data: messages, error } = await supabase
        .from('messages')
        .select('phone, status, error, campaign_id')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    messages.forEach(m => {
        console.log(`Phone: ${m.phone}`);
        console.log(`Status: ${m.status}`);
        console.log(`Error: ${m.error}`);
        console.log(`Campaign: ${m.campaign_id}`);
        console.log('---');
    });
}

checkMessages();
