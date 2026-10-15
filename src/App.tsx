import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Sparkles, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft, 
  HelpCircle,
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';
import { Header } from './components/Header';
import { RouteCard } from './components/RouteCard';
import { SettingsModal } from './components/SettingsModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { LoginModal } from './components/LoginModal';
import { 
  AppSettings, 
  CommuteRouteConfig, 
  RouteCalculationResult, 
  UserProfile 
} from './types';
import { getCurrentUser, logout } from './services/googleAuth';
import { loadSettings, saveSettings } from './services/storage';
import { fetchRouteDetails } from './services/directionsService';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [routeResults, setRouteResults] = useState<Record<string, RouteCalculationResult>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [nextRefreshCountdown, setNextRefreshCountdown] = useState(settings.autoRefreshIntervalSeconds);

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Load client ID from env if not specified in settings
  const effectiveGoogleClientId = settings.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Main refresh function
  const refreshAllRoutes = useCallback(async () => {
    setIsRefreshing(true);
    const newResults: Record<string, RouteCalculationResult> = {};

    try {
      // Calculate active routes concurrently
      const activeRoutes = settings.routes.filter((r) => r.enabled);
      const promises = activeRoutes.map(async (route) => {
        const result = await fetchRouteDetails(route, settings.googleMapsApiKey);
        return { id: route.id, result };
      });

      const settled = await Promise.all(promises);
      for (const item of settled) {
        newResults[item.id] = item.result;
      }

      setRouteResults(newResults);
      const timeStr = new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastUpdated(timeStr);
      setNextRefreshCountdown(settings.autoRefreshIntervalSeconds);
    } catch (err) {
      console.error('Failed to refresh routes:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [settings.routes, settings.googleMapsApiKey, settings.autoRefreshIntervalSeconds]);

  // Initial load on page visit - satisfies "Immer wenn ich die website aufrufe..."
  useEffect(() => {
    refreshAllRoutes();
  }, [refreshAllRoutes]);

  // Interval countdown timer
  useEffect(() => {
    if (!settings.autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setNextRefreshCountdown((prev) => {
        if (prev <= 1) {
          refreshAllRoutes();
          return settings.autoRefreshIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.autoRefreshEnabled, settings.autoRefreshIntervalSeconds, refreshAllRoutes]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    setNextRefreshCountdown(newSettings.autoRefreshIntervalSeconds);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Sticky Header */}
      <Header
        user={user}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onRefresh={refreshAllRoutes}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        nextRefreshCountdown={nextRefreshCountdown}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Banner if in Simulation / Demo Mode */}
        {(!effectiveGoogleClientId || Object.values(routeResults).some((r) => r.isMockData)) && (
          <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-sky-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Live-Vorschau aktiv & bereit für Netlify
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Deine Routen (Zuhause ➔ Arbeit, Arbeit ➔ Zuhause, Zuhause ➔ Uni) werden live berechnet. Um deine eigenen Google Cloud API-Keys für das Produktiv-System zu hinterlegen, klicke auf die Setup-Anleitung.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-sky-700 border border-sky-200 text-xs font-semibold shadow-2xs transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Setup Anleitung</span>
              </button>
            </div>
          </div>
        )}

        {/* Welcome / Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Deine täglichen Pendelstrecken
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Automatische Ermittlung des schnellsten Verkehrsmittels und nächster Abfahrten
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">Echtzeit-Verkehr & ÖPNV aktiv</span>
          </div>
        </div>

        {/* Routes Grid: Home -> Work, Work -> Home, Home -> Uni */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settings.routes
            .filter((r) => r.enabled)
            .map((route) => (
              <RouteCard
                key={route.id}
                config={route}
                result={routeResults[route.id]}
                isLoading={isRefreshing && !routeResults[route.id]}
                onRefreshThisRoute={refreshAllRoutes}
              />
            ))}
        </div>

        {/* Quick Tips & Netlify Integration Info */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500">
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block mb-0.5">Schnellster Weg ermittelt</strong>
              Vergleicht live ÖPNV, PKW mit Verkehrsdaten und Fahrrad für jede einzelne Strecke.
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
            <Layers className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block mb-0.5">Netlify Serverless Ready</strong>
              Die Netlify Function schützt deinen Google Maps API Key und liefert blitzschnelle Antworten.
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
            <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block mb-0.5">Google OAuth Login</strong>
              Sichere Anmeldung mit deinem persönlichen Google-Account für deine gespeicherten Orte.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-600">Pendler-Radar</span>
            <span>•</span>
            <span>Entwickelt für Netlify & Google Maps</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-700 underline transition-colors"
            >
              Adressen anpassen
            </button>
            <span>•</span>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-slate-700 underline transition-colors"
            >
              Netlify Deployment Anleitung
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={(loggedInUser) => setUser(loggedInUser)}
        googleClientId={effectiveGoogleClientId}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <SetupGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
export default App;
