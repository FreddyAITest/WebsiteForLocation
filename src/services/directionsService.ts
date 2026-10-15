import { CommuteRouteConfig, RouteCalculationResult } from '../types';

export async function fetchRouteDetails(
  route: CommuteRouteConfig,
  clientApiKey?: string
): Promise<RouteCalculationResult> {
  const origin = route.origin;
  const destination = route.destination;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

  try {
    // Attempt to call Netlify function endpoint
    const response = await fetch(
      `/api/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
    );

    if (response.ok) {
      const data = await response.json();
      return {
        ...data,
        routeId: route.id,
        title: route.title,
      };
    }
  } catch (err) {
    // Fetch failed (e.g. standalone Vite dev server without netlify cli running)
    console.warn(`Netlify function call failed, using client simulation for route ${route.id}:`, err);
  }

  // If client provides a direct Google Maps API Key in settings, we can also query client-side or generate simulation
  return generateClientSimulation(route, googleMapsUrl);
}

function generateClientSimulation(
  route: CommuteRouteConfig,
  googleMapsUrl: string
): RouteCalculationResult {
  const now = new Date();
  const lower = (route.origin + ' ' + route.destination + ' ' + route.title).toLowerCase();

  let transitMin = 24;
  let drivingMin = 22;
  let bikeMin = 32;
  let distKm = 8.2;
  let transitLine = 'S-Bahn S3';
  let vehicleType: any = 'TRAIN';
  let startStation = 'Bahnhof Mitte';
  let endStation = 'Bahnhof Gewerbepark';
  let headsign = 'Richtung Stadtgrenze';
  let lineColor = '#007b3b'; // S-Bahn green

  if (lower.includes('uni') || lower.includes('universität') || lower.includes('campus')) {
    transitMin = 19;
    drivingMin = 25;
    bikeMin = 23;
    distKm = 5.6;
    transitLine = 'U-Bahn U6';
    vehicleType = 'SUBWAY';
    startStation = 'Stadtmitte';
    endStation = 'Campus / Universität';
    headsign = 'Richtung Alt-Mariendorf';
    lineColor = '#6f2d91';
  } else if (lower.includes('arbeit') && lower.includes('hause')) {
    // Return trip
    transitMin = 26;
    drivingMin = 29; // Rush hour traffic
    bikeMin = 33;
    distKm = 8.4;
    transitLine = 'S-Bahn S5';
    vehicleType = 'TRAIN';
    startStation = 'Gewerbepark';
    endStation = 'Heimatbahnhof';
    headsign = 'Richtung Spandau';
    lineColor = '#ff6600';
  }

  // Dynamic live variance based on the actual clock minute so it ticks live
  const minuteNow = now.getMinutes();
  const depInMinutes = Math.max(1, 6 - (minuteNow % 6));
  const depTimeDate = new Date(now.getTime() + depInMinutes * 60000);
  const depTimeStr = depTimeDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  const arrTimeDate = new Date(depTimeDate.getTime() + transitMin * 60000);
  const arrTimeStr = arrTimeDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  // Traffic delays simulation (higher in morning/evening rush hours)
  const hour = now.getHours();
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18);
  const trafficDelay = isRushHour ? 8 : 1;
  const currentDrivingDuration = drivingMin + trafficDelay;

  const options = [
    {
      mode: 'TRANSIT' as const,
      durationMinutes: transitMin,
      durationText: `${transitMin} Min.`,
      distanceText: `${distKm} km`,
      isFastest: transitMin < currentDrivingDuration,
      transitDetails: {
        departureTime: depTimeStr,
        departureTimeRelative: depInMinutes === 0 ? 'Jetzt' : `in ${depInMinutes} Min.`,
        arrivalTime: arrTimeStr,
        transfers: 0,
        steps: [
          {
            line: transitLine,
            vehicleType,
            departureStop: startStation,
            departureTime: depTimeStr,
            departureTimeRelative: `in ${depInMinutes} Min.`,
            arrivalStop: endStation,
            arrivalTime: arrTimeStr,
            headsign,
            numStops: 5,
            color: lineColor,
          },
        ],
      },
    },
    {
      mode: 'DRIVING' as const,
      durationMinutes: currentDrivingDuration,
      durationText: `${currentDrivingDuration} Min.`,
      distanceText: `${(distKm * 1.1).toFixed(1)} km`,
      isFastest: currentDrivingDuration <= transitMin,
      trafficDelayMinutes: trafficDelay,
      trafficCondition: (trafficDelay > 5 ? 'HEAVY' : trafficDelay > 2 ? 'MODERATE' : 'FAST') as any,
    },
    {
      mode: 'BICYCLING' as const,
      durationMinutes: bikeMin,
      durationText: `${bikeMin} Min.`,
      distanceText: `${distKm} km`,
      isFastest: false,
    },
  ];

  options.sort((a, b) => a.durationMinutes - b.durationMinutes);
  options[0].isFastest = true;

  return {
    routeId: route.id,
    title: route.title,
    origin: route.origin,
    destination: route.destination,
    fastestMode: options[0].mode,
    fastestDurationMinutes: options[0].durationMinutes,
    options,
    googleMapsUrl,
    lastUpdated: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    isMockData: true,
  };
}
