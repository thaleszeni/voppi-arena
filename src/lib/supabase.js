import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('❌ Supabase credentials missing! Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
} else {
  if (typeof window !== 'undefined') {
    console.log('✅ Supabase initialized with URL:', supabaseUrl.substring(0, 10) + '...');
  }
}

// Only initialize if we have the credentials to avoid crashing during build
let supabaseClient;
try {
    ?createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    detectSessionInUrl: true
  }
})
    : null;
} catch (e) {
  console.error('❌ Error creating Supabase client:', e);
}

export const supabase = supabaseClient || {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    getSession: async () => ({ data: { session: null } }),
    getUser: async () => ({ data: { user: null } }),
    signInWithPassword: async () => ({ error: { message: 'Supabase credentials missing' } }),
    signUp: async () => ({ error: { message: 'Supabase credentials missing' } }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => ({ limit: async () => ({ data: [], error: null }) }),
      }),
      single: async () => ({ data: null, error: null }),
    }),
    insert: async () => ({ data: null, error: null }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      })
    }),
  }),
};

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

// Helper function to get user profile
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
  return data;
}

// Helper function to update user profile
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
  return data;
}
