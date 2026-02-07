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

async function resetCampaign() {
    const env = getEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Resetting Campaign ---');
    const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('status', 'sending')
        .limit(1)
        .single();

    if (fetchError) {
        console.error('No sending campaign found.');
        return;
    }

    console.log(`Resetting: ${campaign.name} (${campaign.id})`);

    const { error: updateError } = await supabase
        .from('campaigns')
        .update({ status: 'queued', error_log: null })
        .eq('id', campaign.id);

    if (updateError) {
        console.error('Update Error:', updateError.message);
    } else {
        console.log('Successfully reset to queued.');
    }
}

resetCampaign();
