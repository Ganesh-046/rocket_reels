export type RootStackParamList = {
  Tabs: undefined;
  ReelDetail: any;
  Shorts: any;
  EpisodePlayer: {
    contentId: string;
    contentName: string;
    episodes: any[];
    initialIndex?: number;
  };
  // Profile Screens
  EditProfile: undefined;
  History: undefined;
  MyList: undefined;
  Transaction: undefined;
  MyWallet: undefined;
  Refill: undefined;
  Subscription: undefined;
  WebView: {
    title: string;
    url: string;
  };
};
