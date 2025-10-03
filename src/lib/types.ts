import type { Session, User, AuthError } from '@supabase/supabase-js';

export type ManduviRole =
  | 'admin'
  | 'empresa'
  | 'terceiro_setor'
  | 'orgao_publico'
  | 'colaborador'
  | 'usuario';

export type ManduviUserStatus = 'pending' | 'active' | 'suspended' | 'deleted';

export interface UserMetadata {
  phone?: string;
  department?: string;
  avatar_url?: string;
  display_name?: string;
  [key: string]: unknown;
}

export interface UserProfile {
  id: string;
  email: string;
  role: ManduviRole;
  status: ManduviUserStatus;
  email_verified: boolean;
  phone_verified: boolean;
  profile_completed: boolean;
  last_login_at: string | null;
  metadata: UserMetadata;
  created_at: string;
  updated_at: string;
  name?: string;
}

export interface AdminAuthContext {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => Promise<{ error?: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError | null }>;
  refreshProfile: () => Promise<void>;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  click_count: number;
  impression_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface BannerAnalyticsEvent {
  id: string;
  banner_id: string;
  event_type: 'impression' | 'click';
  user_id: string | null;
  session_id: string | null;
  created_at: string;
}

export interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  folder: string;
  tags: string[];
  alt_text: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
  link_url?: string | null;
}

export interface AdminActivityLog {
  id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete';
  entity_type: string;
  entity_id: string | null;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  pending_users: number;
  total_editais: number;
  published_editais: number;
  total_media_files: number;
  active_banners: number;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: unknown;
  setting_type: string;
  description: string | null;
  is_public: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface ContentSection {
  id: string;
  page_slug: string;
  section_key: string;
  content: Record<string, unknown>;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface AdminApiError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
}

