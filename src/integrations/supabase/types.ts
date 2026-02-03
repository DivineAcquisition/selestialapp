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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          business_id: string
          created_at: string | null
          description: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          business_id: string
          created_at?: string | null
          description?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          business_id?: string
          created_at?: string | null
          description?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompt_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          is_active: boolean | null
          name: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          is_active?: boolean | null
          name: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          is_active?: boolean | null
          name?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          auto_summarize_enabled: boolean | null
          business_context: string | null
          business_id: string
          created_at: string | null
          custom_instructions: string | null
          emoji_usage: string | null
          formality_level: number | null
          id: string
          include_pricing: boolean | null
          last_reset_at: string | null
          monthly_suggestion_limit: number | null
          response_length: string | null
          sentiment_analysis_enabled: boolean | null
          smart_replies_enabled: boolean | null
          suggest_upsells: boolean | null
          suggestions_used_this_month: number | null
          tokens_used_month: number | null
          tokens_used_today: number | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          auto_summarize_enabled?: boolean | null
          business_context?: string | null
          business_id: string
          created_at?: string | null
          custom_instructions?: string | null
          emoji_usage?: string | null
          formality_level?: number | null
          id?: string
          include_pricing?: boolean | null
          last_reset_at?: string | null
          monthly_suggestion_limit?: number | null
          response_length?: string | null
          sentiment_analysis_enabled?: boolean | null
          smart_replies_enabled?: boolean | null
          suggest_upsells?: boolean | null
          suggestions_used_this_month?: number | null
          tokens_used_month?: number | null
          tokens_used_today?: number | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_summarize_enabled?: boolean | null
          business_context?: string | null
          business_id?: string
          created_at?: string | null
          custom_instructions?: string | null
          emoji_usage?: string | null
          formality_level?: number | null
          id?: string
          include_pricing?: boolean | null
          last_reset_at?: string | null
          monthly_suggestion_limit?: number | null
          response_length?: string | null
          sentiment_analysis_enabled?: boolean | null
          smart_replies_enabled?: boolean | null
          suggest_upsells?: boolean | null
          suggestions_used_this_month?: number | null
          tokens_used_month?: number | null
          tokens_used_today?: number | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          business_id: string
          content: string
          created_at: string | null
          edited_content: string | null
          id: string
          quote_id: string | null
          suggestion_type: string
          tokens_used: number | null
          was_edited: boolean | null
          was_used: boolean | null
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string | null
          edited_content?: string | null
          id?: string
          quote_id?: string | null
          suggestion_type: string
          tokens_used?: number | null
          was_edited?: boolean | null
          was_used?: boolean | null
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string | null
          edited_content?: string | null
          id?: string
          quote_id?: string | null
          suggestion_type?: string
          tokens_used?: number | null
          was_edited?: boolean | null
          was_used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_events: {
        Row: {
          business_id: string | null
          created_at: string | null
          data: Json
          event_type: string
          id: string
          processed: boolean | null
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          data: Json
          event_type: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          data?: Json
          event_type?: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id?: string
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
      business_metrics: {
        Row: {
          avg_job_value: number | null
          avg_response_time_minutes: number | null
          avg_review_rating: number | null
          business_id: string
          churn_rate: number | null
          conversion_rate: number | null
          created_at: string | null
          customer_retention_rate: number | null
          id: string
          messages_delivered: number | null
          messages_failed: number | null
          messages_received: number | null
          messages_sent: number | null
          metric_date: string
          new_customers: number | null
          period_end: string | null
          period_start: string | null
          period_type: string | null
          quote_win_rate: number | null
          quotes_created: number | null
          quotes_expired: number | null
          quotes_lost: number | null
          quotes_won: number | null
          recurring_revenue: number | null
          repeat_customers: number | null
          response_rate: number | null
          revenue_quoted: number | null
          revenue_won: number | null
          reviews_received: number | null
          total_active_customers: number | null
          total_revenue: number | null
        }
        Insert: {
          avg_job_value?: number | null
          avg_response_time_minutes?: number | null
          avg_review_rating?: number | null
          business_id: string
          churn_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          customer_retention_rate?: number | null
          id?: string
          messages_delivered?: number | null
          messages_failed?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          metric_date: string
          new_customers?: number | null
          period_end?: string | null
          period_start?: string | null
          period_type?: string | null
          quote_win_rate?: number | null
          quotes_created?: number | null
          quotes_expired?: number | null
          quotes_lost?: number | null
          quotes_won?: number | null
          recurring_revenue?: number | null
          repeat_customers?: number | null
          response_rate?: number | null
          revenue_quoted?: number | null
          revenue_won?: number | null
          reviews_received?: number | null
          total_active_customers?: number | null
          total_revenue?: number | null
        }
        Update: {
          avg_job_value?: number | null
          avg_response_time_minutes?: number | null
          avg_review_rating?: number | null
          business_id?: string
          churn_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          customer_retention_rate?: number | null
          id?: string
          messages_delivered?: number | null
          messages_failed?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          metric_date?: string
          new_customers?: number | null
          period_end?: string | null
          period_start?: string | null
          period_type?: string | null
          quote_win_rate?: number | null
          quotes_created?: number | null
          quotes_expired?: number | null
          quotes_lost?: number | null
          quotes_won?: number | null
          recurring_revenue?: number | null
          repeat_customers?: number | null
          response_rate?: number | null
          revenue_quoted?: number | null
          revenue_won?: number | null
          reviews_received?: number | null
          total_active_customers?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          business_name: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          created_at: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_step: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_name?: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_name?: string | null
          business_type?: Database["public"]["Enums"]["business_type"]
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string | null
          auto_reply_enabled: boolean | null
          auto_send_payment_link: boolean | null
          business_hours: Json | null
          cancel_at_period_end: boolean | null
          city: string | null
          company_color: string | null
          company_logo_url: string | null
          created_at: string | null
          current_period_end: string | null
          default_follow_up_days: number | null
          email: string | null
          google_review_link: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          name: string
          notification_email: string | null
          notification_phone: string | null
          notify_new_message: boolean | null
          notify_new_quote: boolean | null
          notify_quote_lost: boolean | null
          notify_quote_won: boolean | null
          owner_name: string | null
          phone: string | null
          quote_email_message: string | null
          quote_email_subject: string | null
          quote_sms_message: string | null
          quotes_limit: number | null
          review_request_enabled: boolean | null
          send_quote_email: boolean | null
          send_quote_sms: boolean | null
          sequences_limit: number | null
          state: string | null
          stripe_connect_account_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          timezone: string | null
          trial_ends_at: string | null
          twilio_account_sid: string | null
          twilio_auth_token: string | null
          twilio_phone_number: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          auto_reply_enabled?: boolean | null
          auto_send_payment_link?: boolean | null
          business_hours?: Json | null
          cancel_at_period_end?: boolean | null
          city?: string | null
          company_color?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          current_period_end?: string | null
          default_follow_up_days?: number | null
          email?: string | null
          google_review_link?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          name: string
          notification_email?: string | null
          notification_phone?: string | null
          notify_new_message?: boolean | null
          notify_new_quote?: boolean | null
          notify_quote_lost?: boolean | null
          notify_quote_won?: boolean | null
          owner_name?: string | null
          phone?: string | null
          quote_email_message?: string | null
          quote_email_subject?: string | null
          quote_sms_message?: string | null
          quotes_limit?: number | null
          review_request_enabled?: boolean | null
          send_quote_email?: boolean | null
          send_quote_sms?: boolean | null
          sequences_limit?: number | null
          state?: string | null
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          timezone?: string | null
          trial_ends_at?: string | null
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          twilio_phone_number?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          auto_reply_enabled?: boolean | null
          auto_send_payment_link?: boolean | null
          business_hours?: Json | null
          cancel_at_period_end?: boolean | null
          city?: string | null
          company_color?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          current_period_end?: string | null
          default_follow_up_days?: number | null
          email?: string | null
          google_review_link?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          name?: string
          notification_email?: string | null
          notification_phone?: string | null
          notify_new_message?: boolean | null
          notify_new_quote?: boolean | null
          notify_quote_lost?: boolean | null
          notify_quote_won?: boolean | null
          owner_name?: string | null
          phone?: string | null
          quote_email_message?: string | null
          quote_email_subject?: string | null
          quote_sms_message?: string | null
          quotes_limit?: number | null
          review_request_enabled?: boolean | null
          send_quote_email?: boolean | null
          send_quote_sms?: boolean | null
          sequences_limit?: number | null
          state?: string | null
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          timezone?: string | null
          trial_ends_at?: string | null
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          twilio_phone_number?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          created_at: string | null
          customer_id: string
          delivered_at: string | null
          error_message: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          created_at?: string | null
          customer_id: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string | null
          customer_id?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "seasonal_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_templates: {
        Row: {
          avg_click_rate: number | null
          avg_conversion_rate: number | null
          avg_open_rate: number | null
          body: string | null
          campaign_type: string | null
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          description: string | null
          email_subject_template: string | null
          email_template: string | null
          holiday: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          industry_slug: string | null
          is_active: boolean | null
          is_featured: boolean | null
          month: number | null
          name: string
          preview_text: string | null
          recommended_month: number | null
          recommended_season: string | null
          season: string | null
          sms_template: string | null
          subject: string | null
          tags: string[] | null
          target_customer_types: string[] | null
          usage_count: number | null
        }
        Insert: {
          avg_click_rate?: number | null
          avg_conversion_rate?: number | null
          avg_open_rate?: number | null
          body?: string | null
          campaign_type?: string | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          email_subject_template?: string | null
          email_template?: string | null
          holiday?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          industry_slug?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          month?: number | null
          name: string
          preview_text?: string | null
          recommended_month?: number | null
          recommended_season?: string | null
          season?: string | null
          sms_template?: string | null
          subject?: string | null
          tags?: string[] | null
          target_customer_types?: string[] | null
          usage_count?: number | null
        }
        Update: {
          avg_click_rate?: number | null
          avg_conversion_rate?: number | null
          avg_open_rate?: number | null
          body?: string | null
          campaign_type?: string | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          email_subject_template?: string | null
          email_template?: string | null
          holiday?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          industry_slug?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          month?: number | null
          name?: string
          preview_text?: string | null
          recommended_month?: number | null
          recommended_season?: string | null
          season?: string | null
          sms_template?: string | null
          subject?: string | null
          tags?: string[] | null
          target_customer_types?: string[] | null
          usage_count?: number | null
        }
        Relationships: []
      }
      check_in_responses: {
        Row: {
          additional_responses: Json | null
          biggest_challenge: string | null
          biggest_win: string | null
          calls_attended: string | null
          client_id: string
          energy_level: number | null
          help_needed: string | null
          id: string
          progress_status: string | null
          submitted_at: string | null
          week_number: number
        }
        Insert: {
          additional_responses?: Json | null
          biggest_challenge?: string | null
          biggest_win?: string | null
          calls_attended?: string | null
          client_id: string
          energy_level?: number | null
          help_needed?: string | null
          id?: string
          progress_status?: string | null
          submitted_at?: string | null
          week_number: number
        }
        Update: {
          additional_responses?: Json | null
          biggest_challenge?: string | null
          biggest_win?: string | null
          calls_attended?: string | null
          client_id?: string
          energy_level?: number | null
          help_needed?: string | null
          id?: string
          progress_status?: string | null
          submitted_at?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "check_in_responses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          author_name: string | null
          client_id: string
          content: string
          created_at: string | null
          id: string
          is_ai_generated: boolean | null
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          client_id: string
          content: string
          created_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          client_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          assignments_completed: number | null
          avatar_url: string | null
          business_profile_id: string
          calls_attended: number | null
          calls_expected: number | null
          churn_reason: string | null
          churned_at: string | null
          community_comments: number | null
          community_posts: number | null
          community_reactions: number | null
          created_at: string | null
          current_week: number | null
          email: string
          expected_completion_at: string | null
          external_id: string | null
          health_score: number | null
          health_status: string | null
          id: string
          is_active: boolean | null
          last_active_at: string | null
          last_call_attended_at: string | null
          last_community_activity_at: string | null
          last_module_completed_at: string | null
          lifetime_value: number | null
          modules_completed: number | null
          name: string
          offer_id: string | null
          revenue_at_risk: number | null
          source_platform: Database["public"]["Enums"]["platform_type"] | null
          started_at: string | null
          total_spent: number | null
          trend: string | null
          updated_at: string | null
        }
        Insert: {
          assignments_completed?: number | null
          avatar_url?: string | null
          business_profile_id: string
          calls_attended?: number | null
          calls_expected?: number | null
          churn_reason?: string | null
          churned_at?: string | null
          community_comments?: number | null
          community_posts?: number | null
          community_reactions?: number | null
          created_at?: string | null
          current_week?: number | null
          email: string
          expected_completion_at?: string | null
          external_id?: string | null
          health_score?: number | null
          health_status?: string | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          last_call_attended_at?: string | null
          last_community_activity_at?: string | null
          last_module_completed_at?: string | null
          lifetime_value?: number | null
          modules_completed?: number | null
          name: string
          offer_id?: string | null
          revenue_at_risk?: number | null
          source_platform?: Database["public"]["Enums"]["platform_type"] | null
          started_at?: string | null
          total_spent?: number | null
          trend?: string | null
          updated_at?: string | null
        }
        Update: {
          assignments_completed?: number | null
          avatar_url?: string | null
          business_profile_id?: string
          calls_attended?: number | null
          calls_expected?: number | null
          churn_reason?: string | null
          churned_at?: string | null
          community_comments?: number | null
          community_posts?: number | null
          community_reactions?: number | null
          created_at?: string | null
          current_week?: number | null
          email?: string
          expected_completion_at?: string | null
          external_id?: string | null
          health_score?: number | null
          health_status?: string | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          last_call_attended_at?: string | null
          last_community_activity_at?: string | null
          last_module_completed_at?: string | null
          lifetime_value?: number | null
          modules_completed?: number | null
          name?: string
          offer_id?: string | null
          revenue_at_risk?: number | null
          source_platform?: Database["public"]["Enums"]["platform_type"] | null
          started_at?: string | null
          total_spent?: number | null
          trend?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          avg_job_value: number | null
          business_id: string
          city: string | null
          created_at: string | null
          customer_type: string | null
          email: string | null
          external_id: string | null
          first_service_at: string | null
          health_score: number | null
          id: string
          is_recurring: boolean | null
          jobs_completed: number | null
          last_contact_at: string | null
          last_service_at: string | null
          lifetime_value: number | null
          name: string
          next_service_at: string | null
          notes: string | null
          opted_out: boolean | null
          phone: string | null
          preferred_channel:
            | Database["public"]["Enums"]["message_channel"]
            | null
          quotes_lost: number | null
          quotes_won: number | null
          rating: number | null
          source: string | null
          state: string | null
          tags: string[] | null
          total_quotes: number | null
          total_revenue: number | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          avg_job_value?: number | null
          business_id: string
          city?: string | null
          created_at?: string | null
          customer_type?: string | null
          email?: string | null
          external_id?: string | null
          first_service_at?: string | null
          health_score?: number | null
          id?: string
          is_recurring?: boolean | null
          jobs_completed?: number | null
          last_contact_at?: string | null
          last_service_at?: string | null
          lifetime_value?: number | null
          name: string
          next_service_at?: string | null
          notes?: string | null
          opted_out?: boolean | null
          phone?: string | null
          preferred_channel?:
            | Database["public"]["Enums"]["message_channel"]
            | null
          quotes_lost?: number | null
          quotes_won?: number | null
          rating?: number | null
          source?: string | null
          state?: string | null
          tags?: string[] | null
          total_quotes?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          avg_job_value?: number | null
          business_id?: string
          city?: string | null
          created_at?: string | null
          customer_type?: string | null
          email?: string | null
          external_id?: string | null
          first_service_at?: string | null
          health_score?: number | null
          id?: string
          is_recurring?: boolean | null
          jobs_completed?: number | null
          last_contact_at?: string | null
          last_service_at?: string | null
          lifetime_value?: number | null
          name?: string
          next_service_at?: string | null
          notes?: string | null
          opted_out?: boolean | null
          phone?: string | null
          preferred_channel?:
            | Database["public"]["Enums"]["message_channel"]
            | null
          quotes_lost?: number | null
          quotes_won?: number | null
          rating?: number | null
          source?: string | null
          state?: string | null
          tags?: string[] | null
          total_quotes?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      health_score_weights: {
        Row: {
          assignment_completion_weight: number | null
          call_attendance_weight: number | null
          community_activity_weight: number | null
          created_at: string | null
          id: string
          module_progress_weight: number | null
          offer_id: string
          support_engagement_weight: number | null
          updated_at: string | null
        }
        Insert: {
          assignment_completion_weight?: number | null
          call_attendance_weight?: number | null
          community_activity_weight?: number | null
          created_at?: string | null
          id?: string
          module_progress_weight?: number | null
          offer_id: string
          support_engagement_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          assignment_completion_weight?: number | null
          call_attendance_weight?: number | null
          community_activity_weight?: number | null
          created_at?: string | null
          id?: string
          module_progress_weight?: number | null
          offer_id?: string
          support_engagement_weight?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_score_weights_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: true
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      inbound_messages: {
        Row: {
          business_id: string
          content: string
          created_at: string | null
          customer_id: string | null
          from_number: string | null
          id: string
          is_processed: boolean | null
          matched_at: string | null
          quote_id: string | null
          to_number: string | null
          twilio_sid: string | null
          twilio_status: string | null
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string | null
          customer_id?: string | null
          from_number?: string | null
          id?: string
          is_processed?: boolean | null
          matched_at?: string | null
          quote_id?: string | null
          to_number?: string | null
          twilio_sid?: string | null
          twilio_status?: string | null
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string | null
          customer_id?: string | null
          from_number?: string | null
          id?: string
          is_processed?: boolean | null
          matched_at?: string | null
          quote_id?: string | null
          to_number?: string | null
          twilio_sid?: string | null
          twilio_status?: string | null
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
            foreignKeyName: "inbound_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
      industries: {
        Row: {
          code: Database["public"]["Enums"]["industry_type"]
          color: string | null
          default_follow_up_days: number | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          peak_seasons: string[] | null
          typical_quote_range_max: number | null
          typical_quote_range_min: number | null
        }
        Insert: {
          code: Database["public"]["Enums"]["industry_type"]
          color?: string | null
          default_follow_up_days?: number | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          peak_seasons?: string[] | null
          typical_quote_range_max?: number | null
          typical_quote_range_min?: number | null
        }
        Update: {
          code?: Database["public"]["Enums"]["industry_type"]
          color?: string | null
          default_follow_up_days?: number | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          peak_seasons?: string[] | null
          typical_quote_range_max?: number | null
          typical_quote_range_min?: number | null
        }
        Relationships: []
      }
      industry_benchmarks: {
        Row: {
          average_value: number | null
          avg_close_time_days: number | null
          avg_conversion_rate: number | null
          avg_quote_value: number | null
          avg_response_time_minutes: number | null
          category: string | null
          display_format: string | null
          excellent_threshold: number | null
          good_threshold: number | null
          higher_is_better: boolean | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"]
          industry_slug: string | null
          metric_description: string | null
          metric_key: string | null
          metric_name: string | null
          poor_threshold: number | null
          priority: number | null
          season: string | null
          top_10_conversion_rate: number | null
          top_25_conversion_rate: number | null
          updated_at: string | null
        }
        Insert: {
          average_value?: number | null
          avg_close_time_days?: number | null
          avg_conversion_rate?: number | null
          avg_quote_value?: number | null
          avg_response_time_minutes?: number | null
          category?: string | null
          display_format?: string | null
          excellent_threshold?: number | null
          good_threshold?: number | null
          higher_is_better?: boolean | null
          id?: string
          industry: Database["public"]["Enums"]["industry_type"]
          industry_slug?: string | null
          metric_description?: string | null
          metric_key?: string | null
          metric_name?: string | null
          poor_threshold?: number | null
          priority?: number | null
          season?: string | null
          top_10_conversion_rate?: number | null
          top_25_conversion_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          average_value?: number | null
          avg_close_time_days?: number | null
          avg_conversion_rate?: number | null
          avg_quote_value?: number | null
          avg_response_time_minutes?: number | null
          category?: string | null
          display_format?: string | null
          excellent_threshold?: number | null
          good_threshold?: number | null
          higher_is_better?: boolean | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"]
          industry_slug?: string | null
          metric_description?: string | null
          metric_key?: string | null
          metric_name?: string | null
          poor_threshold?: number | null
          priority?: number | null
          season?: string | null
          top_10_conversion_rate?: number | null
          top_25_conversion_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      industry_service_types: {
        Row: {
          description: string | null
          display_order: number | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"]
          is_active: boolean | null
          name: string
          typical_price_max: number | null
          typical_price_min: number | null
        }
        Insert: {
          description?: string | null
          display_order?: number | null
          id?: string
          industry: Database["public"]["Enums"]["industry_type"]
          is_active?: boolean | null
          name: string
          typical_price_max?: number | null
          typical_price_min?: number | null
        }
        Update: {
          description?: string | null
          display_order?: number | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"]
          is_active?: boolean | null
          name?: string
          typical_price_max?: number | null
          typical_price_min?: number | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          access_token: string | null
          business_profile_id: string
          category: Database["public"]["Enums"]["integration_category"]
          created_at: string | null
          external_id: string | null
          external_name: string | null
          id: string
          last_synced_at: string | null
          metadata: Json | null
          platform: Database["public"]["Enums"]["platform_type"]
          refresh_token: string | null
          status: Database["public"]["Enums"]["connection_status"] | null
          sync_error: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          business_profile_id: string
          category: Database["public"]["Enums"]["integration_category"]
          created_at?: string | null
          external_id?: string | null
          external_name?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          platform: Database["public"]["Enums"]["platform_type"]
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["connection_status"] | null
          sync_error?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          business_profile_id?: string
          category?: Database["public"]["Enums"]["integration_category"]
          created_at?: string | null
          external_id?: string | null
          external_name?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          platform?: Database["public"]["Enums"]["platform_type"]
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["connection_status"] | null
          sync_error?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      intervention_outcomes: {
        Row: {
          client_pattern: string | null
          created_at: string | null
          features: Json | null
          health_score_change: number | null
          id: string
          intervention_approach: string | null
          intervention_id: string
          responded: boolean | null
          response_time_hours: number | null
          retained: boolean | null
        }
        Insert: {
          client_pattern?: string | null
          created_at?: string | null
          features?: Json | null
          health_score_change?: number | null
          id?: string
          intervention_approach?: string | null
          intervention_id: string
          responded?: boolean | null
          response_time_hours?: number | null
          retained?: boolean | null
        }
        Update: {
          client_pattern?: string | null
          created_at?: string | null
          features?: Json | null
          health_score_change?: number | null
          id?: string
          intervention_approach?: string | null
          intervention_id?: string
          responded?: boolean | null
          response_time_hours?: number | null
          retained?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "intervention_outcomes_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "interventions"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions: {
        Row: {
          client_id: string
          confidence_score: number | null
          created_at: string | null
          generated_content: string | null
          generated_subject: string | null
          health_score_after: number | null
          health_score_before: number | null
          id: string
          intervention_type: Database["public"]["Enums"]["intervention_type"]
          outcome: string | null
          pattern_matched: string | null
          priority: string | null
          recommended_action: string | null
          revenue_impact: number | null
          risk_analysis: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["intervention_status"] | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          confidence_score?: number | null
          created_at?: string | null
          generated_content?: string | null
          generated_subject?: string | null
          health_score_after?: number | null
          health_score_before?: number | null
          id?: string
          intervention_type: Database["public"]["Enums"]["intervention_type"]
          outcome?: string | null
          pattern_matched?: string | null
          priority?: string | null
          recommended_action?: string | null
          revenue_impact?: number | null
          risk_analysis?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["intervention_status"] | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          confidence_score?: number | null
          created_at?: string | null
          generated_content?: string | null
          generated_subject?: string | null
          health_score_after?: number | null
          health_score_before?: number | null
          id?: string
          intervention_type?: Database["public"]["Enums"]["intervention_type"]
          outcome?: string | null
          pattern_matched?: string | null
          priority?: string | null
          recommended_action?: string | null
          revenue_impact?: number | null
          risk_analysis?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["intervention_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interventions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      message_queue: {
        Row: {
          attempts: number | null
          business_id: string
          channel: Database["public"]["Enums"]["message_channel"]
          content: string
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number | null
          processed_at: string | null
          quote_id: string | null
          scheduled_for: string
          sequence_id: string | null
          status: string | null
          step_number: number | null
          subject: string | null
        }
        Insert: {
          attempts?: number | null
          business_id: string
          channel: Database["public"]["Enums"]["message_channel"]
          content: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          processed_at?: string | null
          quote_id?: string | null
          scheduled_for: string
          sequence_id?: string | null
          status?: string | null
          step_number?: number | null
          subject?: string | null
        }
        Update: {
          attempts?: number | null
          business_id?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          content?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number | null
          processed_at?: string | null
          quote_id?: string | null
          scheduled_for?: string
          sequence_id?: string | null
          status?: string | null
          step_number?: number | null
          subject?: string | null
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
      messages: {
        Row: {
          business_id: string
          channel: Database["public"]["Enums"]["message_channel"]
          content: string
          created_at: string | null
          customer_id: string | null
          delivered_at: string | null
          direction: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          metadata: Json | null
          quote_id: string | null
          read_at: string | null
          resend_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          subject: string | null
          twilio_sid: string | null
        }
        Insert: {
          business_id: string
          channel: Database["public"]["Enums"]["message_channel"]
          content: string
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          direction?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          quote_id?: string | null
          read_at?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string | null
          twilio_sid?: string | null
        }
        Update: {
          business_id?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          content?: string
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          direction?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json | null
          quote_id?: string | null
          read_at?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string | null
          twilio_sid?: string | null
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
            foreignKeyName: "messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string | null
          description: string
          id: string
          milestone_order: number | null
          offer_id: string
          week_end: number
          week_start: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          milestone_order?: number | null
          offer_id: string
          week_end: number
          week_start: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          milestone_order?: number | null
          offer_id?: string
          week_end?: number
          week_start?: number
        }
        Relationships: [
          {
            foreignKeyName: "milestones_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          business_profile_id: string
          created_at: string | null
          description: string | null
          duration_unit: Database["public"]["Enums"]["duration_unit"] | null
          duration_value: number | null
          id: string
          ideal_for: string | null
          is_core_offer: boolean | null
          ladder_order: number | null
          module_count: number | null
          name: string
          offer_type: Database["public"]["Enums"]["offer_type"]
          price: number
          pricing_model: Database["public"]["Enums"]["pricing_model"]
          target_audience: string | null
          tier: Database["public"]["Enums"]["offer_tier"] | null
          updated_at: string | null
        }
        Insert: {
          business_profile_id: string
          created_at?: string | null
          description?: string | null
          duration_unit?: Database["public"]["Enums"]["duration_unit"] | null
          duration_value?: number | null
          id?: string
          ideal_for?: string | null
          is_core_offer?: boolean | null
          ladder_order?: number | null
          module_count?: number | null
          name: string
          offer_type: Database["public"]["Enums"]["offer_type"]
          price: number
          pricing_model: Database["public"]["Enums"]["pricing_model"]
          target_audience?: string | null
          tier?: Database["public"]["Enums"]["offer_tier"] | null
          updated_at?: string | null
        }
        Update: {
          business_profile_id?: string
          created_at?: string | null
          description?: string | null
          duration_unit?: Database["public"]["Enums"]["duration_unit"] | null
          duration_value?: number | null
          id?: string
          ideal_for?: string | null
          is_core_offer?: boolean | null
          ladder_order?: number | null
          module_count?: number | null
          name?: string
          offer_type?: Database["public"]["Enums"]["offer_type"]
          price?: number
          pricing_model?: Database["public"]["Enums"]["pricing_model"]
          target_audience?: string | null
          tier?: Database["public"]["Enums"]["offer_tier"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_links: {
        Row: {
          amount: number
          business_id: string
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          paid_at: string | null
          quote_id: string | null
          status: string | null
          stripe_payment_link_id: string | null
          url: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          quote_id?: string | null
          status?: string | null
          stripe_payment_link_id?: string | null
          url: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          quote_id?: string | null
          status?: string | null
          stripe_payment_link_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_links_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_alerts: {
        Row: {
          action_label: string | null
          action_url: string | null
          alert_type: string
          business_id: string
          created_at: string | null
          current_value: number | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          metric_key: string | null
          previous_value: number | null
          severity: string | null
          title: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          alert_type: string
          business_id: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          metric_key?: string | null
          previous_value?: number | null
          severity?: string | null
          title: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          alert_type?: string
          business_id?: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          metric_key?: string | null
          previous_value?: number | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_alerts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          business_id: string
          capabilities: Json | null
          created_at: string | null
          friendly_name: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          phone_number: string
          twilio_sid: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          capabilities?: Json | null
          created_at?: string | null
          friendly_name?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          phone_number: string
          twilio_sid?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          capabilities?: Json | null
          created_at?: string | null
          friendly_name?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          phone_number?: string
          twilio_sid?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          business_id: string
          conversation_summary: string | null
          created_at: string | null
          current_step: number | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          description: string | null
          email_sent_at: string | null
          email_status: Database["public"]["Enums"]["message_status"] | null
          expired_at: string | null
          external_id: string | null
          final_job_amount: number | null
          id: string
          job_status: string | null
          last_message_at: string | null
          last_message_direction: string | null
          last_message_preview: string | null
          lost_at: string | null
          lost_reason: string | null
          next_message_at: string | null
          paid_amount: number | null
          paid_at: string | null
          payment_link_id: string | null
          payment_link_url: string | null
          payment_status: string | null
          quote_amount: number | null
          sequence_id: string | null
          service_type: string | null
          sms_sent_at: string | null
          sms_status: Database["public"]["Enums"]["message_status"] | null
          source: string | null
          status: Database["public"]["Enums"]["quote_status"] | null
          unread_count: number | null
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
          won_at: string | null
        }
        Insert: {
          business_id: string
          conversation_summary?: string | null
          created_at?: string | null
          current_step?: number | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          description?: string | null
          email_sent_at?: string | null
          email_status?: Database["public"]["Enums"]["message_status"] | null
          expired_at?: string | null
          external_id?: string | null
          final_job_amount?: number | null
          id?: string
          job_status?: string | null
          last_message_at?: string | null
          last_message_direction?: string | null
          last_message_preview?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          next_message_at?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          payment_link_id?: string | null
          payment_link_url?: string | null
          payment_status?: string | null
          quote_amount?: number | null
          sequence_id?: string | null
          service_type?: string | null
          sms_sent_at?: string | null
          sms_status?: Database["public"]["Enums"]["message_status"] | null
          source?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          unread_count?: number | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
          won_at?: string | null
        }
        Update: {
          business_id?: string
          conversation_summary?: string | null
          created_at?: string | null
          current_step?: number | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          description?: string | null
          email_sent_at?: string | null
          email_status?: Database["public"]["Enums"]["message_status"] | null
          expired_at?: string | null
          external_id?: string | null
          final_job_amount?: number | null
          id?: string
          job_status?: string | null
          last_message_at?: string | null
          last_message_direction?: string | null
          last_message_preview?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          next_message_at?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          payment_link_id?: string | null
          payment_link_url?: string | null
          payment_status?: string | null
          quote_amount?: number | null
          sequence_id?: string | null
          service_type?: string | null
          sms_sent_at?: string | null
          sms_status?: Database["public"]["Enums"]["message_status"] | null
          source?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          unread_count?: number | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
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
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
      retention_queue: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          customer_id: string
          id: string
          last_sent_at: string | null
          retention_sequence_id: string
          scheduled_for: string
          status: string | null
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          customer_id: string
          id?: string
          last_sent_at?: string | null
          retention_sequence_id: string
          scheduled_for: string
          status?: string | null
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          customer_id?: string
          id?: string
          last_sent_at?: string | null
          retention_sequence_id?: string
          scheduled_for?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_queue_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_queue_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_queue_retention_sequence_id_fkey"
            columns: ["retention_sequence_id"]
            isOneToOne: false
            referencedRelation: "retention_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_sequences: {
        Row: {
          business_id: string
          created_at: string | null
          cycle: Database["public"]["Enums"]["cycle_type"] | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          steps: Json | null
          trigger_day: number | null
          trigger_days_after: number | null
          trigger_month: number | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          cycle?: Database["public"]["Enums"]["cycle_type"] | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          steps?: Json | null
          trigger_day?: number | null
          trigger_days_after?: number | null
          trigger_month?: number | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          cycle?: Database["public"]["Enums"]["cycle_type"] | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: Json | null
          trigger_day?: number | null
          trigger_days_after?: number | null
          trigger_month?: number | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_sequences_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      review_requests: {
        Row: {
          business_id: string
          clicked_at: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          quote_id: string | null
          review_platform: string | null
          review_rating: number | null
          review_submitted_at: string | null
          sent_at: string | null
          sent_via: Database["public"]["Enums"]["message_channel"] | null
          status: string | null
        }
        Insert: {
          business_id: string
          clicked_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          quote_id?: string | null
          review_platform?: string | null
          review_rating?: number | null
          review_submitted_at?: string | null
          sent_at?: string | null
          sent_via?: Database["public"]["Enums"]["message_channel"] | null
          status?: string | null
        }
        Update: {
          business_id?: string
          clicked_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          quote_id?: string | null
          review_platform?: string | null
          review_rating?: number | null
          review_submitted_at?: string | null
          sent_at?: string | null
          sent_via?: Database["public"]["Enums"]["message_channel"] | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_campaigns: {
        Row: {
          avg_click_rate: number | null
          avg_conversion_rate: number | null
          avg_open_rate: number | null
          body: string | null
          business_id: string
          campaign_type: string | null
          channel: string | null
          clicked_count: number | null
          completed_at: string | null
          converted_count: number | null
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          delivered_count: number | null
          description: string | null
          email_body: string | null
          email_content: string | null
          email_subject: string | null
          exclude_recent_days: number | null
          failed_count: number | null
          holiday: string | null
          id: string
          include_opt_out_sms: boolean | null
          include_unsubscribe: boolean | null
          industry: string | null
          is_featured: boolean | null
          is_template: boolean | null
          max_days_since_service: number | null
          min_days_since_service: number | null
          month: number | null
          name: string
          opened_count: number | null
          opens_count: number | null
          preview_text: string | null
          scheduled_for: string | null
          season: string | null
          send_time: string | null
          send_timezone: string | null
          sent_count: number | null
          sms_content: string | null
          sms_message: string | null
          started_at: string | null
          status: string | null
          subject: string | null
          tags: string[] | null
          target_audience: Json | null
          target_customer_types: string[] | null
          template_id: string | null
          total_recipients: number | null
          unsubscribed_count: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          avg_click_rate?: number | null
          avg_conversion_rate?: number | null
          avg_open_rate?: number | null
          body?: string | null
          business_id: string
          campaign_type?: string | null
          channel?: string | null
          clicked_count?: number | null
          completed_at?: string | null
          converted_count?: number | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          delivered_count?: number | null
          description?: string | null
          email_body?: string | null
          email_content?: string | null
          email_subject?: string | null
          exclude_recent_days?: number | null
          failed_count?: number | null
          holiday?: string | null
          id?: string
          include_opt_out_sms?: boolean | null
          include_unsubscribe?: boolean | null
          industry?: string | null
          is_featured?: boolean | null
          is_template?: boolean | null
          max_days_since_service?: number | null
          min_days_since_service?: number | null
          month?: number | null
          name: string
          opened_count?: number | null
          opens_count?: number | null
          preview_text?: string | null
          scheduled_for?: string | null
          season?: string | null
          send_time?: string | null
          send_timezone?: string | null
          sent_count?: number | null
          sms_content?: string | null
          sms_message?: string | null
          started_at?: string | null
          status?: string | null
          subject?: string | null
          tags?: string[] | null
          target_audience?: Json | null
          target_customer_types?: string[] | null
          template_id?: string | null
          total_recipients?: number | null
          unsubscribed_count?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          avg_click_rate?: number | null
          avg_conversion_rate?: number | null
          avg_open_rate?: number | null
          body?: string | null
          business_id?: string
          campaign_type?: string | null
          channel?: string | null
          clicked_count?: number | null
          completed_at?: string | null
          converted_count?: number | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          delivered_count?: number | null
          description?: string | null
          email_body?: string | null
          email_content?: string | null
          email_subject?: string | null
          exclude_recent_days?: number | null
          failed_count?: number | null
          holiday?: string | null
          id?: string
          include_opt_out_sms?: boolean | null
          include_unsubscribe?: boolean | null
          industry?: string | null
          is_featured?: boolean | null
          is_template?: boolean | null
          max_days_since_service?: number | null
          min_days_since_service?: number | null
          month?: number | null
          name?: string
          opened_count?: number | null
          opens_count?: number | null
          preview_text?: string | null
          scheduled_for?: string | null
          season?: string | null
          send_time?: string | null
          send_timezone?: string | null
          sent_count?: number | null
          sms_content?: string | null
          sms_message?: string | null
          started_at?: string | null
          status?: string | null
          subject?: string | null
          tags?: string[] | null
          target_audience?: Json | null
          target_customer_types?: string[] | null
          template_id?: string | null
          total_recipients?: number | null
          unsubscribed_count?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_templates: {
        Row: {
          avg_conversion_rate: number | null
          created_at: string | null
          description: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          steps: Json
          times_used: number | null
        }
        Insert: {
          avg_conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          steps?: Json
          times_used?: number | null
        }
        Update: {
          avg_conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          steps?: Json
          times_used?: number | null
        }
        Relationships: []
      }
      sequences: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          steps: Json | null
          total_converted: number | null
          total_enrolled: number | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          steps?: Json | null
          total_converted?: number | null
          total_enrolled?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          steps?: Json | null
          total_converted?: number | null
          total_enrolled?: number | null
          updated_at?: string | null
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
      stripe_connected_accounts: {
        Row: {
          business_id: string
          charges_enabled: boolean | null
          created_at: string | null
          details_submitted: boolean | null
          id: string
          onboarding_completed: boolean | null
          payouts_enabled: boolean | null
          stripe_account_id: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          charges_enabled?: boolean | null
          created_at?: string | null
          details_submitted?: boolean | null
          id?: string
          onboarding_completed?: boolean | null
          payouts_enabled?: boolean | null
          stripe_account_id: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          charges_enabled?: boolean | null
          created_at?: string | null
          details_submitted?: boolean | null
          id?: string
          onboarding_completed?: boolean | null
          payouts_enabled?: boolean | null
          stripe_account_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_connected_accounts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      success_metrics: {
        Row: {
          created_at: string | null
          expected_calls_per_week: number | null
          expected_community_activity_per_week: number | null
          expected_module_progress_per_week: number | null
          id: string
          offer_id: string
          primary_outcome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expected_calls_per_week?: number | null
          expected_community_activity_per_week?: number | null
          expected_module_progress_per_week?: number | null
          id?: string
          offer_id: string
          primary_outcome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expected_calls_per_week?: number | null
          expected_community_activity_per_week?: number | null
          expected_module_progress_per_week?: number | null
          id?: string
          offer_id?: string
          primary_outcome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "success_metrics_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: true
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      touchpoints: {
        Row: {
          accountability_enabled: boolean | null
          assignments_count: number | null
          assignments_enabled: boolean | null
          chat_enabled: boolean | null
          chat_platform: Database["public"]["Enums"]["platform_type"] | null
          community_enabled: boolean | null
          community_platform:
            | Database["public"]["Enums"]["platform_type"]
            | null
          created_at: string | null
          email_support_enabled: boolean | null
          group_calls_enabled: boolean | null
          group_calls_frequency: number | null
          group_calls_per: string | null
          id: string
          modules_count: number | null
          modules_enabled: boolean | null
          offer_id: string
          one_on_one_enabled: boolean | null
          one_on_one_frequency: number | null
          one_on_one_per: string | null
          portal_support_enabled: boolean | null
          qa_sessions_enabled: boolean | null
          qa_sessions_frequency: number | null
          qa_sessions_per: string | null
          resources_enabled: boolean | null
          updated_at: string | null
          voice_support_enabled: boolean | null
        }
        Insert: {
          accountability_enabled?: boolean | null
          assignments_count?: number | null
          assignments_enabled?: boolean | null
          chat_enabled?: boolean | null
          chat_platform?: Database["public"]["Enums"]["platform_type"] | null
          community_enabled?: boolean | null
          community_platform?:
            | Database["public"]["Enums"]["platform_type"]
            | null
          created_at?: string | null
          email_support_enabled?: boolean | null
          group_calls_enabled?: boolean | null
          group_calls_frequency?: number | null
          group_calls_per?: string | null
          id?: string
          modules_count?: number | null
          modules_enabled?: boolean | null
          offer_id: string
          one_on_one_enabled?: boolean | null
          one_on_one_frequency?: number | null
          one_on_one_per?: string | null
          portal_support_enabled?: boolean | null
          qa_sessions_enabled?: boolean | null
          qa_sessions_frequency?: number | null
          qa_sessions_per?: string | null
          resources_enabled?: boolean | null
          updated_at?: string | null
          voice_support_enabled?: boolean | null
        }
        Update: {
          accountability_enabled?: boolean | null
          assignments_count?: number | null
          assignments_enabled?: boolean | null
          chat_enabled?: boolean | null
          chat_platform?: Database["public"]["Enums"]["platform_type"] | null
          community_enabled?: boolean | null
          community_platform?:
            | Database["public"]["Enums"]["platform_type"]
            | null
          created_at?: string | null
          email_support_enabled?: boolean | null
          group_calls_enabled?: boolean | null
          group_calls_frequency?: number | null
          group_calls_per?: string | null
          id?: string
          modules_count?: number | null
          modules_enabled?: boolean | null
          offer_id?: string
          one_on_one_enabled?: boolean | null
          one_on_one_frequency?: number | null
          one_on_one_per?: string | null
          portal_support_enabled?: boolean | null
          qa_sessions_enabled?: boolean | null
          qa_sessions_frequency?: number | null
          qa_sessions_per?: string | null
          resources_enabled?: boolean | null
          updated_at?: string | null
          voice_support_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "touchpoints_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: true
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_sequence: {
        Args: { p_business_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_action: string
          p_business_id: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type?: string
        }
        Returns: string
      }
      seed_test_data: { Args: { p_business_id: string }; Returns: Json }
      system_health_check: { Args: { p_business_id: string }; Returns: Json }
      verify_database_schema: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      business_type:
        | "coach"
        | "course_creator"
        | "community"
        | "agency"
        | "hybrid"
      connection_status: "connected" | "disconnected" | "error" | "pending"
      cycle_type: "monthly" | "quarterly" | "annually"
      duration_unit: "days" | "weeks" | "months"
      industry_type:
        | "hvac"
        | "plumbing"
        | "electrical"
        | "roofing"
        | "landscaping"
        | "painting"
        | "flooring"
        | "pest_control"
        | "cleaning"
        | "auto_repair"
        | "pool_service"
        | "tree_service"
        | "fencing"
        | "concrete"
        | "garage_doors"
        | "handyman"
        | "pressure_washing"
        | "other"
      integration_category:
        | "community"
        | "course"
        | "crm"
        | "payments"
        | "calendar"
        | "email"
      intervention_status:
        | "recommended"
        | "sent"
        | "completed"
        | "skipped"
        | "failed"
      intervention_type:
        | "email"
        | "message"
        | "call_scheduled"
        | "workflow_triggered"
        | "manual_outreach"
      message_channel: "sms" | "email" | "both"
      message_status: "pending" | "sent" | "delivered" | "failed" | "read"
      offer_tier: "entry" | "starter" | "core" | "premium" | "elite"
      offer_type:
        | "one_on_one"
        | "group"
        | "hybrid_coaching"
        | "mastermind"
        | "self_paced"
        | "cohort"
        | "membership"
        | "retainer"
        | "project"
      platform_type:
        | "skool"
        | "circle"
        | "discord"
        | "mighty_networks"
        | "slack"
        | "kajabi"
        | "teachable"
        | "thinkific"
        | "ghl"
        | "hubspot"
        | "activecampaign"
        | "stripe"
        | "google_calendar"
        | "calendly"
        | "zoom"
      pricing_model: "one_time" | "monthly" | "annual" | "lifetime"
      quote_status: "new" | "following_up" | "won" | "lost" | "expired"
      subscription_status:
        | "trial"
        | "active"
        | "past_due"
        | "canceled"
        | "paused"
      urgency_level: "low" | "medium" | "high" | "urgent"
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
      app_role: ["admin", "moderator", "user"],
      business_type: [
        "coach",
        "course_creator",
        "community",
        "agency",
        "hybrid",
      ],
      connection_status: ["connected", "disconnected", "error", "pending"],
      cycle_type: ["monthly", "quarterly", "annually"],
      duration_unit: ["days", "weeks", "months"],
      industry_type: [
        "hvac",
        "plumbing",
        "electrical",
        "roofing",
        "landscaping",
        "painting",
        "flooring",
        "pest_control",
        "cleaning",
        "auto_repair",
        "pool_service",
        "tree_service",
        "fencing",
        "concrete",
        "garage_doors",
        "handyman",
        "pressure_washing",
        "other",
      ],
      integration_category: [
        "community",
        "course",
        "crm",
        "payments",
        "calendar",
        "email",
      ],
      intervention_status: [
        "recommended",
        "sent",
        "completed",
        "skipped",
        "failed",
      ],
      intervention_type: [
        "email",
        "message",
        "call_scheduled",
        "workflow_triggered",
        "manual_outreach",
      ],
      message_channel: ["sms", "email", "both"],
      message_status: ["pending", "sent", "delivered", "failed", "read"],
      offer_tier: ["entry", "starter", "core", "premium", "elite"],
      offer_type: [
        "one_on_one",
        "group",
        "hybrid_coaching",
        "mastermind",
        "self_paced",
        "cohort",
        "membership",
        "retainer",
        "project",
      ],
      platform_type: [
        "skool",
        "circle",
        "discord",
        "mighty_networks",
        "slack",
        "kajabi",
        "teachable",
        "thinkific",
        "ghl",
        "hubspot",
        "activecampaign",
        "stripe",
        "google_calendar",
        "calendly",
        "zoom",
      ],
      pricing_model: ["one_time", "monthly", "annual", "lifetime"],
      quote_status: ["new", "following_up", "won", "lost", "expired"],
      subscription_status: [
        "trial",
        "active",
        "past_due",
        "canceled",
        "paused",
      ],
      urgency_level: ["low", "medium", "high", "urgent"],
    },
  },
} as const
