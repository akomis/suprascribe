export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      DISCOVERY_RUNS: {
        Row: {
          discovered_at: string
          email_address: string
          id: string
          is_byok: boolean
          provider: string
          subscriptions_found: number
          user_id: string
        }
        Insert: {
          discovered_at?: string
          email_address: string
          id?: string
          is_byok?: boolean
          provider: string
          subscriptions_found?: number
          user_id: string
        }
        Update: {
          discovered_at?: string
          email_address?: string
          id?: string
          is_byok?: boolean
          provider?: string
          subscriptions_found?: number
          user_id?: string
        }
        Relationships: []
      }
      SUBSCRIPTION_SERVICES: {
        Row: {
          category: Database['public']['Enums']['SUBSCRIPTION_CATEGORY']
          domains: string[] | null
          id: number
          name: string | null
          unsubscribe_url: string | null
          url: string | null
        }
        Insert: {
          category?: Database['public']['Enums']['SUBSCRIPTION_CATEGORY']
          domains?: string[] | null
          id?: number
          name?: string | null
          unsubscribe_url?: string | null
          url?: string | null
        }
        Update: {
          category?: Database['public']['Enums']['SUBSCRIPTION_CATEGORY']
          domains?: string[] | null
          id?: number
          name?: string | null
          unsubscribe_url?: string | null
          url?: string | null
        }
        Relationships: []
      }
      USER_API_KEYS: {
        Row: {
          created_at: string | null
          encrypted_key: string
          id: string
          key_hint: string | null
          model: string
          provider: string
          updated_at: string | null
          user_id: string
          validated_at: string | null
        }
        Insert: {
          created_at?: string | null
          encrypted_key: string
          id?: string
          key_hint?: string | null
          model: string
          provider: string
          updated_at?: string | null
          user_id: string
          validated_at?: string | null
        }
        Update: {
          created_at?: string | null
          encrypted_key?: string
          id?: string
          key_hint?: string | null
          model?: string
          provider?: string
          updated_at?: string | null
          user_id?: string
          validated_at?: string | null
        }
        Relationships: []
      }
      USER_SETTINGS: {
        Row: {
          active_key_id: string | null
          email_reminders_enabled: boolean | null
          reminder_days_before: number | null
          tier: Database['public']['Enums']['TIER_TYPE']
          user_id: string
        }
        Insert: {
          active_key_id?: string | null
          email_reminders_enabled?: boolean | null
          reminder_days_before?: number | null
          tier?: Database['public']['Enums']['TIER_TYPE']
          user_id: string
        }
        Update: {
          active_key_id?: string | null
          email_reminders_enabled?: boolean | null
          reminder_days_before?: number | null
          tier?: Database['public']['Enums']['TIER_TYPE']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'USER_SETTINGS_active_key_id_fkey'
            columns: ['active_key_id']
            isOneToOne: false
            referencedRelation: 'USER_API_KEYS'
            referencedColumns: ['id']
          },
        ]
      }
      USER_SUBSCRIPTIONS: {
        Row: {
          auto_renew: boolean
          created_at: string
          currency: Database['public']['Enums']['CURRENCY_CODE']
          end_date: string | null
          id: number
          payment_method: string | null
          price: number | null
          source_email: string | null
          start_date: string | null
          subscription_service_id: number
          user_id: string | null
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          currency?: Database['public']['Enums']['CURRENCY_CODE']
          end_date?: string | null
          id?: number
          payment_method?: string | null
          price?: number | null
          source_email?: string | null
          start_date?: string | null
          subscription_service_id: number
          user_id?: string | null
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          currency?: Database['public']['Enums']['CURRENCY_CODE']
          end_date?: string | null
          id?: number
          payment_method?: string | null
          price?: number | null
          source_email?: string | null
          start_date?: string | null
          subscription_service_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'USER_SUBSCRIPTIONS_subscription_service_id_fkey'
            columns: ['subscription_service_id']
            isOneToOne: false
            referencedRelation: 'SUBSCRIPTION_SERVICES'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      process_subscription_renewals: {
        Args: never
        Returns: {
          renewed_count: number
          subscription_ids: number[]
        }[]
      }
    }
    Enums: {
      CURRENCY_CODE: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'INR' | 'KRW'
      SUBSCRIPTION_CATEGORY:
        | 'Entertainment'
        | 'Utilities'
        | 'Other'
        | 'AI'
        | 'Health & Wellness'
        | 'Food & Beverage'
        | 'Education'
        | 'News & Content'
        | 'Software'
        | 'Financial'
        | 'Transportation'
      TIER_TYPE: 'BASIC' | 'PRO'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      CURRENCY_CODE: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'KRW'],
      SUBSCRIPTION_CATEGORY: [
        'Entertainment',
        'Utilities',
        'Other',
        'AI',
        'Health & Wellness',
        'Food & Beverage',
        'Education',
        'News & Content',
        'Software',
        'Financial',
        'Transportation',
      ],
      TIER_TYPE: ['BASIC', 'PRO'],
    },
  },
} as const
