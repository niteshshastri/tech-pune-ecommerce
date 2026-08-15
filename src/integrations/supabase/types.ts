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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      business_settings: {
        Row: {
          about_text: string | null
          address: string | null
          business_hours: string | null
          business_name: string
          cancellation_policy: string | null
          delivery_fee: number
          delivery_policy: string | null
          email: string | null
          facebook_url: string | null
          google_maps_url: string | null
          gst_number: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          phone: string | null
          privacy_policy: string | null
          refund_policy: string | null
          singleton: boolean
          tagline: string | null
          terms: string | null
          updated_at: string
          upi_id: string | null
          upi_payee_name: string | null
          upi_qr_url: string | null
          warranty_policy: string | null
          whatsapp: string | null
          youtube_url: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          business_hours?: string | null
          business_name?: string
          cancellation_policy?: string | null
          delivery_fee?: number
          delivery_policy?: string | null
          email?: string | null
          facebook_url?: string | null
          google_maps_url?: string | null
          gst_number?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          phone?: string | null
          privacy_policy?: string | null
          refund_policy?: string | null
          singleton?: boolean
          tagline?: string | null
          terms?: string | null
          updated_at?: string
          upi_id?: string | null
          upi_payee_name?: string | null
          upi_qr_url?: string | null
          warranty_policy?: string | null
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          business_hours?: string | null
          business_name?: string
          cancellation_policy?: string | null
          delivery_fee?: number
          delivery_policy?: string | null
          email?: string | null
          facebook_url?: string | null
          google_maps_url?: string | null
          gst_number?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          phone?: string | null
          privacy_policy?: string | null
          refund_policy?: string | null
          singleton?: boolean
          tagline?: string | null
          terms?: string | null
          updated_at?: string
          upi_id?: string | null
          upi_payee_name?: string | null
          upi_qr_url?: string | null
          warranty_policy?: string | null
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_archived: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_archived?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_archived?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          product_slug: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          product_slug?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_slug?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line1: string
          address_line2: string | null
          admin_notes: string | null
          city: string
          created_at: string
          customer_name: string
          delivery_fee: number
          email: string | null
          id: string
          notes: string | null
          order_number: string
          order_status: Database["public"]["Enums"]["order_state"]
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_state"]
          phone: string
          pincode: string
          state: string
          subtotal: number
          total: number
          updated_at: string
          upi_reference: string | null
          user_id: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          admin_notes?: string | null
          city: string
          created_at?: string
          customer_name: string
          delivery_fee?: number
          email?: string | null
          id?: string
          notes?: string | null
          order_number: string
          order_status?: Database["public"]["Enums"]["order_state"]
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_state"]
          phone: string
          pincode: string
          state?: string
          subtotal?: number
          total?: number
          updated_at?: string
          upi_reference?: string | null
          user_id?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          admin_notes?: string | null
          city?: string
          created_at?: string
          customer_name?: string
          delivery_fee?: number
          email?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_state"]
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_state"]
          phone?: string
          pincode?: string
          state?: string
          subtotal?: number
          total?: number
          updated_at?: string
          upi_reference?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          order_id: string
          provider: string
          reference: string | null
          status: Database["public"]["Enums"]["payment_state"]
          submitted_at: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          provider?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_state"]
          submitted_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          provider?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_state"]
          submitted_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          storage_path: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          storage_path: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          storage_path?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          compare_at_price: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_archived: boolean
          is_bestseller: boolean
          is_featured: boolean
          low_stock_threshold: number
          name: string
          needs_review: boolean
          price: number
          short_description: string | null
          slug: string
          specs: Json
          stock_quantity: number
          stock_state: Database["public"]["Enums"]["stock_state"]
          updated_at: string
          warranty: string | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_archived?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          low_stock_threshold?: number
          name: string
          needs_review?: boolean
          price: number
          short_description?: string | null
          slug: string
          specs?: Json
          stock_quantity?: number
          stock_state?: Database["public"]["Enums"]["stock_state"]
          updated_at?: string
          warranty?: string | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_archived?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          low_stock_threshold?: number
          name?: string
          needs_review?: boolean
          price?: number
          short_description?: string | null
          slug?: string
          specs?: Json
          stock_quantity?: number
          stock_state?: Database["public"]["Enums"]["stock_state"]
          updated_at?: string
          warranty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_order: {
        Args: {
          _address_line1: string
          _address_line2: string
          _city: string
          _customer_name: string
          _email: string
          _items: Json
          _notes: string
          _phone: string
          _pincode: string
          _state: string
          _user_id: string
        }
        Returns: {
          order_id: string
          order_number: string
          total: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      order_state:
        | "payment_pending"
        | "verification_pending"
        | "paid"
        | "processing"
        | "ready_for_delivery"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_state:
        | "payment_pending"
        | "verification_pending"
        | "paid"
        | "refunded"
        | "failed"
      product_condition: "new" | "refurbished" | "used"
      stock_state: "unverified" | "in_stock" | "out_of_stock"
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
      app_role: ["admin", "customer"],
      order_state: [
        "payment_pending",
        "verification_pending",
        "paid",
        "processing",
        "ready_for_delivery",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_state: [
        "payment_pending",
        "verification_pending",
        "paid",
        "refunded",
        "failed",
      ],
      product_condition: ["new", "refurbished", "used"],
      stock_state: ["unverified", "in_stock", "out_of_stock"],
    },
  },
} as const
