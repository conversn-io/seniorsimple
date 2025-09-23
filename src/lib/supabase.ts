import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a mock client if environment variables are not set
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export interface Database {
  public: {
    Tables: {
      newsletter_signups?: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events?: {
        Row: {
          id: string
          event_name: string
          event_category: string
          event_label: string
          user_id: string
          session_id: string
          page_url: string | null
          user_agent: string | null
          ip_address: string | null
          properties: any
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          event_category: string
          event_label: string
          user_id: string
          session_id: string
          page_url?: string | null
          user_agent?: string | null
          ip_address?: string | null
          properties?: any
          created_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          event_category?: string
          event_label?: string
          user_id?: string
          session_id?: string
          page_url?: string | null
          user_agent?: string | null
          ip_address?: string | null
          properties?: any
          created_at?: string
        }
      }
    }
  }
}
