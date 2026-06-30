import airportData from "@/data/airports.json";

export interface Airport {
  iata: string;
  city: string;
  country: string;
}

const airports = airportData as Airport[];

/**
 * Search airports by city name. Returns top matches.
 * Searches from the beginning of the city name (prefix match)
 * for fast, relevant results as users type.
 */
export function searchAirports(query: string, limit: number = 8): Airport[] {
  if (!query || query.length < 2) return [];

  const lower = query.toLowerCase();

  // Prefix matches first (city starts with query), then includes
  const prefixMatches: Airport[] = [];
  const includesMatches: Airport[] = [];

  for (const airport of airports) {
    const cityLower = airport.city.toLowerCase();
    if (cityLower.startsWith(lower)) {
      prefixMatches.push(airport);
    } else if (cityLower.includes(lower)) {
      includesMatches.push(airport);
    }

    // Early exit once we have enough
    if (prefixMatches.length + includesMatches.length >= limit * 2) break;
  }

  return [...prefixMatches, ...includesMatches].slice(0, limit);
}

/**
 * Get IATA code for a city name (exact or best match).
 * Used by the API route to convert user selections to IATA codes.
 */
export function getIATACode(city: string): string | null {
  if (!city) return null;

  const lower = city.toLowerCase();

  // Exact match
  const exact = airports.find((a) => a.city.toLowerCase() === lower);
  if (exact) return exact.iata;

  // If input looks like "City (CODE)" format, extract the code
  const codeMatch = city.match(/\(([A-Z]{3})\)/);
  if (codeMatch) return codeMatch[1];

  // If it's already a 3-letter code
  if (/^[A-Z]{3}$/.test(city.toUpperCase())) return city.toUpperCase();

  // Partial match
  const partial = airports.find((a) => a.city.toLowerCase().startsWith(lower));
  if (partial) return partial.iata;

  return null;
}
