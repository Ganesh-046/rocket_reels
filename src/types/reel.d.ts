export interface Reel {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  category: string;
  tags: string[];
  author: {
    id: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReelComment {
  id: string;
  text: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export interface ReelCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  reelCount: number;
}

export interface UploadProgress {
  progress: number; // 0-100
  uploadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  estimatedTime: number; // seconds remaining
}
