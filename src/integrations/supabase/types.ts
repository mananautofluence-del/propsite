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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      collections: {
        Row: {
          created_at: string | null
          description: string | null
          expiry_date: string | null
          id: string
          listing_ids: string[]
          listing_order: number[] | null
          slug: string
          status: string | null
          temp_token: string | null
          title: string
          total_views: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          listing_ids: string[]
          listing_order?: number[] | null
          slug: string
          status?: string | null
          temp_token?: string | null
          title: string
          total_views?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          listing_ids?: string[]
          listing_order?: number[] | null
          slug?: string
          status?: string | null
          temp_token?: string | null
          title?: string
          total_views?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credits_transactions: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          credits_added: number | null
          id: string
          razorpay_payment_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          credits_added?: number | null
          id?: string
          razorpay_payment_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          credits_added?: number | null
          id?: string
          razorpay_payment_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credits_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          contacted: boolean | null
          created_at: string | null
          email: string | null
          id: string
          listing_id: string | null
          name: string | null
          notes: string | null
          phone: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          contacted?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          listing_id?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          contacted?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          listing_id?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_events: {
        Row: {
          city: string | null
          created_at: string | null
          device_type: string | null
          event_type: string
          id: string
          listing_id: string | null
          metadata: Json | null
          session_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type: string
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          session_id: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          listing_id?: string | null
          metadata?: Json | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_events_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          created_at: string | null
          id: string
          is_hero: boolean | null
          listing_id: string | null
          order_index: number | null
          room_tag: string | null
          storage_path: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_hero?: boolean | null
          listing_id?: string | null
          order_index?: number | null
          room_tag?: string | null
          storage_path: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_hero?: boolean | null
          listing_id?: string | null
          order_index?: number | null
          room_tag?: string | null
          storage_path?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_sessions: {
        Row: {
          city: string | null
          contact_clicked: boolean | null
          device_type: string | null
          duration_seconds: number | null
          id: string
          is_hot_lead: boolean | null
          last_ping_at: string | null
          listing_id: string | null
          photos_viewed: number | null
          session_id: string
          started_at: string | null
          whatsapp_clicked: boolean | null
        }
        Insert: {
          city?: string | null
          contact_clicked?: boolean | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          is_hot_lead?: boolean | null
          last_ping_at?: string | null
          listing_id?: string | null
          photos_viewed?: number | null
          session_id: string
          started_at?: string | null
          whatsapp_clicked?: boolean | null
        }
        Update: {
          city?: string | null
          contact_clicked?: boolean | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          is_hot_lead?: boolean | null
          last_ping_at?: string | null
          listing_id?: string | null
          photos_viewed?: number | null
          session_id?: string
          started_at?: string | null
          whatsapp_clicked?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_sessions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          ac_type: string | null
          accent_color: string | null
          ai_description: string | null
          ai_highlights: string[] | null
          ai_neighbourhood_highlights: string[] | null
          amenities: string[] | null
          avg_time_seconds: number | null
          balcony_count: number | null
          bathroom_count: number | null
          bhk_config: string | null
          broker_agency: string | null
          broker_avatar_url: string | null
          broker_logo_url: string | null
          broker_name: string | null
          broker_notes: string | null
          broker_personal_note: string | null
          broker_phone: string | null
          broker_rera: string | null
          broker_whatsapp: string | null
          building_grade: string | null
          building_name: string | null
          builtup_area: number | null
          cabin_count: number | null
          cam_charges: number | null
          carpet_area: number | null
          city: string | null
          contact_clicks: number | null
          created_at: string | null
          current_status: string | null
          expiry_date: string | null
          facing_direction: string | null
          floor_load_capacity: number | null
          floor_number: number | null
          floor_plan_url: string | null
          frontage_width: number | null
          fsi_available: number | null
          furnishing_status: string | null
          google_maps_url: string | null
          has_na_order: boolean | null
          has_pooja_room: boolean | null
          has_servant_room: boolean | null
          has_store_room: boolean | null
          has_study_room: boolean | null
          has_three_phase_power: boolean | null
          headline: string | null
          id: string
          is_clear_title: boolean | null
          is_corner_unit: boolean | null
          is_main_road_facing: boolean | null
          is_midc_plot: boolean | null
          lead_capture_enabled: boolean | null
          listing_quality_score: number | null
          loading_bays: number | null
          locality: string | null
          lock_in_period: string | null
          meeting_rooms: number | null
          monthly_rent: number | null
          office_furnishing: string | null
          open_house_date: string | null
          open_house_time_end: string | null
          open_house_time_start: string | null
          parking_car: number | null
          parking_two_wheeler: number | null
          pincode: string | null
          plot_area: number | null
          plot_dimensions: string | null
          plot_shape: string | null
          possession_date: string | null
          possession_status: string | null
          power_backup_kva: number | null
          power_load_kw: number | null
          price: number | null
          price_history_note: string | null
          price_negotiable: boolean | null
          property_age: string | null
          property_category: string | null
          property_type: string | null
          rera_number: string | null
          road_type: string | null
          road_width: number | null
          security_deposit: number | null
          show_broker_card: boolean | null
          slug: string
          status: string | null
          super_builtup_area: number | null
          survey_number: string | null
          temp_token: string | null
          template: string | null
          total_floors: number | null
          total_sessions: number | null
          total_views: number | null
          transaction_type: string | null
          unit_height: number | null
          updated_at: string | null
          urgency_badge: string | null
          user_id: string | null
          virtual_tour_url: string | null
          warehouse_height: number | null
          whatsapp_clicks: number | null
          workstation_capacity: number | null
          zoning_type: string | null
        }
        Insert: {
          ac_type?: string | null
          accent_color?: string | null
          ai_description?: string | null
          ai_highlights?: string[] | null
          ai_neighbourhood_highlights?: string[] | null
          amenities?: string[] | null
          avg_time_seconds?: number | null
          balcony_count?: number | null
          bathroom_count?: number | null
          bhk_config?: string | null
          broker_agency?: string | null
          broker_avatar_url?: string | null
          broker_logo_url?: string | null
          broker_name?: string | null
          broker_notes?: string | null
          broker_personal_note?: string | null
          broker_phone?: string | null
          broker_rera?: string | null
          broker_whatsapp?: string | null
          building_grade?: string | null
          building_name?: string | null
          builtup_area?: number | null
          cabin_count?: number | null
          cam_charges?: number | null
          carpet_area?: number | null
          city?: string | null
          contact_clicks?: number | null
          created_at?: string | null
          current_status?: string | null
          expiry_date?: string | null
          facing_direction?: string | null
          floor_load_capacity?: number | null
          floor_number?: number | null
          floor_plan_url?: string | null
          frontage_width?: number | null
          fsi_available?: number | null
          furnishing_status?: string | null
          google_maps_url?: string | null
          has_na_order?: boolean | null
          has_pooja_room?: boolean | null
          has_servant_room?: boolean | null
          has_store_room?: boolean | null
          has_study_room?: boolean | null
          has_three_phase_power?: boolean | null
          headline?: string | null
          id?: string
          is_clear_title?: boolean | null
          is_corner_unit?: boolean | null
          is_main_road_facing?: boolean | null
          is_midc_plot?: boolean | null
          lead_capture_enabled?: boolean | null
          listing_quality_score?: number | null
          loading_bays?: number | null
          locality?: string | null
          lock_in_period?: string | null
          meeting_rooms?: number | null
          monthly_rent?: number | null
          office_furnishing?: string | null
          open_house_date?: string | null
          open_house_time_end?: string | null
          open_house_time_start?: string | null
          parking_car?: number | null
          parking_two_wheeler?: number | null
          pincode?: string | null
          plot_area?: number | null
          plot_dimensions?: string | null
          plot_shape?: string | null
          possession_date?: string | null
          possession_status?: string | null
          power_backup_kva?: number | null
          power_load_kw?: number | null
          price?: number | null
          price_history_note?: string | null
          price_negotiable?: boolean | null
          property_age?: string | null
          property_category?: string | null
          property_type?: string | null
          rera_number?: string | null
          road_type?: string | null
          road_width?: number | null
          security_deposit?: number | null
          show_broker_card?: boolean | null
          slug: string
          status?: string | null
          super_builtup_area?: number | null
          survey_number?: string | null
          temp_token?: string | null
          template?: string | null
          total_floors?: number | null
          total_sessions?: number | null
          total_views?: number | null
          transaction_type?: string | null
          unit_height?: number | null
          updated_at?: string | null
          urgency_badge?: string | null
          user_id?: string | null
          virtual_tour_url?: string | null
          warehouse_height?: number | null
          whatsapp_clicks?: number | null
          workstation_capacity?: number | null
          zoning_type?: string | null
        }
        Update: {
          ac_type?: string | null
          accent_color?: string | null
          ai_description?: string | null
          ai_highlights?: string[] | null
          ai_neighbourhood_highlights?: string[] | null
          amenities?: string[] | null
          avg_time_seconds?: number | null
          balcony_count?: number | null
          bathroom_count?: number | null
          bhk_config?: string | null
          broker_agency?: string | null
          broker_avatar_url?: string | null
          broker_logo_url?: string | null
          broker_name?: string | null
          broker_notes?: string | null
          broker_personal_note?: string | null
          broker_phone?: string | null
          broker_rera?: string | null
          broker_whatsapp?: string | null
          building_grade?: string | null
          building_name?: string | null
          builtup_area?: number | null
          cabin_count?: number | null
          cam_charges?: number | null
          carpet_area?: number | null
          city?: string | null
          contact_clicks?: number | null
          created_at?: string | null
          current_status?: string | null
          expiry_date?: string | null
          facing_direction?: string | null
          floor_load_capacity?: number | null
          floor_number?: number | null
          floor_plan_url?: string | null
          frontage_width?: number | null
          fsi_available?: number | null
          furnishing_status?: string | null
          google_maps_url?: string | null
          has_na_order?: boolean | null
          has_pooja_room?: boolean | null
          has_servant_room?: boolean | null
          has_store_room?: boolean | null
          has_study_room?: boolean | null
          has_three_phase_power?: boolean | null
          headline?: string | null
          id?: string
          is_clear_title?: boolean | null
          is_corner_unit?: boolean | null
          is_main_road_facing?: boolean | null
          is_midc_plot?: boolean | null
          lead_capture_enabled?: boolean | null
          listing_quality_score?: number | null
          loading_bays?: number | null
          locality?: string | null
          lock_in_period?: string | null
          meeting_rooms?: number | null
          monthly_rent?: number | null
          office_furnishing?: string | null
          open_house_date?: string | null
          open_house_time_end?: string | null
          open_house_time_start?: string | null
          parking_car?: number | null
          parking_two_wheeler?: number | null
          pincode?: string | null
          plot_area?: number | null
          plot_dimensions?: string | null
          plot_shape?: string | null
          possession_date?: string | null
          possession_status?: string | null
          power_backup_kva?: number | null
          power_load_kw?: number | null
          price?: number | null
          price_history_note?: string | null
          price_negotiable?: boolean | null
          property_age?: string | null
          property_category?: string | null
          property_type?: string | null
          rera_number?: string | null
          road_type?: string | null
          road_width?: number | null
          security_deposit?: number | null
          show_broker_card?: boolean | null
          slug?: string
          status?: string | null
          super_builtup_area?: number | null
          survey_number?: string | null
          temp_token?: string | null
          template?: string | null
          total_floors?: number | null
          total_sessions?: number | null
          total_views?: number | null
          transaction_type?: string | null
          unit_height?: number | null
          updated_at?: string | null
          urgency_badge?: string | null
          user_id?: string | null
          virtual_tour_url?: string | null
          warehouse_height?: number | null
          whatsapp_clicks?: number | null
          workstation_capacity?: number | null
          zoning_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agency_name: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          credits_remaining: number | null
          email: string
          full_name: string
          id: string
          listings_used_this_month: number | null
          logo_url: string | null
          onboarding_complete: boolean | null
          phone: string | null
          plan: string | null
          plan_expires_at: string | null
          rera_number: string | null
          tagline: string | null
          username: string | null
          whatsapp: string | null
        }
        Insert: {
          agency_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          credits_remaining?: number | null
          email: string
          full_name: string
          id: string
          listings_used_this_month?: number | null
          logo_url?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          plan?: string | null
          plan_expires_at?: string | null
          rera_number?: string | null
          tagline?: string | null
          username?: string | null
          whatsapp?: string | null
        }
        Update: {
          agency_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          credits_remaining?: number | null
          email?: string
          full_name?: string
          id?: string
          listings_used_this_month?: number | null
          logo_url?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          plan?: string | null
          plan_expires_at?: string | null
          rera_number?: string | null
          tagline?: string | null
          username?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      white_labeled_links: {
        Row: {
          id: string
          original_listing_id: string | null
          partner_user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          original_listing_id?: string | null
          partner_user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          original_listing_id?: string | null
          partner_user_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "white_labeled_links_original_listing_id_fkey"
            columns: ["original_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "white_labeled_links_partner_user_id_fkey"
            columns: ["partner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_views: { Args: { p_listing_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
