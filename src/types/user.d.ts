export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  reelsCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  phoneNumber?: string;
  dateOfBirth?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface AuthUser {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}
