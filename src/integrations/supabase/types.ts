export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      client_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["client_role"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["client_role"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["client_role"]
          status?: string
          updated_at?: string
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
          {
            foreignKeyName: "client_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          state: string | null
          status: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      course_allocations: {
        Row: {
          client_id: string
          course_instance_id: number
          created_at: string
          id: number
          seats_allocated: number
          updated_at: string
        }
        Insert: {
          client_id: string
          course_instance_id: number
          created_at?: string
          id?: number
          seats_allocated: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          course_instance_id?: number
          created_at?: string
          id?: number
          seats_allocated?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_allocations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_allocations_course_instance_id_fkey"
            columns: ["course_instance_id"]
            isOneToOne: false
            referencedRelation: "course_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      course_instances: {
        Row: {
          created_at: string
          end_date: string | null
          host_client_id: string | null
          id: number
          is_open_enrollment: boolean
          private_seats_allocated: number | null
          program_id: number
          start_date: string
          updated_at: string
          venue_id: number
          visibility_type: number
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          host_client_id?: string | null
          id?: number
          is_open_enrollment?: boolean
          private_seats_allocated?: number | null
          program_id: number
          start_date: string
          updated_at?: string
          venue_id: number
          visibility_type?: number
        }
        Update: {
          created_at?: string
          end_date?: string | null
          host_client_id?: string | null
          id?: number
          is_open_enrollment?: boolean
          private_seats_allocated?: number | null
          program_id?: number
          start_date?: string
          updated_at?: string
          venue_id?: number
          visibility_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_instances_host_client_id_fkey"
            columns: ["host_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_instances_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_instances_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          client_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_type: string | null
          status: string | null
          token: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invitation_type?: string | null
          status?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_type?: string | null
          status?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          organization_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_login?: string | null
          last_name?: string | null
          organization_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          organization_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          duration_days: number | null
          id: number
          lvl: number
          max_students: number | null
          min_students: number | null
          name: string
          price: number | null
          sku: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          id?: number
          lvl?: number
          max_students?: number | null
          min_students?: number | null
          name: string
          price?: number | null
          sku: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          id?: number
          lvl?: number
          max_students?: number | null
          min_students?: number | null
          name?: string
          price?: number | null
          sku?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          group_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups: {
        Row: {
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_groups_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_teams: {
        Row: {
          created_at: string
          id: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_teams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_teams_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          created_at: string | null
          google_location: string | null
          id: number
          name: string
          region: string | null
          short_name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          google_location?: string | null
          id?: number
          name: string
          region?: string | null
          short_name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          google_location?: string | null
          id?: number
          name?: string
          region?: string | null
          short_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_to_client: {
        Args: {
          p_client_id: string
          p_email: string
          p_role?: Database["public"]["Enums"]["client_role"]
        }
        Returns: Json
      }
      can_access_client_groups: {
        Args: { client_id: string }
        Returns: boolean
      }
      check_client_access: {
        Args: { client_id: string; user_id: string }
        Returns: boolean
      }
      check_client_access_direct: {
        Args: { client_id: string }
        Returns: boolean
      }
      check_client_access_secure: {
        Args: { client_id: string }
        Returns: boolean
      }
      check_client_access_simple: {
        Args: { client_id_param: string }
        Returns: boolean
      }
      check_client_access_v2: {
        Args: { client_id_param: string }
        Returns: boolean
      }
      check_client_user_access: {
        Args: { client_id_param: string }
        Returns: boolean
      }
      check_direct_client_access: {
        Args: { client_id: string }
        Returns: boolean
      }
      check_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_client_manual: {
        Args: {
          client_name: string
          p_address?: string
          p_city?: string
          p_state?: string
          p_zip_code?: string
          p_phone?: string
          p_contact_email?: string
        }
        Returns: string
      }
      create_client_shareable_invitation: {
        Args: { client_id: string }
        Returns: Json
      }
      create_client_with_invitation: {
        Args: { client_name: string; contact_email: string }
        Returns: Json
      }
      create_internal_user: {
        Args: {
          p_email: string
          p_first_name: string
          p_last_name: string
          p_title: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_client_access: {
        Args: { client_id_param: string }
        Returns: boolean
      }
      has_client_access_secure: {
        Args: { client_id: string }
        Returns: boolean
      }
      has_client_user_access: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      has_direct_client_access: {
        Args: { client_id_param: string }
        Returns: boolean
      }
      is_client_admin_direct: {
        Args: { client_id_param: string }
        Returns: boolean
      }
      is_client_admin_secure: {
        Args: { client_id: string }
        Returns: boolean
      }
      is_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin_base: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin_direct: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin_no_joins: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin_secure: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin_simple: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "staff"
      client_role: "client_admin" | "manager" | "supervisor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["superadmin", "admin", "staff"],
      client_role: ["client_admin", "manager", "supervisor"],
    },
  },
} as const
