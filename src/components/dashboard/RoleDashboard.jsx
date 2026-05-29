import OrganizerArea from "./OrganizerArea";
import ArtistArea from "./ArtistArea";
import ArtistBookings from "./ArtistBookings";
import OrganizerBookings from "./OrganizerBookings";
import PromoterArea from "./PromoterArea";

export default function RoleDashboard({
  user,

  events = [],
  artists = [],
  bookings = [],
  bookedDates = [],
  bookedSlots = [],

  title,
  setTitle,
  date,
  setDate,
  artist,
  setArtist,
  promoter,
  setPromoter,

  cachet,
  setCachet,
  bio,
  setBio,
  availability,
  setAvailability,

  photo,
  setPhoto,

  instagram,
  setInstagram,

  spotify,
  setSpotify,

  youtube,
  setYoutube,

  soundcloud,
  setSoundcloud,

  genres,
  setGenres,

  city,
  setCity,

  languages,
  setLanguages,

  rider,
  setRider,

  availableDates,
  setAvailableDates,

  saveArtistProfile,
  artistMessage,

  updateBookingStatus,
}) {
  if (user.role === "organizer") {
    return (
      <>
        <OrganizerArea
          currentUser={user}
          events={events}
          artists={artists}
          bookings={bookings}
          title={title}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          artist={artist}
          setArtist={setArtist}
          promoter={promoter}
          setPromoter={setPromoter}
        />

        <OrganizerBookings bookings={bookings} />
      </>
    );
  }

  if (user.role === "artist") {
    return (
      <>
        <ArtistArea
          cachet={cachet}
          setCachet={setCachet}
          bio={bio}
          setBio={setBio}
          availability={availability}
          setAvailability={setAvailability}
          photo={photo}
          setPhoto={setPhoto}
          instagram={instagram}
          setInstagram={setInstagram}
          spotify={spotify}
          setSpotify={setSpotify}
          youtube={youtube}
          setYoutube={setYoutube}
          soundcloud={soundcloud}
          setSoundcloud={setSoundcloud}
          genres={genres}
          setGenres={setGenres}
          city={city}
          setCity={setCity}
          languages={languages}
          setLanguages={setLanguages}
          rider={rider}
          setRider={setRider}
          availableDates={availableDates}
          setAvailableDates={setAvailableDates}
          bookedDates={bookedDates}
          bookedSlots={bookedSlots}
          bookings={bookings}
          saveArtistProfile={saveArtistProfile}
          artistMessage={artistMessage}
        />

        <ArtistBookings
          bookings={bookings}
          updateBookingStatus={updateBookingStatus}
        />
      </>
    );
  }

  if (user.role === "promoter") {
    return <PromoterArea />;
  }

  return null;
}