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

async function debugSupabase() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('URL:', supabaseUrl);
    console.log('Key Length:', supabaseKey.length);

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Debugging Supabase ---');

    const entities = ['profiles', 'campaigns', 'messages'];

    for (const table of entities) {
        const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`Table [${table}] Error:`, error.message);
        } else {
            console.log(`Table [${table}] Success. Count:`, count);
        }
    }
}

debugSupabase();
