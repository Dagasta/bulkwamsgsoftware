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

async function checkCampaignCounts() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Checking Campaign Counts ---');
    const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('id, name, total_count, sent_count, status')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Campaign: ${campaign.name}`);
    console.log(`Total Count: ${campaign.total_count}`);
    console.log(`Sent Count: ${campaign.sent_count}`);
    console.log(`Status: ${campaign.status}`);

    const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaign.id);

    console.log(`Actual Messages in DB: ${count}`);
}

checkCampaignCounts();
