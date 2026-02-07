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

async function checkCampaigns() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Checking Campaigns ---');
    const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('id, name, status, error_log, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    campaigns.forEach(c => {
        console.log(`ID: ${c.id}`);
        console.log(`Name: ${c.name}`);
        console.log(`Status: ${c.status}`);
        console.log(`Error: ${c.error_log}`);
        console.log(`Updated: ${c.updated_at}`);
        console.log('---');
    });
}

checkCampaigns();
