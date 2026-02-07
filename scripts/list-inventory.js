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

async function listAllTables() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Database Table Inventory ---');

    // Attempting a direct RPC to get table names or querying a common system view if possible
    // Supabase JS doesn't allow raw SQL unless via RPC. 
    // Let's try to query 'campaigns' again to be 100% sure it works.
    const { data: campaigns, error: campError } = await supabase.from('campaigns').select('id').limit(1);
    if (campError) {
        console.log('Campaigns Error:', campError.message);
    } else {
        console.log('Campaigns exists.');
    }

    // Try 'profiles' again with a more generic select
    const { data: profiles, error: profError } = await supabase.from('profiles').select('*').limit(1);
    if (profError) {
        console.log('Profiles Error:', profError.message);
    } else {
        console.log('Profiles exists.');
    }
}

listAllTables();
