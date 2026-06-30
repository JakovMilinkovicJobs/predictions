// Copy this file to environment.ts and environment.prod.ts
// Then replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY with your actual values

export const environment = {
  production: false, // Set to true in environment.prod.ts
  supabase: {
    // Get these from: https://supabase.com/dashboard/project/_/settings/api
    url: 'YOUR_SUPABASE_URL',           // Example: https://xxxxx.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY'   // Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  }
};
