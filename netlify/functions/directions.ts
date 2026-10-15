import { Handler } from '@netlify/functions';

// Interface definitions matching backend needs
interface DirectionsResponse {
  isMockData: boolean;
  origin: string;
  destination: string;
  options: any[];
  fastestMode: string;
  fastestDurationMinutes: number;
  googleMapsUrl: string;
  lastUpdated: string;
  error?: string;
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let origin = event.queryStringParameters?.origin || '';
  let destination = event.queryStringParameters?.destination || '';

  if (event.body) {
    try {
      const parsed = JSON.parse(event.body);
      origin = parsed.origin || origin;
      destination = parsed.destination || destination;
    } catch {
      // ignore
    }
  }

  if (!origin || !destination) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Origin and destination are required' }),
    };
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

  // If no API key is provided in Netlify environment variables, return high-fidelity live simulation
  if (!apiKey) {
    const mockResult = generateMockRouteResult(origin, destination, googleMapsUrl);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockResult),
    };
  }

  try {
    const now = Math.floor(Date.now() / 1000);

    // Fetch Transit & Driving concurrently
    const [transitRes, drivingRes, bikeRes] = await Promise.all([
      fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=transit&departure_time=${now}&language=de&key=${apiKey}`
      ).then((r) => r.json()),
      fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving&departure_time=now&language=de&key=${apiKey}`
      ).then((r) => r.json()),
      fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=bicycling&language=de&key=${apiKey}`
      ).then((r) => r.json()),
    ]);

    const options: any[] = [];

    // Parse Transit
    if (transitRes.status === 'OK' && transitRes.routes?.[0]?.legs?.[0]) {
      const leg = transitRes.routes[0].legs[0];
      const durationSec = leg.duration?.value || 0;
      const durationMin = Math.round(durationSec / 60);

      const transitSteps: any[] = [];
      let nextDepTime = '';
      let nextDepTimeRelative = '';
      let nextArrTime = '';

      if (leg.steps) {
        for (const step of leg.steps) {
          if (step.travel_mode === 'TRANSIT' && step.transit_details) {
            const td = step.transit_details;
            const depVal = td.departure_time?.value || 0;
            const diffMin = Math.max(0, Math.round((depVal - now) / 60));

            if (!nextDepTime) {
              nextDepTime = td.departure_time?.text || '';
              nextDepTimeRelative = diffMin === 0 ? 'Jetzt' : `in ${diffMin} Min.`;
            }
            nextArrTime = td.arrival_time?.text || nextArrTime;

            transitSteps.push({
              line: td.line?.short_name || td.line?.name || 'ÖPNV',
              vehicleType: td.line?.vehicle?.type || 'BUS',
              departureStop: td.departure_stop?.name || '',
              departureTime: td.departure_time?.text || '',
              departureTimeRelative: diffMin === 0 ? 'Jetzt' : `in ${diffMin} Min.`,
              arrivalStop: td.arrival_stop?.name || '',
              arrivalTime: td.arrival_time?.text || '',
              headsign: td.headsign || '',
              numStops: td.num_stops || 1,
              color: td.line?.color ? `#${td.line.color}` : undefined,
            });
          }
        }
      }

      options.push({
        mode: 'TRANSIT',
        durationMinutes: durationMin,
        durationText: leg.duration?.text || `${durationMin} Min.`,
        distanceText: leg.distance?.text || '',
        isFastest: false,
        transitDetails: {
          departureTime: nextDepTime || leg.departure_time?.text || 'Jetzt',
          departureTimeRelative: nextDepTimeRelative || 'in Kürze',
          arrivalTime: nextArrTime || leg.arrival_time?.text || '',
          transfers: Math.max(0, transitSteps.length - 1),
          steps: transitSteps,
        },
      });
    }

    // Parse Driving
    if (drivingRes.status === 'OK' && drivingRes.routes?.[0]?.legs?.[0]) {
      const leg = drivingRes.routes[0].legs[0];
      const durationSec = leg.duration_in_traffic?.value || leg.duration?.value || 0;
      const baseSec = leg.duration?.value || durationSec;
      const durationMin = Math.round(durationSec / 60);
      const delayMin = Math.max(0, Math.round((durationSec - baseSec) / 60));

      let trafficCondition: 'FAST' | 'MODERATE' | 'HEAVY' = 'FAST';
      if (delayMin >= 10) trafficCondition = 'HEAVY';
      else if (delayMin >= 3) trafficCondition = 'MODERATE';

      options.push({
        mode: 'DRIVING',
        durationMinutes: durationMin,
        durationText: leg.duration_in_traffic?.text || leg.duration?.text || `${durationMin} Min.`,
        distanceText: leg.distance?.text || '',
        isFastest: false,
        trafficDelayMinutes: delayMin,
        trafficCondition,
      });
    }

    // Parse Bicycling
    if (bikeRes.status === 'OK' && bikeRes.routes?.[0]?.legs?.[0]) {
      const leg = bikeRes.routes[0].legs[0];
      const durationSec = leg.duration?.value || 0;
      const durationMin = Math.round(durationSec / 60);

      options.push({
        mode: 'BICYCLING',
        durationMinutes: durationMin,
        durationText: leg.duration?.text || `${durationMin} Min.`,
        distanceText: leg.distance?.text || '',
        isFastest: false,
      });
    }

    if (options.length === 0) {
      // Fallback to simulation if Google API returned ZERO_RESULTS or error
      const mockResult = generateMockRouteResult(origin, destination, googleMapsUrl);
      mockResult.error = `Google API meldete: ${transitRes.status || 'Keine Route gefunden'}. Zeige Schätzung.`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(mockResult),
      };
    }

    // Determine fastest mode
    options.sort((a, b) => a.durationMinutes - b.durationMinutes);
    options[0].isFastest = true;

    const fastest = options[0];

    const result: DirectionsResponse = {
      isMockData: false,
      origin,
      destination,
      options,
      fastestMode: fastest.mode,
      fastestDurationMinutes: fastest.durationMinutes,
      googleMapsUrl,
      lastUpdated: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (err: any) {
    console.error('Directions error:', err);
    const mockResult = generateMockRouteResult(origin, destination, googleMapsUrl);
    mockResult.error = `Fehler bei Google Maps Abfrage (${err.message}). Zeige Live-Simulation.`;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockResult),
    };
  }
};

function generateMockRouteResult(origin: string, destination: string, googleMapsUrl: string): DirectionsResponse {
  const lower = (origin + ' ' + destination).toLowerCase();

  let transitMin = 22;
  let drivingMin = 26;
  let bikeMin = 34;
  let distKm = 7.5;
  let transitLine = 'U-Bahn U2';
  let vehicleType: any = 'SUBWAY';
  let startStation = 'Hauptbahnhof / Station';
  let endStation = 'Zielstation';
  let headsign = 'Richtung Zentrum';

  if (lower.includes('uni') || lower.includes('universität') || lower.includes('campus')) {
    transitMin = 18;
    drivingMin = 24;
    bikeMin = 25;
    distKm = 5.2;
    transitLine = 'U-Bahn U6';
    vehicleType = 'SUBWAY';
    startStation = 'Stadtmitte';
    endStation = 'Universität / Campus';
    headsign = 'Richtung Alt-Tegel';
  } else if (lower.includes('arbeit') || lower.includes('office') || lower.includes('work')) {
    transitMin = 28;
    drivingMin = 21;
    bikeMin = 38;
    distKm = 9.8;
    transitLine = 'S-Bahn S3';
    vehicleType = 'TRAIN';
    startStation = 'Bahnhof West';
    endStation = 'Gewerbepark Nord';
    headsign = 'Richtung Erkner';
  }

  // Slight live variation based on current minute
  const now = new Date();
  const minuteVariation = (now.getMinutes() % 5) - 2;
  transitMin = Math.max(10, transitMin + minuteVariation);
  drivingMin = Math.max(12, drivingMin + (now.getHours() >= 7 && now.getHours() <= 9 ? 6 : 0));

  const depInMinutes = (5 - (now.getMinutes() % 5)) || 5;
  const depTimeDate = new Date(now.getTime() + depInMinutes * 60000);
  const depTimeStr = depTimeDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  const arrTimeDate = new Date(depTimeDate.getTime() + transitMin * 60000);
  const arrTimeStr = arrTimeDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  const options: any[] = [
    {
      mode: 'TRANSIT',
      durationMinutes: transitMin,
      durationText: `${transitMin} Min.`,
      distanceText: `${distKm} km`,
      isFastest: transitMin < drivingMin,
      transitDetails: {
        departureTime: depTimeStr,
        departureTimeRelative: `in ${depInMinutes} Min.`,
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
            numStops: 6,
            color: '#da251d',
          },
        ],
      },
    },
    {
      mode: 'DRIVING',
      durationMinutes: drivingMin,
      durationText: `${drivingMin} Min.`,
      distanceText: `${(distKm * 1.15).toFixed(1)} km`,
      isFastest: drivingMin <= transitMin,
      trafficDelayMinutes: drivingMin > 22 ? 4 : 0,
      trafficCondition: drivingMin > 22 ? 'MODERATE' : 'FAST',
    },
    {
      mode: 'BICYCLING',
      durationMinutes: bikeMin,
      durationText: `${bikeMin} Min.`,
      distanceText: `${distKm} km`,
      isFastest: false,
    },
  ];

  options.sort((a, b) => a.durationMinutes - b.durationMinutes);
  options[0].isFastest = true;

  return {
    isMockData: true,
    origin,
    destination,
    options,
    fastestMode: options[0].mode,
    fastestDurationMinutes: options[0].durationMinutes,
    googleMapsUrl,
    lastUpdated: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}
