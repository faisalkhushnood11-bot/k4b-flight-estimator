"use client";

import { useState } from "react";
import type { FormState, DestinationResult, CabinClass } from "@/lib/types";
import { calculateEstimates } from "@/lib/estimator"; // Fallback for offline use
import PasswordGate from "@/components/PasswordGate";

const ALL_CITIES = [
  "Amsterdam", "Athens", "Bali", "Bangalore", "Bangkok", "Barcelona",
  "Beijing", "Berlin", "Bogotá", "Buenos Aires", "Budapest", "Cairo",
  "Cape Town", "Chicago", "Copenhagen", "Delhi", "Doha", "Dubai",
  "Dublin", "Frankfurt", "Helsinki", "Hong Kong", "Istanbul", "Jakarta",
  "Johannesburg", "Kuala Lumpur", "Lagos", "Lima", "Lisbon", "London",
  "Los Angeles", "Madrid", "Manila", "Mexico City", "Miami", "Milan",
  "Moscow", "Mumbai", "Nairobi", "New York", "Oslo", "Paris", "Prague",
  "Riyadh", "Rome", "San Francisco", "São Paulo", "Seoul", "Shanghai",
  "Singapore", "Stockholm", "Sydney", "Taipei", "Tel Aviv", "Tokyo",
  "Toronto", "Vienna", "Warsaw", "Zurich",
];

const ORIGIN_CITIES = ALL_CITIES;
const DESTINATION_CITIES = ALL_CITIES;

const KAYAK_BLUE = "#0546B0";
const KAYAK_ORANGE = "#FF6B00";
const KAYAK_DARK = "#1a1a2e";

function StepIndicator({ current }: { current: number }) {
  const steps = ["Origins", "Destinations", "Dates"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={{
                  background: done ? KAYAK_ORANGE : active ? KAYAK_ORANGE : "#e2e8f0",
                  color: done || active ? "#fff" : "#64748b",
                }}
              >
                {done ? "✓" : idx}
              </div>
              <span
                className="mt-1 text-xs font-medium"
                style={{ color: active ? KAYAK_ORANGE : done ? "#64748b" : "#94a3b8" }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-20 h-0.5 mb-4 mx-1 transition-all"
                style={{ background: done ? KAYAK_ORANGE : "#e2e8f0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CityAutocomplete({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const filtered = options.filter(
    (o) => o.toLowerCase().includes(value.toLowerCase()) && o !== value
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
          {filtered.map((city) => (
            <li
              key={city}
              onMouseDown={() => { onChange(city); setOpen(false); }}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Step1({
  state,
  setState,
  onNext,
}: {
  state: FormState;
  setState: (s: FormState) => void;
  onNext: () => void;
}) {
  const addOrigin = () =>
    setState({ ...state, origins: [...state.origins, { city: "", count: 1 }] });

  const removeOrigin = (i: number) =>
    setState({ ...state, origins: state.origins.filter((_, idx) => idx !== i) });

  const updateOrigin = (i: number, field: "city" | "count", value: string | number) => {
    const updated = state.origins.map((o, idx) =>
      idx === i ? { ...o, [field]: value } : o
    );
    setState({ ...state, origins: updated });
  };

  const valid = state.origins.some((o) => o.city.trim() && o.count > 0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1 text-gray-900">Where is your team flying from?</h2>
      <p className="text-sm text-gray-500 mb-6">Add each departure city and the number of travelers from there.</p>

      <div className="space-y-3">
        {state.origins.map((origin, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="flex-1">
              <CityAutocomplete
                value={origin.city}
                onChange={(v) => updateOrigin(i, "city", v)}
                options={ORIGIN_CITIES}
                placeholder="e.g. Berlin"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateOrigin(i, "count", Math.max(1, origin.count - 1))}
                className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 flex items-center justify-center text-lg leading-none"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gray-800">{origin.count}</span>
              <button
                onClick={() => updateOrigin(i, "count", origin.count + 1)}
                className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 flex items-center justify-center text-lg leading-none"
              >
                +
              </button>
              <span className="text-xs text-gray-400 w-14">{origin.count === 1 ? "person" : "people"}</span>
            </div>
            {state.origins.length > 1 && (
              <button
                onClick={() => removeOrigin(i)}
                className="text-gray-300 hover:text-red-400 text-lg leading-none"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addOrigin}
        className="mt-4 text-sm font-medium flex items-center gap-1.5"
        style={{ color: KAYAK_ORANGE }}
      >
        <span className="text-lg leading-none">+</span> Add another city
      </button>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!valid}
          className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: KAYAK_ORANGE }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function Step2({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: FormState;
  setState: (s: FormState) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const updateDest = (i: number, value: string) => {
    const updated = state.destinations.map((d, idx) => (idx === i ? value : d));
    setState({ ...state, destinations: updated });
  };

  const addDest = () => {
    if (state.destinations.length < 5)
      setState({ ...state, destinations: [...state.destinations, ""] });
  };

  const removeDest = (i: number) =>
    setState({ ...state, destinations: state.destinations.filter((_, idx) => idx !== i) });

  const valid = state.destinations.some((d) => d.trim());

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1 text-gray-900">Where are you considering?</h2>
      <p className="text-sm text-gray-500 mb-6">Add up to 5 candidate destinations.</p>

      <div className="space-y-3">
        {state.destinations.map((dest, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="flex-1">
              <CityAutocomplete
                value={dest}
                onChange={(v) => updateDest(i, v)}
                options={DESTINATION_CITIES}
                placeholder={`e.g. ${DESTINATION_CITIES[i] ?? "Destination"}`}
              />
            </div>
            {state.destinations.length > 1 && (
              <button
                onClick={() => removeDest(i)}
                className="text-gray-300 hover:text-red-400 text-lg leading-none"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {state.destinations.length < 5 && (
        <button
          onClick={addDest}
          className="mt-4 text-sm font-medium flex items-center gap-1.5"
          style={{ color: KAYAK_BLUE }}
        >
          <span className="text-lg leading-none">+</span> Add another destination
        </button>
      )}

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:border-gray-300">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: KAYAK_ORANGE }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function Step3({
  state,
  setState,
  onSearch,
  onBack,
  loading,
}: {
  state: FormState;
  setState: (s: FormState) => void;
  onSearch: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const valid = state.departureDate && state.returnDate;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1 text-gray-900">When are you travelling?</h2>
      <p className="text-sm text-gray-500 mb-6">Select your travel window.</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Departure date</label>
          <input
            type="date"
            value={state.departureDate}
            onChange={(e) => setState({ ...state, departureDate: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Return date</label>
          <input
            type="date"
            value={state.returnDate}
            onChange={(e) => setState({ ...state, returnDate: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 mb-2">Cabin class</label>
        <div className="flex gap-2">
          {(["economy", "business", "first"] as CabinClass[]).map((cabin) => {
            const labels: Record<CabinClass, string> = { economy: "Economy", business: "Business", first: "First" };
            const active = state.cabinClass === cabin;
            return (
              <button
                key={cabin}
                onClick={() => setState({ ...state, cabinClass: cabin })}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-all"
                style={{
                  background: active ? KAYAK_ORANGE : "#fff",
                  borderColor: active ? KAYAK_ORANGE : "#e2e8f0",
                  color: active ? "#fff" : "#64748b",
                }}
              >
                {labels[cabin]}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setState({ ...state, directOnly: !state.directOnly })}
          className="w-11 h-6 rounded-full relative transition-colors cursor-pointer"
          style={{ background: state.directOnly ? KAYAK_ORANGE : "#cbd5e1" }}
        >
          <div
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
            style={{ transform: state.directOnly ? "translateX(22px)" : "translateX(2px)" }}
          />
        </div>
        <span className="text-sm text-gray-700 font-medium">Direct flights only</span>
      </label>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:border-gray-300">
          ← Back
        </button>
        <button
          onClick={onSearch}
          disabled={!valid || loading}
          className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40 flex items-center gap-2"
          style={{ background: KAYAK_ORANGE }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              Estimating...
            </>
          ) : (
            "Compare flights →"
          )}
        </button>
      </div>
    </div>
  );
}

function ResultsScreen({
  results,
  state,
  onReset,
}: {
  results: DestinationResult[];
  state: FormState;
  onReset: () => void;
}) {
  const totalTravelers = state.origins.reduce((sum, o) => sum + o.count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Flight cost comparison</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalTravelers} traveler{totalTravelers !== 1 ? "s" : ""} ·{" "}
            {state.departureDate} → {state.returnDate} ·{" "}
            {state.cabinClass.charAt(0).toUpperCase() + state.cabinClass.slice(1)}
            {state.directOnly ? " · Direct only" : ""}
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-sm font-medium px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 text-gray-600"
        >
          ← New search
        </button>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No routes found.</p>
          <p className="text-sm mt-1">Try turning off &quot;Direct only&quot; or adding different cities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r, i) => {
            const isBest = i === 0;
            return (
              <div
                key={r.destination}
                className="bg-white rounded-xl shadow-sm border overflow-hidden"
                style={{ borderColor: isBest ? KAYAK_ORANGE : "#e2e8f0" }}
              >
                {isBest && (
                  <div
                    className="px-5 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5"
                    style={{ background: KAYAK_ORANGE }}
                  >
                    ★ Cheapest option
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{r.destination}</h3>
                      {!r.hasAllRoutes && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          Some routes missing data
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: isBest ? KAYAK_ORANGE : KAYAK_DARK }}>
                        €{r.totalCost.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">€{r.avgPerPerson} avg / person</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Route breakdown</p>
                    <div className="space-y-2">
                      {r.routes.map((route) => (
                        <div key={route.origin} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">{route.origin}</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-gray-700">{route.destination}</span>
                            {route.direct ? (
                              <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Direct</span>
                            ) : (
                              <span className="text-xs bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded">Connecting</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-right shrink-0">
                            <span className="text-gray-400 text-xs">{route.travelers}× €{route.pricePerPerson}</span>
                            <span className="font-semibold text-gray-800 w-20 text-right">€{route.subtotal.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-6 text-xs text-gray-500">
                    <span>
                      Cheapest route:{" "}
                      <strong className="text-gray-700">
                        {r.cheapestRoute.origin} (€{r.cheapestRoute.pricePerPerson})
                      </strong>
                    </span>
                    <span>
                      Priciest route:{" "}
                      <strong className="text-gray-700">
                        {r.mostExpensiveRoute.origin} (€{r.mostExpensiveRoute.pricePerPerson})
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const defaultState: FormState = {
  origins: [{ city: "", count: 1 }],
  destinations: [""],
  departureDate: "",
  returnDate: "",
  directOnly: false,
  cabinClass: "economy",
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<FormState>(defaultState);
  const [results, setResults] = useState<DestinationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Try the API route first (uses Amadeus if configured, falls back to dummy data server-side)
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origins: formState.origins,
          destinations: formState.destinations,
          departureDate: formState.departureDate,
          returnDate: formState.returnDate,
          directOnly: formState.directOnly,
          cabinClass: formState.cabinClass,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      } else {
        // API route failed — fall back to client-side dummy calculation
        const estimates = calculateEstimates(
          formState.origins,
          formState.destinations,
          formState.directOnly,
          formState.cabinClass
        );
        setResults(estimates);
      }
    } catch {
      // Network error — fall back to client-side dummy calculation
      const estimates = calculateEstimates(
        formState.origins,
        formState.destinations,
        formState.directOnly,
        formState.cabinClass
      );
      setResults(estimates);
    }
    setLoading(false);
    setStep(4);
  };

  const handleReset = () => {
    setFormState(defaultState);
    setResults([]);
    setStep(1);
  };

  return (
    <PasswordGate>
    <div className="min-h-screen flex flex-col" style={{ background: "#f8f9fb" }}>
      <nav className="flex items-center px-8 h-14 shrink-0 border-b border-gray-100" style={{ background: "#ffffff" }}>
        <span className="font-bold text-base tracking-tight" style={{ color: KAYAK_DARK }}>
          K4B <span style={{ color: KAYAK_ORANGE }}>Flight Estimator</span>
        </span>
        <span
          className="ml-3 text-xs px-2 py-0.5 rounded font-medium"
          style={{ background: "#fff3eb", color: KAYAK_ORANGE }}
        >
          by KAYAK for Business
        </span>
      </nav>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {step < 4 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Plan your team offsite</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Compare total flight costs across destinations in seconds.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <StepIndicator current={step} />
                {step === 1 && (
                  <Step1 state={formState} setState={setFormState} onNext={() => setStep(2)} />
                )}
                {step === 2 && (
                  <Step2
                    state={formState}
                    setState={setFormState}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                  />
                )}
                {step === 3 && (
                  <Step3
                    state={formState}
                    setState={setFormState}
                    onSearch={handleSearch}
                    onBack={() => setStep(2)}
                    loading={loading}
                  />
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <ResultsScreen results={results} state={formState} onReset={handleReset} />
          )}
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        Prices are estimates for demo purposes only. Not for actual booking.
      </footer>
    </div>
    </PasswordGate>
  );
}
