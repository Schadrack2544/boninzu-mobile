export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'agent' | 'user';
  is_active: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  property_type_label: string;
  listing_type: string;
  listing_type_label: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: string;
  year_built?: number;
  featured: boolean;
  agent_id?: number;
  agent_name?: string;
  agent_email?: string;
  status: string;
  views_count: number;
  created_at: string;
  primary_image: string;
  image_count: number;
}

export interface PropertyImage {
  image_url: string;
  is_primary: boolean;
  display_order: number;
  alt_text?: string;
}

export interface PropertyFeature {
  value: string;
  label: string;
  category: string;
}

export interface PropertyDetails extends Property {
  images: PropertyImage[];
  features: PropertyFeature[];
}

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Filters {
  keyword?: string;
  type?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  min_bathrooms?: number;
  location?: string;
  features?: string[];
  sort?: string;
}