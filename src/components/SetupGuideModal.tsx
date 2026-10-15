import React from 'react';
import { X, Cloud, Key, Globe, Shield, Terminal, CheckCircle2, ExternalLink } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-2">
            <Cloud className="w-3.5 h-3.5" />
            <span>Netlify & Google Cloud Setup</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Schritt-für-Schritt Anleitung: Netlify & Google
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            So richtest du dein Google-Konto, Google Maps API und das Hosting auf Netlify vollständig ein.
          </p>
        </div>

        <div className="space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Schritt 1 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center space-x-2.5 font-bold text-slate-900 text-sm sm:text-base mb-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Google Cloud Console vorbereiten</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 ml-1">
              <li>
                Öffne die{' '}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 font-semibold underline inline-flex items-center"
                >
                  Google Cloud Console <ExternalLink className="w-3 h-3 ml-1" />
                </a>{' '}
                und erstelle ein neues Projekt (z.B. <em>"Pendler-Dashboard"</em>).
              </li>
              <li>
                Gehe zu <strong>APIs & Dienste &gt; Bibliothek</strong> und aktiviere:
                <ul className="list-disc list-inside ml-4 mt-1 font-mono text-xs text-slate-800">
                  <li>Directions API</li>
                  <li>Maps JavaScript API (optional)</li>
                </ul>
              </li>
              <li>
                Gehe zu <strong>Anmeldedaten &gt; Anmeldedaten erstellen &gt; API-Schlüssel</strong>. Kopiere diesen Schlüssel (das ist dein <code className="bg-slate-200 px-1 rounded">GOOGLE_MAPS_API_KEY</code>).
              </li>
            </ol>
          </div>

          {/* Schritt 2 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center space-x-2.5 font-bold text-slate-900 text-sm sm:text-base mb-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Google OAuth 2.0 Client-ID für Login anlegen</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 ml-1">
              <li>
                Gehe in der Google Cloud Console zu <strong>APIs & Dienste &gt; OAuth-Zustimmungsbildschirm</strong> und wähle <em>External</em>. Trage deinen App-Namen und deine E-Mail ein.
              </li>
              <li>
                Gehe zu <strong>Anmeldedaten &gt; Anmeldedaten erstellen &gt; OAuth-Client-ID</strong>:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Anwendungstyp: <strong>Webanwendung</strong></li>
                  <li>
                    Autorisierte JavaScript-Quellen:
                    <div className="font-mono text-xs bg-slate-200 p-2 rounded mt-1 text-slate-800">
                      http://localhost:3000<br />
                      https://deine-seite.netlify.app
                    </div>
                  </li>
                </ul>
              </li>
              <li>Kopiere die generierte <strong>Client-ID</strong> (z.B. <code className="bg-slate-200 px-1 rounded">xxx.apps.googleusercontent.com</code>).</li>
            </ol>
          </div>

          {/* Schritt 3 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center space-x-2.5 font-bold text-slate-900 text-sm sm:text-base mb-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Auf Netlify deployen & Umgebungsvariablen setzen</span>
            </div>
            <p className="mb-2 text-slate-600">
              Du kannst das Projekt direkt mit Netlify verknüpfen (via GitHub/GitLab) oder über die Netlify CLI deployen:
            </p>
            <div className="font-mono text-xs bg-slate-900 text-slate-100 p-3 rounded-lg space-y-1 mb-3">
              <div># Projekt bauen & deployen</div>
              <div className="text-emerald-400">npm run build</div>
              <div className="text-emerald-400">npx netlify deploy --prod</div>
            </div>
            <p className="mb-2 text-slate-600 font-semibold">
              Wichtig: Hinterlege in deinem Netlify Dashboard unter <em>Site configuration &gt; Environment variables</em>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <span className="text-sky-700 font-bold">GOOGLE_MAPS_API_KEY</span>
                <div className="text-slate-400 text-[11px] font-sans mt-0.5">Sicherer Serverless-Schlüssel für Google Directions</div>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <span className="text-sky-700 font-bold">VITE_GOOGLE_CLIENT_ID</span>
                <div className="text-slate-400 text-[11px] font-sans mt-0.5">Öffentliche OAuth Client-ID für Google Login</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            Verstanden, schließen
          </button>
        </div>
      </div>
    </div>
  );
};
