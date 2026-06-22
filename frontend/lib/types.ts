export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'seller' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  avatar_path: string | null;
  email_verified_at: string | null;
  created_at: string;
}

export interface Seller {
  id: number;
  user_id: number;
  store_name: string;
  store_slug: string;
  store_description: string | null;
  logo_path: string | null;
  banner_path: string | null;
  rating: number;
  total_reviews: number;
  status: 'pending' | 'verified' | 'suspended';
  level: 'bronze' | 'silver' | 'gold' | 'verified_artisan';
  total_orders: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon_path: string | null;
  parent_id: number | null;
  display_order: number;
  is_active: boolean;
}