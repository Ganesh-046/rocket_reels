// Dummy data for the app

// Real internet video URLs for testing
export const dummyVideoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMobsters.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerTranscoders.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
];

// Dummy episode data for series
export const dummyEpisodeData = (contentId: string, contentName: string, episodeCount: number = 26) => {
  return Array.from({ length: episodeCount }, (_, i) => ({
    _id: `episode-${contentId}-${i + 1}`,
    episodeNo: i + 1,
    title: `${contentName} - Episode ${i + 1}`,
    description: `Watch the exciting Episode ${i + 1} of ${contentName}. This episode features amazing storytelling and incredible performances.`,
    videoUrl: dummyVideoUrls[i % dummyVideoUrls.length],
    thumbnail: `https://picsum.photos/400/600?random=${contentId}-${i + 1}`,
    duration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
    views: `${Math.floor(Math.random() * 1000)}K`,
    likes: Math.floor(Math.random() * 10000),
    comments: Math.floor(Math.random() * 500),
    shares: Math.floor(Math.random() * 200),
    status: i < 3 ? 'unlocked' as const : 'locked' as const, // First 3 episodes unlocked
    contentId,
    contentName,
  }));
};

// Dummy series data with episodes
export const dummySeriesData = [
  {
    id: 'series-1',
    title: 'Breaking Bad',
    genre: 'Drama',
    imageUri: 'https://picsum.photos/300/450?random=1',
    episodes: dummyEpisodeData('series-1', 'Breaking Bad', 26),
  },
  {
    id: 'series-2',
    title: 'Game of Thrones',
    genre: 'Fantasy',
    imageUri: 'https://picsum.photos/300/450?random=2',
    episodes: dummyEpisodeData('series-2', 'Game of Thrones', 20),
  },
  {
    id: 'series-3',
    title: 'Stranger Things',
    genre: 'Sci-Fi',
    imageUri: 'https://picsum.photos/300/450?random=3',
    episodes: dummyEpisodeData('series-3', 'Stranger Things', 16),
  },
  {
    id: 'series-4',
    title: 'The Crown',
    genre: 'Drama',
    imageUri: 'https://picsum.photos/300/450?random=4',
    episodes: dummyEpisodeData('series-4', 'The Crown', 24),
  },
  {
    id: 'series-5',
    title: 'Money Heist',
    genre: 'Action',
    imageUri: 'https://picsum.photos/300/450?random=5',
    episodes: dummyEpisodeData('series-5', 'Money Heist', 18),
  },
];

// Dummy episode reels/shorts data for inner pages
export const dummyEpisodeReelsData = (contentId: string, contentName: string) => {
  return Array.from({ length: 50 }, (_, i) => ({
    _id: `reel-${contentId}-${i + 1}`,
    episodeNo: i + 1,
    title: `${contentName} - Episode ${i + 1}`,
    description: `Watch the exciting Episode ${i + 1} of ${contentName}. This episode features amazing storytelling and incredible performances.`,
    videoUrl: dummyVideoUrls[i % dummyVideoUrls.length],
    thumbnail: `https://picsum.photos/400/600?random=${contentId}-reel-${i + 1}`,
    duration: Math.floor(Math.random() * 180) + 30, // 30 seconds to 3.5 minutes for shorts
    views: `${Math.floor(Math.random() * 5000)}K`,
    likes: Math.floor(Math.random() * 50000),
    comments: Math.floor(Math.random() * 2000),
    shares: Math.floor(Math.random() * 1000),
    status: 'unlocked' as const,
    contentId,
    contentName,
    isShort: true,
    aspectRatio: 9 / 16, // Vertical aspect ratio for shorts
  }));
};

export const dummyBannerData = [
  {
    id: 'banner-1',
    title: 'Amazing Action Movie',
    subtitle: 'Watch the latest blockbuster',
    imageUri: 'https://picsum.photos/400/200?random=1',
  },
  {
    id: 'banner-2',
    title: 'Comedy Special',
    subtitle: 'Laugh out loud with the best comedians',
    imageUri: 'https://picsum.photos/400/200?random=2',
  },
  {
    id: 'banner-3',
    title: 'Drama Series',
    subtitle: 'Emotional storytelling at its finest',
    imageUri: 'https://picsum.photos/400/200?random=3',
  },
];

export const dummyGenreData = [
  { id: 'all', name: 'All', slug: 'all' },
  { id: 'action', name: 'Action', slug: 'action' },
  { id: 'comedy', name: 'Comedy', slug: 'comedy' },
  { id: 'drama', name: 'Drama', slug: 'drama' },
  { id: 'horror', name: 'Horror', slug: 'horror' },
  { id: 'romance', name: 'Romance', slug: 'romance' },
  { id: 'sci-fi', name: 'Sci-Fi', slug: 'sci-fi' },
];

export const dummyContentData = {
  bannerData: dummyBannerData,
  allContentData: Array.from({ length: 20 }, (_, i) => ({
    id: `content-${i + 1}`,
    title: `Content ${i + 1}`,
    genre: ['Action', 'Comedy', 'Drama', 'Horror'][i % 4],
    imageUri: `https://picsum.photos/300/450?random=${i + 10}`,
  })),
  topContentData: Array.from({ length: 10 }, (_, i) => ({
    id: `top-${i + 1}`,
    title: `Top Content ${i + 1}`,
    genre: ['Action', 'Comedy', 'Drama', 'Horror'][i % 4],
    imageUri: `https://picsum.photos/300/450?random=${i + 20}`,
  })),
  latestContentData: Array.from({ length: 10 }, (_, i) => ({
    id: `latest-${i + 1}`,
    title: `Latest Content ${i + 1}`,
    genre: ['Action', 'Comedy', 'Drama', 'Horror'][i % 4],
    imageUri: `https://picsum.photos/300/450?random=${i + 30}`,
  })),
  upcomingContentData: Array.from({ length: 10 }, (_, i) => ({
    id: `upcoming-${i + 1}`,
    title: `Upcoming Content ${i + 1}`,
    genre: ['Action', 'Comedy', 'Drama', 'Horror'][i % 4],
    imageUri: `https://picsum.photos/300/450?random=${i + 40}`,
  })),
};

export const dummyWatchlistData = {
  videoData: Array.from({ length: 5 }, (_, i) => ({
    id: `watchlist-${i + 1}`,
    title: `Continue Watching ${i + 1}`,
    episode: `Episode ${i + 1}`,
    progress: Math.floor(Math.random() * 80) + 20,
    imageUri: `https://picsum.photos/250/350?random=${i + 50}`,
  })),
};

export const dummyUserInfo = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
};

export const dummyUserProfileInfo = {
  id: 'profile-1',
  name: 'John Doe',
  avatar: 'https://picsum.photos/100/100?random=1',
}; 