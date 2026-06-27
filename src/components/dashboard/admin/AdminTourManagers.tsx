"use client";

import { useState, useEffect } from "react";
import Skeleton from "@/components/ui/Skeleton";

interface TourManager {
  id: string;
  user_id: number;
  display_name?: string;
  assigned_artists: string[];
  is_active: boolean;
  created_at: string;
  users: { name: string; email: string; role: string };
  totalBudget: number;
  totalSpent: number;
  activeTours: number;
}

export default function AdminTourManagers() {
  const [tms, setTms] = useState<TourManager[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/tour-managers")
      .then((r) => r.json())
      .then((d) => setTms(Array.isArray(d) ? d : []))
      .catch(() => setTms([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" className="w-48 h-6 bg-gray-200" />
        <Skeleton className="h-16 w-full bg-gray-200" />
        <Skeleton className="h-16 w-full bg-gray-200" />
        <Skeleton className="h-16 w-full bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tour Manager</h2>
        <span className="text-sm text-gray-500 font-bold">{tms.length} attivi</span>
      </div>

      {tms.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">Nessun tour manager registrato.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-500 border-b border-black/5">
                <th className="py-3 font-bold">Nome</th>
                <th className="py-3 font-bold">Ruolo Base</th>
                <th className="py-3 font-bold">Tour Attivi</th>
                <th className="py-3 font-bold">Budget Totale</th>
                <th className="py-3 font-bold">Speso</th>
                <th className="py-3 font-bold">Stato</th>
              </tr>
            </thead>
            <tbody>
              {tms.map((tm) => (
                <tr key={tm.id} className="border-t border-black/5">
                  <td className="py-3 font-medium">
                    {tm.display_name || tm.users.name}
                    <p className="text-xs text-gray-400 mt-0.5">{tm.users.email}</p>
                  </td>
                  <td className="py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-black/5 capitalize">
                      {tm.users.role}
                    </span>
                  </td>
                  <td className="py-3 font-bold">{tm.activeTours}</td>
                  <td className="py-3">€{tm.totalBudget.toLocaleString()}</td>
                  <td className="py-3">€{tm.totalSpent.toLocaleString()}</td>
                  <td className="py-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        tm.is_active
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {tm.is_active ? "Attivo" : "Disabilitato"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}