"use client";

import { useState, useEffect } from "react";
import Skeleton from "@/components/ui/Skeleton";
import SettlementSheet from "./SettlementSheet";
import type { Tour } from "./types";

interface TourHubProps {
  currentUser: { id: string; name?: string };
}

export default function TourHub({ currentUser }: TourHubProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [settlementTourId, setSettlementTourId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tour/list?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then((d) => setTours(Array.isArray(d) ? d : []))
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, [currentUser.id]);

  // ── Loading State ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton variant="text" className="w-64 h-8 bg-gray-800" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full bg-gray-800" />
          <Skeleton className="h-40 w-full bg-gray-800" />
          <Skeleton className="h-40 w-full bg-gray-800" />
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Tour Hub</h1>
          <p className="text-gray-400 mt-1">Gestisci tour, budget e settlement</p>
        </div>
        <button className="bg-[#ff5a00] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e04f00] transition-colors">
          + Nuovo Tour
        </button>
      </div>

      {/* Empty State */}
      {tours.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-700 rounded-2xl">
          <p className="text-gray-400 text-lg">Nessun tour attivo</p>
          <p className="text-gray-500 text-sm mt-2">Crea il tuo primo tour per iniziare</p>
        </div>
      ) : (
        /* Tour Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-[#ff5a00]/50 transition-colors"
            >
              {/* Status + Date */}
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    tour.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : tour.status === "draft"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {tour.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {tour.startDate} → {tour.endDate}
                </span>
              </div>

              {/* Tour Name */}
              <h3 className="text-lg font-bold text-white mb-1">{tour.name}</h3>

              {/* Budget Summary */}
              <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-sm">
                <div>
                  <p className="text-gray-500">Budget</p>
                  <p className="text-white font-bold">€{tour.budgetPlanned.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Speso</p>
                  <p
                    className={`font-bold ${
                      tour.budgetActual > tour.budgetPlanned ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    €{tour.budgetActual.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Settlement Button */}
              <button
                onClick={() => setSettlementTourId(tour.id)}
                className="mt-3 w-full py-2 rounded-lg border border-gray-700 text-gray-300 text-xs font-bold hover:border-[#ff5a00] hover:text-[#ff5a00] transition-colors"
              >
                + Settlement
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Settlement Modal */}
      {settlementTourId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0b] rounded-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl">
            <SettlementSheet
              tourId={settlementTourId}
              currentUser={currentUser}
              onClose={() => setSettlementTourId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}