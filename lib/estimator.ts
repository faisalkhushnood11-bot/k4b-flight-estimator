import flightData from "@/data/flights.json";
import type { Origin, DestinationResult, RouteResult, CabinClass } from "./types";

const flights = flightData as Record<string, { economy: number; direct: boolean }>;

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  economy: 1,
  business: 3,
  first: 6,
};

function getPrice(origin: string, destination: string): { economy: number; direct: boolean } | null {
  return flights[`${origin}-${destination}`] ?? null;
}

export function calculateEstimates(
  origins: Origin[],
  destinations: string[],
  directOnly: boolean,
  cabinClass: CabinClass
): DestinationResult[] {
  const multiplier = CABIN_MULTIPLIER[cabinClass];
  const results: DestinationResult[] = [];

  for (const dest of destinations) {
    if (!dest.trim()) continue;

    const routes: RouteResult[] = [];
    let hasAllRoutes = true;
    let totalTravelers = 0;

    for (const origin of origins) {
      if (!origin.city.trim()) continue;
      const data = getPrice(origin.city, dest);

      if (!data) {
        hasAllRoutes = false;
        continue;
      }

      if (directOnly && !data.direct) continue;

      const pricePerPerson = Math.round(data.economy * multiplier);
      const subtotal = pricePerPerson * origin.count;
      routes.push({
        origin: origin.city,
        destination: dest,
        pricePerPerson,
        direct: data.direct,
        travelers: origin.count,
        subtotal,
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
      hasAllRoutes,
    });
  }

  return results.sort((a, b) => a.totalCost - b.totalCost);
}
