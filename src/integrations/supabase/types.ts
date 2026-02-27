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
      profiles: {
        Row: {
          allergies_detail: string | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          discord: string | null
          dietary: string | null
          drinks_beer: string | null
          expectations: string | null
          feedback: string | null
          first_name: string
          id: string
          is_judge: boolean
          is_organizer: boolean
          languages: string[] | null
          last_name: string
          linkedin: string | null
          looking_for: string[] | null
          meat_preference: string | null
          onboarding_completed: boolean
          points: number
          role: string | null
          skills: string[] | null
          staying_overnight: string | null
          team_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies_detail?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          discord?: string | null
          dietary?: string | null
          drinks_beer?: string | null
          expectations?: string | null
          feedback?: string | null
          first_name?: string
          id?: string
          is_judge?: boolean
          is_organizer?: boolean
          languages?: string[] | null
          last_name?: string
          linkedin?: string | null
          looking_for?: string[] | null
          meat_preference?: string | null
          onboarding_completed?: boolean
          points?: number
          role?: string | null
          skills?: string[] | null
          staying_overnight?: string | null
          team_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies_detail?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          discord?: string | null
          dietary?: string | null
          drinks_beer?: string | null
          expectations?: string | null
          feedback?: string | null
          first_name?: string
          id?: string
          is_judge?: boolean
          is_organizer?: boolean
          languages?: string[] | null
          last_name?: string
          linkedin?: string | null
          looking_for?: string[] | null
          meat_preference?: string | null
          onboarding_completed?: boolean
          points?: number
          role?: string | null
          skills?: string[] | null
          staying_overnight?: string | null
          team_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_applications: {
        Row: {
          created_at: string
          id: string
          status: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_applications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string
          id: string
          leader_id: string
          max_members: number
          name: string
          openai_org_id: string | null
          skills_needed: string[]
          track: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          leader_id: string
          max_members?: number
          name: string
          openai_org_id?: string | null
          skills_needed?: string[]
          track: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          leader_id?: string
          max_members?: number
          name?: string
          openai_org_id?: string | null
          skills_needed?: string[]
          track?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          team_id: string
          title: string
          tagline: string
          description: string | null
          demo_url: string | null
          repo_url: string | null
          track: string
          tech_stack: string[]
          submitted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          title: string
          tagline: string
          description?: string | null
          demo_url?: string | null
          repo_url?: string | null
          track: string
          tech_stack?: string[]
          submitted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          title?: string
          tagline?: string
          description?: string | null
          demo_url?: string | null
          repo_url?: string | null
          track?: string
          tech_stack?: string[]
          submitted_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_feed: {
        Row: {
          id: string
          type: string
          actor_name: string
          detail: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          actor_name: string
          detail?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          actor_name?: string
          detail?: string | null
          created_at?: string
        }
        Relationships: []
      }
      judge_scores: {
        Row: {
          id: string
          judge_id: string
          project_id: string
          conversation_ux: number | null
          task_autonomy: number | null
          memory_adaptivity: number | null
          real_world_impact: number | null
          technical_depth: number | null
          partner_utilisation: number | null
          product_story: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          judge_id: string
          project_id: string
          conversation_ux?: number | null
          task_autonomy?: number | null
          memory_adaptivity?: number | null
          real_world_impact?: number | null
          technical_depth?: number | null
          partner_utilisation?: number | null
          product_story?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          judge_id?: string
          project_id?: string
          conversation_ux?: number | null
          task_autonomy?: number | null
          memory_adaptivity?: number | null
          real_world_impact?: number | null
          technical_depth?: number | null
          partner_utilisation?: number | null
          product_story?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "judge_scores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          id: string
          title: string
          body: string
          pinned: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          pinned?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          pinned?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
