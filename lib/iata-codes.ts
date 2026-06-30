/**
 * City name → IATA airport code mapping.
 * Amadeus requires IATA codes, but users type city names.
 * This maps common cities to their main airport.
 */

const CITY_TO_IATA: Record<string, string> = {
  // Origins from your dummy data
  "Berlin": "BER",
  "New York": "JFK",
  "London": "LHR",
  "Mumbai": "BOM",
  "San Francisco": "SFO",
  "Toronto": "YYZ",
  "Dubai": "DXB",
  "Singapore": "SIN",
  "Paris": "CDG",
  "Amsterdam": "AMS",

  // Destinations from your dummy data
  "Lisbon": "LIS",
  "Barcelona": "BCN",
  "Istanbul": "IST",
  "Prague": "PRG",
  "Bangkok": "BKK",
  "Cape Town": "CPT",
  "Mexico City": "MEX",
  "Bali": "DPS",
  "Athens": "ATH",

  // Additional common cities
  "Los Angeles": "LAX",
  "Chicago": "ORD",
  "Tokyo": "NRT",
  "Sydney": "SYD",
  "Hong Kong": "HKG",
  "Seoul": "ICN",
  "Madrid": "MAD",
  "Rome": "FCO",
  "Vienna": "VIE",
  "Zurich": "ZRH",
  "Frankfurt": "FRA",
  "Milan": "MXP",
  "Dublin": "DUB",
  "Copenhagen": "CPH",
  "Stockholm": "ARN",
  "Oslo": "OSL",
  "Helsinki": "HEL",
  "Warsaw": "WAW",
  "Budapest": "BUD",
  "Johannesburg": "JNB",
  "Cairo": "CAI",
  "Nairobi": "NBO",
  "Lagos": "LOS",
  "Buenos Aires": "EZE",
  "São Paulo": "GRU",
  "Bogotá": "BOG",
  "Lima": "LIM",
  "Kuala Lumpur": "KUL",
  "Jakarta": "CGK",
  "Manila": "MNL",
  "Delhi": "DEL",
  "Bangalore": "BLR",
  "Tel Aviv": "TLV",
  "Doha": "DOH",
  "Riyadh": "RUH",
  "Moscow": "SVO",
  "Taipei": "TPE",
  "Shanghai": "PVG",
  "Beijing": "PEK",
};

/**
 * Convert city name to IATA code.
 * Case-insensitive matching.
 */
export function cityToIATA(city: string): string | null {
  // Direct match
  const code = CITY_TO_IATA[city];
  if (code) return code;

  // Case-insensitive match
  const lower = city.toLowerCase();
  for (const [name, iata] of Object.entries(CITY_TO_IATA)) {
    if (name.toLowerCase() === lower) return iata;
  }

  // If it's already a 3-letter IATA code, pass through
  if (/^[A-Z]{3}$/.test(city.toUpperCase())) {
    return city.toUpperCase();
  }

  return null;
}

/**
 * Get all available city names (for autocomplete)
 */
export function getAllCities(): string[] {
  return Object.keys(CITY_TO_IATA).sort();
}
