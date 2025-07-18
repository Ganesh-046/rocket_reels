// Dummy data for the app
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