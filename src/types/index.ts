export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isDemo?: boolean;
}

export type RouteIconType = 'briefcase' | 'home' | 'graduation-cap' | 'map-pin';

export interface CommuteRouteConfig {
  id: string;
  title: string;
  origin: string;
  destination: string;
  icon: RouteIconType;
  enabled: boolean;
}

export type TransitVehicle = 'BUS' | 'SUBWAY' | 'TRAIN' | 'TRAM' | 'HEAVY_RAIL' | 'FERRY' | 'OTHER';

export interface TransitStep {
  line: string;
  vehicleType: TransitVehicle;
  departureStop: string;
  departureTime: string;
  departureTimeRelative: string;
  arrivalStop: string;
  arrivalTime: string;
  headsign: string;
  numStops: number;
  color?: string;
}

export type TravelMode = 'TRANSIT' | 'DRIVING' | 'BICYCLING' | 'WALKING';

export interface RouteOption {
  mode: TravelMode;
  durationMinutes: number;
  durationText: string;
  distanceText: string;
  isFastest: boolean;
  trafficDelayMinutes?: number;
  trafficCondition?: 'FAST' | 'MODERATE' | 'HEAVY';
  transitDetails?: {
    departureTime: string;
    departureTimeRelative: string;
    arrivalTime: string;
    transfers: number;
    steps: TransitStep[];
  };
}

export interface RouteCalculationResult {
  routeId: string;
  title: string;
  origin: string;
  destination: string;
  fastestMode: TravelMode;
  fastestDurationMinutes: number;
  options: RouteOption[];
  googleMapsUrl: string;
  lastUpdated: string;
  error?: string;
  isMockData?: boolean;
}

export interface AppSettings {
  googleClientId: string;
  googleMapsApiKey: string;
  autoRefreshIntervalSeconds: number; // e.g. 180 (3 min)
  autoRefreshEnabled: boolean;
  routes: CommuteRouteConfig[];
}
