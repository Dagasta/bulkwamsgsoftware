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

async function checkCampaignMessages() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Checking Campaign Messages ---');
    const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('id, name, user_id, status')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (fetchError) {
        console.error('No campaign found.');
        return;
    }

    console.log(`Campaign: ${campaign.name} (${campaign.id})`);
    console.log(`User ID: ${campaign.user_id}`);
    console.log(`Status: ${campaign.status}`);

    const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('phone, status')
        .eq('campaign_id', campaign.id);

    if (msgError) {
        console.error('Msg Error:', msgError.message);
    } else {
        console.log(`Total Messages: ${messages.length}`);
        messages.forEach(m => {
            console.log(`  - ${m.phone}: ${m.status}`);
        });
    }
}

checkCampaignMessages();
