export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <iframe
        src="/preview.html"
        title="TuttoEvento"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </main>
  );
}