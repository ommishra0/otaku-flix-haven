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
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password_hash: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password_hash: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      anime: {
        Row: {
          anilist_id: number | null
          "anime.anilist_id": number | null
          banner_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_custom: boolean | null
          is_featured: boolean | null
          is_popular: boolean | null
          is_trending: boolean | null
          rating: number | null
          release_year: number | null
          status: string | null
          studio: string | null
          title: string
          tmdb_id: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          anilist_id?: number | null
          "anime.anilist_id"?: number | null
          banner_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_custom?: boolean | null
          is_featured?: boolean | null
          is_popular?: boolean | null
          is_trending?: boolean | null
          rating?: number | null
          release_year?: number | null
          status?: string | null
          studio?: string | null
          title: string
          tmdb_id?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          anilist_id?: number | null
          "anime.anilist_id"?: number | null
          banner_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_custom?: boolean | null
          is_featured?: boolean | null
          is_popular?: boolean | null
          is_trending?: boolean | null
          rating?: number | null
          release_year?: number | null
          status?: string | null
          studio?: string | null
          title?: string
          tmdb_id?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      anime_cast: {
        Row: {
          anime_id: string | null
          character_name: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          anime_id?: string | null
          character_name?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          anime_id?: string | null
          character_name?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anime_cast_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
        ]
      }
      anime_categories: {
        Row: {
          anime_id: string
          category_id: string
        }
        Insert: {
          anime_id: string
          category_id: string
        }
        Update: {
          anime_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_categories_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anime_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      anime_genres: {
        Row: {
          anime_id: string
          genre_id: string
        }
        Insert: {
          anime_id: string
          genre_id: string
        }
        Update: {
          anime_id?: string
          genre_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_genres_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anime_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      anime_ratings: {
        Row: {
          anime_id: string | null
          created_at: string | null
          id: string
          system: string
          updated_at: string | null
          value: string
        }
        Insert: {
          anime_id?: string | null
          created_at?: string | null
          id?: string
          system: string
          updated_at?: string | null
          value: string
        }
        Update: {
          anime_id?: string | null
          created_at?: string | null
          id?: string
          system?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_ratings_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
        ]
      }
      anime_trailers: {
        Row: {
          anime_id: string | null
          created_at: string | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          anime_id?: string | null
          created_at?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          anime_id?: string | null
          created_at?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_trailers_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          dislikes: number | null
          episode_id: string | null
          id: string
          is_highlighted: boolean | null
          is_pinned: boolean | null
          likes: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          dislikes?: number | null
          episode_id?: string | null
          id?: string
          is_highlighted?: boolean | null
          is_pinned?: boolean | null
          likes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          dislikes?: number | null
          episode_id?: string | null
          id?: string
          is_highlighted?: boolean | null
          is_pinned?: boolean | null
          likes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          air_date: string | null
          anime_id: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          embed_code: string | null
          embed_provider: string | null
          id: string
          import_status: string | null
          number: number
          quality_options: Json | null
          season_id: string | null
          season_number: number | null
          subtitles: Json | null
          thumbnail_url: string | null
          title: string
          tmdb_id: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          air_date?: string | null
          anime_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          embed_code?: string | null
          embed_provider?: string | null
          id?: string
          import_status?: string | null
          number: number
          quality_options?: Json | null
          season_id?: string | null
          season_number?: number | null
          subtitles?: Json | null
          thumbnail_url?: string | null
          title: string
          tmdb_id?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          air_date?: string | null
          anime_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          embed_code?: string | null
          embed_provider?: string | null
          id?: string
          import_status?: string | null
          number?: number
          quality_options?: Json | null
          season_id?: string | null
          season_number?: number | null
          subtitles?: Json | null
          thumbnail_url?: string | null
          title?: string
          tmdb_id?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string | null
          downvotes: number | null
          id: string
          is_best_answer: boolean | null
          topic_id: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_best_answer?: boolean | null
          topic_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_best_answer?: boolean | null
          topic_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          content: string
          created_at: string | null
          downvotes: number | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      genres: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      seasons: {
        Row: {
          air_date: string | null
          anime_id: string | null
          created_at: string | null
          id: string
          name: string
          overview: string | null
          poster_path: string | null
          season_number: number
          tmdb_id: number | null
          updated_at: string | null
        }
        Insert: {
          air_date?: string | null
          anime_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          overview?: string | null
          poster_path?: string | null
          season_number: number
          tmdb_id?: number | null
          updated_at?: string | null
        }
        Update: {
          air_date?: string | null
          anime_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          overview?: string | null
          poster_path?: string | null
          season_number?: number
          tmdb_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seasons_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
        ]
      }
      user_genre_preferences: {
        Row: {
          genre_id: string
          preference_score: number | null
          user_id: string
        }
        Insert: {
          genre_id: string
          preference_score?: number | null
          user_id: string
        }
        Update: {
          genre_id?: string
          preference_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_genre_preferences_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_genre_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_history: {
        Row: {
          completed: boolean | null
          episode_id: string | null
          id: string
          progress_seconds: number | null
          user_id: string | null
          watched_at: string | null
        }
        Insert: {
          completed?: boolean | null
          episode_id?: string | null
          id?: string
          progress_seconds?: number | null
          user_id?: string | null
          watched_at?: string | null
        }
        Update: {
          completed?: boolean | null
          episode_id?: string | null
          id?: string
          progress_seconds?: number | null
          user_id?: string | null
          watched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_admin_credentials: {
        Args: { admin_email: string; admin_password: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
