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
      alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: Database["public"]["Enums"]["alert_type"]
          description: string | null
          id: string
          resolved_at: string | null
          sensor_id: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          status: Database["public"]["Enums"]["alert_status"] | null
          title: string
          triggered_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: Database["public"]["Enums"]["alert_type"]
          description?: string | null
          id?: string
          resolved_at?: string | null
          sensor_id?: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["alert_status"] | null
          title: string
          triggered_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: Database["public"]["Enums"]["alert_type"]
          description?: string | null
          id?: string
          resolved_at?: string | null
          sensor_id?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["alert_status"] | null
          title?: string
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          address: string
          created_at: string | null
          id: string
          location: unknown | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          location?: unknown | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          location?: unknown | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      issue_tickets: {
        Row: {
          ai_analysis: string | null
          alert_id: string | null
          assigned_to: string | null
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          details: string | null
          id: string
          status: Database["public"]["Enums"]["ticket_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_analysis?: string | null
          alert_id?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          details?: string | null
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_analysis?: string | null
          alert_id?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          details?: string | null
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_tickets_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          building_id: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          building_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          building_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          id: string
          read_at: string | null
          sensor_id: string
          value: number
        }
        Insert: {
          id?: string
          read_at?: string | null
          sensor_id: string
          value: number
        }
        Update: {
          id?: string
          read_at?: string | null
          sensor_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      sensors: {
        Row: {
          building_id: string
          created_at: string | null
          id: string
          location_detail: string | null
          name: string
          type: Database["public"]["Enums"]["sensor_type"]
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          building_id: string
          created_at?: string | null
          id?: string
          location_detail?: string | null
          name: string
          type: Database["public"]["Enums"]["sensor_type"]
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          building_id?: string
          created_at?: string | null
          id?: string
          location_detail?: string | null
          name?: string
          type?: Database["public"]["Enums"]["sensor_type"]
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensors_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          file_type: string | null
          file_url: string
          id: string
          ticket_id: string
          uploaded_at: string | null
        }
        Insert: {
          file_type?: string | null
          file_url: string
          id?: string
          ticket_id: string
          uploaded_at?: string | null
        }
        Update: {
          file_type?: string | null
          file_url?: string
          id?: string
          ticket_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "issue_tickets"
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
      alert_status: "NEW" | "ACKNOWLEDGED" | "RESOLVED"
      alert_type: "THRESHOLD" | "ANOMALY" | "FACILITY_ERROR"
      sensor_type:
        | "ENERGY"
        | "TEMP"
        | "HUMIDITY"
        | "CO2"
        | "DOOR_STATUS"
        | "ELEVATOR_STATUS"
        | "CHARGER_STATUS"
      severity_level: "CRITICAL" | "WARNING" | "INFO"
      ticket_status: "OPEN" | "IN_PROGRESS" | "CLOSED"
      user_role: "AGENT" | "MANAGER" | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
