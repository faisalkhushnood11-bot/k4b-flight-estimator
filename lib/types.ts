export interface Origin {
  city: string;
  count: number;
}

export type CabinClass = "economy" | "business" | "first";

export interface FormState {
  origins: Origin[];
  destinations: string[];
  departureDate: string;
  returnDate: string;
  directOnly: boolean;
  cabinClass: CabinClass;
}

export interface RouteResult {
  origin: string;
  destination: string;
  pricePerPerson: number;
  direct: boolean;
  travelers: number;
  subtotal: number;
}

export interface DestinationResult {
  destination: string;
  totalCost: number;
  avgPerPerson: number;
  routes: RouteResult[];
  cheapestRoute: RouteResult;
  mostExpensiveRoute: RouteResult;
  hasAllRoutes: boolean;
}
