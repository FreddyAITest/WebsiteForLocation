import React, { useState } from 'react';
import {
  Briefcase,
  Home,
  GraduationCap,
  MapPin,
  Car,
  Train,
  Bike,
  Footprints,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { CommuteRouteConfig, RouteCalculationResult, TravelMode } from '../types';

interface RouteCardProps {
  config: CommuteRouteConfig;
  result?: RouteCalculationResult;
  isLoading: boolean;
  onRefreshThisRoute?: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ config, result, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRouteIcon = (iconType: string) => {
    switch (iconType) {
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-indigo-600" />;
      case 'home':
        return <Home className="w-5 h-5 text-emerald-600" />;
      case 'graduation-cap':
        return <GraduationCap className="w-5 h-5 text-amber-600" />;
      default:
        return <MapPin className="w-5 h-5 text-sky-600" />;
    }
  };

  const getModeIcon = (mode: TravelMode) => {
    switch (mode) {
      case 'TRANSIT':
        return <Train className="w-4 h-4" />;
      case 'DRIVING':
        return <Car className="w-4 h-4" />;
      case 'BICYCLING':
        return <Bike className="w-4 h-4" />;
      case 'WALKING':
        return <Footprints className="w-4 h-4" />;
    }
  };

  const getModeNameGerman = (mode: TravelMode) => {
    switch (mode) {
      case 'TRANSIT':
        return 'Öffentliche Verkehrsmittel (ÖPNV)';
      case 'DRIVING':
        return 'Auto / PKW';
      case 'BICYCLING':
        return 'Fahrrad';
      case 'WALKING':
        return 'Zu Fuß';
    }
  };

  const transitOption = result?.options.find((opt) => opt.mode === 'TRANSIT');
  const drivingOption = result?.options.find((opt) => opt.mode === 'DRIVING');
  const bikeOption = result?.options.find((opt) => opt.mode === 'BICYCLING');

  const fastestOption = result?.options.find((opt) => opt.isFastest);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      {/* Top Banner: Route info & fastest way */}
      <div>
        <div className="p-5 sm:p-6 pb-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                {getRouteIcon(config.icon)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                  {config.title}
                </h3>
                <div className="flex items-center text-xs text-slate-500 mt-1 space-x-1.5 truncate max-w-xs sm:max-w-md">
                  <span className="truncate">{config.origin.split(',')[0]}</span>
                  <ArrowRight className="w-3 h-3 shrink-0 text-slate-400" />
                  <span className="truncate font-medium text-slate-700">
                    {config.destination.split(',')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Pill */}
            {result?.isMockData && (
              <span className="shrink-0 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full" title="Google Maps API-Schlüssel nicht hinterlegt, zeigt Live-Vorschau">
                Live-Simulation
              </span>
            )}
          </div>

          {/* Fastest Mode Highlight Ribbon */}
          {fastestOption && !isLoading && (
            <div className="mt-4 mb-5 p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="flex h-7 w-7 rounded-lg bg-emerald-600 text-white items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center">
                    🏆 Schnellster Weg aktuell
                  </div>
                  <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                    <span>{getModeNameGerman(fastestOption.mode)}</span>
                    <span className="text-emerald-600 font-extrabold text-base">
                      • {fastestOption.durationText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="my-5 p-6 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Berechne schnellste Verbindungen...</span>
            </div>
          )}

          {/* Route Options Comparison Grid */}
          {!isLoading && result && (
            <div className="space-y-3">
              {/* Transit / ÖPNV Option */}
              {transitOption && (
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    transitOption.isFastest
                      ? 'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-400/20'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Train className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 flex items-center space-x-2">
                          <span>ÖPNV</span>
                          {transitOption.transitDetails?.steps[0] && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                              style={{
                                backgroundColor:
                                  transitOption.transitDetails.steps[0].color || '#0284c7',
                              }}
                            >
                              {transitOption.transitDetails.steps[0].line}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-sky-700">
                            Nächste Abfahrt: {transitOption.transitDetails?.departureTimeRelative}
                          </span>
                          <span>({transitOption.transitDetails?.departureTime} Uhr)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">
                        {transitOption.durationText}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {transitOption.transitDetails?.transfers === 0
                          ? 'Direkt'
                          : `${transitOption.transitDetails?.transfers} Umstieg`}
                      </div>
                    </div>
                  </div>

                  {/* Transit Station Summary */}
                  {transitOption.transitDetails?.steps[0] && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="truncate">
                        Ab: <strong>{transitOption.transitDetails.steps[0].departureStop}</strong>
                      </span>
                      <span className="text-slate-400 mx-1">➔</span>
                      <span className="truncate">
                        Bis: <strong>{transitOption.transitDetails.steps[0].arrivalStop}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Driving / Auto Option */}
              {drivingOption && (
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    drivingOption.isFastest
                      ? 'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-400/20'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800">
                          Auto / PKW
                        </div>
                        <div className="text-[11px] mt-0.5 flex items-center space-x-1.5">
                          {drivingOption.trafficDelayMinutes && drivingOption.trafficDelayMinutes > 0 ? (
                            <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              +{drivingOption.trafficDelayMinutes} Min. Verzögerung
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">
                              Fließender Verkehr
                            </span>
                          )}
                          <span className="text-slate-400">• {drivingOption.distanceText}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">
                        {drivingOption.durationText}
                      </div>
                      <div className="text-[11px] text-slate-500">Live-Verkehr</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bicycle Option */}
              {bikeOption && (
                <div className="p-2.5 px-3 rounded-xl border border-slate-200/70 bg-white flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Bike className="w-4 h-4 text-slate-500" />
                    <span>Fahrrad</span>
                    <span className="text-slate-400">• {bikeOption.distanceText}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{bikeOption.durationText}</span>
                </div>
              )}
            </div>
          )}

          {/* Expandable Step-by-Step details */}
          {isExpanded && transitOption?.transitDetails?.steps && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-3 animate-fadeIn">
              <div className="font-semibold text-slate-700 mb-2">Details zur ÖPNV-Verbindung:</div>
              {transitOption.transitDetails.steps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <span>{step.line}</span>
                      <span className="text-slate-400 text-[11px] font-normal">({step.headsign})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Einsteigen: <strong className="text-slate-700">{step.departureStop}</strong> ({step.departureTime} Uhr)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Aussteigen: <strong className="text-slate-700">{step.arrivalStop}</strong> ({step.arrivalTime} Uhr)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {step.numStops} Stationen
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Actions */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center space-x-1 transition-colors"
        >
          <span>{isExpanded ? 'Details verbergen' : 'Details & Haltestellen'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <a
          href={result?.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(config.origin)}&destination=${encodeURIComponent(config.destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <span>In Google Maps öffnen</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
