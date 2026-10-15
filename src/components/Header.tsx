import React from 'react';
import { 
  Navigation, 
  RefreshCw, 
  Settings as SettingsIcon, 
  HelpCircle, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
  nextRefreshCountdown: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLoginClick,
  onLogout,
  onOpenSettings,
  onOpenHelp,
  onRefresh,
  isRefreshing,
  lastUpdated,
  nextRefreshCountdown,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Navigation className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Pendler-Radar
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  Google Maps Live
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Echtzeit-Verbindungen & schnellste Wege für deine täglichen Strecken
              </p>
            </div>
          </div>

          {/* Controls & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Refresh Status */}
            <div className="hidden md:flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <span>
                {lastUpdated ? `Stand: ${lastUpdated}` : 'Wird geladen...'}
              </span>
              <span className="mx-2 text-slate-300">|</span>
              <span className="text-sky-600 font-medium">
                Auto-Refresh in {nextRefreshCountdown}s
              </span>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Routendaten jetzt aktualisieren"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Routen & Adressen konfigurieren"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Help / Setup Guide Button */}
            <button
              onClick={onOpenHelp}
              title="Netlify Deployment & Google Setup Anleitung"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center space-x-2">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full ring-2 ring-sky-500/30 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Abmelden"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-sky-600 text-white font-medium text-xs sm:text-sm hover:bg-sky-700 shadow-sm transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Anmelden</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
