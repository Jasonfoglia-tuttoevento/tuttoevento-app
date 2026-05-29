"use client";

import { useState } from "react";

export default function CalendarPicker({
  availableDates,
  setAvailableDates,
  bookedDates = [],
  bookedSlots = [],
}) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const calendarDays = generateCalendarDays(currentMonth, currentYear);

  const monthName = new Date(currentYear, currentMonth).toLocaleString("it-IT", {
    month: "long",
    year: "numeric",
  });

  function slotsForDay(dateKey) {
    return bookedSlots.filter((slot) => normalizeDate(slot.date) === dateKey);
  }

  function toggleDate(dateKey) {
    setSelectedDay(dateKey);

    if (slotsForDay(dateKey).length > 0) {
      return;
    }

    if (availableDates.includes(dateKey)) {
      setAvailableDates(availableDates.filter((d) => d !== dateKey));
    } else {
      setAvailableDates([...availableDates, dateKey]);
    }
  }

  function previousMonth() {
    setSelectedDay(null);

    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    setSelectedDay(null);

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  const selectedSlots = selectedDay ? slotsForDay(selectedDay) : [];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em]">
            Calendario disponibilità
          </h2>

          <p className="text-black/50 mt-2">
            Bordo rosso = giorno con eventi confermati
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={previousMonth}
            className="bg-[#f5f5f5] border border-black/10 px-4 py-3 rounded-2xl font-black"
          >
            ←
          </button>

          <p className="font-black capitalize min-w-[160px] text-center">
            {monthName}
          </p>

          <button
            type="button"
            onClick={nextMonth}
            className="bg-[#f5f5f5] border border-black/10 px-4 py-3 rounded-2xl font-black"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
          <div key={d} className="text-center text-black/35 text-sm font-black">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={"empty-" + index} />;
          }

          const daySlots = slotsForDay(day.key);
          const eventCount = daySlots.length;
          const hasEvents = eventCount > 0;
          const isAvailable = availableDates.includes(day.key);
          const isSelected = selectedDay === day.key;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => toggleDate(day.key)}
              className={
                hasEvents
                  ? "bg-white border-2 border-red-600 rounded-2xl p-2 min-h-[82px] font-black text-left"
                  : isAvailable
                  ? "bg-white border-2 border-[#ff5a00] rounded-2xl p-2 min-h-[82px] font-black text-left"
                  : isSelected
                  ? "bg-[#f5f5f5] border-2 border-black rounded-2xl p-2 min-h-[82px] font-bold text-left"
                  : "bg-white border border-black/10 rounded-2xl p-2 min-h-[82px] font-bold text-black/65 hover:border-[#ff5a00] text-left"
              }
            >
              <div className="flex flex-col h-full justify-between">
                <span>{day.day}</span>

                {hasEvents && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {daySlots.map((slot) => (
                      <span
                        key={slot.bookingId}
                        className="w-2 h-2 rounded-full bg-red-600"
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 bg-[#fafafa] border border-black/5 rounded-[22px] p-5">
        <h3 className="text-xl font-black">
          Dettaglio giorno
        </h3>

        {!selectedDay ? (
          <p className="text-black/45 mt-2">
            Seleziona un giorno del calendario.
          </p>
        ) : selectedSlots.length === 0 ? (
          <p className="text-black/45 mt-2">
            {selectedDay}: nessun evento confermato.
          </p>
        ) : (
          <div className="space-y-3 mt-4">
            <p className="text-black/50 font-bold">
              {selectedDay}
            </p>

            {selectedSlots.map((slot) => (
              <div
                key={slot.bookingId}
                className="bg-white border border-black/10 rounded-2xl p-4"
              >
                <p className="font-black">
                  {slot.eventTitle || "Evento confermato"}
                </p>

                <p className="text-sm text-black/50 mt-1">
                  {slot.startTime} - {slot.endTime}
                </p>

                <p className="text-sm text-black/50 mt-1">
                  Locale: {slot.organizerName || "Non indicato"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeDate(date) {
  if (!date) return "";

  if (date.includes("-")) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${String(year).slice(-2)}`;
  }

  const parts = date.split("/");

  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
  }

  return date;
}

function generateCalendarDays(month, year) {
  const days = [];
  const totalDays = new Date(year, month + 1, 0).getDate();

  let firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dd = String(day).padStart(2, "0");
    const mm = String(month + 1).padStart(2, "0");
    const yy = String(year).slice(-2);

    days.push({
      day,
      key: `${dd}/${mm}/${yy}`,
    });
  }

  return days;
}