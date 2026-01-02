export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          business_id: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          quote_id: string | null
        }
        Insert: {
          action: string
          business_id: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          quote_id?: string | null
        }
        Update: {
          action?: string
          business_id?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          quote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action: string
          actor_user_id: string
          company_id: string
          created_at: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_user_id: string
          company_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string
          company_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          actions_performed: Json | null
          admin_user_id: string
          id: string
          ip_address: unknown
          session_end: string | null
          session_start: string
          user_agent: string | null
        }
        Insert: {
          actions_performed?: Json | null
          admin_user_id: string
          id?: string
          ip_address?: unknown
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
        }
        Update: {
          actions_performed?: Json | null
          admin_user_id?: string
          id?: string
          ip_address?: unknown
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          permissions: Json
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          org_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_customers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          stripe_customer_id: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          stripe_customer_id: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_events: {
        Row: {
          business_id: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          stripe_customer_id: string | null
          stripe_event_id: string | null
          stripe_event_type: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          stripe_customer_id?: string | null
          stripe_event_id?: string | null
          stripe_event_type?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_event_id?: string | null
          stripe_event_type?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          auto_start_sequence: boolean
          business_days: number[]
          business_hours_enabled: boolean
          business_hours_end: string
          business_hours_start: string
          cancel_at_period_end: boolean | null
          company_color: string | null
          company_logo_url: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          default_sequence_id: string | null
          email: string
          id: string
          industry: string
          name: string
          notify_email_daily_digest: boolean
          notify_email_lost: boolean
          notify_email_won: boolean
          notify_sms_response: boolean
          owner_name: string
          phone: string
          quote_email_message: string | null
          quote_email_subject: string | null
          quote_sms_message: string | null
          quotes_limit: number | null
          send_quote_email: boolean | null
          send_quote_sms: boolean | null
          sequences_limit: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string | null
          subscription_status: string
          timezone: string
          trial_ends_at: string | null
          twilio_phone_number: string | null
          twilio_phone_sid: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          auto_start_sequence?: boolean
          business_days?: number[]
          business_hours_enabled?: boolean
          business_hours_end?: string
          business_hours_start?: string
          cancel_at_period_end?: boolean | null
          company_color?: string | null
          company_logo_url?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          default_sequence_id?: string | null
          email: string
          id?: string
          industry?: string
          name: string
          notify_email_daily_digest?: boolean
          notify_email_lost?: boolean
          notify_email_won?: boolean
          notify_sms_response?: boolean
          owner_name: string
          phone: string
          quote_email_message?: string | null
          quote_email_subject?: string | null
          quote_sms_message?: string | null
          quotes_limit?: number | null
          send_quote_email?: boolean | null
          send_quote_sms?: boolean | null
          sequences_limit?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string
          timezone?: string
          trial_ends_at?: string | null
          twilio_phone_number?: string | null
          twilio_phone_sid?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          auto_start_sequence?: boolean
          business_days?: number[]
          business_hours_enabled?: boolean
          business_hours_end?: string
          business_hours_start?: string
          cancel_at_period_end?: boolean | null
          company_color?: string | null
          company_logo_url?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          default_sequence_id?: string | null
          email?: string
          id?: string
          industry?: string
          name?: string
          notify_email_daily_digest?: boolean
          notify_email_lost?: boolean
          notify_email_won?: boolean
          notify_sms_response?: boolean
          owner_name?: string
          phone?: string
          quote_email_message?: string | null
          quote_email_subject?: string | null
          quote_sms_message?: string | null
          quotes_limit?: number | null
          send_quote_email?: boolean | null
          send_quote_sms?: boolean | null
          sequences_limit?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string
          timezone?: string
          trial_ends_at?: string | null
          twilio_phone_number?: string | null
          twilio_phone_sid?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          calendar_id: string | null
          created_at: string
          id: string
          last_sync: string | null
          provider: string
          refresh_token: string | null
          sync_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string
          id?: string
          last_sync?: string | null
          provider: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string
          id?: string
          last_sync?: string | null
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_subscribers: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          created_at: string
          customer_email: string
          customer_phone: string | null
          delivered_at: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          customer_email: string
          customer_phone?: string | null
          delivered_at?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          customer_email?: string
          customer_phone?: string | null
          delivered_at?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_subscribers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      capture_forms: {
        Row: {
          client_id: string
          consent_template_id: string | null
          created_at: string | null
          form_schema: Json | null
          id: string
          name: string
          niche: string
          status: string
          territory_type: string | null
          territory_value: string | null
        }
        Insert: {
          client_id: string
          consent_template_id?: string | null
          created_at?: string | null
          form_schema?: Json | null
          id?: string
          name: string
          niche: string
          status?: string
          territory_type?: string | null
          territory_value?: string | null
        }
        Update: {
          client_id?: string
          consent_template_id?: string | null
          created_at?: string | null
          form_schema?: Json | null
          id?: string
          name?: string
          niche?: string
          status?: string
          territory_type?: string | null
          territory_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capture_forms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capture_forms_consent_template_id_fkey"
            columns: ["consent_template_id"]
            isOneToOne: false
            referencedRelation: "consent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_preferences: {
        Row: {
          business_hours: Json | null
          client_id: string
          created_at: string | null
          id: string
          lead_supply_mode: string
          min_lead_quality_score: number | null
          niches: string[] | null
          notes: string | null
          plan: string
          shared_max_providers: number | null
        }
        Insert: {
          business_hours?: Json | null
          client_id: string
          created_at?: string | null
          id?: string
          lead_supply_mode?: string
          min_lead_quality_score?: number | null
          niches?: string[] | null
          notes?: string | null
          plan?: string
          shared_max_providers?: number | null
        }
        Update: {
          business_hours?: Json | null
          client_id?: string
          created_at?: string | null
          id?: string
          lead_supply_mode?: string
          min_lead_quality_score?: number | null
          niches?: string[] | null
          notes?: string | null
          plan?: string
          shared_max_providers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_preferences_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_name: string
          created_at: string | null
          delivery_method: string
          email: string
          id: string
          onboarding_complete: boolean | null
          phone: string | null
          primary_contact_name: string | null
          status: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          delivery_method?: string
          email: string
          id?: string
          onboarding_complete?: boolean | null
          phone?: string | null
          primary_contact_name?: string | null
          status?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          delivery_method?: string
          email?: string
          id?: string
          onboarding_complete?: boolean | null
          phone?: string | null
          primary_contact_name?: string | null
          status?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      comms_preferences: {
        Row: {
          allow_email: boolean | null
          allow_push: boolean | null
          allow_sms: boolean | null
          contractor_id: string
          created_at: string
          id: string
          locale: string | null
          org_id: string
          preferred_channel: string | null
          updated_at: string
        }
        Insert: {
          allow_email?: boolean | null
          allow_push?: boolean | null
          allow_sms?: boolean | null
          contractor_id: string
          created_at?: string
          id?: string
          locale?: string | null
          org_id: string
          preferred_channel?: string | null
          updated_at?: string
        }
        Update: {
          allow_email?: boolean | null
          allow_push?: boolean | null
          allow_sms?: boolean | null
          contractor_id?: string
          created_at?: string
          id?: string
          locale?: string | null
          org_id?: string
          preferred_channel?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comms_preferences_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_consent: {
        Row: {
          company_id: string
          consent_date: string | null
          consent_source: string | null
          created_at: string
          email: string | null
          email_marketing: boolean | null
          email_transactional: boolean | null
          id: string
          ip_address: unknown
          phone: string | null
          sms_marketing: boolean | null
          sms_transactional: boolean | null
          unsubscribe_reason: string | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          consent_date?: string | null
          consent_source?: string | null
          created_at?: string
          email?: string | null
          email_marketing?: boolean | null
          email_transactional?: boolean | null
          id?: string
          ip_address?: unknown
          phone?: string | null
          sms_marketing?: boolean | null
          sms_transactional?: boolean | null
          unsubscribe_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          consent_date?: string | null
          consent_source?: string | null
          created_at?: string
          email?: string | null
          email_marketing?: boolean | null
          email_transactional?: boolean | null
          id?: string
          ip_address?: unknown
          phone?: string | null
          sms_marketing?: boolean | null
          sms_transactional?: boolean | null
          unsubscribe_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      communication_metrics: {
        Row: {
          communication_type: string
          company_id: string
          cost_cents: number | null
          created_at: string
          date: string
          id: string
          provider: string
          total_clicked: number | null
          total_delivered: number | null
          total_failed: number | null
          total_opened: number | null
          total_sent: number | null
          total_unsubscribed: number | null
        }
        Insert: {
          communication_type: string
          company_id: string
          cost_cents?: number | null
          created_at?: string
          date: string
          id?: string
          provider: string
          total_clicked?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_opened?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
        }
        Update: {
          communication_type?: string
          company_id?: string
          cost_cents?: number | null
          created_at?: string
          date?: string
          id?: string
          provider?: string
          total_clicked?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_opened?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
        }
        Relationships: []
      }
      communication_settings: {
        Row: {
          brand_color: string | null
          branding_footer_html: string | null
          company_id: string
          created_at: string
          email_from_address: string | null
          email_from_name: string | null
          email_provider: string | null
          id: string
          logo_url: string | null
          marketing_allowed: boolean | null
          quiet_hours_end: number | null
          quiet_hours_start: number | null
          reply_to_email: string | null
          sms_from_number: string | null
          sms_provider: string | null
          test_mode: boolean | null
          updated_at: string
        }
        Insert: {
          brand_color?: string | null
          branding_footer_html?: string | null
          company_id: string
          created_at?: string
          email_from_address?: string | null
          email_from_name?: string | null
          email_provider?: string | null
          id?: string
          logo_url?: string | null
          marketing_allowed?: boolean | null
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          reply_to_email?: string | null
          sms_from_number?: string | null
          sms_provider?: string | null
          test_mode?: boolean | null
          updated_at?: string
        }
        Update: {
          brand_color?: string | null
          branding_footer_html?: string | null
          company_id?: string
          created_at?: string
          email_from_address?: string | null
          email_from_name?: string | null
          email_provider?: string | null
          id?: string
          logo_url?: string | null
          marketing_allowed?: boolean | null
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          reply_to_email?: string | null
          sms_from_number?: string | null
          sms_provider?: string | null
          test_mode?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      config_audit: {
        Row: {
          action: string
          actor_user_id: string
          after: Json | null
          before: Json | null
          company_id: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_user_id: string
          after?: Json | null
          before?: Json | null
          company_id: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_user_id?: string
          after?: Json | null
          before?: Json | null
          company_id?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          channel: string
          client_id: string
          consent_template_id: string | null
          consent_text_snapshot: string
          created_at: string | null
          id: string
          lead_id: string
          proof: Json | null
          status: string
        }
        Insert: {
          channel: string
          client_id: string
          consent_template_id?: string | null
          consent_text_snapshot: string
          created_at?: string | null
          id?: string
          lead_id: string
          proof?: Json | null
          status?: string
        }
        Update: {
          channel?: string
          client_id?: string
          consent_template_id?: string | null
          consent_text_snapshot?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          proof?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_consent_template_id_fkey"
            columns: ["consent_template_id"]
            isOneToOne: false
            referencedRelation: "consent_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_templates: {
        Row: {
          created_at: string | null
          email_disclosure: string | null
          id: string
          name: string
          privacy_url: string | null
          sms_call_disclosure: string
          terms_url: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          email_disclosure?: string | null
          id?: string
          name: string
          privacy_url?: string | null
          sms_call_disclosure: string
          terms_url?: string | null
          version?: string
        }
        Update: {
          created_at?: string | null
          email_disclosure?: string | null
          id?: string
          name?: string
          privacy_url?: string | null
          sms_call_disclosure?: string
          terms_url?: string | null
          version?: string
        }
        Relationships: []
      }
      contractor_messages: {
        Row: {
          channel: string
          created_at: string
          delivered_at: string | null
          error_text: string | null
          external_id: string | null
          id: string
          org_id: string
          payload_json: Json | null
          sent_at: string | null
          status: string
          template_code: string
          to_contractor_id: string
          updated_at: string
        }
        Insert: {
          channel: string
          created_at?: string
          delivered_at?: string | null
          error_text?: string | null
          external_id?: string | null
          id?: string
          org_id: string
          payload_json?: Json | null
          sent_at?: string | null
          status?: string
          template_code: string
          to_contractor_id: string
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          delivered_at?: string | null
          error_text?: string | null
          external_id?: string | null
          id?: string
          org_id?: string
          payload_json?: Json | null
          sent_at?: string | null
          status?: string
          template_code?: string
          to_contractor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_messages_to_contractor_id_fkey"
            columns: ["to_contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          base_rate_type: string
          base_rate_value: number
          created_at: string
          created_by: string | null
          display_name: string
          email: string
          flags_count: number | null
          id: string
          insurance_expiry: string | null
          org_id: string
          payout_account_status: string | null
          phone: string | null
          rating_avg: number | null
          service_zones: string[] | null
          skills: string[] | null
          status: string
          tax_form_status: string | null
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          base_rate_type?: string
          base_rate_value?: number
          created_at?: string
          created_by?: string | null
          display_name: string
          email: string
          flags_count?: number | null
          id?: string
          insurance_expiry?: string | null
          org_id: string
          payout_account_status?: string | null
          phone?: string | null
          rating_avg?: number | null
          service_zones?: string[] | null
          skills?: string[] | null
          status?: string
          tax_form_status?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          base_rate_type?: string
          base_rate_value?: number
          created_at?: string
          created_by?: string | null
          display_name?: string
          email?: string
          flags_count?: number | null
          id?: string
          insurance_expiry?: string | null
          org_id?: string
          payout_account_status?: string | null
          phone?: string | null
          rating_avg?: number | null
          service_zones?: string[] | null
          skills?: string[] | null
          status?: string
          tax_form_status?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      copy_blocks: {
        Row: {
          body_md: string | null
          company_id: string
          created_at: string
          id: string
          key: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body_md?: string | null
          company_id: string
          created_at?: string
          id?: string
          key: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body_md?: string | null
          company_id?: string
          created_at?: string
          id?: string
          key?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crawl_runs: {
        Row: {
          created_at: string | null
          id: string
          leads_extracted: number | null
          log: Json | null
          pages_found: number | null
          ran_at: string | null
          source_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          leads_extracted?: number | null
          log?: Json | null
          pages_found?: number | null
          ran_at?: string | null
          source_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          leads_extracted?: number | null
          log?: Json | null
          pages_found?: number | null
          ran_at?: string | null
          source_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "crawl_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_consent: {
        Row: {
          company_id: string
          created_at: string
          customer_id: string
          email_opt_in: boolean | null
          id: string
          marketing_opt_in: boolean | null
          sms_opt_in: boolean | null
          unsubscribed_reason: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          customer_id: string
          email_opt_in?: boolean | null
          id?: string
          marketing_opt_in?: boolean | null
          sms_opt_in?: boolean | null
          unsubscribed_reason?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_id?: string
          email_opt_in?: boolean | null
          id?: string
          marketing_opt_in?: boolean | null
          sms_opt_in?: boolean | null
          unsubscribed_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_consent_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notifications: {
        Row: {
          created_at: string | null
          customer_email: string
          email_enabled: boolean | null
          id: string
          job_complete_notifications: boolean | null
          job_start_notifications: boolean | null
          payment_notifications: boolean | null
          sms_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          email_enabled?: boolean | null
          id?: string
          job_complete_notifications?: boolean | null
          job_start_notifications?: boolean | null
          payment_notifications?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          email_enabled?: boolean | null
          id?: string
          job_complete_notifications?: boolean | null
          job_start_notifications?: boolean | null
          payment_notifications?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_pages: {
        Row: {
          content: string | null
          created_at: string
          display_order: number | null
          id: string
          is_enabled: boolean | null
          meta_description: string | null
          page_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          meta_description?: string | null
          page_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          meta_description?: string | null
          page_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_payments: {
        Row: {
          amount: number | null
          booking_id: string | null
          cancellation_fee: number | null
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          payment_date: string | null
          refund_amount: number | null
          refund_status: string | null
          service_details: Json | null
          status: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          cancellation_fee?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          payment_date?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          service_details?: Json | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          cancellation_fee?: number | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          payment_date?: string | null
          refund_amount?: number | null
          refund_status?: string | null
          service_details?: Json | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          address_line1: string | null
          city: string | null
          company_id: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          first_name: string | null
          id: string
          last_name: string | null
          preferred_contact_method: string | null
          referral_code: string | null
          referral_credits: number | null
          state: string | null
          total_referrals: number | null
          updated_at: string
          user_id: string
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          city?: string | null
          company_id?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_contact_method?: string | null
          referral_code?: string | null
          referral_credits?: number | null
          state?: string | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          city?: string | null
          company_id?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_contact_method?: string | null
          referral_code?: string | null
          referral_credits?: number | null
          state?: string | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string
          zip?: string | null
        }
        Relationships: []
      }
      customer_referrals: {
        Row: {
          claimed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          referral_code: string
          referred_customer_id: string | null
          referred_email: string | null
          referrer_customer_id: string
          reward_amount: number | null
          reward_claimed: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_code: string
          referred_customer_id?: string | null
          referred_email?: string | null
          referrer_customer_id: string
          reward_amount?: number | null
          reward_claimed?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_code?: string
          referred_customer_id?: string | null
          referred_email?: string | null
          referrer_customer_id?: string
          reward_amount?: number | null
          reward_claimed?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      demo_limits: {
        Row: {
          blocked: boolean | null
          company_id: string
          created_at: string
          free_txn_cap: number | null
          updated_at: string
          used_txn_count: number | null
        }
        Insert: {
          blocked?: boolean | null
          company_id: string
          created_at?: string
          free_txn_cap?: number | null
          updated_at?: string
          used_txn_count?: number | null
        }
        Update: {
          blocked?: boolean | null
          company_id?: string
          created_at?: string
          free_txn_cap?: number | null
          updated_at?: string
          used_txn_count?: number | null
        }
        Relationships: []
      }
      elevated_auth: {
        Row: {
          expires_at: string
          id: string
          issued_at: string
          used: boolean
          user_id: string
        }
        Insert: {
          expires_at?: string
          id?: string
          issued_at?: string
          used?: boolean
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          issued_at?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          company_id: string | null
          created_at: string
          delivered_at: string | null
          email: string
          failed_reason: string | null
          id: string
          max_retries: number | null
          metadata: Json | null
          next_retry_at: string | null
          opened_at: string | null
          provider: string | null
          resend_id: string | null
          retry_count: number | null
          status: string
          template_id: string | null
          type: string
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          company_id?: string | null
          created_at?: string
          delivered_at?: string | null
          email: string
          failed_reason?: string | null
          id?: string
          max_retries?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          opened_at?: string | null
          provider?: string | null
          resend_id?: string | null
          retry_count?: number | null
          status?: string
          template_id?: string | null
          type: string
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          company_id?: string | null
          created_at?: string
          delivered_at?: string | null
          email?: string
          failed_reason?: string | null
          id?: string
          max_retries?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          opened_at?: string | null
          provider?: string | null
          resend_id?: string | null
          retry_count?: number | null
          status?: string
          template_id?: string | null
          type?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          booking_id: string | null
          email_type: string
          id: string
          metadata: Json | null
          recipient_email: string
          resend_id: string | null
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          booking_id?: string | null
          email_type: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          booking_id?: string | null
          email_type?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          resend_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          company_id: string
          created_at: string
          from_email: string
          from_name: string
          id: string
          last_test_at: string | null
          last_test_status: string | null
          provider: string
          smtp_configured: boolean
          updated_at: string
          webhook_configured: boolean
        }
        Insert: {
          company_id: string
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          last_test_at?: string | null
          last_test_status?: string | null
          provider?: string
          smtp_configured?: boolean
          updated_at?: string
          webhook_configured?: boolean
        }
        Update: {
          company_id?: string
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          last_test_at?: string | null
          last_test_status?: string | null
          provider?: string
          smtp_configured?: boolean
          updated_at?: string
          webhook_configured?: boolean
        }
        Relationships: []
      }
      email_unsubscribes: {
        Row: {
          created_at: string
          email: string
          id: string
          type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          type?: string
        }
        Relationships: []
      }
      email_verification_codes: {
        Row: {
          attempts: number
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used_at: string | null
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          used_at?: string | null
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          code: string
          created_at: string
          id: string
          org_id: string | null
          updated_at: string
          value_bool: boolean | null
          value_json: Json | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          org_id?: string | null
          updated_at?: string
          value_bool?: boolean | null
          value_json?: Json | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          org_id?: string | null
          updated_at?: string
          value_bool?: boolean | null
          value_json?: Json | null
        }
        Relationships: []
      }
      frequency_discounts: {
        Row: {
          company_id: string
          created_at: string | null
          discount_percent: number
          frequency: string
          id: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          discount_percent?: number
          frequency: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          discount_percent?: number
          frequency?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gps_check_ins: {
        Row: {
          address: string | null
          booking_id: string
          check_in_type: string
          distance_from_job: number | null
          id: string
          latitude: number
          longitude: number
          metadata: Json | null
          notes: string | null
          staff_id: string
          timestamp: string
        }
        Insert: {
          address?: string | null
          booking_id: string
          check_in_type: string
          distance_from_job?: number | null
          id?: string
          latitude: number
          longitude: number
          metadata?: Json | null
          notes?: string | null
          staff_id: string
          timestamp?: string
        }
        Update: {
          address?: string | null
          booking_id?: string
          check_in_type?: string
          distance_from_job?: number | null
          id?: string
          latitude?: number
          longitude?: number
          metadata?: Json | null
          notes?: string | null
          staff_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      inbound_messages: {
        Row: {
          business_id: string
          content: string
          created_at: string
          external_id: string | null
          from_phone: string
          id: string
          is_read: boolean
          quote_id: string | null
          read_at: string | null
          to_phone: string
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string
          external_id?: string | null
          from_phone: string
          id?: string
          is_read?: boolean
          quote_id?: string | null
          read_at?: string | null
          to_phone: string
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string
          external_id?: string | null
          from_phone?: string
          id?: string
          is_read?: boolean
          quote_id?: string | null
          read_at?: string | null
          to_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbound_messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbound_messages_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          calendar: Json | null
          company_id: string
          created_at: string
          id: string
          payments: Json | null
          stripe_status: string | null
          updated_at: string
        }
        Insert: {
          calendar?: Json | null
          company_id: string
          created_at?: string
          id?: string
          payments?: Json | null
          stripe_status?: string | null
          updated_at?: string
        }
        Update: {
          calendar?: Json | null
          company_id?: string
          created_at?: string
          id?: string
          payments?: Json | null
          stripe_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          id: string
          invited_by_user_id: string
          invited_email: string
          organization_id: string
          role: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invited_by_user_id: string
          invited_email: string
          organization_id: string
          role?: string
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invited_by_user_id?: string
          invited_email?: string
          organization_id?: string
          role?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_assignments: {
        Row: {
          acceptance_at: string | null
          acceptance_status: string
          assigned_at: string
          assigned_by: string
          contractor_id: string
          created_at: string
          id: string
          job_id: string
          org_id: string
          pay_override_type: string | null
          pay_override_value: number | null
          respond_token_id: string | null
          updated_at: string
        }
        Insert: {
          acceptance_at?: string | null
          acceptance_status?: string
          assigned_at?: string
          assigned_by: string
          contractor_id: string
          created_at?: string
          id?: string
          job_id: string
          org_id: string
          pay_override_type?: string | null
          pay_override_value?: number | null
          respond_token_id?: string | null
          updated_at?: string
        }
        Update: {
          acceptance_at?: string | null
          acceptance_status?: string
          assigned_at?: string
          assigned_by?: string
          contractor_id?: string
          created_at?: string
          id?: string
          job_id?: string
          org_id?: string
          pay_override_type?: string | null
          pay_override_value?: number | null
          respond_token_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_respond_token_id_fkey"
            columns: ["respond_token_id"]
            isOneToOne: false
            referencedRelation: "magic_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booking_id: string
          id: string
          image_url: string
          is_approved: boolean | null
          metadata: Json | null
          notes: string | null
          photo_type: string
          staff_id: string | null
          thumbnail_url: string | null
          uploaded_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id: string
          id?: string
          image_url: string
          is_approved?: boolean | null
          metadata?: Json | null
          notes?: string | null
          photo_type: string
          staff_id?: string | null
          thumbnail_url?: string | null
          uploaded_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string
          id?: string
          image_url?: string
          is_approved?: boolean | null
          metadata?: Json | null
          notes?: string | null
          photo_type?: string
          staff_id?: string | null
          thumbnail_url?: string | null
          uploaded_at?: string
        }
        Relationships: []
      }
      job_status_history: {
        Row: {
          booking_id: string
          changed_by: string
          gps_location: Json | null
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          photo_count: number | null
          staff_id: string | null
          timestamp: string
        }
        Insert: {
          booking_id: string
          changed_by: string
          gps_location?: Json | null
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          photo_count?: number | null
          staff_id?: string | null
          timestamp?: string
        }
        Update: {
          booking_id?: string
          changed_by?: string
          gps_location?: Json | null
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          photo_count?: number | null
          staff_id?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      job_verifications: {
        Row: {
          address_verified: string | null
          after_photo_urls: string[] | null
          after_photos: string[] | null
          before_photo_urls: string[] | null
          before_photos: string[] | null
          booking_id: string
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          gps_accuracy: number | null
          gps_coords: Json | null
          id: string
          location_verified: boolean | null
          notes: string | null
          staff_id: string | null
          staff_name: string | null
          updated_at: string
        }
        Insert: {
          address_verified?: string | null
          after_photo_urls?: string[] | null
          after_photos?: string[] | null
          before_photo_urls?: string[] | null
          before_photos?: string[] | null
          booking_id: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          gps_accuracy?: number | null
          gps_coords?: Json | null
          id?: string
          location_verified?: boolean | null
          notes?: string | null
          staff_id?: string | null
          staff_name?: string | null
          updated_at?: string
        }
        Update: {
          address_verified?: string | null
          after_photo_urls?: string[] | null
          after_photos?: string[] | null
          before_photo_urls?: string[] | null
          before_photos?: string[] | null
          booking_id?: string
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          gps_accuracy?: number | null
          gps_coords?: Json | null
          id?: string
          location_verified?: boolean | null
          notes?: string | null
          staff_id?: string | null
          staff_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          client_id: string
          created_at: string
          created_by: string
          id: string
          instructions_text: string | null
          location_json: Json | null
          org_id: string
          price_quote: number | null
          pricing_model: string
          scheduled_end: string
          scheduled_start: string
          service_type: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by: string
          id?: string
          instructions_text?: string | null
          location_json?: Json | null
          org_id: string
          price_quote?: number | null
          pricing_model?: string
          scheduled_end: string
          scheduled_start: string
          service_type: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string
          id?: string
          instructions_text?: string | null
          location_json?: Json | null
          org_id?: string
          price_quote?: number | null
          pricing_model?: string
          scheduled_end?: string
          scheduled_start?: string
          service_type?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      lead_events: {
        Row: {
          actor_role: string | null
          actor_user_id: string | null
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          lead_id: string
        }
        Insert: {
          actor_role?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          lead_id: string
        }
        Update: {
          actor_role?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_submissions: {
        Row: {
          capture_form_id: string
          created_at: string | null
          id: string
          landing_page_url: string | null
          lead_id: string
          raw_payload: Json | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          capture_form_id: string
          created_at?: string | null
          id?: string
          landing_page_url?: string | null
          lead_id: string
          raw_payload?: Json | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          capture_form_id?: string
          created_at?: string | null
          id?: string
          landing_page_url?: string | null
          lead_id?: string
          raw_payload?: Json | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_submissions_capture_form_id_fkey"
            columns: ["capture_form_id"]
            isOneToOne: false
            referencedRelation: "capture_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_submissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget_signal: string | null
          claim_count: number | null
          claimed_at: string | null
          claimed_by_client_id: string | null
          client_outcome: string | null
          client_outcome_value: number | null
          confidence_score: number | null
          contact_channel: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_url: string | null
          contract_type: string | null
          created_at: string | null
          deadline_date: string | null
          delivered_at: string | null
          delivered_to_client_id: string | null
          dispute_notes: string | null
          exclusivity: string | null
          extracted_payload: Json | null
          freshness_days: number | null
          id: string
          invalid_reason: string | null
          lead_origin: string
          lead_type: string
          location_address: string | null
          location_city: string | null
          location_state: string | null
          location_zip: string | null
          niche: string
          outcome_notes: string | null
          posted_date: string | null
          proof_snippet: string | null
          replacement_status: string | null
          scope_summary: string | null
          service_needed: string | null
          source_id: string | null
          source_url: string | null
          status: string
          target_org_name: string | null
          target_org_type: string | null
          territory_type: string | null
          territory_value: string | null
          urgency: string | null
        }
        Insert: {
          budget_signal?: string | null
          claim_count?: number | null
          claimed_at?: string | null
          claimed_by_client_id?: string | null
          client_outcome?: string | null
          client_outcome_value?: number | null
          confidence_score?: number | null
          contact_channel?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_url?: string | null
          contract_type?: string | null
          created_at?: string | null
          deadline_date?: string | null
          delivered_at?: string | null
          delivered_to_client_id?: string | null
          dispute_notes?: string | null
          exclusivity?: string | null
          extracted_payload?: Json | null
          freshness_days?: number | null
          id?: string
          invalid_reason?: string | null
          lead_origin: string
          lead_type: string
          location_address?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          niche: string
          outcome_notes?: string | null
          posted_date?: string | null
          proof_snippet?: string | null
          replacement_status?: string | null
          scope_summary?: string | null
          service_needed?: string | null
          source_id?: string | null
          source_url?: string | null
          status?: string
          target_org_name?: string | null
          target_org_type?: string | null
          territory_type?: string | null
          territory_value?: string | null
          urgency?: string | null
        }
        Update: {
          budget_signal?: string | null
          claim_count?: number | null
          claimed_at?: string | null
          claimed_by_client_id?: string | null
          client_outcome?: string | null
          client_outcome_value?: number | null
          confidence_score?: number | null
          contact_channel?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_url?: string | null
          contract_type?: string | null
          created_at?: string | null
          deadline_date?: string | null
          delivered_at?: string | null
          delivered_to_client_id?: string | null
          dispute_notes?: string | null
          exclusivity?: string | null
          extracted_payload?: Json | null
          freshness_days?: number | null
          id?: string
          invalid_reason?: string | null
          lead_origin?: string
          lead_type?: string
          location_address?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          niche?: string
          outcome_notes?: string | null
          posted_date?: string | null
          proof_snippet?: string | null
          replacement_status?: string | null
          scope_summary?: string | null
          service_needed?: string | null
          source_id?: string | null
          source_url?: string | null
          status?: string
          target_org_name?: string | null
          target_org_type?: string | null
          territory_type?: string | null
          territory_value?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_claimed_by_client_id_fkey"
            columns: ["claimed_by_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_delivered_to_client_id_fkey"
            columns: ["delivered_to_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      magic_tokens: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string
          expires_at: string
          id: string
          org_id: string
          token_hmac: string
          used_at: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id: string
          expires_at: string
          id?: string
          org_id: string
          token_hmac: string
          used_at?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string
          expires_at?: string
          id?: string
          org_id?: string
          token_hmac?: string
          used_at?: string | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          company_id: string
          content: string
          created_at: string
          delay_hours: number | null
          id: string
          name: string
          status: string
          subject: string | null
          template_data: Json | null
          trigger_event: string | null
          type: string
          updated_at: string
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string
          delay_hours?: number | null
          id?: string
          name: string
          status?: string
          subject?: string | null
          template_data?: Json | null
          trigger_event?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string
          delay_hours?: number | null
          id?: string
          name?: string
          status?: string
          subject?: string | null
          template_data?: Json | null
          trigger_event?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_log: {
        Row: {
          created_at: string
          id: string
          meta: Json | null
          provider_message_id: string | null
          queue_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta?: Json | null
          provider_message_id?: string | null
          queue_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          meta?: Json | null
          provider_message_id?: string | null
          queue_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_log_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "message_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      message_logs: {
        Row: {
          bounced_at: string | null
          channel: string
          clicked_at: string | null
          company_id: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          message_queue_id: string
          metadata: Json | null
          opened_at: string | null
          provider_message_id: string | null
          sent_at: string | null
          status: string
          template_key: string
          to_address: string | null
          to_number: string | null
          updated_at: string
        }
        Insert: {
          bounced_at?: string | null
          channel: string
          clicked_at?: string | null
          company_id: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          message_queue_id: string
          metadata?: Json | null
          opened_at?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          template_key: string
          to_address?: string | null
          to_number?: string | null
          updated_at?: string
        }
        Update: {
          bounced_at?: string | null
          channel?: string
          clicked_at?: string | null
          company_id?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          message_queue_id?: string
          metadata?: Json | null
          opened_at?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          template_key?: string
          to_address?: string | null
          to_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_logs_message_queue_id_fkey"
            columns: ["message_queue_id"]
            isOneToOne: false
            referencedRelation: "message_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      message_queue: {
        Row: {
          attempts: number | null
          business_id: string
          channel: string
          content: string
          created_at: string
          error_message: string | null
          external_id: string | null
          from_phone: string
          id: string
          last_attempt_at: string | null
          last_error: string | null
          max_attempts: number | null
          metadata: Json | null
          next_retry_at: string | null
          original_scheduled_for: string | null
          payload: Json | null
          quote_id: string
          scheduled_for: string
          sent_at: string | null
          sequence_id: string | null
          status: string
          step_index: number
          to_address: string | null
          to_phone: string
          updated_at: string
        }
        Insert: {
          attempts?: number | null
          business_id: string
          channel: string
          content: string
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          from_phone: string
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          original_scheduled_for?: string | null
          payload?: Json | null
          quote_id: string
          scheduled_for?: string
          sent_at?: string | null
          sequence_id?: string | null
          status?: string
          step_index?: number
          to_address?: string | null
          to_phone: string
          updated_at?: string
        }
        Update: {
          attempts?: number | null
          business_id?: string
          channel?: string
          content?: string
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          from_phone?: string
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          original_scheduled_for?: string | null
          payload?: Json | null
          quote_id?: string
          scheduled_for?: string
          sent_at?: string | null
          sequence_id?: string | null
          status?: string
          step_index?: number
          to_address?: string | null
          to_phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_queue_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_queue_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_queue_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body_html: string | null
          body_text: string
          channel: string
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          key: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          body_html?: string | null
          body_text: string
          channel: string
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          key: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body_html?: string | null
          body_text?: string
          channel?: string
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          key?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          business_id: string
          channel: string
          content: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          from_address: string
          id: string
          quote_id: string
          scheduled_for: string | null
          sent_at: string | null
          sequence_id: string | null
          status: string
          step_id: string | null
          subject: string | null
          to_address: string
        }
        Insert: {
          business_id: string
          channel: string
          content: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          from_address: string
          id?: string
          quote_id: string
          scheduled_for?: string | null
          sent_at?: string | null
          sequence_id?: string | null
          status?: string
          step_id?: string | null
          subject?: string | null
          to_address: string
        }
        Update: {
          business_id?: string
          channel?: string
          content?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          from_address?: string
          id?: string
          quote_id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          sequence_id?: string | null
          status?: string
          step_id?: string | null
          subject?: string | null
          to_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_data: {
        Row: {
          completed: boolean | null
          created_at: string
          data: Json | null
          id: string
          step: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          data?: Json | null
          id?: string
          step?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          data?: Json | null
          id?: string
          step?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_tasks: {
        Row: {
          completed_at: string | null
          completed_by_user_id: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_required: boolean
          organization_id: string
          task_key: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_required?: boolean
          organization_id: string
          task_key: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_required?: boolean
          organization_id?: string
          task_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          branding: Json | null
          business_profile: Json | null
          channel_connections: Json | null
          client_data: Json | null
          created_at: string
          id: string
          is_launched: boolean | null
          kpi_baselines: Json | null
          launch_settings: Json | null
          organization_id: string
          team_invites: Json | null
          updated_at: string
        }
        Insert: {
          branding?: Json | null
          business_profile?: Json | null
          channel_connections?: Json | null
          client_data?: Json | null
          created_at?: string
          id?: string
          is_launched?: boolean | null
          kpi_baselines?: Json | null
          launch_settings?: Json | null
          organization_id: string
          team_invites?: Json | null
          updated_at?: string
        }
        Update: {
          branding?: Json | null
          business_profile?: Json | null
          channel_connections?: Json | null
          client_data?: Json | null
          created_at?: string
          id?: string
          is_launched?: boolean | null
          kpi_baselines?: Json | null
          launch_settings?: Json | null
          organization_id?: string
          team_invites?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          plan_name: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          plan_name?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          plan_name?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      package_tiers: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_popular: boolean | null
          key: string
          name: string
          price_cents: number
          service_id: string | null
          sort_order: number | null
          strike_price_cents: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_popular?: boolean | null
          key: string
          name: string
          price_cents: number
          service_id?: string | null
          sort_order?: number | null
          strike_price_cents?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_popular?: boolean | null
          key?: string
          name?: string
          price_cents?: number
          service_id?: string | null
          sort_order?: number | null
          strike_price_cents?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      page_media: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          id: string
          media_type: string
          media_url: string
          page_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          media_type: string
          media_url: string
          page_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          media_type?: string
          media_url?: string
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_media_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "customer_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          status: string
          stripe_payment_intent_id: string | null
          tenant_id: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          status: string
          stripe_payment_intent_id?: string | null
          tenant_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          tenant_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          org_id: string
          paid_at: string | null
          payroll_record_id: string
          processor: string
          processor_ref: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          org_id: string
          paid_at?: string | null
          payroll_record_id: string
          processor?: string
          processor_ref?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          org_id?: string
          paid_at?: string | null
          payroll_record_id?: string
          processor?: string
          processor_ref?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_payroll_record_id_fkey"
            columns: ["payroll_record_id"]
            isOneToOne: false
            referencedRelation: "payroll_records"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_periods: {
        Row: {
          created_at: string
          id: string
          org_id: string
          period_end: string
          period_start: string
          status: string
          totals_json: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          period_end: string
          period_start: string
          status?: string
          totals_json?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          period_end?: string
          period_start?: string
          status?: string
          totals_json?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      payroll_records: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bonus: number | null
          contractor_id: string
          created_at: string
          deduction: number | null
          id: string
          job_id: string | null
          memo: string | null
          org_id: string
          pay_calc: number | null
          pay_type: string
          payroll_period_id: string
          rate: number
          status: string
          timesheet_id: string | null
          units: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bonus?: number | null
          contractor_id: string
          created_at?: string
          deduction?: number | null
          id?: string
          job_id?: string | null
          memo?: string | null
          org_id: string
          pay_calc?: number | null
          pay_type: string
          payroll_period_id: string
          rate: number
          status?: string
          timesheet_id?: string | null
          units: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bonus?: number | null
          contractor_id?: string
          created_at?: string
          deduction?: number | null
          id?: string
          job_id?: string | null
          memo?: string | null
          org_id?: string
          pay_calc?: number | null
          pay_type?: string
          payroll_period_id?: string
          rate?: number
          status?: string
          timesheet_id?: string | null
          units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_payroll_period_id_fkey"
            columns: ["payroll_period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_timesheet_id_fkey"
            columns: ["timesheet_id"]
            isOneToOne: false
            referencedRelation: "timesheets"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          business_id: string
          created_at: string
          friendly_name: string | null
          id: string
          mms_enabled: boolean
          phone_number: string
          phone_sid: string
          sms_enabled: boolean
          status: string
          voice_enabled: boolean
        }
        Insert: {
          business_id: string
          created_at?: string
          friendly_name?: string | null
          id?: string
          mms_enabled?: boolean
          phone_number: string
          phone_sid: string
          sms_enabled?: boolean
          status?: string
          voice_enabled?: boolean
        }
        Update: {
          business_id?: string
          created_at?: string
          friendly_name?: string | null
          id?: string
          mms_enabled?: boolean
          phone_number?: string
          phone_sid?: string
          sms_enabled?: boolean
          status?: string
          voice_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_catalog_items: {
        Row: {
          active: boolean
          category: string
          conditions: string | null
          confidence: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          max_price: number | null
          min_price: number | null
          price: number | null
          price_type: string
          service_name: string
          source_document_id: string | null
          tenant_id: string
          unit_label: string | null
          updated_at: string
          vertical: string
        }
        Insert: {
          active?: boolean
          category: string
          conditions?: string | null
          confidence?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          max_price?: number | null
          min_price?: number | null
          price?: number | null
          price_type?: string
          service_name: string
          source_document_id?: string | null
          tenant_id: string
          unit_label?: string | null
          updated_at?: string
          vertical?: string
        }
        Update: {
          active?: boolean
          category?: string
          conditions?: string | null
          confidence?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          max_price?: number | null
          min_price?: number | null
          price?: number | null
          price_type?: string
          service_name?: string
          source_document_id?: string | null
          tenant_id?: string
          unit_label?: string | null
          updated_at?: string
          vertical?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_catalog_items_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "pricing_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_catalog_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_display_settings: {
        Row: {
          disclaimer: string | null
          display_mode: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          disclaimer?: string | null
          display_mode?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          disclaimer?: string | null
          display_mode?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_display_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_documents: {
        Row: {
          ai_confidence_summary: Json | null
          ai_output_json: Json | null
          created_at: string
          error_message: string | null
          extracted_text: string | null
          file_name: string
          file_url: string
          id: string
          mime_type: string | null
          status: string
          tenant_id: string
          updated_at: string
          vertical: string
        }
        Insert: {
          ai_confidence_summary?: Json | null
          ai_output_json?: Json | null
          created_at?: string
          error_message?: string | null
          extracted_text?: string | null
          file_name: string
          file_url: string
          id?: string
          mime_type?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          vertical?: string
        }
        Update: {
          ai_confidence_summary?: Json | null
          ai_output_json?: Json | null
          created_at?: string
          error_message?: string | null
          extracted_text?: string | null
          file_name?: string
          file_url?: string
          id?: string
          mime_type?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          vertical?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_import_events: {
        Row: {
          created_at: string
          detail_json: Json | null
          document_id: string | null
          event_type: string
          id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          detail_json?: Json | null
          document_id?: string | null
          event_type: string
          id?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          detail_json?: Json | null
          document_id?: string | null
          event_type?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_import_events_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "pricing_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_import_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_presets: {
        Row: {
          company_id: string | null
          config: Json
          created_at: string
          id: string
          is_system_preset: boolean | null
          name: string
          pricing_mode: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          config?: Json
          created_at?: string
          id?: string
          is_system_preset?: boolean | null
          name: string
          pricing_mode: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          config?: Json
          created_at?: string
          id?: string
          is_system_preset?: boolean | null
          name?: string
          pricing_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          amount_off_cents: number | null
          code: string
          company_id: string | null
          created_at: string | null
          discount_type: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          max_redemptions: number | null
          percent_off: number | null
          redemptions: number | null
          starts_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount_off_cents?: number | null
          code: string
          company_id?: string | null
          created_at?: string | null
          discount_type?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          percent_off?: number | null
          redemptions?: number | null
          starts_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_off_cents?: number | null
          code?: string
          company_id?: string | null
          created_at?: string | null
          discount_type?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          percent_off?: number | null
          redemptions?: number | null
          starts_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      provisioning_jobs: {
        Row: {
          created_at: string | null
          detail_json: Json | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          detail_json?: Json | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          detail_json?: Json | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provisioning_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          business_id: string
          created_at: string
          current_step_index: number
          customer_email: string | null
          customer_name: string
          customer_phone: string
          description: string | null
          email_sent_at: string | null
          email_status: string | null
          final_job_amount: number | null
          id: string
          last_message_at: string | null
          last_message_direction: string | null
          last_message_preview: string | null
          lost_at: string | null
          lost_reason: string | null
          next_message_at: string | null
          notification_error: string | null
          quote_amount: number
          sequence_completed_at: string | null
          sequence_id: string | null
          sequence_paused_at: string | null
          sequence_started_at: string | null
          service_type: string
          sms_sent_at: string | null
          sms_status: string | null
          status: string
          status_changed_at: string
          unread_count: number | null
          updated_at: string
          won_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          current_step_index?: number
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          description?: string | null
          email_sent_at?: string | null
          email_status?: string | null
          final_job_amount?: number | null
          id?: string
          last_message_at?: string | null
          last_message_direction?: string | null
          last_message_preview?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          next_message_at?: string | null
          notification_error?: string | null
          quote_amount: number
          sequence_completed_at?: string | null
          sequence_id?: string | null
          sequence_paused_at?: string | null
          sequence_started_at?: string | null
          service_type: string
          sms_sent_at?: string | null
          sms_status?: string | null
          status?: string
          status_changed_at?: string
          unread_count?: number | null
          updated_at?: string
          won_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          current_step_index?: number
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          description?: string | null
          email_sent_at?: string | null
          email_status?: string | null
          final_job_amount?: number | null
          id?: string
          last_message_at?: string | null
          last_message_direction?: string | null
          last_message_preview?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          next_message_at?: string | null
          notification_error?: string | null
          quote_amount?: number
          sequence_completed_at?: string | null
          sequence_id?: string | null
          sequence_paused_at?: string | null
          sequence_started_at?: string | null
          service_type?: string
          sms_sent_at?: string | null
          sms_status?: string | null
          status?: string
          status_changed_at?: string
          unread_count?: number | null
          updated_at?: string
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_policies: {
        Row: {
          churn_reactivate_after_days: number | null
          company_id: string
          created_at: string
          discount_percent_by_freq: Json | null
          frequencies: string[] | null
          id: string
          retry_failed_payment_days: number | null
          updated_at: string
        }
        Insert: {
          churn_reactivate_after_days?: number | null
          company_id: string
          created_at?: string
          discount_percent_by_freq?: Json | null
          frequencies?: string[] | null
          id?: string
          retry_failed_payment_days?: number | null
          updated_at?: string
        }
        Update: {
          churn_reactivate_after_days?: number | null
          company_id?: string
          created_at?: string
          discount_percent_by_freq?: Json | null
          frequencies?: string[] | null
          id?: string
          retry_failed_payment_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      saas_addons: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_order: number | null
          id: string
          name: string
          price: number
          service_id: string | null
          tenant_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          name: string
          price?: number
          service_id?: string | null
          tenant_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          name?: string
          price?: number
          service_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_addons_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "saas_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_addons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_super_admin: boolean | null
          role: string | null
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_super_admin?: boolean | null
          role?: string | null
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_super_admin?: boolean | null
          role?: string | null
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_admin_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_booking_events: {
        Row: {
          booking_id: string
          created_at: string | null
          detail_json: Json | null
          event_type: string
          id: string
          status: string | null
          tenant_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          detail_json?: Json | null
          event_type: string
          id?: string
          status?: string | null
          tenant_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          detail_json?: Json | null
          event_type?: string
          id?: string
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "saas_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_booking_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_bookings: {
        Row: {
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          frequency: string | null
          id: string
          notes: string | null
          quoted_price: number | null
          selected_addons_json: Json | null
          service_id: string | null
          sqft: number | null
          status: string | null
          tenant_id: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          quoted_price?: number | null
          selected_addons_json?: Json | null
          service_id?: string | null
          sqft?: number | null
          status?: string | null
          tenant_id: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          quoted_price?: number | null
          selected_addons_json?: Json | null
          service_id?: string | null
          sqft?: number | null
          status?: string | null
          tenant_id?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "saas_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_pricing_rules: {
        Row: {
          created_at: string | null
          id: string
          rules_json: Json
          service_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rules_json?: Json
          service_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rules_json?: Json
          service_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_pricing_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "saas_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_pricing_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_service_areas: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          tenant_id: string
          zip: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          tenant_id: string
          zip: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          tenant_id?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_service_areas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_services: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_tenant_settings: {
        Row: {
          business_name: string
          created_at: string | null
          ghl_inbound_webhook_url: string | null
          ghl_integration_mode: string | null
          ghl_location_id: string | null
          id: string
          logo_url: string | null
          phone: string | null
          pricing_mode: string | null
          primary_color: string | null
          promo_enabled: boolean | null
          promo_text: string | null
          support_email: string | null
          tenant_id: string
          timezone: string | null
        }
        Insert: {
          business_name: string
          created_at?: string | null
          ghl_inbound_webhook_url?: string | null
          ghl_integration_mode?: string | null
          ghl_location_id?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          pricing_mode?: string | null
          primary_color?: string | null
          promo_enabled?: boolean | null
          promo_text?: string | null
          support_email?: string | null
          tenant_id: string
          timezone?: string | null
        }
        Update: {
          business_name?: string
          created_at?: string | null
          ghl_inbound_webhook_url?: string | null
          ghl_integration_mode?: string | null
          ghl_location_id?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          pricing_mode?: string | null
          primary_color?: string | null
          promo_enabled?: boolean | null
          promo_text?: string | null
          support_email?: string | null
          tenant_id?: string
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_tenants: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          status: string
          template_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          status?: string
          template_type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          status?: string
          template_type?: string
        }
        Relationships: []
      }
      sequences: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          steps: Json
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          steps?: Json
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          steps?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequences_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      service_addons: {
        Row: {
          addon_id: string
          service_id: string
        }
        Insert: {
          addon_id: string
          service_id: string
        }
        Update: {
          addon_id?: string
          service_id?: string
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          zipcode: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          zipcode: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          zipcode?: string
        }
        Relationships: []
      }
      service_display_rules: {
        Row: {
          add_ons_config: Json | null
          availability_config: Json | null
          badges: Json | null
          company_id: string
          created_at: string
          form_config: Json | null
          id: string
          payment: Json | null
          pricing_config: Json | null
          pricing_mode: string
          service_id: string
          updated_at: string
          visibility: Json | null
        }
        Insert: {
          add_ons_config?: Json | null
          availability_config?: Json | null
          badges?: Json | null
          company_id: string
          created_at?: string
          form_config?: Json | null
          id?: string
          payment?: Json | null
          pricing_config?: Json | null
          pricing_mode?: string
          service_id: string
          updated_at?: string
          visibility?: Json | null
        }
        Update: {
          add_ons_config?: Json | null
          availability_config?: Json | null
          badges?: Json | null
          company_id?: string
          created_at?: string
          form_config?: Json | null
          id?: string
          payment?: Json | null
          pricing_config?: Json | null
          pricing_mode?: string
          service_id?: string
          updated_at?: string
          visibility?: Json | null
        }
        Relationships: []
      }
      service_snapshots: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          service_id: string
          snapshot: Json
          version: number
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          service_id: string
          snapshot: Json
          version: number
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          service_id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: []
      }
      service_templates: {
        Row: {
          adders: Json | null
          base_price: number | null
          category: string | null
          created_at: string | null
          description: string | null
          estimated_duration_hours: number | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          name: string
          pricing_mode: string
          suggested_addons: Json | null
          tiers: Json | null
        }
        Insert: {
          adders?: Json | null
          base_price?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          pricing_mode?: string
          suggested_addons?: Json | null
          tiers?: Json | null
        }
        Update: {
          adders?: Json | null
          base_price?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          pricing_mode?: string
          suggested_addons?: Json | null
          tiers?: Json | null
        }
        Relationships: []
      }
      service_tiers: {
        Row: {
          created_at: string | null
          display_order: number | null
          duration_delta_minutes: number
          id: string
          label: string
          price_delta_cents: number
          service_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          duration_delta_minutes?: number
          id?: string
          label: string
          price_delta_cents: number
          service_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          duration_delta_minutes?: number
          id?: string
          label?: string
          price_delta_cents?: number
          service_id?: string
        }
        Relationships: []
      }
      short_links: {
        Row: {
          click_count: number | null
          company_id: string
          created_at: string
          id: string
          slug: string
          target_url: string
        }
        Insert: {
          click_count?: number | null
          company_id: string
          created_at?: string
          id?: string
          slug: string
          target_url: string
        }
        Update: {
          click_count?: number | null
          company_id?: string
          created_at?: string
          id?: string
          slug?: string
          target_url?: string
        }
        Relationships: []
      }
      shortlinks: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          org_id: string
          slug: string
          url: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          org_id: string
          slug: string
          url: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          org_id?: string
          slug?: string
          url?: string
          used_at?: string | null
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          campaign_id: string | null
          company_id: string | null
          created_at: string
          delivered_at: string | null
          failed_reason: string | null
          id: string
          max_retries: number | null
          message: string
          metadata: Json | null
          next_retry_at: string | null
          phone_number: string
          provider: string | null
          provider_id: string | null
          retry_count: number | null
          status: string
          template_id: string | null
          type: string
        }
        Insert: {
          campaign_id?: string | null
          company_id?: string | null
          created_at?: string
          delivered_at?: string | null
          failed_reason?: string | null
          id?: string
          max_retries?: number | null
          message: string
          metadata?: Json | null
          next_retry_at?: string | null
          phone_number: string
          provider?: string | null
          provider_id?: string | null
          retry_count?: number | null
          status?: string
          template_id?: string | null
          type?: string
        }
        Update: {
          campaign_id?: string | null
          company_id?: string | null
          created_at?: string
          delivered_at?: string | null
          failed_reason?: string | null
          id?: string
          max_retries?: number | null
          message?: string
          metadata?: Json | null
          next_retry_at?: string | null
          phone_number?: string
          provider?: string | null
          provider_id?: string | null
          retry_count?: number | null
          status?: string
          template_id?: string | null
          type?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          base_url: string
          crawl_frequency: string
          created_at: string | null
          id: string
          niche: string
          notes: string | null
          source_type: string
          status: string
        }
        Insert: {
          base_url: string
          crawl_frequency?: string
          created_at?: string | null
          id?: string
          niche: string
          notes?: string | null
          source_type?: string
          status?: string
        }
        Update: {
          base_url?: string
          crawl_frequency?: string
          created_at?: string | null
          id?: string
          niche?: string
          notes?: string | null
          source_type?: string
          status?: string
        }
        Relationships: []
      }
      staff_applications: {
        Row: {
          address: string | null
          application_date: string
          availability: string | null
          business_owner_id: string
          created_at: string
          email: string
          experience: string | null
          full_name: string
          id: string
          phone: string
          reference_contacts: string | null
          status: string | null
          transportation: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          application_date?: string
          availability?: string | null
          business_owner_id: string
          created_at?: string
          email: string
          experience?: string | null
          full_name: string
          id?: string
          phone: string
          reference_contacts?: string | null
          status?: string | null
          transportation?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          application_date?: string
          availability?: string | null
          business_owner_id?: string
          created_at?: string
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          phone?: string
          reference_contacts?: string | null
          status?: string | null
          transportation?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staff_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          staff_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          staff_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          staff_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_time_off: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          reason: string | null
          staff_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          reason?: string | null
          staff_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          reason?: string | null
          staff_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_portal_tokens: {
        Row: {
          company_id: string
          created_at: string
          expires_at: string
          id: string
          sub_id: string
          token: string
          used: boolean | null
        }
        Insert: {
          company_id: string
          created_at?: string
          expires_at: string
          id?: string
          sub_id: string
          token: string
          used?: boolean | null
        }
        Update: {
          company_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          sub_id?: string
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      subcontractor_availability: {
        Row: {
          available: boolean
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          max_jobs_per_day: number | null
          start_time: string
          subcontractor_id: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          max_jobs_per_day?: number | null
          start_time: string
          subcontractor_id: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          max_jobs_per_day?: number | null
          start_time?: string
          subcontractor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcontractor_metrics: {
        Row: {
          acceptance_rate: number | null
          avg_duration_minutes: number | null
          avg_rating: number | null
          created_at: string
          id: string
          jobs_completed: number | null
          jobs_offered: number | null
          on_time_rate: number | null
          period_end: string
          period_start: string
          subcontractor_id: string
          total_earnings_cents: number | null
          updated_at: string
        }
        Insert: {
          acceptance_rate?: number | null
          avg_duration_minutes?: number | null
          avg_rating?: number | null
          created_at?: string
          id?: string
          jobs_completed?: number | null
          jobs_offered?: number | null
          on_time_rate?: number | null
          period_end: string
          period_start: string
          subcontractor_id: string
          total_earnings_cents?: number | null
          updated_at?: string
        }
        Update: {
          acceptance_rate?: number | null
          avg_duration_minutes?: number | null
          avg_rating?: number | null
          created_at?: string
          id?: string
          jobs_completed?: number | null
          jobs_offered?: number | null
          on_time_rate?: number | null
          period_end?: string
          period_start?: string
          subcontractor_id?: string
          total_earnings_cents?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subcontractor_service_areas: {
        Row: {
          created_at: string
          id: string
          subcontractor_id: string
          zip_code: string
        }
        Insert: {
          created_at?: string
          id?: string
          subcontractor_id: string
          zip_code: string
        }
        Update: {
          created_at?: string
          id?: string
          subcontractor_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      subcontractor_timeoff: {
        Row: {
          created_at: string
          end_date: string
          id: string
          notes: string | null
          reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          subcontractor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          subcontractor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          subcontractor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_automations: number | null
          max_bookings: number | null
          max_team_members: number | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          stripe_price_id: string | null
          stripe_yearly_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_automations?: number | null
          max_bookings?: number | null
          max_team_members?: number | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          stripe_price_id?: string | null
          stripe_yearly_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_automations?: number | null
          max_bookings?: number | null
          max_team_members?: number | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          stripe_price_id?: string | null
          stripe_yearly_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          plan: string | null
          status: string | null
          stripe_subscription_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          member_id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      territories: {
        Row: {
          created_at: string | null
          exclusivity: string
          id: string
          max_shared_clients: number | null
          niche: string
          status: string
          zip_code: string
        }
        Insert: {
          created_at?: string | null
          exclusivity?: string
          id?: string
          max_shared_clients?: number | null
          niche: string
          status?: string
          zip_code: string
        }
        Update: {
          created_at?: string | null
          exclusivity?: string
          id?: string
          max_shared_clients?: number | null
          niche?: string
          status?: string
          zip_code?: string
        }
        Relationships: []
      }
      territory_assignments: {
        Row: {
          assignment_type: string
          client_id: string
          created_at: string | null
          id: string
          niche: string
          status: string
          territory_id: string
          zip_code: string
        }
        Insert: {
          assignment_type?: string
          client_id: string
          created_at?: string | null
          id?: string
          niche: string
          status?: string
          territory_id: string
          zip_code: string
        }
        Update: {
          assignment_type?: string
          client_id?: string
          created_at?: string | null
          id?: string
          niche?: string
          status?: string
          territory_id?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "territory_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territory_assignments_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          company_id: string
          created_at: string | null
          customer_name: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          rating: number
          service_type: string | null
          text: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          customer_name: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating: number
          service_type?: string | null
          text: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          customer_name?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number
          service_type?: string | null
          text?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          available: boolean | null
          buffer_time_minutes: number | null
          created_at: string
          date: string
          end_time: string
          id: string
          max_bookings_per_slot: number | null
          service_id: string | null
          slot_duration_minutes: number | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: boolean | null
          buffer_time_minutes?: number | null
          created_at?: string
          date: string
          end_time: string
          id?: string
          max_bookings_per_slot?: number | null
          service_id?: string | null
          slot_duration_minutes?: number | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: boolean | null
          buffer_time_minutes?: number | null
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          max_bookings_per_slot?: number | null
          service_id?: string | null
          slot_duration_minutes?: number | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      timesheets: {
        Row: {
          break_minutes: number | null
          contractor_id: string
          created_at: string
          end_time: string
          evidence_urls: string[] | null
          hours_calc: number | null
          id: string
          job_id: string
          notes_text: string | null
          org_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          break_minutes?: number | null
          contractor_id: string
          created_at?: string
          end_time: string
          evidence_urls?: string[] | null
          hours_calc?: number | null
          id?: string
          job_id: string
          notes_text?: string | null
          org_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          break_minutes?: number | null
          contractor_id?: string
          created_at?: string
          end_time?: string
          evidence_urls?: string[] | null
          hours_calc?: number | null
          id?: string
          job_id?: string
          notes_text?: string | null
          org_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "training_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      training_lessons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          module_id: string
          order_index: number
          resource_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          module_id: string
          order_index?: number
          resource_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          module_id?: string
          order_index?: number
          resource_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          role_target: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          role_target?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          role_target?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_cents: number
          booking_id: string | null
          company_id: string
          created_at: string
          id: string
          type: string
        }
        Insert: {
          amount_cents: number
          booking_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          type: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          type?: string
        }
        Relationships: []
      }
      uptime_probes: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          probed_at: string
          response_time_ms: number
          status: string
          subdomain: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          probed_at?: string
          response_time_ms: number
          status: string
          subdomain: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          probed_at?: string
          response_time_ms?: number
          status?: string
          subdomain?: string
        }
        Relationships: []
      }
      user_active_org: {
        Row: {
          active_org_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_org_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_org_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          ip_masked: string | null
          last_active_at: string
          revoked: boolean
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          ip_masked?: string | null
          last_active_at?: string
          revoked?: boolean
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          ip_masked?: string | null
          last_active_at?: string
          revoked?: boolean
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: { Args: { p_token: string }; Returns: string }
      adjust_to_business_hours: {
        Args: { p_business_id: string; p_scheduled_time: string }
        Returns: string
      }
      advance_to_next_step: { Args: { p_quote_id: string }; Returns: undefined }
      calculate_scheduled_time: {
        Args: { base_time: string; channel?: string; company_id: string }
        Returns: string
      }
      calculate_service_price: {
        Args: {
          p_addon_ids?: string[]
          p_frequency?: string
          p_promo_code?: string
          p_service_id: string
          p_tier_id?: string
        }
        Returns: Json
      }
      calculate_subcontractor_metrics: {
        Args: {
          p_period_end: string
          p_period_start: string
          p_subcontractor_id: string
        }
        Returns: undefined
      }
      can_use_premium: { Args: { p_company_id: string }; Returns: boolean }
      cleanup_expired_auth: { Args: never; Returns: undefined }
      consume_magic_token: { Args: { p_token_hmac: string }; Returns: Json }
      create_booking_public: {
        Args: {
          p_add_ons?: Json
          p_address_line1?: string
          p_booking_date: string
          p_city?: string
          p_client_email: string
          p_client_name: string
          p_client_phone?: string
          p_company_slug: string
          p_duration_minutes?: number
          p_marketing_opt_in?: boolean
          p_notes?: string
          p_postal_code?: string
          p_pricing_meta?: Json
          p_service_id: string
          p_source?: string
          p_start_time: string
          p_state?: string
          p_utm?: Json
        }
        Returns: string
      }
      create_default_sequence: {
        Args: { p_business_id: string }
        Returns: string
      }
      create_organization: { Args: { org_name: string }; Returns: string }
      create_service_from_template: {
        Args: {
          p_company_id: string
          p_service_name?: string
          p_template_id: string
        }
        Returns: string
      }
      create_service_snapshot: {
        Args: { p_service_id: string }
        Returns: string
      }
      enqueue_message: {
        Args: {
          p_channel: string
          p_company_id: string
          p_customer_id?: string
          p_payload?: Json
          p_scheduled_for?: string
          p_template_key: string
          p_to_address?: string
          p_to_number?: string
        }
        Returns: string
      }
      generate_magic_token: {
        Args: {
          p_action: string
          p_entity: string
          p_entity_id: string
          p_expires_hours?: number
          p_org_id: string
        }
        Returns: string
      }
      generate_referral_code: {
        Args: { customer_email: string }
        Returns: string
      }
      generate_unique_slug: { Args: { desired_slug: string }; Returns: string }
      get_active_org: { Args: never; Returns: string }
      get_company_billing_state: {
        Args: { p_company_id: string }
        Returns: {
          active: boolean
          days_left: number
          in_trial: boolean
          status: string
        }[]
      }
      get_company_booking_config: {
        Args: { p_company_id: string }
        Returns: {
          draft: Json
          published: Json
          published_at: string
        }[]
      }
      get_company_stripe_status: {
        Args: { p_company_id: string }
        Returns: {
          account_id: string
          connected: boolean
          status: string
        }[]
      }
      get_merged_booking_config: {
        Args: { p_company_id: string }
        Returns: Json
      }
      get_user_client_id: { Args: never; Returns: string }
      get_user_company_id: { Args: never; Returns: string }
      get_user_plan: {
        Args: { user_uuid: string }
        Returns: {
          current_period_end: string
          features: Json
          max_automations: number
          max_bookings: number
          max_team_members: number
          plan_name: string
          status: string
        }[]
      }
      get_user_subscription: {
        Args: never
        Returns: {
          cancel_at_period_end: boolean
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_saas_super_admin: { Args: never; Returns: boolean }
      is_saas_tenant_admin: { Args: { p_tenant_id: string }; Returns: boolean }
      is_superadmin_user: { Args: never; Returns: boolean }
      log_activity: {
        Args: {
          p_action: string
          p_business_id: string
          p_description: string
          p_metadata?: Json
          p_quote_id?: string
        }
        Returns: string
      }
      mark_conversation_read: {
        Args: { p_quote_id: string }
        Returns: undefined
      }
      publish_booking_config: { Args: { p_company_id: string }; Returns: Json }
      replace_merge_fields: {
        Args: { p_content: string; p_quote_id: string }
        Returns: string
      }
      schedule_next_message: { Args: { p_quote_id: string }; Returns: string }
      schedule_trial_reminders: { Args: never; Returns: undefined }
      seed_onboarding_tasks: { Args: { org_id: string }; Returns: undefined }
      set_active_org: { Args: { p_org: string }; Returns: undefined }
      simulate_plan: { Args: { plan_name: string }; Returns: Json }
      simulate_user_plan: { Args: { plan_name: string }; Returns: Json }
      test_email_configuration: {
        Args: { p_company_id: string; p_test_email: string }
        Returns: Json
      }
      user_in_company: { Args: { _company_id: string }; Returns: boolean }
      validate_subscription_access: {
        Args: { subscription_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "superadmin" | "admin" | "moderator" | "support"
      app_role: "admin" | "owner" | "user" | "subcontractor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["superadmin", "admin", "moderator", "support"],
      app_role: ["admin", "owner", "user", "subcontractor"],
    },
  },
} as const
