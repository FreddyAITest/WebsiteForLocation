import React, { useEffect, useRef } from 'react';
import { LogIn, X, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { createDemoUser, initGoogleSignIn } from '../services/googleAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  googleClientId: string;
  onOpenSettings: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  googleClientId,
  onOpenSettings,
}) => {
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && googleClientId) {
      const initialized = initGoogleSignIn(googleClientId, 'google-signin-btn-container', (user) => {
        onSuccess(user);
        onClose();
      });
      if (!initialized) {
        // Retry shortly if script is still loading
        const t = setTimeout(() => {
          initGoogleSignIn(googleClientId, 'google-signin-btn-container', (user) => {
            onSuccess(user);
            onClose();
          });
        }, 800);
        return () => clearTimeout(t);
      }
    }
  }, [isOpen, googleClientId, onSuccess, onClose]);

  if (!isOpen) return null;

  const handleDemoLogin = () => {
    const demo = createDemoUser();
    onSuccess(demo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Mit Google anmelden</h2>
          <p className="text-xs text-slate-500 mt-1">
            Melde dich an, um deine Routen (Zuhause, Arbeit, Uni) geräteübergreifend zu sichern.
          </p>
        </div>

        {/* Google Official Button Container */}
        <div className="flex flex-col items-center justify-center my-4 min-h-[50px]">
          {googleClientId ? (
            <div id="google-signin-btn-container" ref={googleBtnRef} className="flex justify-center" />
          ) : (
            <div className="w-full p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-800 space-y-2">
              <div className="flex items-center font-semibold space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Google Client-ID noch nicht konfiguriert</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Um echtes Google Sign-In zu nutzen, hinterlege deine Google OAuth Web Client-ID in den Einstellungen oder in Netlify.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="text-xs font-semibold text-sky-700 hover:underline inline-block mt-1"
              >
                ➔ Jetzt Client-ID in Einstellungen eintragen
              </button>
            </div>
          )}
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">Oder ohne Konfiguration</span>
          </div>
        </div>

        {/* Demo Login Button */}
        <button
          onClick={handleDemoLogin}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm flex items-center justify-center space-x-2 transition-colors shadow-2xs"
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Als Demo-Benutzer fortfahren (Sofort-Test)</span>
        </button>

        <div className="mt-5 text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Datenschutz: Deine Routen werden nur für dich verarbeitet.</span>
        </div>
      </div>
    </div>
  );
};
