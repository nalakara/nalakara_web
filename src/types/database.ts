export type LifecycleStage = 'idea' | 'lab' | 'project' | 'product' | 'commercial';
export type AccessModel = 'concept' | 'private-alpha' | 'public-beta' | 'production' | 'commercial';
export type PublicationStatus = 'draft' | 'published' | 'archived';
export type HeroMode = 'studio' | 'featured_initiative';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name_en: string;
          name_id: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name_en: string;
          name_id: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_id?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      initiatives: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category_id: string;
          lifecycle_stage: LifecycleStage;
          access_model: AccessModel;
          tagline_en: string;
          tagline_id: string;
          description_en: string;
          description_id: string;
          target_url: string | null;
          is_external: boolean;
          featured: boolean;
          sort_order: number;
          publication_status: PublicationStatus;
          commercial_badge_en: string | null;
          commercial_badge_id: string | null;
          commercial_action_en: string | null;
          commercial_action_id: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id: string;
          slug: string;
          name: string;
          category_id: string;
          lifecycle_stage?: LifecycleStage;
          access_model?: AccessModel;
          tagline_en: string;
          tagline_id: string;
          description_en: string;
          description_id: string;
          target_url?: string | null;
          is_external?: boolean;
          featured?: boolean;
          sort_order?: number;
          publication_status?: PublicationStatus;
          commercial_badge_en?: string | null;
          commercial_badge_id?: string | null;
          commercial_action_en?: string | null;
          commercial_action_id?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          category_id?: string;
          lifecycle_stage?: LifecycleStage;
          access_model?: AccessModel;
          tagline_en?: string;
          tagline_id?: string;
          description_en?: string;
          description_id?: string;
          target_url?: string | null;
          is_external?: boolean;
          featured?: boolean;
          sort_order?: number;
          publication_status?: PublicationStatus;
          commercial_badge_en?: string | null;
          commercial_badge_id?: string | null;
          commercial_action_en?: string | null;
          commercial_action_id?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "initiatives_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      studio_principles: {
        Row: {
          id: string;
          number: string;
          title_en: string;
          title_id: string;
          description_en: string;
          description_id: string;
          sort_order: number;
          publication_status: PublicationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          number: string;
          title_en: string;
          title_id: string;
          description_en: string;
          description_id: string;
          sort_order?: number;
          publication_status?: PublicationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          number?: string;
          title_en?: string;
          title_id?: string;
          description_en?: string;
          description_id?: string;
          sort_order?: number;
          publication_status?: PublicationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hero_config: {
        Row: {
          id: string;
          mode: HeroMode;
          featured_initiative_id: string | null;
          show_lifecycle_bar: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mode?: HeroMode;
          featured_initiative_id?: string | null;
          show_lifecycle_bar?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mode?: HeroMode;
          featured_initiative_id?: string | null;
          show_lifecycle_bar?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hero_config_featured_initiative_id_fkey";
            columns: ["featured_initiative_id"];
            isOneToOne: false;
            referencedRelation: "initiatives";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      lifecycle_stage: LifecycleStage;
      access_model: AccessModel;
      publication_status: PublicationStatus;
      hero_mode: HeroMode;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
