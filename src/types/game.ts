export type DeviceType = 'mobile' | 'pc' | 'console';

export type GameGenre = 
  | 'action'
  | 'battle_royale'
  | 'racing'
  | 'adventure'
  | 'sports'
  | 'puzzle'
  | 'arcade'
  | 'rpg';

export interface Game {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  devices: DeviceType[];
  genre: GameGenre;
  genreAr: string;
  rating: number;
  reviewsCount: number;
  downloadsCount: string;
  size: string;
  isPopular: boolean;
  isPlayableInBrowser: boolean;
  playableGameId?: 'cyber-runner' | 'space-shooter' | 'cyber-2048' | 'arcade-speedway';
  coverImage: string;
  bannerImage: string;
  screenshots: string[];
  developer: string;
  releaseYear: number;
  featuresAr: string[];
  controls: {
    mobile: string;
    pc: string;
    console: string;
  };
  systemRequirements?: {
    mobile?: string;
    pc?: string;
    console?: string;
  };
}

export interface HumanVerificationState {
  isVerified: boolean;
  verifiedAt?: number;
  expiresAt?: number;
  trustScore: number;
  verificationMethod?: 'reflex' | 'slider' | 'pattern';
}

export interface SecurityThreatLog {
  id: string;
  timestamp: string;
  ipMasked: string;
  threatType: 'Headless Bot' | 'Rapid Scraper' | 'Automated Clicker' | 'Proxy Injection';
  action: 'Blocked' | 'Challenged' | 'Quarantined';
  threatLevel: 'High' | 'Medium' | 'Critical';
}
