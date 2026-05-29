"use client";

import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 5;

export default function OrganizerStatement({ events = [], bookings = [] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const [revenues, setRevenues] = useState(() => {
    const initialValues = {};

    events.forEach((event) => {
      initialValues[event.id] = event.revenue ? String(event.revenue) : "";
    });

    return initialValues;
  });

  const [savingEventId, setSavingEventId] = useState(null);
  const [savedEventId, setSavedEventId] = useState(null);

  const eventRows = useMemo(() => {
    return events
      .map((event) => {
        const relatedBookings = bookings.filter((booking) => {
          return String(booking.eventId) === String(event.id);
        });

        const acceptedBookings = relatedBookings.filter(
          (booking) => booking.status === "accepted"
        );

        const artistCost = acceptedBookings.reduce((total, booking) => {
          return total + getBookingCost(booking);
        }, 0);

        const revenue = getRevenueValue(
          revenues[event.id] !== undefined ? revenues[event.id] : event.revenue
        );

        const profit = revenue - artistCost;

        return {
          ...event,
          relatedBookings,
          acceptedBookings,
          artistCost,
          revenue,
          profit,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.eventDate || a.createdAt || 0);
        const dateB = new Date(b.date || b.eventDate || b.createdAt || 0);

        return dateB - dateA;
      });
  }, [events, bookings, revenues]);

  const totalArtistCost = eventRows.reduce(
    (total, event) => total + event.artistCost,
    0
  );

  const totalRevenue = eventRows.reduce(
    (total, event) => total + event.revenue,
    0
  );

  const totalProfit = totalRevenue - totalArtistCost;

  const totalPages = Math.max(1, Math.ceil(eventRows.length / ITEMS_PER_PAGE));

  const paginatedRows = eventRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function updateRevenueInput(eventId, value) {
    setRevenues((current) => ({
      ...current,
      [eventId]: value,
    }));

    if (savedEventId === eventId) {
      setSavedEventId(null);
    }
  }

  async function saveRevenue(eventId) {
    const value = revenues[eventId] || "0";

    setSavingEventId(eventId);
    setSavedEventId(null);

    try {
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: eventId,
          revenue: value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Errore salvataggio incasso serata.");
        setSavingEventId(null);
        return;
      }

      setRevenues((current) => ({
        ...current,
        [eventId]: String(data.revenue || value || "0"),
      }));

      setSavedEventId(eventId);

      setTimeout(() => {
        setSavedEventId(null);
      }, 1800);
    } catch (error) {
      console.error("Errore salvataggio incasso:", error);
      alert("Errore salvataggio incasso serata.");
    }

    setSavingEventId(null);
  }

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function goToNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  return (
    <section
      id="organizer-statement"
      className="bg-white border border-black/5 rounded-[28px] p-5 md:p-7 shadow-sm mt-8 scroll-mt-8 overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
        <div>
          <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
            Estratto conto
          </p>

          <h2 className="text-3xl font-black tracking-[-0.04em] leading-tight">
            Costi, incassi e margini
          </h2>

          <p className="text-black/50 mt-2">
            Inserisci l’incasso della serata, salvalo e controlla il margine
            stimato.
          </p>
        </div>

        <div className="rounded-3xl bg-[#111] text-white px-5 py-4">
          <p className="text-xs uppercase tracking-[2px] text-white/40 font-black">
            Utile stimato
          </p>

          <p className="text-2xl font-black mt-1">
            € {totalProfit.toLocaleString("it-IT")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard title="Incasso totale" value={totalRevenue} />
        <SummaryCard title="Costo artisti" value={totalArtistCost} />
        <SummaryCard title="Margine stimato" value={totalProfit} highlight />
      </div>

      {eventRows.length === 0 ? (
        <div className="rounded-3xl bg-[#f7f7f8] border border-black/5 p-6">
          <p className="font-black">
            Nessun evento disponibile.
          </p>

          <p className="text-black/45 mt-2">
            Crea un evento e invia un booking per iniziare a calcolare costi e
            incassi.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto rounded-3xl border border-black/5">
            <table className="w-full">
              <thead>
                <tr className="text-left text-black/40 border-b border-black/5 bg-[#f7f7f8]">
                  <th className="p-4">Evento</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Booking accettati</th>
                  <th className="p-4">Costo artisti</th>
                  <th className="p-4">Incasso serata</th>
                  <th className="p-4">Margine</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.map((event) => (
                  <tr key={event.id} className="border-b border-black/5">
                    <td className="p-4 font-black">
                      {event.title || "Evento"}
                    </td>

                    <td className="p-4">
                      {event.date || event.eventDate || "-"}
                    </td>

                    <td className="p-4">
                      {event.acceptedBookings.length}
                    </td>

                    <td className="p-4 font-black">
                      € {event.artistCost.toLocaleString("it-IT")}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input
                          value={revenues[event.id] ?? ""}
                          onChange={(e) =>
                            updateRevenueInput(event.id, e.target.value)
                          }
                          placeholder="€ 0"
                          inputMode="decimal"
                          className="w-32 bg-white border border-black/10 rounded-2xl px-4 py-3 outline-none focus:border-[#ff5a00]"
                        />

                        <button
                          type="button"
                          onClick={() => saveRevenue(event.id)}
                          disabled={savingEventId === event.id}
                          className="bg-[#111] text-white rounded-2xl px-4 py-3 font-black text-sm disabled:opacity-40"
                        >
                          {savingEventId === event.id ? "Salvo..." : "Salva"}
                        </button>
                      </div>

                      {savedEventId === event.id && (
                        <p className="text-xs text-green-600 font-black mt-2">
                          Salvato
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <MarginBadge value={event.profit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {paginatedRows.map((event) => (
              <article
                key={event.id}
                className="rounded-3xl border border-black/5 bg-[#f7f7f8] p-4 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[2px] text-black/35 font-black mb-2">
                      Evento
                    </p>

                    <h3 className="text-xl font-black tracking-[-0.03em] break-words">
                      {event.title || "Evento"}
                    </h3>

                    <p className="text-sm text-black/45 mt-1">
                      {event.date || event.eventDate || "-"}
                    </p>
                  </div>

                  <MarginBadge value={event.profit} />
                </div>

                <div className="grid grid-cols-1 gap-3 mt-5">
                  <InfoBox
                    label="Booking accettati"
                    value={event.acceptedBookings.length}
                  />

                  <InfoBox
                    label="Costo artisti"
                    value={`€ ${event.artistCost.toLocaleString("it-IT")}`}
                    strong
                  />

                  <div className="bg-white border border-black/5 rounded-2xl p-3">
                    <p className="text-xs text-black/35 font-black uppercase tracking-[2px]">
                      Incasso serata
                    </p>

                    <input
                      value={revenues[event.id] ?? ""}
                      onChange={(e) =>
                        updateRevenueInput(event.id, e.target.value)
                      }
                      placeholder="€ 0"
                      inputMode="decimal"
                      className="w-full bg-[#f7f7f8] border border-black/10 rounded-2xl px-4 py-3 outline-none mt-2 focus:border-[#ff5a00]"
                    />

                    <button
                      type="button"
                      onClick={() => saveRevenue(event.id)}
                      disabled={savingEventId === event.id}
                      className="w-full bg-[#111] text-white rounded-2xl px-4 py-3 font-black text-sm mt-3 disabled:opacity-40"
                    >
                      {savingEventId === event.id
                        ? "Salvataggio..."
                        : "Salva incasso"}
                    </button>

                    {savedEventId === event.id && (
                      <p className="text-xs text-green-600 font-black mt-2">
                        Incasso salvato
                      </p>
                    )}
                  </div>

                  <InfoBox
                    label="Margine"
                    value={`€ ${event.profit.toLocaleString("it-IT")}`}
                    strong
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 border-t border-black/5 pt-5">
            <p className="text-sm text-black/45 font-bold">
              Pagina {currentPage} di {totalPages} · {eventRows.length} eventi
            </p>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="bg-[#f7f7f8] border border-black/5 text-black px-5 py-3 rounded-2xl font-black text-sm disabled:opacity-40"
              >
                Indietro
              </button>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="bg-[#111] text-white px-5 py-3 rounded-2xl font-black text-sm disabled:opacity-40"
              >
                Avanti
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function SummaryCard({ title, value, highlight = false }) {
  return (
    <div
      className={
        highlight
          ? "rounded-3xl border border-[#ff5a00]/20 bg-[#ff5a00]/10 p-5 overflow-hidden"
          : "rounded-3xl border border-black/5 bg-[#f7f7f8] p-5 overflow-hidden"
      }
    >
      <p
        className={
          highlight
            ? "text-sm text-[#ff5a00] font-black"
            : "text-sm text-black/45 font-black"
        }
      >
        {title}
      </p>

      <p className="text-3xl font-black tracking-[-0.04em] mt-4">
        € {value.toLocaleString("it-IT")}
      </p>
    </div>
  );
}

function InfoBox({ label, value, strong = false }) {
  return (
    <div className="bg-white border border-black/5 rounded-2xl p-3">
      <p className="text-xs text-black/35 font-black uppercase tracking-[2px]">
        {label}
      </p>

      <p
        className={
          strong
            ? "font-black text-xl mt-1"
            : "font-bold mt-1 break-words"
        }
      >
        {value}
      </p>
    </div>
  );
}

function MarginBadge({ value }) {
  if (value >= 0) {
    return (
      <span className="inline-flex px-3 py-2 rounded-full bg-green-100 text-green-700 text-xs font-black whitespace-nowrap">
        + € {value.toLocaleString("it-IT")}
      </span>
    );
  }

  return (
    <span className="inline-flex px-3 py-2 rounded-full bg-red-100 text-red-700 text-xs font-black whitespace-nowrap">
      - € {Math.abs(value).toLocaleString("it-IT")}
    </span>
  );
}

function getBookingCost(booking) {
  const rawValue =
    booking.artistCachet ||
    booking.cachet ||
    booking.amount ||
    booking.fee ||
    booking.price ||
    0;

  const value = Number(
    String(rawValue)
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );

  return Number.isFinite(value) ? value : 0;
}

function getRevenueValue(rawValue) {
  const value = Number(
    String(rawValue || 0)
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );

  return Number.isFinite(value) ? value : 0;
}