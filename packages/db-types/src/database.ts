
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "app_settings": {
                  Row: {
                    "description": string | null,"is_public": boolean,"key": string,"updated_at": string,"updated_by": string | null,"value": NonNullable<Json>,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string | null,"is_public"?: boolean,"key": string,"updated_at"?: string,"updated_by"?: string | null,"value": NonNullable<Json>,"version"?: number
                  }
                  Update: {
                    "description"?: string | null,"is_public"?: boolean,"key"?: string,"updated_at"?: string,"updated_by"?: string | null,"value"?: NonNullable<Json>,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "app_settings_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"areas": {
                  Row: {
                    "id": string,"name_ar": string,"name_en": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"name_ar": string,"name_en": string,"slug": string
                  }
                  Update: {
                    "id"?: string,"name_ar"?: string,"name_en"?: string,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"audit_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"after_json": Json | null,"before_json": Json | null,"entity": string,"entity_id": string,"id": number,"reason": string | null,"ts": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"after_json"?: Json | null,"before_json"?: Json | null,"entity": string,"entity_id": string,"id"?: never,"reason"?: string | null,"ts"?: string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"after_json"?: Json | null,"before_json"?: Json | null,"entity"?: string,"entity_id"?: string,"id"?: never,"reason"?: string | null,"ts"?: string
                  }
                  Relationships: [
                    
                  ]
                },"compounds": {
                  Row: {
                    "area_id": string,"id": string,"name_ar": string,"name_en": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "area_id": string,"id"?: string,"name_ar": string,"name_en": string,"slug": string
                  }
                  Update: {
                    "area_id"?: string,"id"?: string,"name_ar"?: string,"name_en"?: string,"slug"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "compounds_area_id_fkey"
      columns: ["area_id"]
isOneToOne: false
      referencedRelation: "areas"
      referencedColumns: ["id"]
    }
                  ]
                },"kyc_submissions": {
                  Row: {
                    "back_path": string,"decided_at": string | null,"decided_by": string | null,"front_path": string,"id": string,"reject_reason": string | null,"selfie_path": string,"status": Database["public"]['Enums']["kyc_status"],"submitted_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "back_path": string,"decided_at"?: string | null,"decided_by"?: string | null,"front_path": string,"id"?: string,"reject_reason"?: string | null,"selfie_path": string,"status"?: Database["public"]['Enums']["kyc_status"],"submitted_at"?: string,"user_id": string
                  }
                  Update: {
                    "back_path"?: string,"decided_at"?: string | null,"decided_by"?: string | null,"front_path"?: string,"id"?: string,"reject_reason"?: string | null,"selfie_path"?: string,"status"?: Database["public"]['Enums']["kyc_status"],"submitted_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "kyc_submissions_decided_by_fkey"
      columns: ["decided_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "kyc_submissions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"id": string,"kyc_tier": Database["public"]['Enums']["kyc_tier"],"locale": string,"name_ar": string | null,"name_en": string | null,"phone": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id": string,"kyc_tier"?: Database["public"]['Enums']["kyc_tier"],"locale"?: string,"name_ar"?: string | null,"name_en"?: string | null,"phone": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"kyc_tier"?: Database["public"]['Enums']["kyc_tier"],"locale"?: string,"name_ar"?: string | null,"name_en"?: string | null,"phone"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"properties": {
                  Row: {
                    "area_id": string | null,"area_sqm": number | null,"bedrooms": number | null,"compound_id": string | null,"created_at": string,"id": string,"kind": string,"owner_id": string,"title_ar": string | null,"title_en": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "area_id"?: string | null,"area_sqm"?: number | null,"bedrooms"?: number | null,"compound_id"?: string | null,"created_at"?: string,"id"?: string,"kind"?: string,"owner_id": string,"title_ar"?: string | null,"title_en"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "area_id"?: string | null,"area_sqm"?: number | null,"bedrooms"?: number | null,"compound_id"?: string | null,"created_at"?: string,"id"?: string,"kind"?: string,"owner_id"?: string,"title_ar"?: string | null,"title_en"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "properties_area_id_fkey"
      columns: ["area_id"]
isOneToOne: false
      referencedRelation: "areas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "properties_compound_id_fkey"
      columns: ["compound_id"]
isOneToOne: false
      referencedRelation: "compounds"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "properties_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_roles": {
                  Row: {
                    "created_at": string,"granted_by": string | null,"role": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"granted_by"?: string | null,"role": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"granted_by"?: string | null,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_roles_granted_by_fkey"
      columns: ["granted_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_roles_user_id_fkey"
      columns: ["user_id"]
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
            "admin_decide_kyc":
{ Args: { "p_approve": boolean,"p_reason"?: string,"p_submission": string }; Returns: {
              "back_path": string,
"decided_at": string | null,
"decided_by": string | null,
"front_path": string,
"id": string,
"reject_reason": string | null,
"selfie_path": string,
"status": Database["public"]['Enums']["kyc_status"],
"submitted_at": string,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "kyc_submissions"
        isOneToOne: true
        isSetofReturn: false
      } },
"dev_sms_inbox":
{ Args: { "p_phone": string }; Returns: string
                           },
"kyc_submit":
{ Args: { "p_back": string,"p_front": string,"p_selfie": string }; Returns: {
              "back_path": string,
"decided_at": string | null,
"decided_by": string | null,
"front_path": string,
"id": string,
"reject_reason": string | null,
"selfie_path": string,
"status": Database["public"]['Enums']["kyc_status"],
"submitted_at": string,
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "kyc_submissions"
        isOneToOne: true
        isSetofReturn: false
      } }
          }
          Enums: {
            "kyc_status": "pending"|"approved"|"rejected","kyc_tier": "T0"|"T1"|"T2"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "kyc_status": ["pending", "approved", "rejected"],"kyc_tier": ["T0", "T1", "T2"]
          }
        }
} as const
