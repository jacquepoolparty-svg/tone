// Run DB migration for TONE
// Usage: node scripts/migrate.mjs

const url = "https://hpiujjvmuhwkvfndmxsl.supabase.co";
const key = "SUPABASE_SERVICE_KEY_PLACEHOLDER";

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(url, key);

async function runSQL(sql) {
  const projectRef = "hpiujjvmuhwkvfndmxsl";
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  console.log(`SQL status ${res.status}:`, text.slice(0, 100));
  return { ok: res.ok, text };
}

// Try creating tables via direct insert (to check if they exist)
async function createTablesViaInsert() {
  console.log("Checking/creating tone_workspaces table...");
  const { error: checkError } = await supabase.from('tone_workspaces').select('id').limit(1);
  
  if (checkError && checkError.message.includes('relation') && checkError.message.includes('does not exist')) {
    console.log("Tables don't exist — need to create via SQL editor");
    console.log("\nPlease run migration.sql in the Supabase dashboard:");
    console.log("https://supabase.com/dashboard/project/hpiujjvmuhwkvfndmxsl/sql\n");
    return false;
  } else if (checkError) {
    console.log("Workspace table check error:", checkError.message);
    return false;
  }
  
  console.log("✓ tone_workspaces exists");
  return true;
}

async function seedData() {
  const WORKSPACE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  
  // Seed workspace
  const { data: existing } = await supabase.from('tone_workspaces').select('id').eq('id', WORKSPACE_ID).single();
  if (!existing) {
    const { error } = await supabase.from('tone_workspaces').insert({
      id: WORKSPACE_ID,
      name: 'Pool Party',
      slug: 'pool-party',
      owner_id: 'jacque',
      industry: 'Creative Agency',
      platforms: ['instagram', 'linkedin', 'tiktok'],
      brand_dna: {
        voice: { formal_casual: 30, serious_playful: 35, corporate_human: 80, reserved_bold: 75 },
        wordsToUse: ['cinematic', 'elevated', 'direct', 'sharp', 'cultural'],
        wordsToAvoid: ['synergy', 'crushing it', 'awesome', 'storytelling', 'journey'],
        examplePostLove: "Run Day started as a Sunday ritual — 3 friends, South Sydney, no plan. Five years later we had 500 people showing up every week.",
        examplePostHate: "So excited to share our amazing storytelling journey! We are crushing it every single day!",
        targetAudience: "Brand founders, CMOs, and creative directors in Australia who want commercially sharp creative work.",
        visualStyle: ['cinematic', 'moody'],
        brandColours: ['#0D0D0D', '#24AD94', '#F5C842'],
        referenceAccounts: ['@acnestudios', '@bottegaveneta', '@nicechapel'],
      },
    });
    if (error) console.error("Workspace seed error:", error.message);
    else console.log("✓ Pool Party workspace seeded");
  } else {
    console.log("✓ Pool Party workspace already exists");
  }

  // Seed pillars
  const { data: pillarCount } = await supabase.from('tone_pillars').select('id').eq('workspace_id', WORKSPACE_ID);
  if (!pillarCount?.length) {
    const pillars = [
      { workspace_id: WORKSPACE_ID, name: 'Client Work', description: "Campaigns, films, and production we've delivered", frequency_per_week: 3 },
      { workspace_id: WORKSPACE_ID, name: 'Behind the Lens', description: 'BTS of shoots, process, craft', frequency_per_week: 2 },
      { workspace_id: WORKSPACE_ID, name: 'Industry POV', description: 'Sharp takes on creative, brand, and culture', frequency_per_week: 2 },
      { workspace_id: WORKSPACE_ID, name: 'South Sydney', description: 'Community, roots, where we come from', frequency_per_week: 1 },
      { workspace_id: WORKSPACE_ID, name: 'Team', description: 'The people behind the work', frequency_per_week: 1 },
    ];
    for (const p of pillars) {
      const { error } = await supabase.from('tone_pillars').insert(p);
      if (error) console.error("Pillar error:", error.message);
    }
    console.log("✓ Pillars seeded");
  } else {
    console.log("✓ Pillars already exist");
  }

  // Seed user
  const { data: existingUser } = await supabase.from('tone_users').select('id').eq('email', 'leo@poolparty.com.au').single();
  if (!existingUser) {
    const { error } = await supabase.from('tone_users').insert({
      email: 'leo@poolparty.com.au',
      password_hash: 'poolparty2026',
      workspace_id: WORKSPACE_ID,
      role: 'owner',
    });
    if (error) console.error("User seed error:", error.message);
    else console.log("✓ Demo user seeded: leo@poolparty.com.au / poolparty2026");
  } else {
    console.log("✓ Demo user already exists");
  }

  // Seed posts
  const { data: postCount } = await supabase.from('tone_posts').select('id').eq('workspace_id', WORKSPACE_ID);
  if (!postCount?.length) {
    const posts = [
      { workspace_id: WORKSPACE_ID, platform: 'instagram', caption: "Run Day started as a Sunday ritual. Three friends. South Sydney. No plan.\n\nFive years later: 500 people showing up every week.\n\nCommunity doesn't need a product. It needs a reason to exist.", scheduled_for: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(), status: 'scheduled', created_by: 'Jacque' },
      { workspace_id: WORKSPACE_ID, platform: 'linkedin', caption: "The brief said \"make it feel premium.\"\n\nOur question back: premium for who?\n\nThat's where the work actually starts. Not in the edit suite. In the strategy room.", scheduled_for: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(), status: 'scheduled', created_by: 'Jacque' },
      { workspace_id: WORKSPACE_ID, platform: 'instagram', caption: "Client came to us with a 60-second brief.\n\nWe gave them a content system. Six films. Twelve social assets. A sonic identity.\n\nThe 60 seconds was the last thing we made.", scheduled_for: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), status: 'draft', created_by: 'Jacque' },
    ];
    for (const p of posts) {
      await supabase.from('tone_posts').insert(p);
    }
    console.log("✓ Sample posts seeded");
  } else {
    console.log("✓ Posts already exist");
  }
}

const tablesExist = await createTablesViaInsert();
if (tablesExist) {
  await seedData();
  console.log("\n✅ Migration complete");
}
