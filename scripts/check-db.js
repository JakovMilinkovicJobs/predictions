// Simple script to check Supabase database connection
const { createClient } = require('@supabase/supabase-js');

// Load environment
const environment = require('../src/environments/environment.ts');

async function checkDatabase() {
  console.log('\n📊 Checking Supabase Database Connection...\n');

  const supabase = createClient(
    environment.environment.supabase.url,
    environment.environment.supabase.anonKey
  );

  try {
    // Check connection by querying competitions
    console.log('✓ Connecting to:', environment.environment.supabase.url);

    const { data: competitions, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .limit(5);

    if (compError) {
      console.error('❌ Error fetching competitions:', compError.message);
      console.log('\n💡 This likely means:');
      console.log('   1. Migrations have not been run yet');
      console.log('   2. Run the SQL files in supabase/migrations/ via Supabase Dashboard');
      console.log('   3. See README_DATABASE.md for detailed instructions\n');
      process.exit(1);
    }

    console.log(`✓ Competitions table exists (${competitions?.length || 0} competitions found)`);
    if (competitions && competitions.length > 0) {
      console.log('  Sample:', competitions[0].name);
    }

    // Check leagues table
    const { error: leaguesError } = await supabase
      .from('leagues')
      .select('count')
      .limit(1);

    if (leaguesError) {
      console.error('❌ Error accessing leagues table:', leaguesError.message);
      process.exit(1);
    }

    console.log('✓ Leagues table accessible');

    // Check profiles table
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError.message);
      process.exit(1);
    }

    console.log('✓ Profiles table accessible');

    // Check matches table
    const { error: matchesError } = await supabase
      .from('matches')
      .select('count')
      .limit(1);

    if (matchesError) {
      console.error('❌ Error accessing matches table:', matchesError.message);
      process.exit(1);
    }

    console.log('✓ Matches table accessible');

    // Check predictions table
    const { error: predictionsError } = await supabase
      .from('predictions')
      .select('count')
      .limit(1);

    if (predictionsError) {
      console.error('❌ Error accessing predictions table:', predictionsError.message);
      process.exit(1);
    }

    console.log('✓ Predictions table accessible');

    console.log('\n✅ All database checks passed!');
    console.log('📝 See README_DATABASE.md for management guide\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. You have run the migrations in supabase/migrations/');
    console.log('   2. Your environment.ts has correct Supabase credentials');
    console.log('   3. Your Supabase project is active\n');
    process.exit(1);
  }
}

checkDatabase();
