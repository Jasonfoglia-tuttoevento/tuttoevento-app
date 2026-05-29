import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role")
      .eq("role", "artist")
      .order("name", { ascending: true });

    if (usersError) {
      console.error("Errore Supabase users artists:", usersError);

      return NextResponse.json(
        { error: "Errore caricamento artisti" },
        { status: 500 }
      );
    }

    const artistIds = users.map((user) => user.id);

    if (artistIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("artist_profiles")
      .select(
        `
        user_id,
        cachet,
        bio,
        availability,
        photo,
        instagram,
        spotify,
        youtube,
        soundcloud,
        genres,
        city,
        languages,
        rider,
        available_dates,
        booked_dates,
        booked_slots
      `
      )
      .in("user_id", artistIds);

    if (profilesError) {
      console.error("Errore Supabase artist_profiles:", profilesError);

      return NextResponse.json(
        { error: "Errore caricamento profili artisti" },
        { status: 500 }
      );
    }

    const { data: acceptedBookings, error: bookingsError } =
      await supabaseAdmin
        .from("bookings")
        .select(
          `
          id,
          artist_id,
          artist_name,
          organizer_id,
          organizer_name,
          event_id,
          event_title,
          event_date,
          start_time,
          end_time,
          status
        `
        )
        .in("artist_id", artistIds)
        .eq("status", "accepted");

    if (bookingsError) {
      console.error("Errore Supabase bookings artisti:", bookingsError);

      return NextResponse.json(
        { error: "Errore caricamento booking artisti" },
        { status: 500 }
      );
    }

    const profilesByUserId = new Map();

    profiles.forEach((profile) => {
      profilesByUserId.set(Number(profile.user_id), profile);
    });

    const bookingsByArtistId = new Map();

    acceptedBookings.forEach((booking) => {
      const artistId = Number(booking.artist_id);

      if (!bookingsByArtistId.has(artistId)) {
        bookingsByArtistId.set(artistId, []);
      }

      bookingsByArtistId.get(artistId).push(booking);
    });

    const artists = users.map((user) => {
      const profile = profilesByUserId.get(Number(user.id));
      const artistBookings = bookingsByArtistId.get(Number(user.id)) || [];

      const dynamicBookedDates = artistBookings
        .map((booking) => booking.event_date)
        .filter(Boolean);

      const dynamicBookedSlots = artistBookings.map((booking) => ({
        bookingId: booking.id,
        eventId: booking.event_id,
        eventTitle: booking.event_title,
        date: booking.event_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        organizerId: booking.organizer_id,
        organizerName: booking.organizer_name,
      }));

      return {
        id: user.id,
        name: user.name,
        email: user.email,

        cachet: profile?.cachet || "Non inserito",
        bio: profile?.bio || "Bio non inserita",
        availability: profile?.availability || "Disponibilità non inserita",

        photo: profile?.photo || "",

        instagram: profile?.instagram || "",
        spotify: profile?.spotify || "",
        youtube: profile?.youtube || "",
        soundcloud: profile?.soundcloud || "",

        genres: profile?.genres || "",
        city: profile?.city || "",
        languages: profile?.languages || "",
        rider: profile?.rider || "",

        availableDates: profile?.available_dates || "[]",

        bookedDates:
          dynamicBookedDates.length > 0
            ? JSON.stringify(dynamicBookedDates)
            : profile?.booked_dates || "[]",

        bookedSlots:
          dynamicBookedSlots.length > 0
            ? JSON.stringify(dynamicBookedSlots)
            : profile?.booked_slots || "[]",
      };
    });

    return NextResponse.json(artists);
  } catch (error) {
    console.error("Errore API artists:", error);

    return NextResponse.json(
      { error: "Errore server caricamento artisti" },
      { status: 500 }
    );
  }
}