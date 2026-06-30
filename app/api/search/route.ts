import { NextRequest, NextResponse } from "next/server";
import { searchFlightPrice } from "@/lib/amadeus";
import { cityToIATA } from "@/lib/iata-codes";
import flightData from "@/data/flights.json";

const flights = flightData as Record<string, { economy: number; direct: boolean }>;

interface SearchRequest {
  origins: { city: string; count: number }[];
  destinations: string[];
  departureDate: string;
  returnDate?: string;
  directOnly: boolean;
  cabinClass: "economy" | "business" | "first";
}

const CABIN_MULTIPLIER = { economy: 1, business: 3, first: 6 };

/**
 * Fallback: get price from dummy data when API fails or city not found.
 */
function getDummyPrice(origin: string, destination: string): { economy: number; direct: boolean } | null {
  return flights[`${origin}-${destination}`] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { origins, destinations, departureDate, returnDate, directOnly, cabinClass } = body;

    // Validate input
    if (!origins?.length || !destinations?.length || !departureDate) {
      return NextResponse.json(
        { error: "Missing required fields: origins, destinations, departureDate" },
        { status: 400 }
      );
    }

    const multiplier = CABIN_MULTIPLIER[cabinClass] || 1;
    const results = [];

    for (const dest of destinations) {
      if (!dest.trim()) continue;

      const destIATA = cityToIATA(dest);
      const routes = [];
      let totalTravelers = 0;

      for (const origin of origins) {
        if (!origin.city.trim()) continue;

        const originIATA = cityToIATA(origin.city);
        let price: number | null = null;
        let isDirect = false;
        let source: "api" | "fallback" = "fallback";

        // Try SerpApi (Google Flights) first (only if we have valid IATA codes and API key is set)
        if (originIATA && destIATA && process.env.SERPAPI_KEY) {
          try {
            const offer = await searchFlightPrice(
              originIATA,
              destIATA,
              departureDate,
              returnDate,
              directOnly
            );
            if (offer) {
              price = offer.price;
              isDirect = offer.direct;
              source = "api";
            }
          } catch {
            // API failed — fall through to dummy data
          }
        }

        // Fallback to dummy data
        if (price === null) {
          const dummy = getDummyPrice(origin.city, dest);
          if (dummy) {
            if (directOnly && !dummy.direct) continue;
            price = dummy.economy;
            isDirect = dummy.direct;
          } else {
            continue; // No data available for this route
          }
        }

        const pricePerPerson = Math.round(price * multiplier);
        const subtotal = pricePerPerson * origin.count;

        routes.push({
          origin: origin.city,
          destination: dest,
          pricePerPerson,
          direct: isDirect,
          travelers: origin.count,
          subtotal,
          source,
        });
        totalTravelers += origin.count;
      }

      if (routes.length === 0) continue;

      const totalCost = routes.reduce((sum, r) => sum + r.subtotal, 0);
      const avgPerPerson = totalTravelers > 0 ? Math.round(totalCost / totalTravelers) : 0;
      const sorted = [...routes].sort((a, b) => a.pricePerPerson - b.pricePerPerson);

      results.push({
        destination: dest,
        totalCost,
        avgPerPerson,
        routes,
        cheapestRoute: sorted[0],
        mostExpensiveRoute: sorted[sorted.length - 1],
        hasAllRoutes: routes.length === origins.length,
      });
    }

    results.sort((a, b) => a.totalCost - b.totalCost);

    return NextResponse.json({
      results,
      meta: {
        dataSource: process.env.SERPAPI_KEY ? "google_flights" : "dummy",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
