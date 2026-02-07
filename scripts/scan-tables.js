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

    console.log('--- Scanning for Tables ---');

    // Attempting to query the info schema if possible, or just common names
    const commonNames = ['users', 'profiles', 'accounts', 'user_metadata', 'settings', 'user_profiles'];

    for (const name of commonNames) {
        const { error } = await supabase.from(name).select('id').limit(1);
        if (!error) {
            console.log(`[FOUND] ${name}`);
        } else if (error.code !== 'PGRST116' && error.code !== '42P01') {
            // 42P01 is "undefined_table"
            console.log(`[ERROR ${error.code}] ${name}: ${error.message}`);
        } else {
            console.log(`[MISSING] ${name}`);
        }
    }
}

listAllTables();
