import React, { useState } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  MapPin, 
  Briefcase, 
  Home, 
  GraduationCap, 
  Key, 
  Clock, 
  Check 
} from 'lucide-react';
import { AppSettings, CommuteRouteConfig } from '../types';
import { DEFAULT_ROUTES, DEFAULT_SETTINGS } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  // Address shortcuts for home, work, uni
  const homeRoute = formData.routes.find((r) => r.id === 'home-to-work');
  const workRoute = formData.routes.find((r) => r.id === 'work-to-home');
  const uniRoute = formData.routes.find((r) => r.id === 'home-to-uni');

  const [homeAddress, setHomeAddress] = useState(homeRoute ? homeRoute.origin : 'Alexanderplatz 1, Berlin');
  const [workAddress, setWorkAddress] = useState(workRoute ? workRoute.origin : 'Potsdamer Platz 1, Berlin');
  const [uniAddress, setUniAddress] = useState(uniRoute ? uniRoute.destination : 'Unter den Linden 6, Berlin');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Propagate home, work, uni addresses to the standard routes
    const updatedRoutes: CommuteRouteConfig[] = formData.routes.map((route) => {
      if (route.id === 'home-to-work') {
        return { ...route, origin: homeAddress, destination: workAddress };
      }
      if (route.id === 'work-to-home') {
        return { ...route, origin: workAddress, destination: homeAddress };
      }
      if (route.id === 'home-to-uni') {
        return { ...route, origin: homeAddress, destination: uniAddress };
      }
      return route;
    });

    const newSettings: AppSettings = {
      ...formData,
      routes: updatedRoutes,
    };

    onSave(newSettings);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    if (confirm('Möchtest du alle Einstellungen und Adressen auf die Standardwerte zurücksetzen?')) {
      setFormData(DEFAULT_SETTINGS);
      setHomeAddress(DEFAULT_ROUTES[0].origin);
      setWorkAddress(DEFAULT_ROUTES[0].destination);
      setUniAddress(DEFAULT_ROUTES[2].destination);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Einstellungen & Adressen</h2>
          <p className="text-xs text-slate-500 mt-1">
            Passe deine Zieladressen und automatischen Aktualisierungszeiten an.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Adressen Sektion */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
              Deine 3 Hauptadressen
            </h3>

            {/* Zuhause */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Adresse: Zuhause</span>
              </label>
              <input
                type="text"
                required
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="z.B. Alexanderplatz 1, 10178 Berlin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Arbeit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Adresse: Arbeit</span>
              </label>
              <input
                type="text"
                required
                value={workAddress}
                onChange={(e) => setWorkAddress(e.target.value)}
                placeholder="z.B. Potsdamer Platz 1, 10785 Berlin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Universität */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>Adresse: Universität</span>
              </label>
              <input
                type="text"
                required
                value={uniAddress}
                onChange={(e) => setUniAddress(e.target.value)}
                placeholder="z.B. Unter den Linden 6, 10117 Berlin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Aktualisierung Sektion */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Automatische Aktualisierung</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intervall (Sekunden)
                </label>
                <select
                  value={formData.autoRefreshIntervalSeconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      autoRefreshIntervalSeconds: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value={60}>Jede Minute (60s)</option>
                  <option value={120}>Alle 2 Minuten (120s)</option>
                  <option value={180}>Alle 3 Minuten (180s - empfohlen)</option>
                  <option value={300}>Alle 5 Minuten (300s)</option>
                  <option value={600}>Alle 10 Minuten (600s)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="relative flex items-center cursor-pointer space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.autoRefreshEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        autoRefreshEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Live-Auto-Refresh aktivieren
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Google API Keys (optional local override) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>Google Cloud Zugangsdaten (Optional)</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google OAuth 2.0 Web Client-ID
              </label>
              <input
                type="text"
                value={formData.googleClientId}
                onChange={(e) => setFormData({ ...formData, googleClientId: e.target.value })}
                placeholder="xxxx.apps.googleusercontent.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Für echtes Google Login. Alternativ in Netlify als <code className="bg-slate-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> hinterlegen.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Standard wiederherstellen</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {savedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Gespeichert!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Speichern</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
