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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_plans: {
        Row: {
          agent_id: string
          created_at: string
          ends_at: string | null
          id: string
          plan_id: string
          starts_at: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_id: string
          starts_at?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_plans_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_usage: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          order_count: number
          period_end: string
          period_start: string
          storage_bytes: number
          tenant_count: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          order_count?: number
          period_end: string
          period_start: string
          storage_bytes?: number
          tenant_count?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          order_count?: number
          period_end?: string
          period_start?: string
          storage_bytes?: number
          tenant_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_usage_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          owner_user_id: string | null
          plan_id: string | null
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          tenant_quota: number
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          owner_user_id?: string | null
          plan_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          tenant_quota?: number
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          owner_user_id?: string | null
          plan_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          tenant_quota?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          link_href: string | null
          link_label: string | null
          locale: string
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          link_href?: string | null
          link_label?: string | null
          locale?: string
          message: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          link_href?: string | null
          link_label?: string | null
          locale?: string
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          context: Json | null
          created_at: string
          id: string
          module: string
          record_id: string | null
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          context?: Json | null
          created_at?: string
          id?: string
          module: string
          record_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          context?: Json | null
          created_at?: string
          id?: string
          module?: string
          record_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          created_at: string
          description: string | null
          detail_html: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          sort_order: number
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          detail_html?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          detail_html?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "awards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          brand_id: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          deleted_at: string | null
          directions_url: string | null
          gallery: Json
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          map_embed_url: string | null
          name: string
          opening_hours: Json
          phone: string | null
          slug: string
          socials: Json
          sort_order: number
          tenant_id: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          brand_id?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          deleted_at?: string | null
          directions_url?: string | null
          gallery?: Json
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          map_embed_url?: string | null
          name: string
          opening_hours?: Json
          phone?: string | null
          slug: string
          socials?: Json
          sort_order?: number
          tenant_id: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          brand_id?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          deleted_at?: string | null
          directions_url?: string | null
          gallery?: Json
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          map_embed_url?: string | null
          name?: string
          opening_hours?: Json
          phone?: string | null
          slug?: string
          socials?: Json
          sort_order?: number
          tenant_id?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          cover_image_url: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          badge: string | null
          branch_id: string | null
          category: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          ends_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          slug: string
          sort_order: number
          starts_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          branch_id?: string | null
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          slug: string
          sort_order?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          branch_id?: string | null
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          slug?: string
          sort_order?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      galleries: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          items: Json
          name: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          items?: Json
          name: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          items?: Json
          name?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "galleries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          locale: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          locale?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          locale?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      landing_features: {
        Row: {
          created_at: string
          description: string | null
          detail_html: string | null
          icon: string | null
          id: string
          is_active: boolean
          locale: string
          section_key: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          detail_html?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          locale?: string
          section_key?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          detail_html?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          locale?: string
          section_key?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      landing_sections: {
        Row: {
          body: string | null
          config: Json
          created_at: string
          eyebrow: string | null
          id: string
          is_active: boolean
          key: string
          locale: string
          media_url: string | null
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          config?: Json
          created_at?: string
          eyebrow?: string | null
          id?: string
          is_active?: boolean
          key: string
          locale?: string
          media_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          config?: Json
          created_at?: string
          eyebrow?: string | null
          id?: string
          is_active?: boolean
          key?: string
          locale?: string
          media_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          flag: string | null
          is_active: boolean
          is_default: boolean
          name: string
          native_name: string
          sort_order: number
        }
        Insert: {
          code: string
          flag?: string | null
          is_active?: boolean
          is_default?: boolean
          name: string
          native_name: string
          sort_order?: number
        }
        Update: {
          code?: string
          flag?: string | null
          is_active?: boolean
          is_default?: boolean
          name?: string
          native_name?: string
          sort_order?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          plan_slug: string | null
          source: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          plan_slug?: string | null
          source?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          plan_slug?: string | null
          source?: string
        }
        Relationships: []
      }
      localized_content: {
        Row: {
          created_at: string
          entity_id: string
          entity_table: string
          field: string
          id: string
          locale: string
          tenant_id: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_table: string
          field: string
          id?: string
          locale: string
          tenant_id?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_table?: string
          field?: string
          id?: string
          locale?: string
          tenant_id?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "localized_content_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "localized_content_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          folder_id: string | null
          height: number | null
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          tenant_id: string
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          folder_id?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          tenant_id: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          folder_id?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          tenant_id?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      media_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_folders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_products: {
        Row: {
          id: string
          menu_id: string
          product_id: string
          quantity: number
          sort_order: number
          tenant_id: string
        }
        Insert: {
          id?: string
          menu_id: string
          product_id: string
          quantity?: number
          sort_order?: number
          tenant_id: string
        }
        Update: {
          id?: string
          menu_id?: string
          product_id?: string
          quantity?: number
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_products_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          badges: Json
          category_id: string | null
          created_at: string
          currency: string
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_special: boolean
          name: string
          price: number
          short_description: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          badges?: Json
          category_id?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_special?: boolean
          name: string
          price?: number
          short_description?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          badges?: Json
          category_id?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_special?: boolean
          name?: string
          price?: number
          short_description?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menus_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          href: string | null
          id: string
          is_read: boolean
          tenant_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          is_read?: boolean
          tenant_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          is_read?: boolean
          tenant_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          menu_id: string | null
          note: string | null
          order_id: string
          product_id: string | null
          quantity: number
          tenant_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          menu_id?: string | null
          note?: string | null
          order_id: string
          product_id?: string | null
          quantity?: number
          tenant_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          menu_id?: string | null
          note?: string | null
          order_id?: string
          product_id?: string | null
          quantity?: number
          tenant_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          order_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          order_id: string
          status: string
          tenant_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          order_id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_id: string | null
          code: string
          created_at: string
          currency: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          note: string | null
          status: string
          table_no: string | null
          tenant_id: string
          total: number
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          code?: string
          created_at?: string
          currency?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          note?: string | null
          status?: string
          table_no?: string | null
          tenant_id: string
          total?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          code?: string
          created_at?: string
          currency?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          note?: string | null
          status?: string
          table_no?: string | null
          tenant_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          key: string
          module: string
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          module: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          module?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_included: boolean
          key: string
          label: string
          plan_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_included?: boolean
          key: string
          label: string
          plan_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_included?: boolean
          key?: string
          label?: string
          plan_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          created_at: string
          id: string
          key: string
          limit_value: number | null
          plan_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          limit_value?: number | null
          plan_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          limit_value?: number | null
          plan_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_limits_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          is_active: boolean
          is_featured: boolean
          kind: Database["public"]["Enums"]["plan_kind"]
          limits: Json
          name: string
          price_monthly: number
          price_yearly: number | null
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          kind: Database["public"]["Enums"]["plan_kind"]
          limits?: Json
          name: string
          price_monthly?: number
          price_yearly?: number | null
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          kind?: Database["public"]["Enums"]["plan_kind"]
          limits?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plugin_assignments: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          is_enabled: boolean
          plan_id: string | null
          plugin_id: string
          settings: Json
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          plan_id?: string | null
          plugin_id: string
          settings?: Json
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          plan_id?: string | null
          plugin_id?: string
          settings?: Json
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_assignments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_assignments_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          plugin_id: string
          tenant_id: string | null
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          plugin_id: string
          tenant_id?: string | null
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          plugin_id?: string
          tenant_id?: string | null
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "plugin_settings_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plugins: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          manifest: Json
          name: string
          permissions: Json
          price: number
          scope: string
          slug: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manifest?: Json
          name: string
          permissions?: Json
          price?: number
          scope: string
          slug: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manifest?: Json
          name?: string
          permissions?: Json
          price?: number
          scope?: string
          slug?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      post_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          badge: string | null
          badge_position: string
          category_id: string | null
          content: string | null
          created_at: string
          deleted_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tenant_id: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          badge?: string | null
          badge_position?: string
          category_id?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tenant_id: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          badge?: string | null
          badge_position?: string
          category_id?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "post_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_features: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          label: string
          product_id: string | null
          show_on_card: boolean
          sort_order: number
          tenant_id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          label: string
          product_id?: string | null
          show_on_card?: boolean
          sort_order?: number
          tenant_id: string
          value?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          product_id?: string | null
          show_on_card?: boolean
          sort_order?: number
          tenant_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_features_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_features_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string
          group_label: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          price_delta: number
          product_id: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_label: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          price_delta?: number
          product_id: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_label?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          price_delta?: number
          product_id?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_options_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badges: Json
          category_id: string | null
          created_at: string
          currency: string
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_special: boolean
          name: string
          price: number
          short_description: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          badges?: Json
          category_id?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_special?: boolean
          name: string
          price?: number
          short_description?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          badges?: Json
          category_id?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_special?: boolean
          name?: string
          price?: number
          short_description?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          locale: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          locale?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          locale?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          key: Database["public"]["Enums"]["app_role"]
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key: Database["public"]["Enums"]["app_role"]
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key?: Database["public"]["Enums"]["app_role"]
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_navigation: {
        Row: {
          created_at: string
          href: string
          id: string
          is_active: boolean
          label: string
          sort_order: number
          target: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          target?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          target?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_navigation_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      site_sections: {
        Row: {
          body: string | null
          config: Json
          created_at: string
          eyebrow: string | null
          id: string
          is_active: boolean
          key: string
          sort_order: number
          subtitle: string | null
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          config?: Json
          created_at?: string
          eyebrow?: string | null
          id?: string
          is_active?: boolean
          key: string
          sort_order?: number
          subtitle?: string | null
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          config?: Json
          created_at?: string
          eyebrow?: string | null
          id?: string
          is_active?: boolean
          key?: string
          sort_order?: number
          subtitle?: string | null
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          accent_color: string | null
          address: string | null
          brand_color: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          favicon_url: string | null
          header_buttons: Json
          hero_image_url: string | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          map_embed_url: string | null
          og_image_url: string | null
          order_enabled: boolean
          order_settings: Json
          seo_description: string | null
          seo_title: string | null
          socials: Json
          tenant_id: string
          topbar: Json
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          brand_color?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          favicon_url?: string | null
          header_buttons?: Json
          hero_image_url?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          map_embed_url?: string | null
          og_image_url?: string | null
          order_enabled?: boolean
          order_settings?: Json
          seo_description?: string | null
          seo_title?: string | null
          socials?: Json
          tenant_id: string
          topbar?: Json
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          brand_color?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          favicon_url?: string | null
          header_buttons?: Json
          hero_image_url?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          map_embed_url?: string | null
          og_image_url?: string | null
          order_enabled?: boolean
          order_settings?: Json
          seo_description?: string | null
          seo_title?: string | null
          socials?: Json
          tenant_id?: string
          topbar?: Json
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          custom_domain: string | null
          default_locale: string
          deleted_at: string | null
          id: string
          is_published: boolean
          kind: string
          published_at: string | null
          slug: string
          tenant_id: string
          theme_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          default_locale?: string
          deleted_at?: string | null
          id?: string
          is_published?: boolean
          kind: string
          published_at?: string | null
          slug: string
          tenant_id: string
          theme_key?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          default_locale?: string
          deleted_at?: string | null
          id?: string
          is_published?: boolean
          kind?: string
          published_at?: string | null
          slug?: string
          tenant_id?: string
          theme_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_default_locale_fkey"
            columns: ["default_locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "sites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      slides: {
        Row: {
          button_href: string | null
          button_label: string | null
          button_target: string
          created_at: string
          description: string | null
          eyebrow: string | null
          id: string
          image_url: string | null
          is_active: boolean
          sort_order: number
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          button_href?: string | null
          button_label?: string | null
          button_target?: string
          created_at?: string
          description?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_href?: string | null
          button_label?: string | null
          button_target?: string
          created_at?: string
          description?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slides_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          agent_id: string | null
          created_at: string
          ends_at: string | null
          id: string
          plan_id: string
          started_at: string
          status: Database["public"]["Enums"]["entity_status"]
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["entity_status"]
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          plan_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["entity_status"]
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          is_public?: boolean
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      tenant_settings: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          key: string
          tenant_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          key: string
          tenant_id: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          key?: string
          tenant_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          agent_id: string | null
          created_at: string
          custom_domain: string | null
          default_locale: string
          deleted_at: string | null
          id: string
          is_published: boolean
          menu_theme: string
          name: string
          owner_user_id: string | null
          plan_id: string | null
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_theme: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          custom_domain?: string | null
          default_locale?: string
          deleted_at?: string | null
          id?: string
          is_published?: boolean
          menu_theme?: string
          name: string
          owner_user_id?: string | null
          plan_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_theme?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          custom_domain?: string | null
          default_locale?: string
          deleted_at?: string | null
          id?: string
          is_published?: boolean
          menu_theme?: string
          name?: string
          owner_user_id?: string | null
          plan_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_assignments: {
        Row: {
          created_at: string
          id: string
          plan_id: string | null
          tenant_id: string | null
          theme_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id?: string | null
          tenant_id?: string | null
          theme_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string | null
          tenant_id?: string | null
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_assignments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theme_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theme_assignments_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          tenant_id: string | null
          theme_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          tenant_id?: string | null
          theme_id: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          tenant_id?: string | null
          theme_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "theme_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theme_settings_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          preview_image_url: string | null
          price: number
          scope: Database["public"]["Enums"]["theme_scope"]
          slug: string
          updated_at: string
          version: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          preview_image_url?: string | null
          price?: number
          scope: Database["public"]["Enums"]["theme_scope"]
          slug: string
          updated_at?: string
          version?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          preview_image_url?: string | null
          price?: number
          scope?: Database["public"]["Enums"]["theme_scope"]
          slug?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          created_at: string
          id: string
          key: string
          locale: string
          namespace: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          locale: string
          namespace?: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          locale?: string
          namespace?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      user_roles: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      agent_effective_plan_id: { Args: { _agent_id: string }; Returns: string }
      agent_usage_summary: {
        Args: { _agent_id: string }
        Returns: {
          key: string
          limit_value: number
          used: number
        }[]
      }
      can_manage_tenant: { Args: { _tenant_id: string }; Returns: boolean }
      has_permission: { Args: { _key: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_tenant_access: { Args: { _tenant_id: string }; Returns: boolean }
      increment_post_views: { Args: { _post_id: string }; Returns: undefined }
      is_agent: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_tenant_published: { Args: { _tenant_id: string }; Returns: boolean }
      my_agent_ids: { Args: never; Returns: string[] }
      my_permissions: { Args: never; Returns: string[] }
      my_tenant_ids: { Args: never; Returns: string[] }
      plan_feature_enabled: {
        Args: { _key: string; _plan_id: string }
        Returns: boolean
      }
      plan_limit: { Args: { _key: string; _plan_id: string }; Returns: number }
      tenant_effective_plan_id: {
        Args: { _tenant_id: string }
        Returns: string
      }
      tenant_feature_enabled: {
        Args: { _key: string; _tenant_id: string }
        Returns: boolean
      }
      tenant_limit: {
        Args: { _key: string; _tenant_id: string }
        Returns: number
      }
      tenant_usage: {
        Args: { _tenant_id: string }
        Returns: {
          key: string
          limit_value: number
          used: number
        }[]
      }
    }
    Enums: {
      app_role: "super_admin" | "agent" | "tenant_owner" | "tenant_staff"
      content_status: "draft" | "published" | "archived"
      entity_status: "active" | "suspended" | "pending" | "cancelled"
      plan_kind: "agent" | "tenant"
      theme_scope: "superadmin" | "restaurant" | "menu"
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
      app_role: ["super_admin", "agent", "tenant_owner", "tenant_staff"],
      content_status: ["draft", "published", "archived"],
      entity_status: ["active", "suspended", "pending", "cancelled"],
      plan_kind: ["agent", "tenant"],
      theme_scope: ["superadmin", "restaurant", "menu"],
    },
  },
} as const
