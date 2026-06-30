/**
 * SerpApi (Google Flights) client — server-side only.
 *
 * SECURITY:
 * - API key read from environment variable (never hardcoded)
 * - This file runs ONLY on the server (Next.js API route)
 * - Key is never exposed to the browser
 * - Read-only: searches prices, cannot book anything
 */

const SERPAPI_BASE_URL = "https://serpapi.com/search.json";

export interface FlightOffer {
  price: number;
  direct: boolean;
  currency: string;
}

/**
 * Search for cheapest flight price using Google Flights via SerpApi.
 * Returns the lowest price found, or null if no flights available.
 */
export async function searchFlightPrice(
  originIATA: string,
  destinationIATA: string,
  departureDate: string,
  returnDate?: string,
  directOnly: boolean = false
): Promise<FlightOffer | null> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new Error("SERPAPI_KEY must be set in environment variables");
  }

  const params = new URLSearchParams({
    engine: "google_flights",
    departure_id: originIATA,
    arrival_id: destinationIATA,
    outbound_date: departureDate,
    currency: "EUR",
    hl: "en",
    api_key: apiKey,
  });

  if (returnDate) {
    params.set("return_date", returnDate);
    params.set("type", "1"); // Round trip
  } else {
    params.set("type", "2"); // One way
  }

  if (directOnly) {
    params.set("stops", "1"); // 1 = nonstop only in SerpApi
  }

  const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    if (response.status === 429) {
      return null; // Rate limited — caller will use fallback
    }
    return null;
  }

  const data = await response.json();

  // SerpApi returns best_flights and other_flights arrays
  const flights = [
    ...(data.best_flights || []),
    ...(data.other_flights || []),
  ];

  if (flights.length === 0) {
    return null;
  }

  // Get cheapest flight
  let cheapest = flights[0];
  for (const flight of flights) {
    if (flight.price < cheapest.price) {
      cheapest = flight;
    }
  }

  // Check if direct (single leg with single segment)
  const isDirect = cheapest.flights?.length === 1;

  return {
    price: Math.round(cheapest.price),
    direct: isDirect,
    currency: "EUR",
  };
}
