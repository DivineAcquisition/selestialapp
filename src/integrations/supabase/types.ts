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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      business_type:
        | "coach"
        | "course_creator"
        | "community"
        | "agency"
        | "hybrid"
      connection_status: "connected" | "disconnected" | "error" | "pending"
      duration_unit: "days" | "weeks" | "months"
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
      business_type: [
        "coach",
        "course_creator",
        "community",
        "agency",
        "hybrid",
      ],
      connection_status: ["connected", "disconnected", "error", "pending"],
      duration_unit: ["days", "weeks", "months"],
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
    },
  },
} as const
