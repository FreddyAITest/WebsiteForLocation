import { AppSettings, CommuteRouteConfig } from '../types';

const SETTINGS_KEY = 'commute_app_settings_v1';

export const DEFAULT_ROUTES: CommuteRouteConfig[] = [
  {
    id: 'home-to-work',
    title: 'Zuhause ➔ Arbeit',
    origin: 'Alexanderplatz 1, 10178 Berlin',
    destination: 'Potsdamer Platz 1, 10785 Berlin',
    icon: 'briefcase',
    enabled: true,
  },
  {
    id: 'work-to-home',
    title: 'Arbeit ➔ Zuhause',
    origin: 'Potsdamer Platz 1, 10785 Berlin',
    destination: 'Alexanderplatz 1, 10178 Berlin',
    icon: 'home',
    enabled: true,
  },
  {
    id: 'home-to-uni',
    title: 'Zuhause ➔ Uni',
    origin: 'Alexanderplatz 1, 10178 Berlin',
    destination: 'Unter den Linden 6, 10117 Berlin (Humboldt-Universität)',
    icon: 'graduation-cap',
    enabled: true,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  googleClientId: '',
  googleMapsApiKey: '',
  autoRefreshIntervalSeconds: 180, // 3 minutes
  autoRefreshEnabled: true,
  routes: DEFAULT_ROUTES,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      routes: parsed.routes && parsed.routes.length > 0 ? parsed.routes : DEFAULT_ROUTES,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
