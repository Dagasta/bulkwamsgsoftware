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

async function listTables() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Listing Public Tables ---');
    // Using an arbitrary query to trigger the client and hopefully get meta or just guess
    // Supabase JS doesn't have a direct "list tables" but we can try common ones or use an RPC if exists
    // Alternatively, we can use the 'users' table from auth via service role if it's there

    // Let's try to query 'campaigns' to see if it exists (we know it does from previous steps)
    const { data: campaigns, error: campError } = await supabase.from('campaigns').select('id').limit(1);
    console.log('Campaigns Table:', campError ? 'Missing/Error' : 'Exists');

    // Try 'profiles' again
    const { data: profiles, error: profError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    console.log('Profiles Table Error:', profError ? profError.message : 'None');
    console.log('Profiles Count:', profError ? 'N/A' : profiles);

    // Try 'campaigns' again
    const { data: campaigns, error: campError } = await supabase.from('campaigns').select('count', { count: 'exact', head: true });
    console.log('Campaigns Table Error:', campError ? campError.message : 'None');
}

listTables();
