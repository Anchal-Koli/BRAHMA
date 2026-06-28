import { client } from './client';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: UserProfile;
}

export const authApi = {
  register: async (payload: any): Promise<UserProfile> => {
    const response = await client.post('auth/register/', payload);
    return response.data;
  },

  login: async (payload: any): Promise<AuthResponse> => {
    const response = await client.post('auth/login/', payload);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await client.post('auth/logout/', { refresh: refreshToken });
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await client.get('auth/profile/');
    return response.data;
  },

  updateProfile: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await client.patch('auth/profile/', payload);
    return response.data;
  },
};
