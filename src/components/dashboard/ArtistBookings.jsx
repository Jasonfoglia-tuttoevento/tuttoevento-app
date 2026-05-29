"use client";

import { useMemo, useState } from "react";

const BOOKINGS_PER_PAGE = 4;

export default function ArtistBookings({
  bookings,
  updateBookingStatus,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  function openBookingChat(booking) {
    const organizerUserId =
      booking.organizerId ||
      booking.organizerUserId ||
      booking.organizer_user_id ||
      booking.organizerUserID;

    if (!organizerUserId) {
      alert(
        "Impossibile aprire la chat: questo booking non contiene l'ID dell'organizer."
      );
      return;
    }

    window.dispatchEvent(
      new CustomEvent("tuttoevento:open-chat", {
        detail: {
          participantUserId: Number(organizerUserId),
          bookingId: booking.id,
          eventId: booking.eventId || null,
          title: `Booking · ${booking.organizerName || "Organizer"}`,
        },
      })
    );
  }

  function statusClass(status) {
    if (status === "accepted") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  }

  function statusLabel(status) {
    if (status === "accepted") return "Accettata";
    if (status === "rejected") return "Rifiutata";
    return "In attesa";
  }

  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;

    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE)
  );

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * BOOKINGS_PER_PAGE,
    currentPage * BOOKINGS_PER_PAGE
  );

  function changeFilter(nextFilter) {
    setStatusFilter(nextFilter);
    setCurrentPage(1);
  }

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function goToNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  return (
    <section
      id="artist-bookings"
      className="bg-white border border-black/5 rounded-[28px] p-5 md:p-7 shadow-sm mt-8 scroll-mt-8 overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
        <div>
          <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
            Booking
          </p>

          <h2 className="text-3xl font-black tracking-[-0.04em] leading-tight">
            Richieste Ricevute
          </h2>

          <p className="text-black/50 mt-2">
            Booking ricevuti dagli organizer.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => changeFilter("all")}
            className={
              statusFilter === "all"
                ? "bg-[#111] text-white px-4 py-3 rounded-2xl text-sm font-black"
                : "bg-[#f7f7f8] text-black/55 border border-black/5 px-4 py-3 rounded-2xl text-sm font-black"
            }
          >
            Tutte
          </button>

          <button
            type="button"
            onClick={() => changeFilter("pending")}
            className={
              statusFilter === "pending"
                ? "bg-yellow-100 text-yellow-700 px-4 py-3 rounded-2xl text-sm font-black"
                : "bg-[#f7f7f8] text-black/55 border border-black/5 px-4 py-3 rounded-2xl text-sm font-black"
            }
          >
            In attesa
          </button>

          <button
            type="button"
            onClick={() => changeFilter("accepted")}
            className={
              statusFilter === "accepted"
                ? "bg-green-100 text-green-700 px-4 py-3 rounded-2xl text-sm font-black"
                : "bg-[#f7f7f8] text-black/55 border border-black/5 px-4 py-3 rounded-2xl text-sm font-black"
            }
          >
            Accettate
          </button>

          <button
            type="button"
            onClick={() => changeFilter("rejected")}
            className={
              statusFilter === "rejected"
                ? "bg-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm font-black"
                : "bg-[#f7f7f8] text-black/55 border border-black/5 px-4 py-3 rounded-2xl text-sm font-black"
            }
          >
            Rifiutate
          </button>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="rounded-3xl bg-[#f7f7f8] border border-black/5 p-6">
          <p className="font-black">
            Nessuna richiesta trovata.
          </p>

          <p className="text-black/45 mt-2">
            Cambia filtro oppure attendi nuove richieste booking.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedBookings.map((booking) => {
              const organizerUserId =
                booking.organizerId ||
                booking.organizerUserId ||
                booking.organizer_user_id ||
                booking.organizerUserID;

              return (
                <article
                  key={booking.id}
                  className="border border-black/10 rounded-3xl p-5 bg-[#fafafa] overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black break-words">
                          {booking.organizerName}
                        </h3>

                        <span
                          className={
                            statusClass(booking.status) +
                            " px-3 py-2 rounded-full text-xs font-black"
                          }
                        >
                          {statusLabel(booking.status)}
                        </span>
                      </div>

                      {booking.eventTitle && (
                        <p className="font-black text-black/70 mt-3 break-words">
                          {booking.eventTitle}
                        </p>
                      )}

                      <p className="text-[#ff5a00] font-black mt-2">
                        Data evento: {booking.eventDate || "Non indicata"}
                      </p>

                      {(booking.startTime || booking.endTime) && (
                        <p className="text-sm text-black/45 mt-1">
                          Orario: {booking.startTime || "--:--"} -{" "}
                          {booking.endTime || "--:--"}
                        </p>
                      )}

                      <p className="text-black/50 mt-3 leading-relaxed break-words">
                        {booking.message}
                      </p>

                      {!organizerUserId && (
                        <p className="text-sm text-red-500 font-bold mt-4">
                          ID organizer mancante nel booking
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-5">
                        <button
                          type="button"
                          onClick={() => openBookingChat(booking)}
                          disabled={!organizerUserId}
                          className="bg-[#111] text-white px-5 py-3 rounded-2xl font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Apri chat
                        </button>

                        {booking.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                updateBookingStatus(booking.id, "accepted")
                              }
                              className="bg-green-600 text-white px-5 py-3 rounded-2xl font-black text-sm"
                            >
                              Accetta
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateBookingStatus(booking.id, "rejected")
                              }
                              className="bg-red-600 text-white px-5 py-3 rounded-2xl font-black text-sm"
                            >
                              Rifiuta
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 border-t border-black/5 pt-5">
            <p className="text-sm text-black/45 font-bold">
              Pagina {currentPage} di {totalPages} ·{" "}
              {filteredBookings.length} richieste
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