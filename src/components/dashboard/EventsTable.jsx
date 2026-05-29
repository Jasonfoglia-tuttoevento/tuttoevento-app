export default function EventsTable({ events }) {
  function statusClass(status) {
    if (status === "accepted") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  }

  function statusLabel(status) {
    if (status === "accepted") return "Confermato";
    if (status === "rejected") return "Rifiutato";
    if (status === "pending") return "In attesa";
    return "Bozza";
  }

  function modeClass(mode) {
    if (mode === "managed") {
      return "bg-[#ff5a00]/10 text-[#ff5a00] border border-[#ff5a00]/20";
    }

    return "bg-black/5 text-black/60 border border-black/10";
  }

  function modeLabel(mode) {
    if (mode === "managed") return "Managed TuttoEvento";
    return "Gestione Autonoma";
  }

  return (
    <section className="dashboard-card-mobile bg-white border border-black/5 rounded-[28px] p-5 md:p-7 shadow-sm overflow-hidden">
      <div className="mb-6">
        <p className="uppercase tracking-[3px] text-[#ff5a00] text-xs font-black mb-2">
          Eventi
        </p>

        <h2 className="text-3xl font-black tracking-[-0.04em] leading-tight">
          Eventi del tuo locale
        </h2>
      </div>

      {events.length === 0 ? (
        <p className="text-black/45">Nessun evento creato.</p>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-black/40 border-b">
                  <th className="p-4">Evento</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Orario</th>
                  <th className="p-4">Artista</th>
                  <th className="p-4">Promoter</th>
                  <th className="p-4">Modalità</th>
                  <th className="p-4">Stato</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-black/5">
                    <td className="p-4 font-bold">
                      {event.title}
                    </td>

                    <td className="p-4">
                      {event.date || "-"}
                    </td>

                    <td className="p-4">
                      {event.startTime && event.endTime
                        ? `${event.startTime} - ${event.endTime}`
                        : "-"}
                    </td>

                    <td className="p-4">
                      {event.artistName || event.artist || "-"}
                    </td>

                    <td className="p-4">
                      {event.promoter || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          modeClass(event.eventMode) +
                          " px-4 py-2 rounded-full font-black text-sm whitespace-nowrap"
                        }
                      >
                        {modeLabel(event.eventMode)}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          statusClass(event.status) +
                          " px-4 py-2 rounded-full font-black text-sm whitespace-nowrap"
                        }
                      >
                        {statusLabel(event.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {events.map((event) => (
              <article
                key={event.id}
                className="rounded-3xl border border-black/5 bg-[#f7f7f8] p-4 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[2px] text-black/35 font-black mb-2">
                      Evento
                    </p>

                    <h3 className="text-xl font-black tracking-[-0.03em] leading-tight break-words">
                      {event.title}
                    </h3>
                  </div>

                  <span
                    className={
                      statusClass(event.status) +
                      " px-3 py-2 rounded-full font-black text-xs shrink-0"
                    }
                  >
                    {statusLabel(event.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-5">
                  <div className="bg-white border border-black/5 rounded-2xl p-3">
                    <p className="text-xs text-black/35 font-black uppercase tracking-[2px]">
                      Data
                    </p>

                    <p className="font-bold mt-1">
                      {event.date || "-"}
                    </p>
                  </div>

                  <div className="bg-white border border-black/5 rounded-2xl p-3">
                    <p className="text-xs text-black/35 font-black uppercase tracking-[2px]">
                      Orario
                    </p>

                    <p className="font-bold mt-1">
                      {event.startTime && event.endTime
                        ? `${event.startTime} - ${event.endTime}`
                        : "-"}
                    </p>
                  </div>

                  <div className="bg-white border border-black/5 rounded-2xl p-3">
                    <p className="text-xs text-black/35 font-black uppercase tracking-[2px]">
                      Artista
                    </p>

                    <p className="font-bold mt-1 break-words">
                      {event.artistName || event.artist || "-"}
                    </p>
                  </div>

                  <div className="bg-white border border-black/5 rounded-2xl p-3">
                    <p className="text-xs text-black/35 font-black uppercase tracking-[2px]">
                      Promoter
                    </p>

                    <p className="font-bold mt-1 break-words">
                      {event.promoter || "-"}
                    </p>
                  </div>

                  <div className="bg-white border border-black/5 rounded-2xl p-3">
                    <p className="text-xs text-black/35 font-black uppercase tracking-[2px]">
                      Modalità
                    </p>

                    <span
                      className={
                        modeClass(event.eventMode) +
                        " inline-flex mt-2 px-3 py-2 rounded-full font-black text-xs"
                      }
                    >
                      {modeLabel(event.eventMode)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}