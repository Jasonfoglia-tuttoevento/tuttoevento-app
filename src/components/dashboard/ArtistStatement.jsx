"use client";

import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 5;

export default function ArtistStatement({ bookings = [], artistProfile }) {
  const [currentPage, setCurrentPage] = useState(1);

  const artistCachet = getArtistCachet(artistProfile);

  const acceptedBookings = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === "accepted")
      .sort((a, b) => {
        const dateA = new Date(a.eventDate || a.date || a.createdAt || 0);
        const dateB = new Date(b.eventDate || b.date || b.createdAt || 0);

        return dateB - dateA;
      });
  }, [bookings]);

  const rows = acceptedBookings.map((booking) => {
    const paymentStatus =
      booking.paymentStatus ||
      booking.payoutStatus ||
      "pending";

    return {
      ...booking,
      amount: artistCachet,
      paymentStatus,
    };
  });

  const acceptedEventsCount = acceptedBookings.length;
  const totalAmount = artistCachet * acceptedEventsCount;

  const paidAmount = rows
    .filter((row) => row.paymentStatus === "paid")
    .reduce((total, row) => total + row.amount, 0);

  const pendingAmount = totalAmount - paidAmount;

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));

  const paginatedRows = rows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function goToNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  return (
    <section
      id="artist-statement"
      className="bg-white border border-black/5 rounded-[28px] p-5 md:p-7 shadow-sm mt-8 scroll-mt-8 overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
        <div>
          <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
            Estratto conto
          </p>

          <h2 className="text-3xl font-black tracking-[-0.04em] leading-tight">
            Compensi e booking
          </h2>

          <p className="text-black/50 mt-2">
            Riepilogo economico dei booking accettati.
          </p>
        </div>

        <div className="rounded-3xl bg-[#111] text-white px-5 py-4">
          <p className="text-xs uppercase tracking-[2px] text-white/40 font-black">
            Totale stimato
          </p>

          <p className="text-2xl font-black mt-1">
            € {totalAmount.toLocaleString("it-IT")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatementSummaryCard
          title="Cachet artista"
          value={artistCachet}
        />

        <StatementSummaryCard
          title="Eventi accettati"
          value={acceptedEventsCount}
          isCount
        />

        <StatementSummaryCard
          title="Totale maturato"
          value={totalAmount}
        />

        <StatementSummaryCard
          title="Da saldare"
          value={pendingAmount}
          highlight
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl bg-[#f7f7f8] border border-black/5 p-6">
          <p className="font-black">
            Nessun movimento disponibile.
          </p>

          <p className="text-black/45 mt-2">
            Quando un booking viene accettato, verrà mostrato qui.
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
                  <th className="p-4">Organizer</th>
                  <th className="p-4">Cachet</th>
                  <th className="p-4">Stato pagamento</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.map((row) => (
                  <tr key={row.id} className="border-b border-black/5">
                    <td className="p-4 font-black">
                      {row.eventTitle || "Booking"}
                    </td>

                    <td className="p-4">
                      {row.eventDate || row.date || "-"}
                    </td>

                    <td className="p-4">
                      {row.organizerName || "-"}
                    </td>

                    <td className="p-4 font-black">
                      € {row.amount.toLocaleString("it-IT")}
                    </td>

                    <td className="p-4">
                      <PaymentBadge status={row.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {paginatedRows.map((row) => (
              <article
                key={row.id}
                className="rounded-3xl border border-black/5 bg-[#f7f7f8] p-4 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[2px] text-black/35 font-black mb-2">
                      Movimento
                    </p>

                    <h3 className="text-xl font-black tracking-[-0.03em] break-words">
                      {row.eventTitle || "Booking"}
                    </h3>
                  </div>

                  <PaymentBadge status={row.paymentStatus} />
                </div>

                <div className="grid grid-cols-1 gap-3 mt-5">
                  <InfoBox
                    label="Data"
                    value={row.eventDate || row.date || "-"}
                  />

                  <InfoBox
                    label="Organizer"
                    value={row.organizerName || "-"}
                  />

                  <InfoBox
                    label="Cachet evento"
                    value={`€ ${row.amount.toLocaleString("it-IT")}`}
                    strong
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 border-t border-black/5 pt-5">
            <p className="text-sm text-black/45 font-bold">
              Pagina {currentPage} di {totalPages} · {rows.length} movimenti
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

      <p className="text-xs text-black/35 mt-5 leading-relaxed">
        Nota: questa è una prima versione operativa dell’estratto conto. La
        gestione reale di pagamenti, fatture e saldi potrà essere collegata in
        una fase successiva.
      </p>
    </section>
  );
}

function StatementSummaryCard({ title, value, highlight = false, isCount = false }) {
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
        {isCount ? value : `€ ${value.toLocaleString("it-IT")}`}
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

function PaymentBadge({ status }) {
  if (status === "paid") {
    return (
      <span className="inline-flex px-3 py-2 rounded-full bg-green-100 text-green-700 text-xs font-black whitespace-nowrap">
        Pagato
      </span>
    );
  }

  if (status === "processing") {
    return (
      <span className="inline-flex px-3 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-black whitespace-nowrap">
        In lavorazione
      </span>
    );
  }

  return (
    <span className="inline-flex px-3 py-2 rounded-full bg-yellow-100 text-yellow-700 text-xs font-black whitespace-nowrap">
      Da saldare
    </span>
  );
}

function getArtistCachet(artistProfile) {
  const rawValue = artistProfile?.cachet || 0;

  const value = Number(
    String(rawValue)
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );

  return Number.isFinite(value) ? value : 0;
}