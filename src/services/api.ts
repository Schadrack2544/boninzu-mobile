import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.1.15/boninzu/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'user' | 'agent' | 'admin';
}

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  confirm_password: string;
}

export interface PropertyFilters {
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

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/signin.php', credentials);
    return response.data;
  },

  signup: async (data: SignupData) => {
    const response = await api.post('/signup.php', data);
    return response.data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
  },
};

export const propertyApi = {
  getFeaturedProperties: async (limit: number = 6) => {
    const response = await api.get(`/get_featured_properties.php?limit=${limit}`);
    return response.data;
  },

  searchProperties: async (filters: PropertyFilters = {}) => {
    const params = new URLSearchParams();

    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.type) params.append('type', filters.type);
    if (filters.listing_type) params.append('listing_type', filters.listing_type);
    if (filters.min_price) params.append('min_price', filters.min_price.toString());
    if (filters.max_price) params.append('max_price', filters.max_price.toString());
    if (filters.min_bedrooms) params.append('min_bedrooms', filters.min_bedrooms.toString());
    if (filters.min_bathrooms) params.append('min_bathrooms', filters.min_bathrooms.toString());
    if (filters.location) params.append('location', filters.location);
    if (filters.features) {
      filters.features.forEach((feature) => {
        params.append('features[]', feature);
      });
    }
    if (filters.sort) params.append('sort', filters.sort);

    const response = await api.get(`/search_properties.php?${params.toString()}`);
    return response.data;
  },

  getPropertyDetails: async (id: string) => {
    const response = await api.get(`/get_property_details.php?id=${id}`);
    return response.data;
  },
};

export const contactApi = {
  sendMessage: async (data: { name: string; email: string; phone?: string; subject: string; message: string }) => {
    const response = await api.post('/contact.php', data);
    return response.data;
  },
};

export const userApi = {
  getProfile: async () => {
    const response = await api.get('/dashboard.php');
    return response.data;
  },

  updateProfile: async (data: Partial<{ first_name: string; last_name: string; phone: string }>) => {
    const response = await api.post('/dashboard.php', data);
    return response.data;
  },
};

export default api;