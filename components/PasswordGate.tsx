"use client";

import { useState } from "react";

const KAYAK_ORANGE = "#FF6B00";
const KAYAK_DARK = "#1a1a2e";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const check = () => {
    if (input === process.env.NEXT_PUBLIC_DEMO_PASSWORD) {
      setUnlocked(true);
    } else {
      setError(true);
      setInput("");
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#f8f9fb" }}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-sm text-center">
        <div className="mb-6">
          <span className="font-bold text-lg" style={{ color: KAYAK_DARK }}>
            K4B <span style={{ color: KAYAK_ORANGE }}>Flight Estimator</span>
          </span>
          <p className="text-sm text-gray-400 mt-1">by KAYAK for Business</p>
        </div>

        <p className="text-sm text-gray-600 mb-5">Enter the demo password to continue.</p>

        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder="Password"
          autoFocus
          className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white mb-3 ${
            error ? "border-red-300 focus:ring-red-200" : "border-gray-200"
          }`}
        />

        {error && (
          <p className="text-xs text-red-500 mb-3">Incorrect password. Try again.</p>
        )}

        <button
          onClick={check}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: KAYAK_ORANGE }}
        >
          Enter →
        </button>
      </div>
    </div>
  );
}
