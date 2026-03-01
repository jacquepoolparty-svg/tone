import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hpiujjvmuhwkvfndmxsl.supabase.co';
const SUPABASE_KEY = '';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || SUPABASE_KEY;
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_KEY;
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Convenience exports (lazy proxies)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) { return (getSupabase() as unknown as Record<string, unknown>)[prop as string]; }
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_t, prop) { return (getSupabaseAdmin() as unknown as Record<string, unknown>)[prop as string]; }
});

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  industry: string;
  platforms: string[];
  brand_dna: BrandDNA;
  created_at: string;
};

export type BrandDNA = {
  voice?: {
    formal_casual: number;
    serious_playful: number;
    corporate_human: number;
    reserved_bold: number;
  };
  wordsToUse?: string[];
  wordsToAvoid?: string[];
  examplePostLove?: string;
  examplePostHate?: string;
  targetAudience?: string;
  visualStyle?: string[];
  brandColours?: string[];
  referenceAccounts?: string[];
};

export type TonePost = {
  id: string;
  workspace_id: string;
  platform: string;
  caption: string;
  media_url?: string;
  scheduled_for?: string;
  posted_at?: string;
  status: 'draft' | 'scheduled' | 'posted' | 'approved';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export type ToneUser = {
  id: string;
  email: string;
  workspace_id: string;
  role: 'owner' | 'member';
  created_at: string;
};

export type ContentPillar = {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  frequency_per_week: number;
  created_at: string;
};
