require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; 

async function checkSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase URL or Key in .env");
    return;
  }

  console.log(`Pinging Supabase at: ${supabaseUrl}...`);

  try {
    // Pinging the root REST endpoint. It should return API documentation if successful.
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok) {
      console.log("✅ Supabase is up, reachable, and your API key is valid!");
    } else {
      console.error(`❌ Supabase is reachable, but responded with: ${response.status} ${response.statusText}`);
      console.log("   (Note: Standard Supabase keys are usually long JWTs starting with 'eyJ'. Make sure your SUPABASE_ANON_KEY is correct.)");
    }
  } catch (error) {
    console.error("❌ Failed to reach Supabase. Network error:", error.message);
  }
}

checkSupabase();