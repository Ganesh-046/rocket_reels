import React from 'react';

interface Episode {
  _id: string;
  episodeNo?: number;
  language?: string;
  status?: 'locked' | 'unlocked';
  contentId?: string;
  video_urls?: {
    '1080p'?: string;
    '720p'?: string;
    '480p'?: string;
    '360p'?: string;
    master?: string;
  };
  video_url?: string;
  thumbnail?: string;
  like?: number;
  isDeleted?: boolean;
  isLiked?: boolean | null;
  title?: string;
  description?: string;
}

interface WorkingHLSVideoPlayerProps {
  episode: Episode;
  isPlaying?: boolean;
  onLoad?: (data: any) => void;
  onProgress?: (data: any) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  onReadyForDisplay?: () => void;
  onBuffer?: (data: any) => void;
  style?: any;
  resizeMode?: string;
  repeat?: boolean;
  muted?: boolean;
  showControls?: boolean;
  showThumbnail?: boolean;
}

declare const WorkingHLSVideoPlayer: React.FC<WorkingHLSVideoPlayerProps>;

export default WorkingHLSVideoPlayer; 