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

async function checkColumns() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Checking Profiles Columns ---');

    // We try to insert an empty row or just select a single row and see the keys
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
        console.log('Error:', error.message);
        if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.log('Hint: One of the columns requested in the select does not exist.');
        }
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('Table is empty. Cannot determine columns via data.');
    }
}

checkColumns();
